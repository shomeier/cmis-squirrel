import { ActivityIndicator, CollectionView, Widget, CollectionViewProperties, Composite, CompositeProperties, ImageView, Page, PageProperties, NavigationView, TextView, device, ui } from 'tabris';
import { CmisSession } from './cmisSession'
const roundTo = require('round-to');
declare var cordova: any;

export default class PropertiesPage extends Page {

    private objectId: string;

    private collectionView: CollectionView;

    private navigationView: NavigationView;

    private activityIndicator: ActivityIndicator;

    constructor(objectId: string, navigationView: NavigationView, properties?: PageProperties) {
        super(properties);
        this.objectId = objectId;
        this.navigationView = navigationView;
        this.appendTo(navigationView);
        let session = CmisSession.getSession();

        this.activityIndicator = new ActivityIndicator({
            centerX: 0,
            centerY: 0,
            visible: true,
        }).appendTo(this);

        session.getObject(objectId).then(cmisObject => {
            console.log('Properties Data: ' + JSON.stringify(cmisObject));
            let sampleData = [{ key: 'cmisObjectId', 'value': cmisObject.cmisObjectId },
            { key: 'cmisName', 'value': cmisObject.cmisName },
            { key: 'cmisBaseTypeId', 'value': cmisObject.cmisBaseTypeId }]

            this.collectionView = this.createPropertiesCollectionView(sampleData);
            this.collectionView.appendTo(this);

            this.activityIndicator.visible = false;
        });


    }

    private createPropertiesCollectionView(data: any[]) {
        return new CollectionView({
            left: 0, top: 0, right: 0, bottom: 0,
            id: 'propertiesCollectionView',
            // items: data,
            // updateCell: this.updateCell,
            createCell: this.initializeCell,
            // itemHeight: device.platform === 'iOS' ? 60 : 68
        });
    }

    private initializeCell(cellType: string): Widget {
        let cmp = new Composite({
            left: 10, right: 10, bottom: 0, height: 1,
            background: '#bbb'
        });
        var keyText = new TextView({
            left: 10, top: 5,
            id: 'objectName',
            textColor: '#4a4a4a'
        }).appendTo(cmp);
        var valueText = new TextView({
            left: 100, top: 5,
            markupEnabled: true,
            textColor: '#9a9a9a'
        }).appendTo(cmp);
        cmp.on('change:item', function ({ value: item }) {
            keyText.set('text', item.key);
            valueText.set('text', item.value)
        });

        return cmp;
    }
}
