import { ActivityIndicator, Button, CollectionView, Widget, CollectionViewProperties, Composite, CompositeProperties, ImageView, Page, PageProperties, NavigationView, TextView, device, ui } from 'tabris';
import { CmisSession } from './cmisSession'
import Activity from './activity';
import Base64 from './lib/base64';
declare var navigator: any;
declare var FileTransfer: any;
declare var FileUploadOptions: any;
declare var cordova: any;
declare var Camera: any;
declare var global: any;
declare var FileReader: any;
declare var window: any;
declare var require: any;
import roundTo = require('round-to');

export default class FolderPage extends Page {

    private folderId: string;

    private button: Button;

    private collectionView: CollectionView;

    private navigationView: NavigationView;

    private collectionViewData: any;

    constructor(folderId: string, navigationView: NavigationView, properties?: PageProperties) {
        super(properties);
        this.folderId = folderId;
        this.navigationView = navigationView;
        this.appendTo(navigationView);
        let session = CmisSession.getSession();

        let activityGetChildren = new Activity(navigationView);
        activityGetChildren.startActivity();
        session.getChildren(folderId).then(data => {
            let cmisObjects: any[] = data.objects;
            let tmpData: any[] = new Array(data.objects.length);
            for (var i = 0; i < cmisObjects.length; i++) {
                let tmp: any = {};
                tmp.cmisObjectId = cmisObjects[i].object.properties['cmis:objectId'].value;
                tmp.cmisName = cmisObjects[i].object.properties['cmis:name'].value;
                tmp.cmisBaseTypeId = cmisObjects[i].object.properties['cmis:baseTypeId'].value;
                if (cmisObjects[i].object.properties['cmis:contentStreamLength']) {
                    tmp.cmisContentStreamLength = cmisObjects[i].object.properties['cmis:contentStreamLength'].value;
                }
                tmpData[i] = tmp;
            }
            this.collectionViewData = tmpData;
            this.collectionView = this.createContentCollectionView();
            this.collectionView.appendTo(this);

            // We need to set our 'atob' method to global scope for FileReader.readAsArrayBuffer()
            // See also here: https://github.com/eclipsesource/tabris-js/issues/899
            if (device.platform === "iOS") {
                // var base64 = require('base64');
                // global.btoa = base64.btoa;
                global.atob = Base64.atob;
            }

            this.button = new Button({
                top: ['#contentCollectionView', 10], left: 10, right: 10,
                background: '#3b283e',
                textColor: '#f3f4e4',
                text: 'Upload'
            }).on('select', () => {
                let activityUpload = new Activity(this.navigationView);
                activityUpload.startActivity();

                let quality:any = localStorage.getItem('uploadQuality');
                quality = quality || 50;
                console.log("Uploading with quality: " + quality);
                let options = {
                    'quality': 5,
                    'destinationType': Camera.DestinationType.FILE_URI,
                    // 'sourceType': Camera.PictureSourceType.PHOTOLIBRARY,
                    'sourceType': Camera.PictureSourceType.CAMERA,
                    // with encoding type JPG 
                    // 'encodingType': Camera.EncodingType.PNG
                    'encodingType': Camera.EncodingType.JPEG,
                    allowEdit : true,
                    targetWidth: 100,
                    targetHeight: 100,
                    correctOrientation: true
                };

                navigator.camera.getPicture((imageData) => {

                    let fileName: string = imageData.substr(imageData.lastIndexOf('/') + 1);

                    window.resolveLocalFileSystemURL(imageData, (fileEntry) => {
                        fileEntry.file((file) => {
                            let reader = new FileReader();
                            reader.onloadend = () => {
                                let content = reader.result;

                                let url = localStorage.getItem('url');
                                console.log("url: " + url);
                                let type = localStorage.getItem('uploadType');
                                console.log("uploadType: " + type);
                                if (!type) {
                                    console.log("Upload type is not set ...");
                                    type = 'cmis:document';
                                }
                                console.log("Using type: " + type);
                                CmisSession.getSession().createDocument(folderId, content, { 'cmis:name': fileName, 'cmis:objectTypeId': type }).then(() => {
                                    CmisSession.getSession().getChildren(folderId).then((data) => {
                                        console.log("Getting children ...");
                                        let cmisObjects: any[] = data.objects;
                                        let tmpData: any[] = new Array(data.objects.length);
                                        for (let i = 0; i < cmisObjects.length; i++) {
                                            let tmp: any = {};
                                            tmp.cmisObjectId = cmisObjects[i].object.properties['cmis:objectId'].value;
                                            tmp.cmisName = cmisObjects[i].object.properties['cmis:name'].value;
                                            tmp.cmisBaseTypeId = cmisObjects[i].object.properties['cmis:baseTypeId'].value;
                                            if (cmisObjects[i].object.properties['cmis:contentStreamLength']) {
                                                tmp.cmisContentStreamLength = cmisObjects[i].object.properties['cmis:contentStreamLength'].value;
                                            }
                                            tmpData[i] = tmp;
                                        }

                                        // calculate position of new element and insert it in collection view 
                                        if (this.collectionViewData.length < tmpData.length) {
                                            let j = 0;
                                            for (j = 0; j < this.collectionViewData.length; j++) {
                                                if (this.collectionViewData[j].cmisObjectId != tmpData[j].cmisObjectId) {
                                                    break;
                                                }
                                            }
                                            this.collectionViewData = tmpData;

                                            this.collectionView.insert(j);
                                        } else {
                                            console.log("HOUSTON .... this.collectionViewData.length: " + this.collectionViewData.length);
                                            console.log("tmpData.length: " + tmpData.length);
                                        }

                                        activityUpload.stopActivity();
                                    });

                                }).catch((err) => {

                                    console.log("In Catch Promise...!!!!");
                                    console.log("Err: " + JSON.stringify(err));

                                    activityUpload.stopActivity();
                                });
                            }

                            reader.readAsArrayBuffer(file);
                        });
                    }, (fsErr) => {
                        activityUpload.stopActivity();
                        console.log("Failed reading file ...");
                        console.log("e: " + JSON.stringify(fsErr));

                    });

                }, (camErr) => {
                    activityUpload.stopActivity();
                    console.log('Camera error ...');
                    console.log('Camera error: ' + JSON.stringify(camErr));
                }, options);
            }).appendTo(this);

            activityGetChildren.stopActivity();
        });
    }

