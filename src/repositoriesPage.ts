import { Button, CollectionView, CollectionViewProperties, Composite, CompositeProperties, Page, PageProperties, NavigationView, ImageView, TextView, Widget, device } from 'tabris';
import CmisSession from './cmisSession'
import FolderPage from './folderPage';

export default class RepositoriesPage extends Page {

    private button: Button;

    private imageView: ImageView;

    private collectionView: CollectionView;

    private navigationView: NavigationView;

    private static _exampleData = [
        {
            name: "Alfresco CMIS Demo Server",
            url: "https://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser",
            user: "admin",
            password: "admin"
        },
        {
            name: "apollon CMIS Server",
            url: "http://192.168.1.102:8083/cmisBrowser",
            user: 'test',
            password: 'test'
        }
    ];

    constructor(navigationView: NavigationView, properties?: PageProperties) {
        super(properties);
        this.navigationView = navigationView;
        this.imageView = this.createLogo();
        this.collectionView = this.createRepositoriesCollection();
        this.collectionView.appendTo(this);
        this.button = new Button({
            top: ['#repositoriesCollection', 10], centerX: 0,
            background: '#3b283e',
            textColor: '#f3f4e4',
            text: 'Add New Repository'
        }).appendTo(this);
    }

    private createLogo(): ImageView {
        return new ImageView({
            top: 50, centerX: 0,
            id: 'logo',
            image: 'icons/squirrel_200.png'
        }).appendTo(this);
    }

    private createRepositoriesCollection() {
        return new CollectionView({
            left: 10, top: ['#logo', 50], right: 0, bottom: 80,
            id: 'repositoriesCollection',
             itemCount:  RepositoriesPage._exampleData.length,
            cellHeight: device.platform === 'iOS' ? 40 : 48,
            updateCell: this.updateCell,
            createCell: this.createCell
        }).on('select', ({ index }) => {
            let item = RepositoriesPage._exampleData[index];
            console.log('selected XXX: ' + JSON.stringify(item));
            CmisSession.init(item.url, item.user, item.password, () => {
                let session = CmisSession.getSession();
                console.log("REPO: " + JSON.stringify(session.defaultRepository.repositoryId));
                let rootFolderId = session.defaultRepository.rootFolderId;
                new FolderPage(rootFolderId, this.navigationView,
                    {
                        title: '/'
                    });
            }),
                (err) => console.log(err)
        });
    }

    private createCell(cellType: string): Widget {
        let widget = new Composite({
            left: 20, right: 20,
            background: '#f3f4e4'
        });
        let line = new Composite({
            left: 20, right: 20, bottom: 0, height: 1,
            background: '#d2cab5'
        }).appendTo(widget);
        var textView = new TextView({
            left: 10, centerY: 0,
            font: device.platform === 'iOS' ? '23px .HelveticaNeueInterface-Regular' : '20px Roboto Medium',
            textColor: '#3b283e'
        }).appendTo(widget);
        var settingsView = new ImageView({
            right: 10, top: 10, bottom: 10,
            image: 'icons/acorn.png'
        }).appendTo(widget);
        widget.on('select', function ({ index }) {
            textView.set('text', RepositoriesPage._exampleData[index].name);
        });
        return widget;
    }

    private updateCell(cell, index) {
        console.log("In updateCell at index: " + index);
        let data = RepositoriesPage._exampleData[index];
        cell.apply({
            TextView: { text: data.name }
        });
    }

    private getRepositoriesData() {
        return  RepositoriesPage._exampleData;
    }
}