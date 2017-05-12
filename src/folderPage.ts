import { ActivityIndicator, Button, CollectionView, Widget, CollectionViewProperties, Composite, CompositeProperties, ImageView, Page, PageProperties, NavigationView, TextView, device, ui } from 'tabris';
import CmisSession from './cmisSession'
import PropertisPage from './propertiesPage';
const roundTo = require('round-to');
// const base64 = require('base64-js');
declare var navigator: any;
declare var FileTransfer: any;
declare var FileUploadOptions: any;
declare var cordova: any;
declare var Camera: any;
declare var global: any;
declare var FileReader: any;
declare var window: any;
// declare var FileUploadOptions: any;
// declare module NodeJS  {
//     interface Global {
//         btoa: any,
//         atoa: any
//     }
// }

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function atob(input) {
    var str = String(input).replace(/[=]+$/, ''); // #31: ExtendScript bad parse of /=
    if (str.length % 4 == 1) {
        throw new console.error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
        // initialize result and counters
        var bc = 0, bs, buffer, idx = 0, output = '';
        // get next character
        buffer = str.charAt(idx++);
        // character found in table? initialize bit storage and add its ascii value;
        ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
            // and if not first of each 4 characters,
            // convert the first 8 bits to one ascii character
            bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
        // try to find character in table (0-63, not found => -1)
        buffer = chars.indexOf(buffer);
    }
    // return input;
    return output;
};

function btoa(input) {
    var str = String(input);
    for (
        // initialize result and counter
        var block, charCode, idx = 0, map = chars, output = '';
        // if the next str index does not exist:
        // change the mapping table to "="
        // check if d has no fractional digits
        str.charAt(idx | 0) || (map = '=', idx % 1);
        // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
        output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
        charCode = str.charCodeAt(idx += 3 / 4);
        if (charCode > 0xFF) {
            console.error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
    }
    return output;
};

var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = atob(base64);
    console.log("RAW: " + raw);
    //   return _utf8_decode(raw);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    console.log("Array: " + array);
    //   return array;
    return raw;
}

// function b64toBlob(b64Data, contentType, sliceSize?) {
//   contentType = contentType || '';
//   sliceSize = sliceSize || 512;

// //   var byteCharacters = atob(b64Data);

//   var byteCharacters = base64.toByteArray(b64Data);
//   var byteArrays = [];
//   var byteArray = new Uint8Array(base64.toByteArray(b64Data));

// //   for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
// //     var slice = byteCharacters.slice(offset, offset + sliceSize);

// //     var byteNumbers = new Array(slice.length);
// //     for (var i = 0; i < slice.length; i++) {
// //       byteNumbers[i] = slice.charCodeAt(i);
// //     }

// //     var byteArray = new Uint8Array(byteNumbers);

//     let tmpS:string = byteArrays.push(byteArray).toString;
// //   }

//     var array = new Uint8Array(new ArrayBuffer(byteArrays.length))
//       for(let i = 0; i < byteArrays.length; i++) {
//     array[i] = string.charCodeAt(i);
//   }
//   return array;
//     // return byteArrays;
// //   var blob = new Blob(byteArrays, {type: contentType});
// //   return blob;
// }

function arrayBufferToString(buffer) {
    var byteArray = new Uint8Array(buffer);
    var str = "", cc = 0, numBytes = 0;
    for (var i = 0, len = byteArray.length; i < len; ++i) {
        var v = byteArray[i];
        if (numBytes > 0) {
            //2 bit determining that this is a tailing byte + 6 bit of payload
            if ((cc & 192) === 192) {
                //processing tailing-bytes
                cc = (cc << 6) | (v & 63);
            } else {
                throw new Error("this is no tailing-byte");
            }
        } else if (v < 128) {
            //single-byte
            numBytes = 1;
            cc = v;
        } else if (v < 192) {
            //these are tailing-bytes
            throw new Error("invalid byte, this is a tailing-byte")
        } else if (v < 224) {
            //3 bits of header + 5bits of payload
            numBytes = 2;
            cc = v & 31;
        } else if (v < 240) {
            //4 bits of header + 4bit of payload
            numBytes = 3;
            cc = v & 15;
        } else {
            //UTF-8 theoretically supports up to 8 bytes containing up to 42bit of payload
            //but JS can only handle 16bit.
            throw new Error("invalid encoding, value out of range")
        }

        if (--numBytes === 0) {
            str += String.fromCharCode(cc);
        }
    }
    if (numBytes) {
        throw new Error("the bytes don't sum up");
    }
    return str;
}