    private createContentCollectionView() {
        let navigationView = this.navigationView;
        return new CollectionView({
            left: 0, top: 0, right: 0, bottom: 62,
            id: 'contentCollectionView',
            itemCount: this.collectionViewData.length,
            updateCell: (cell, index) => {
                let item = this.collectionViewData[index];
                if (item.cmisBaseTypeId == 'cmis:document') {
                    cell.apply({
                        '#icon': { 'image': 'icons/document.png' }
                    });
                    if (item.cmisContentStreamLength) {
                        let size: number = item.cmisContentStreamLength;
                        if (size < 1024) {
                            cell.apply({
                                '#objectSize': { 'text': size + ' Byte' }
                            });
                        } else if (size < 1048576) {
                            cell.apply({
                                '#objectSize': { 'text': roundTo((size / 1024), 1) + ' KB' }
                            });
                        } else if (size < 1073741824) {
                            cell.apply({
                                '#objectSize': { 'text': roundTo((size / 1048576), 1) + ' MB' }
                            });
                        }
                    }
                } else if (item.cmisBaseTypeId == 'cmis:folder')  {
                    cell.apply({
                        '#icon': { 'image': 'icons/folder.png' },
                        // we need to set the object size to sth. to prevent randomly setting text while scrolling (bug?!?s)
                        '#objectSize': { 'text': '  ' }
                    });
                } else {
                    cell.apply({
                        '#icon': { 'image': 'icons/placeholder.png' },
                        // we need to set the object size to sth. to prevent randomly setting text while scrolling (bug?!?s)
                        '#objectSize': { 'text': '  ' }
                    });
                }
                cell.apply({
                    '#objectName': { 'text': item.cmisName }
                })
            },
            cellHeight: device.platform === 'iOS' ? 60 : 68,
            createCell: this.createCell,
            // itemHeight: device.platform === 'iOS' ? 60 : 68
        }).on('select', ({ index }) => {
            let item = this.collectionViewData[index];
            if (item.cmisBaseTypeId == 'cmis:folder') {
                let folderPage = new FolderPage(item.cmisObjectId, this.navigationView,
                    {
                        title: item.cmisName
                    });
            } else if (item.cmisBaseTypeId == 'cmis:document') {
                // TODO: Check if document has content stream
                this.openContent(item.cmisObjectId, item.cmisName);
            }
        });
    }

