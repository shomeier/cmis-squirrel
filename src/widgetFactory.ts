import { ActivityIndicator, CollectionView, CollectionViewProperties, Composite, CompositeProperties, ImageView, NavigationView, Page, TextView, device, ui } from 'tabris';
import { SingleCmisSession } from './singleCmisSession'
import { cmis } from './lib/cmis';
import RepositoriesComposite from './repositoriesComposite';
import FolderPage from './folderPage';
// declare var cordova: any;

export default class WidgetFactory extends Composite {

    public static createRepositoryPage(contentNavigationView: NavigationView): Page {
        return new Page({
            title: 'CMIS Repositories',
            id: 'repositoriesPage'
        }).append(WidgetFactory.createRepositoriesComposite(contentNavigationView));
    }

    private static createRepositoriesComposite(contentNavigationView: NavigationView): Composite {
        let repositoriesComposite = new RepositoriesComposite({
            left: 0, top: 0, right: 0, bottom: 0
        });

        let repositoriesCollection = repositoriesComposite.find('#repositoriesCollection')
        repositoriesCollection.on('select', ({ item }) => {
            console.log('selected XXX: ' + JSON.stringify(item));
            let session = SingleCmisSession.initCmisSession(item.url);
            session.setCredentials(item.user, item.password);
            session.setErrorHandler((err) => console.log(err));
            session.loadRepositories().then(() => {
                console.log("REPO: " + JSON.stringify(session.defaultRepository.repositoryId));
                let rootFolderId = session.defaultRepository.rootFolderId;
                // WidgetFactory.createContentPage(rootFolderId, '/', 'cmis:folder', contentNavigationView);
                new FolderPage(rootFolderId, contentNavigationView,
                {
                    title: '/'
                });
            });
        });

        return repositoriesComposite;
    }
}