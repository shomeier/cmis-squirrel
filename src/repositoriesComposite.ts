import { CollectionView, CollectionViewProperties, Composite, CompositeProperties, ImageView, TextView, device } from 'tabris';

export default class RepositoriesComposite extends Composite {

    private repositoriesView: CollectionView;

    private exampleData = [{
        name: "Alfresco CMIS Demo",
        url: "http://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser",
        user: "admin",
        password: "admin"
    }];

    constructor(properties?: CompositeProperties) {
        super(properties);
        this.repositoriesView = this.createRepositoriesCollection();
        this.repositoriesView.appendTo(this);
    }

    private createRepositoriesCollection() {
        return new CollectionView({
            left: 0, top: 50, right: 0, bottom: 0,
            id: 'repositoriesCollection',
            items: this.getRepositoriesData(),
            initializeCell: this.initializeCell,
            itemHeight: device.platform === 'iOS' ? 40 : 48
        })
    }

    private initializeCell(cell) {
        new Composite({
            left: 0, right: 0, bottom: 0, height: 1,
            background: '#bbb'
        }).appendTo(cell);
        var imageView = new ImageView({
            left: 10, top: 10, bottom: 10
        }).appendTo(cell);
        var textView = new TextView({
            left: 52, centerY: 0,
            font: device.platform === 'iOS' ? '23px .HelveticaNeueInterface-Regular' : '20px Roboto Medium',
            textColor: device.platform === 'iOS' ? 'rgb(22, 126, 251)' : '#212121'
        }).appendTo(cell);
        cell.on('change:item', function ({ value: repo }) {
            imageView.set('image', 'icons/repository.png');
            textView.set('text', repo.name);
        });
        cell.on('select', function ({ value: repo }) {
            imageView.set('image', 'icons/repository.png');
            textView.set('text', repo.name);
        });
    }

    private getRepositoriesData() {
        return this.exampleData;
    }
}