    private createCell(cellType: string): Widget {
        let widget = new Composite({
            left: 20, right: 20,
        });
        let cmp = new Composite({
            left: 20, right: 20, bottom: 0, height: 1,
            background: '#d2cab5'
        }).appendTo(widget);
        let icon = new ImageView({
            left: 10, top: 10, bottom: 10,
            id: 'icon',
            scaleMode: 'fit'
        }).appendTo(widget);
        let objectName = new TextView({
            left: 60, top: 8,
            id: 'objectName',
            textColor: '#3b283e'
        }).appendTo(widget);
        let objectSize = new TextView({
            left: 60, top: ["#objectName", 6],
            id: 'objectSize',
            markupEnabled: true,
            textColor: '#9a9a9a'
        }).appendTo(widget);
        widget.on('change:item', ({ value: item }) => {
            // TODO: Still a bug here: Sometimes file size is added to folder types when scrolling
            // Mybe bug in Tabris.js framework ?!?
            if (item.cmisBaseTypeId == 'cmis:document') {
                icon.set('image', 'icons/document.png');
                if (item.cmisContentStreamLength) {
                    let size: number = item.cmisContentStreamLength;
                    if (size < 1024) {
                        objectSize.set('text', size + ' Byte');
                    } else if (size < 1048576) {
                        objectSize.set('text', roundTo((size / 1024), 1) + ' KB');
                    } else if (size < 1073741824) {
                        objectSize.set('text', roundTo((size / 1048576), 1) + ' MB');
                    }
                }
            } else {
                icon.set('image', 'icons/folder.png');
                // we need to set the object size to sth. to prevent randomly setting text while scrolling (bug?!?s)
                objectSize.set('text', ' ');
            }
            objectName.set('text', item.cmisName);
        });
        widget.on('select', function ({ value: item }) {
            console.log("CELL SELECTED !!!!!!")
            icon.set('image', 'icons/Cloud-50.png');
            objectName.set('text', item.cmisBaseTypeId);
        });

        return widget;
    }

    private openContent(fileId: string, fileName: string): void {
        let activityDownload = new Activity(this.collectionView);

        let url = CmisSession.getSession().defaultRepository.repositoryUrl + '/root?objectId=' + fileId + '&cmisselector=content';
        let fileTransfer = new FileTransfer();
        // TODO: This is iOS specific, make generic for Android and Windows
        let target = 'cdvfile://localhost/temporary/cmis/' + encodeURIComponent(fileName);
        activityDownload.startActivity();
        fileTransfer.download(
            url,
            target,
            function (entry) {
                activityDownload.stopActivity();
                cordova.plugins.fileOpener2.open(decodeURIComponent(entry.toURL()), decodeURIComponent(fileName), (data) => {
                    console.log("FileOpener SUCCESS CALLBACK CALLLED !!!!!");
                    console.log("data fileOpener CB: " + JSON.stringify(data));
                });
            },
            function (error) {
                activityDownload.stopActivity();
                console.log("download error complete: " + JSON.stringify(error));
                console.log("download error source: " + JSON.stringify(error.source));
                console.log("download error target: " + JSON.stringify(error.target));
                console.log("download error code: " + JSON.stringify(error.code));
            },
            false,
            {
                headers: {
                    "Authorization": CmisSession.getSession().getAuthHeader()
                }
            }
        );
    }

}