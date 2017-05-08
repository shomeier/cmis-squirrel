import { ActivityIndicator, CollectionView, CollectionViewProperties, Composite, CompositeProperties, ImageView, Page, PageProperties, NavigationView, TextView, device, ui } from 'tabris';
import { SingleCmisSession } from './singleCmisSession'
import { cmis } from './lib/cmis';
declare var cordova: any;

export default class FolderPage extends Page {

    private contentData: any[];

    private folderId: string;

    private contentCollectionView: CollectionView;

    private activityIndicator: ActivityIndicator;

    private navigationView: NavigationView;

    constructor(folderId: string, navigationView: NavigationView, properties?: PageProperties) {
        super(properties);
        this.folderId = folderId;
        this.navigationView = navigationView;
        this.appendTo(navigationView);
        let session = SingleCmisSession.getCmisSession();

        this.activityIndicator = new ActivityIndicator({
            centerX: 0,
            centerY: 0,
            visible: true,
        }).appendTo(this);

        session.getChildren(folderId).then(data => {
            let cmisObjects: any[] = data.objects;
            let tmpData: any[] = new Array(data.objects.length);
            for (var i = 0; i < cmisObjects.length; i++) {
                console.log("----------------------------------");
                console.log("i: " + i);
                tmpData[i] = {
                    'cmisObjectId': cmisObjects[i].object.properties['cmis:objectId'].value,
                    'cmisName': cmisObjects[i].object.properties['cmis:name'].value,
                    'cmisBaseTypeId': cmisObjects[i].object.properties['cmis:baseTypeId'].value
                };
                console.log("cmisObjectId: " + tmpData[i].cmisObjectId);
                console.log("cmisName: " + tmpData[i].cmisName);
                console.log("cmisBaseTypeId: " + tmpData[i].cmisBaseTypeId);
            }
            this.contentCollectionView = this.createContentCollectionView(tmpData);
            this.contentCollectionView.appendTo(this);

            this.activityIndicator.visible = false;
        });
    }

    private createContentCollectionView(data: any[]) {
        return new CollectionView({
            left: 0, top: 50, right: 0, bottom: 0,
            id: 'contentCollectionView',
            items: data,
            initializeCell: this.initializeCell,
            itemHeight: device.platform === 'iOS' ? 60 : 68
        }).on('select', ({ item }) => {
            console.log("In Select EventHandler ...");
            console.log("Item selected: " + JSON.stringify(item));
            console.log("cmisObjectId: " + JSON.stringify(item.cmisObjectId));
            // if (item.cmisBaseTypeId == 'cmis:folder') {
            console.log("Creating sub content page ...");
            if (item.cmisBaseTypeId == 'cmis:folder') {
                let folderPage = new FolderPage(item.cmisObjectId, this.navigationView,
                    {
                        title: item.cmisName
                    });
            } else if (item.cmisBaseTypeId == 'cmis:document') {
                // TODO: Check if document has content stream
                this.openContent(item.cmisObjectId, item.cmisName);
            }
            console.log("Created sub content page ...");
        });
    }

    private initializeCell(cell) {
        new Composite({
            left: 10, right: 10, bottom: 0, height: 1,
            background: '#bbb'
        }).appendTo(cell);
        var imageView = new ImageView({
            left: 10, top: 10, bottom: 10,
            scaleMode: 'fit'
        }).appendTo(cell);
        var textView = new TextView({
            left: 60, centerY: 0,
            markupEnabled: true,
            textColor: '#4a4a4a'
        }).appendTo(cell);
        cell.on('change:item', function ({ value: item }) {
            if (item.cmisBaseTypeId == 'cmis:document') {
                imageView.set('image', 'icons/document.png');
            } else {
                imageView.set('image', 'icons/folder.png');
            }
            textView.set('text', item.cmisName);
        });
        cell.on('select', function ({ value: item }) {
            console.log("CELL SELECTED !!!!!!")
            imageView.set('image', 'icons/Cloud-50.png');
            textView.set('text', item.cmisBaseTypeId);
        });
    }

    private openContent(fileId: string, fileName: string): void {
        let activityIndicator = this.activityIndicator;
        activityIndicator.visible = true;

        let url = 'https://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser/root?objectId=' + fileId + '&cmisselector=content';
        let fileTransfer = new FileTransfer();
        let target = 'cdvfile://localhost/temporary/cmis/cmisTempDownload.' + fileName.substring(fileName.length-3, fileName.length);
        console.log('TARGET: ' + target);
        fileTransfer.download(
            url,
            target,
            function (entry) {
                console.log("download complete: " + entry.toURL());
                activityIndicator.visible = false;
                cordova.plugins.fileOpener2.open(entry.toURL(), fileName, (data) => {
                    console.log("CALLBACK CALLLED !!!!!");
                    console.log("data fileOpener CB: " + JSON.stringify(data));
                });
            },
            function (error) {
                activityIndicator.visible = false;
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
    }

}