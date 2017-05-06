import { CollectionView, CollectionViewProperties, Composite, CompositeProperties, ImageView, Page, TextView, device } from 'tabris';
import { SingleCmisSession } from './singleCmisSession'
import { cmis } from './lib/cmis';

export default class ContentComposite extends Composite {

    private contentData: any[];

    private folderId: string;

    private contentCollectionView: CollectionView;

    constructor(folderId: string, properties?: CompositeProperties) {
        super(properties);
        this.folderId = folderId;
        let session = SingleCmisSession.getCmisSession();
        session.getChildren(folderId).then(data => {
            let cmisObjects: any[] = data.objects;
            let tmpData: any[] = new Array(data.objects.length);
            for (var i = 0; i < cmisObjects.length; i++) {
                console.log("----------------------------------");
                console.log("i: " + i);
                // tmpData[i] = cmisObjects[i].object.properties;
                tmpData[i] = {
                    'cmisName': cmisObjects[i].object.properties['cmis:name'].value,
                    'cmisBaseTypeId': cmisObjects[i].object.properties['cmis:baseTypeId'].value
                };
                console.log("cmisName: " + tmpData[i].cmisName);
                console.log("cmisBaseTypeId: " + tmpData[i].cmisBaseTypeId);
            }
            this.contentCollectionView = this.createContentCollectionView(tmpData);
            this.contentCollectionView.appendTo(this);
        });
    }

    private createContentCollectionView(data: any[]) {
        return new CollectionView({
            left: 0, top: 50, right: 0, bottom: 0,
            id: 'contentCollection',
            items: data,
            initializeCell: this.initializeCell,
            itemHeight: device.platform === 'iOS' ? 60 : 68
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
            imageView.set('image', 'icons/Cloud-50.png');
            textView.set('text', item.cmisBaseTypeId);
        });
    }

}