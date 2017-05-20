import { Button, CollectionView, CollectionViewProperties, Composite, CompositeProperties, Page, PageProperties, Picker, NavigationView, ImageView, TextView, TextInput, Widget, device, ui } from 'tabris';
import { CmisSession, CmisRepository } from './cmisSession'
import RepositoriesPage from './repositoriesPage';
import FolderPage from './folderPage';
import Activity from './activity';

export default class ServersPage extends Page {

    private button: Button;

    private imageView: ImageView;

    private repoUrl: TextInput;
    private repoUser: TextInput;
    private repoPassword: TextInput;
    private repoPicker: Picker;

    private navigationView: NavigationView;

    constructor(navigationView: NavigationView, properties?: PageProperties) {
        super(properties);
        this.navigationView = navigationView;
        this.imageView = this.createLogo();
        let inputForm = this.createInputForm();
        let activityConnect = new Activity(inputForm);
        this.button = new Button({
            // top: ['#inputForm', 10], centerX: 0,
            bottom: 10, centerX: 0,
            background: '#3b283e',
            textColor: '#f3f4e4',
            text: 'Connect to Server'
        }).on('select', () => {
            console.log('Connection to server ...');

            CmisSession.init(this.repoUrl.text, this.repoUser.text, this.repoPassword.text).then(() => {
                let repos = this.getRepositories()
                if (repos.length > 1) {
                    // open repositories page if the server has more than one repo
                    new RepositoriesPage(this.navigationView, repos, {
                        title: 'Repositories',
                        background: '#f3f4e4',
                        id: 'repositoriesPage'
                    }).appendTo(this.navigationView);

                } else {
                    // if server has only one repo just open the root folder
                    activityConnect.startActivity();
                    CmisSession.init(this.repoUrl.text, this.repoUser.text, this.repoPassword.text).then(() => {
                        activityConnect.stopActivity();
                        let session = CmisSession.getSession();
                        console.log("REPO: " + JSON.stringify(session.defaultRepository.repositoryId));
                        let rootFolderId = session.defaultRepository.rootFolderId;
                        new FolderPage(rootFolderId, this.navigationView,
                            {
                                title: '/'
                            });
                    }).catch((err) => { console.log(err) })
                }
            });

        }).appendTo(this);

    }

    private createLogo(): ImageView {
        return new ImageView({
            top: 50, centerX: 0,
            id: 'logo',
            image: 'icons/squirrel_200.png'
        }).appendTo(this);
    }

    private createInputForm(): Widget {
        let widget = new Composite({
            left: 20, right: 20, top: ["#logo", 50],
            id: 'inputForm',
            background: '#f3f4e4'
        }).appendTo(this);
        this.repoUrl = new TextInput({
            left: 0, right: 0, top: ["#repoName", 10],
            id: 'repoUrl',
            message: 'URL of the CMIS repository ...',
            // text: 'http://192.168.1.110:8083/cmisBrowser'
            text: 'https://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser'
        }).appendTo(widget);
        this.repoUser = new TextInput({
            left: 0, right: 0, top: ["#repoUrl", 10],
            id: 'repoUser',
            message: 'Username ...',
            // text: 'test'
            text: 'admin'
        }).appendTo(widget);
        this.repoPassword = new TextInput({
            left: 0, right: 0, top: ["#repoUser", 10],
            type: 'password',
            id: 'repoPassword',
            message: 'Password ...',
            // text: 'test'
            text: 'admin'
        }).appendTo(widget);

        return widget;
    }

    private getRepositories(): string[] {
        let session = CmisSession.getSession();
        return Object.keys(session.repositories);
    }
}