let _keyStr: String = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

// public method for decoding
let decode = function decode(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    output = _utf8_decode(output);

    return output;
}

// private method for UTF-8 decoding
let _utf8_decode = function (utftext) {
    var string = "";
    var i = 0;
    var c1 = 0;
    var c2 = 0;
    var c3 = 0;
    var c = 0;

    while (i < utftext.length) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        }
        else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }

    return string;
}

export default class FolderPage extends Page {

    private folderId: string;

    private button: Button;

    private collectionView: CollectionView;

    private navigationView: NavigationView;

    private activityIndicator: ActivityIndicator;

    private data: any;

    constructor(folderId: string, navigationView: NavigationView, properties?: PageProperties) {
        super(properties);
        this.folderId = folderId;
        this.navigationView = navigationView;
        this.appendTo(navigationView);
        let session = CmisSession.getSession();

        this.activityIndicator = new ActivityIndicator({
            centerX: 0,
            centerY: 0,
            visible: true,
        }).appendTo(this);

        session.getChildren(folderId).then(data => {
            let cmisObjects: any[] = data.objects;
            let tmpData: any[] = new Array(data.objects.length);
            for (var i = 0; i < cmisObjects.length; i++) {
                // console.log(i + " ----------------------------------");
                let tmp: any = {};
                tmp.cmisObjectId = cmisObjects[i].object.properties['cmis:objectId'].value;
                tmp.cmisName = cmisObjects[i].object.properties['cmis:name'].value;
                tmp.cmisBaseTypeId = cmisObjects[i].object.properties['cmis:baseTypeId'].value;
                if (cmisObjects[i].object.properties['cmis:contentStreamLength']) {
                    tmp.cmisContentStreamLength = cmisObjects[i].object.properties['cmis:contentStreamLength'].value;
                }
                tmpData[i] = tmp;
                // console.log("cmisObjectId: " + tmpData[i].cmisObjectId);
                // console.log("cmisName: " + tmpData[i].cmisName);
                // console.log("cmisBaseTypeId: " + tmpData[i].cmisBaseTypeId);
                // console.log("contentStreamLength: " + tmpData[i].cmisContentStreamFileSize);
            }
            this.data = tmpData;
            this.collectionView = this.createContentCollectionView(this.data);
            this.collectionView.appendTo(this);

            if (device.platform === "iOS") {
                // var base64 = require('base64');
                // global.btoa = base64.btoa;
                global.atob = atob;
            }

            this.button = new Button({
                // top: ['#contentCollectionView', 10], centerX: 0, width: ,
                top: ['#contentCollectionView', 10], left: 10, right: 10,
                background: '#3b283e',
                textColor: '#f3f4e4',
                text: 'Upload'
            }).on('select', () => {
                console.log('Upload button pressed ...');

                let activityIndicator = this.activityIndicator;
                let contentColView = this.collectionView;

                activityIndicator.visible = true;
                contentColView.enabled = false;

                let options = {
                    'destinationType': Camera.DestinationType.FILE_URI,
                    'sourceType': Camera.PictureSourceType.PHOTOLIBRARY,
                    'quality': 10
                };

                navigator.camera.getPicture((imageData) => {
                    console.log('Camera Success ...');
                    console.log('Camera Success Image Data: ' + JSON.stringify(imageData));

                    let fileName: string = imageData.substr(imageData.lastIndexOf('/') + 1);
                    
                    let url = CmisSession.getSession().defaultRepository.repositoryUrl + '/root?objectId=' + folderId + '&cmisaction=createDocument';
                    let fileTransfer = new FileTransfer();
                    let fileUploadOptions: any = {};
                    fileUploadOptions.headers = {
                        "Authorization": CmisSession.getSession().getAuthHeader()
                    };
                    fileUploadOptions.fileKey = "file";
                    fileUploadOptions.fileName = fileName;
                    fileUploadOptions.chunkedMode = true;
                    fileUploadOptions.params = {
                        'propertyId[0]': 'cmis:objectTypeId',
                        'propertyValue[0]': 'cmis:document',
                        'propertyId[1]': 'cmis:name',
                        'propertyValue[1]': fileName,
                        'succinct': 'true',
                    };
                    fileUploadOptions.mimeType = "image/jpeg";
                    fileUploadOptions.chunkedMode = true;
                    fileUploadOptions.httpMethod = "POST";
                    fileTransfer.upload(
                        imageData,
                        url,
                        ((response) => {
                            console.log("Upload complete: " + JSON.stringify(response));
                            activityIndicator.visible = false;
                            contentColView.enabled = true;
                            // activityIndicator.visible = false;
                            // contentColView.enabled = true;
                            // cordova.plugins.fileOpener2.open(decodeURIComponent(entry.toURL()), decodeURIComponent(fileName), (data) => {
                            //     console.log("CALLBACK CALLLED !!!!!");
                            //     console.log("data fileOpener CB: " + JSON.stringify(data));
                            // });
                        }),
                        ((error) => {
                            console.log("Upload error: " + JSON.stringify(error));
                            activityIndicator.visible = false;
                            contentColView.enabled = true;
                            // activityIndicator.visible = false;
                            // contentColView.enabled = true;
                            // console.log("download error complete: " + JSON.stringify(error));
                            // console.log("download error source: " + JSON.stringify(error.source));
                            // console.log("download error target: " + JSON.stringify(error.target));
                            // console.log("download error code: " + JSON.stringify(ersror.code));
                        }),
                        fileUploadOptions,
                        true
                    );

                    // window.resolveLocalFileSystemURL(imageData, (fileEntry) => {
                    //     console.log("Got file ...");
                    //     // console.log("fileEntry: " + JSON.stringify(fileEntry));
                    //     fileEntry.file((file) => {
                    //         // console.log("file: " + JSON.stringify(file));
                    //         let reader = new FileReader();
                    //         reader.onloadend = function (e) {
                    //             // console.log("Text is: " + JSON.stringify(this.result));
                    //             let content = reader.result;
                    //             // console.log("CONTENT: " + decode(content));
                    //             // let content = this.result.match(/,(.*)$/)[1];
                    //             // console.log("Target atob: " + decode(content));
                    //             var url = "data:image/png;base64,TXlUZXN0";
                    //             // console.log("CONTENT: " + content);
                    //             let contentType = 'image/jpeg';
                    //             var b64Data = content;

                    //             // let test = content.match(/,(.*)$/)[1];
                    //             // console.log("TEST: " + decode(test));
                    //             // let test = convertDataURIToBinary(content);
                    //             // let test = arrayBufferToString(content);
                    //             // let test =  JSON.stringify((new Int8Array(content)), null, '  ');
                    //             // let test =  ab2str(content);
                    //             let test =  convertDataURIToBinary(content);
                    //             console.log("DECODED: " + test);
                    //             // console.log("TEST: " + test)

                    //             // console.log("test decode: " + decode(test));

                    //             // var blob = convertDataURIToBinary(url);
                    //             // console.log("BLOB: " + blob);
                    //             // for (let i = 0; i < blob.length; i++)
                    //             // {
                    //             //     console.log(i + ": " + blob[i]);
                    //             // }
                    //             // fetch(content).then((res) => res.blob())
                    //             //     .then(blob => console.log(blob));
                    //             // console.log("Target atob: " + base64.toByteArray(content));
                    //             CmisSession.getSession().createDocument(folderId, test, 'test_upload');
                    //             // .then((response) => {
                    //             //     console.log('Created Document...');
                    //             //     console.log('Response: ' + JSON.stringify(response));
                    //             //     activityIndicator.visible = false;
                    //             //     contentColView.enabled = true;
                    //             // });
                    //                 activityIndicator.visible = false;
                    //                 contentColView.enabled = true;

                    //         }

                    //         reader.readAsDataURL(file);
                    //     });
                    // }, (e) => {
                    //     console.log("Failed reading file ...");
                    //     console.log("e: " + JSON.stringify(e));
                    // });

                    // CmisSession.getSession().createDocument(folderId, imageData, 'test_upload').then((response) => {
                    //     console.log('Created Document...');
                    //     console.log('Response: ' + JSON.stringify(response));
                    // });
                }, (err) => {
                    console.log('Camera error ...');
                    console.log('Camera error: ' + JSON.stringify(err));
                },
                    options);
            }
                ).appendTo(this);

            this.activityIndicator.visible = false;
        });
    }

