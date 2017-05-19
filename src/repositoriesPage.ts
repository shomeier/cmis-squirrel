import { ActivityIndicator, Button, CollectionView, Widget, CollectionViewProperties, Composite, CompositeProperties, ImageView, Page, PageProperties, NavigationView, TextView, device, ui } from 'tabris';
import { CmisSession, CmisRepository } from './cmisSession'
import Activity from './activity';
import FolderPage from './folderPage';

export default class RepositoriesPage extends Page {

    private collectionView: CollectionView;

    private navigationView: NavigationView;

    private repositories: string[];

    constructor(navigationView: NavigationView, repositories: string[], properties?: PageProperties) {
        super(properties);
        this.navigationView = navigationView;
        this.repositories = repositories;
        this.appendTo(navigationView);
        this.collectionView = this.createContentCollectionView();
        this.collectionView.appendTo(this);
    }

    private createContentCollectionView() {
        let navigationView = this.navigationView;
        let myRepos = this.repositories;
        console.log("this.repositories.length: " + this.repositories.length);
        return new CollectionView({
            left: 0, top: 0, right: 0, bottom: 62,
            id: 'contentCollectionView',
            itemCount: this.repositories.length,
            updateCell: this.updateCell,
            cellHeight: device.platform === 'iOS' ? 60 : 68,
            createCell: this.createCell,
        }).on('select', ({ index }) => {
            let item = this.repositories[index];
            console.log("In Select EventHandler ... index: " + index);
            console.log("Item selected: " + JSON.stringify(item));
            console.log("Creating sub content page ...");
            let session = CmisSession.getSession();
            console.log("Session repos: " + JSON.stringify(session.repositories[item]));
            console.log("Default repo: " + JSON.stringify(session.defaultRepository ));
            session.defaultRepository = session.repositories[item];
            let rootFolderId = session.repositories[item].rootFolderId
                let folderPage = new FolderPage(rootFolderId, this.navigationView,
                    {
                        title: '/'
                    });
            console.log("Created sub content page ...");
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
            left: 15, top: 15, bottom: 15,
            id: 'icon',
            scaleMode: 'fit'
        }).appendTo(widget);
        let repositoryName = new TextView({
            left: 60, centerY: 0,
            font: device.platform === 'iOS' ? '23px .HelveticaNeueInterface-Regular' : '20px Roboto Medium',
            id: 'repositoryName',
            textColor: '#3b283e'
        }).appendTo(widget);

        return widget;
    }

    private updateCell(cell, index) {
        let repositories = Object.keys(CmisSession.getSession().repositories);
        console.log("In updateCell at index: " + index);
        let item = repositories[index];
        cell.apply({
            '#icon': { 'image': 'icons/acorn.png' },
            '#repositoryName': { 'text': item }
        });
    }
}