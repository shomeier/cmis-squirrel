import { ActivityIndicator, CollectionView, CollectionViewProperties, Composite, CompositeProperties, ProgressBar, ImageView, Page, TextView, WebView, device, ui } from 'tabris';
import { SingleCmisSession } from './singleCmisSession'
import { cmis } from './lib/cmis';
// import { FileOpener2 } from '../node_modules/cordova-plugin-file-opener2/www/plugins.FileOpener2';
// var FileOpener2 = require('../node_modules/cordova-plugin-file-opener2/www/plugins.FileOpener2');
// var FileTransfer = require('../node_modules/cordova-plugin-file-transfer/www/FileTransfer');
// declare var fileOpener2 : any;
declare var cordova: any;
// declare var FileTransfer: any;
//import {FileTransfer} from 'cordova-plugin-file-transfer';

export default class DocumentContentComposite extends Composite {

    private fileId: string;

    private contentCollectionView: CollectionView;

    constructor(fileId: string, fileName: string, properties?: CompositeProperties) {
        super(properties);
        this.fileId = fileId;
        let session = SingleCmisSession.getCmisSession();

        let activityIndicator = new ActivityIndicator({
            centerX: 0,
            centerY: 0,
            visible: true
        }).appendTo(this);

        // session.getObject(fileId).then(data => {
        //     console.log("---------XXXX__-----------");
        //     console.log("---------XXXX__-----------");
        //     console.log("DATA FILE: " + JSON.stringify(data));
        // });

        // let url = 'http://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser/root?objectId=d590ef62-b530-4e54-ad4c-b7fc9f0a40cb%3B1.0&cmisselector=content';
        let url = 'http://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser/root?objectId=' + fileId + '&cmisselector=content';

        // var progressBar = new ProgressBar({
        //     left: 30, right: 30, centerY: 0,
        //     maximum: 100,
        //     selection: 10
        // }).appendTo(ui.contentView);

        let fileTransfer = new FileTransfer();
        // fileTransfer.onprogress = function (progressEvent) {
        //     console.log("ON PROGRESS CALLED ---------");
        //     if (progressEvent.lengthComputable) {
        //         console.log("ON PROGRESS CALLED lengthComputable ---------");
        //         progressBar.selection = (progressEvent.loaded / progressEvent.total);
        //         // loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
        //     } else {
        //         console.log("ON PROGRESS CALLED NOOOOT lengthComputable ---------");
        //         progressBar.selection = progressBar.selection + 1;
        //         // loadingStatus.increment();
        //     }
        // };

        let target = 'cdvfile://localhost/temporary/cmis/cmisTempDownload.' + fileName.substring(fileName.length-3, fileName.length);
        console.log('TARGET: ' + target);
        fileTransfer.download(
            url,
            // "cdvfile://localhost/temporary/testCmis.png",
            // 'cdvfile://localhost/temporary/cmisTempDownload.' + fileName.substring(fileName.length-3, fileName.length),
            target,
            function (entry) {
                console.log("download complete: " + entry.toURL());
                // progressBar.selection = 100;
                // progressBar.dispose();
                activityIndicator.dispose();
                cordova.plugins.fileOpener2.open(entry.toURL(), fileName, (data) => {
                    console.log("CALLBACK CALLLED !!!!!");
                    console.log("data fileOpener CB: " + JSON.stringify(data));
                });
            },
            function (error) {
                // progressBar.dispose();
                activityIndicator.dispose();
                console.log("download error complete: " + JSON.stringify(error));
                console.log("download error source: " + JSON.stringify(error.source));
                console.log("download error target: " + JSON.stringify(error.target));
                console.log("download error code: " + JSON.stringify(error.code));
            },
            false,
            {
                headers: {
                    "Authorization": "Basic YWRtaW46YWRtaW4="
                }
            }
        );

        

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