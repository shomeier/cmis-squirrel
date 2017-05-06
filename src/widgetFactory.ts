import { CollectionView, CollectionViewProperties, Composite, CompositeProperties, ImageView, NavigationView, Page, TextView, device, ui } from 'tabris';
import { SingleCmisSession } from './singleCmisSession'
import { cmis } from './lib/cmis';
import RepositoriesComposite from './repositoriesComposite';
import FolderContentComposite from './folderContentComposite';
import DocumentContentComposite from './documentContentComposite';

export default class WidgetFactory extends Composite {

    public static createRepositoryPage(contentNavigationView: NavigationView): Page {
        return new Page({
            title: 'CMIS Repositories',
            // autoDispose: false,
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
                WidgetFactory.createContentPage(rootFolderId, '/', 'cmis:folder', contentNavigationView);
            });
        });

        return repositoriesComposite;
    }

    private static createContentPage(objectId: string, objectName: string, baseTypeId: string, navigationView: NavigationView): Page {
        let page = new Page({
            title: objectName,
            autoDispose: false
        });

        console.log("In createContentPage for id: " + objectId);
        console.log("In createContentPage for name: " + objectName);
        console.log("In createContentPage for type: " + baseTypeId);
        if (baseTypeId == 'cmis:folder') {
            let folderContentComposite = new FolderContentComposite(objectId,
                () => {
                    folderContentComposite.find('#contentCollectionView').on('select', ({ item }) => {
                        console.log("In Select EventHandler ...");
                        console.log("Item selected: " + JSON.stringify(item));
                        console.log("cmisObjectId: " + JSON.stringify(item.cmisObjectId));
                        // if (item.cmisBaseTypeId == 'cmis:folder') {
                            console.log("Creating sub content page ...");
                            WidgetFactory.createContentPage(item.cmisObjectId, item.cmisName, item.cmisBaseTypeId, navigationView);
                            console.log("Created sub content page ...");
                        // }
                    })
                }, {
                    left: 0, top: 0, right: 0, bottom: 0
                }).appendTo(page);

            // console.log("Appending to page ...");
            // contentComposite.appendTo(page);
        } else {
            let documentContentComposite = new DocumentContentComposite(objectId).appendTo(page);
        }
        page.appendTo(navigationView);
        console.log("Appended to page ...");
        return page;
    }
}