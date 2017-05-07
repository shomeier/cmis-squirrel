import { ActivityIndicator, CollectionView, CollectionViewProperties, Composite, CompositeProperties, ImageView, Page, TextView, WebView, device, ui } from 'tabris';
import { SingleCmisSession } from './singleCmisSession'
import { cmis } from './lib/cmis';
//import {FileTransfer} from 'cordova-plugin-file-transfer';

export default class DocumentContentComposite extends Composite {

    private fileId: string;

    private contentCollectionView: CollectionView;

    private activityIndicator: ActivityIndicator;

    constructor(fileId: string, cb?, properties?: CompositeProperties) {
        super(properties);
        this.fileId = fileId;
        let session = SingleCmisSession.getCmisSession();

        this.activityIndicator = new ActivityIndicator({
            centerX: 0,
            centerY: 0,
            visible: true,
        }).appendTo(this);

        session.getObject(fileId).then(data => {
            console.log("---------XXXX__-----------");
            console.log("---------XXXX__-----------");
            console.log("DATA FILE: " + JSON.stringify(data));
        });
        let url = 'http://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser/root?objectId=d590ef62-b530-4e54-ad4c-b7fc9f0a40cb%3B1.0&cmisselector=content';
        // var webview = new WebView({
        //     layoutData: { left: 0, top: 0, right: 0, bottom: 0 },
        //     url: 'http://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser/root?objectId=d590ef62-b530-4e54-ad4c-b7fc9f0a40cb%3B1.0&cmisselector=content'
        // }).appendTo(this);
        fileTransfer.download(
            url,
            "cdvfile://localhost/temporary/testCmis.png",
            function (entry) {
                console.log("download complete: " + entry.toURL());
            },
            function (error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("download error code" + error.code);
            },
            false,
            {
                headers: {
                    "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                }
            }
        );
        this.activityIndicator.visible = false;

        // ui.contentView.find('ActivityIndicator').set('visible', true);
        // session.getChildren(folderId).then(data => {
        //     let cmisObjects: any[] = data.objects;
        //     let tmpData: any[] = new Array(data.objects.length);
        //     for (var i = 0; i < cmisObjects.length; i++) {
        //         console.log("----------------------------------");
        //         console.log("i: " + i);
        //         // tmpData[i] = cmisObjects[i].object.properties;
        //         tmpData[i] = {
        //             'cmisObjectId': cmisObjects[i].object.properties['cmis:objectId'].value,
        //             'cmisName': cmisObjects[i].object.properties['cmis:name'].value,
        //             'cmisBaseTypeId': cmisObjects[i].object.properties['cmis:baseTypeId'].value
        //         };
        //         console.log("cmisObjectId: " + tmpData[i].cmisObjectId);
        //         console.log("cmisName: " + tmpData[i].cmisName);
        //         console.log("cmisBaseTypeId: " + tmpData[i].cmisBaseTypeId);
        //     }
        //     this.contentCollectionView = this.createContentCollectionView(tmpData);
        //     this.contentCollectionView.appendTo(this);

        //     // call the callback to let the caller know we are finished
        //     cb();
        //     this.activityIndicator.visible = false;
        // });
    }
}