    private createContentCollectionView(data: any[]) {
        let navigationView = this.navigationView;
        let myData = this.data;
        return new CollectionView({
            left: 0, top: 0, right: 0, bottom: 62,
            id: 'contentCollectionView',
            // items: data,
            itemCount: this.data.length,
            updateCell: (cell, index) => {
                console.log("In updateCell at index: " + index);
                let item = myData[index];
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
                } else {
                    cell.apply({
                        '#icon': { 'image': 'icons/folder.png' },
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
        }).on('select', ({ item }) => {
            console.log("In Select EventHandler ...");
            console.log("Item selected: " + JSON.stringify(item));
            console.log("cmisObjectId: " + JSON.stringify(item.cmisObjectId));
            console.log("Creating sub content page ...");
            if (item.cmisBaseTypeId == 'cmis:folder') {
                let folderPage = new FolderPage(item.cmisObjectId, this.navigationView,
                    {
                        // background: '#f3f4e4',
                        title: item.cmisName
                    });
            } else if (item.cmisBaseTypeId == 'cmis:document') {
                // TODO: Check if document has content stream
                this.openContent(item.cmisObjectId, item.cmisName);
            }
            console.log("Created sub content page ...");
        }).on('longpress', function ({ target }) {
            console.log("LONGPRESS ON SELECTION VIEW !!!!!!");
            console.log("ITEM: " + JSON.stringify(target.item));
            // TODO: Open another page with metdata/properties here
            // Currently does not work propely: 'select' event interferes with 'longpress' somehow
            // new PropertisPage(target.item.cmisObjectId, navigationView,
            //     {
            //         title: target.item.cmisName
            //     });
        });
    }

    private createCell(cellType: string): Widget {
        let widget = new Composite({
            left: 20, right: 20,
            // background: '#bbb'
            // background: '#3b283e'
        });
        let cmp = new Composite({
            left: 20, right: 20, bottom: 0, height: 1,
            // background: '#bbb'
            // background: '#3b283e'
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
            // textColor: '#4a4a4a'
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
        // let navigationView = this.navigationView;
        // cell.on('longpress', function ({target}) {
        //     console.log("LONGPRESS ON CELL !!!!!!");
        //     console.log("ITEM: " + JSON.stringify(target.item));
        //     // TODO: Open another page with metdata/properties here
        //     new PropertisPage(target.item.cmisObjectId, navigationView,
        //         {
        //             title: target.item.cmisName
        //         });
        // });
    }

    private updateCell(cell, index) {
        console.log("In updateCell at index: " + index);
        let item = this.data[index];
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
        } else {
            cell.apply({
                '#icon': { 'image': 'icons/folder.png' },
                // we need to set the object size to sth. to prevent randomly setting text while scrolling (bug?!?s)
                '#objectSize': { 'text': '  ' }
            });
        }
        cell.apply({
            '#objectName': { 'text': item.cmisName }
        });
    }

    private openContent(fileId: string, fileName: string): void {
        // Need to reassign cause we can not use 'this' keyword in callbacks to fileTransfer
        // TODO: Check if doing sth. like this is ok
        let activityIndicator = this.activityIndicator;
        let contentColView = this.collectionView;

        activityIndicator.visible = true;
        contentColView.enabled = false;

        let url = CmisSession.getSession().defaultRepository.repositoryUrl + '/root?objectId=' + fileId + '&cmisselector=content';
        let fileTransfer = new FileTransfer();
        let target = 'cdvfile://localhost/temporary/cmis/' + encodeURIComponent(fileName);
        console.log('TARGET: ' + target);
        fileTransfer.download(
            url,
            target,
            function (entry) {
                console.log("download complete: " + decodeURIComponent(entry.toURL()));
                activityIndicator.visible = false;
                contentColView.enabled = true;
                cordova.plugins.fileOpener2.open(decodeURIComponent(entry.toURL()), decodeURIComponent(fileName), (data) => {
                    console.log("CALLBACK CALLLED !!!!!");
                    console.log("data fileOpener CB: " + JSON.stringify(data));
                });
            },
            function (error) {
                activityIndicator.visible = false;
                contentColView.enabled = true;
                console.log("download error complete: " + JSON.stringify(error));
                console.log("download error source: " + JSON.stringify(error.source));
                console.log("download error target: " + JSON.stringify(error.target));
                console.log("download error code: " + JSON.stringify(error.code));
            },
            false,
            {
                headers: {
                    // "Authorization": "Basic YWRtaW46YWRtaW4="
                    "Authorization": CmisSession.getSession().getAuthHeader()
                }
            }
        );
    }

}