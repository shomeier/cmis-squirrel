import { ActivityIndicator, CollectionView, CollectionViewProperties, Composite, CompositeProperties, ImageView, NavigationView, Page, TextView, device, ui } from 'tabris';
import { SingleCmisSession } from './singleCmisSession'
import { cmis } from './lib/cmis';
import RepositoriesComposite from './repositoriesComposite';
import FolderContentComposite from './folderContentComposite';
import DocumentContentComposite from './documentContentComposite';
declare var cordova: any;

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
                WidgetFactory.createContentPage(rootFolderId, '/', 'cmis:folder', contentNavigationView);
            });
        });

        return repositoriesComposite;
    }

    private static createContentPage(objectId: string, objectName: string, baseTypeId: string, navigationView: NavigationView): void {

        console.log("In createContentPage for id: " + objectId);
        console.log("In createContentPage for name: " + objectName);
        console.log("In createContentPage for type: " + baseTypeId);
        let page = new Page({
            title: objectName
        });
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
            page.appendTo(navigationView);
            console.log("Appended to page ...");
        } else if (baseTypeId == 'cmis:document') {
            // TODO: Check if document has content stream
            WidgetFactory.openContent(objectId, objectName, page);
        }
    }

    private static openContent(fileId: string, fileName: string, page: Page): void {
        let activityIndicator = new ActivityIndicator({
            centerX: 0,
            centerY: 0,
            visible: true
        }).appendTo(ui.contentView);

        let url = 'https://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser/root?objectId=' + fileId + '&cmisselector=content';
        let fileTransfer = new FileTransfer();
        let target = 'cdvfile://localhost/temporary/cmis/cmisTempDownload.' + fileName.substring(fileName.length-3, fileName.length);
        console.log('TARGET: ' + target);
        fileTransfer.download(
            url,
            target,
            function (entry) {
                console.log("download complete: " + entry.toURL());
                activityIndicator.dispose();
                cordova.plugins.fileOpener2.open(entry.toURL(), fileName, (data) => {
                    console.log("CALLBACK CALLLED !!!!!");
                    console.log("data fileOpener CB: " + JSON.stringify(data));
                });
            },
            function (error) {
                activityIndicator.dispose();
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