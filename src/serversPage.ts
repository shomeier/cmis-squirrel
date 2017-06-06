import { Button, CollectionView, CollectionViewProperties, Composite, CompositeProperties, Page, PageProperties, Picker, NavigationView, ImageView, TextView, TextInput, Widget, device, ui } from 'tabris';
import { CmisSession, CmisSettings} from './cmisSession'
import RepositoriesPage from './repositoriesPage';
import FolderPage from './folderPage';
import ErrorMessage from './error';
import Activity from './activity';

declare var secureStorage: Storage;

export default class ServersPage extends Page {

    private button: Button;

    private imageView: ImageView;

    private repoUrl: TextInput;
    private repoUser: TextInput;
    private repoPassword: TextInput;
    private repoUploadType: TextInput;

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

            let settings = this.getSettings();
            this.storeSettings(settings);
            activityConnect.startActivity();
            CmisSession.init(settings).then(() => {
                let repos = this.getRepositories()
                if (repos.length > 1) {
                    // open repositories page if the server has more than one repo
                    new RepositoriesPage(this.navigationView, repos, {
                        title: 'Repositories',
                        background: '#f3f4e4',
                        id: 'repositoriesPage'
                    }).appendTo(this.navigationView);

                } else {
                        let session = CmisSession.getSession();
                        console.log("REPO: " + JSON.stringify(session.defaultRepository.repositoryId));
                        let rootFolderId = session.defaultRepository.rootFolderId;
                        new FolderPage(rootFolderId, this.navigationView,
                            {
                                title: '/'
                            });
                }
                activityConnect.stopActivity();
            }).catch((initErr) => {
                console.log('initErr: ' + JSON.stringify(initErr.response));
                activityConnect.stopActivity();
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
        new TextView({
            id: 'repoUrlLabel',
            text: 'CMIS Browser-Binding URL:'
        }).appendTo(widget);
        this.repoUrl = new TextInput({
            left: 0, right: 0, top: ["#repoUrlLabel", 1],
            id: 'repoUrl',
            text: localStorage.getItem('url') || ''
            // text: 'https://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser'
        }).appendTo(widget);
        new TextView({
            top: ['#repoUrl', 5],
            id: 'repoUserLabel',
            text: 'Username:'
        }).appendTo(widget);
        this.repoUser = new TextInput({
            left: 0, right: 0, top: ["#repoUserLabel", 1],
            id: 'repoUser',
            text: localStorage.getItem('user') || ''
        }).appendTo(widget);
        new TextView({
            top: ['#repoUser', 5],
            id: 'repoPasswordLabel',
            text: 'Password:'
        }).appendTo(widget);
        this.repoPassword = new TextInput({
            left: 0, right: 0, top: ["#repoPasswordLabel", 1],
            type: 'password',
            id: 'repoPassword',
            text: secureStorage.getItem('password') || ''
        }).appendTo(widget);
        new TextView({
            top: ['#repoPassword', 5],
            id: 'repoUploadType',
            text: "Type ID of uploaded images (default 'cmis:document'):"
        }).appendTo(widget);
        this.repoUploadType = new TextInput({
            left: 0, right: 0, top: ["#repoUploadType", 1],
            id: 'repoUploadType',
            text: localStorage.getItem('uploadType') || 'cmis:document'
        }).appendTo(widget);

        return widget;
    }

    private getRepositories(): string[] {
        let session = CmisSession.getSession();
        return Object.keys(session.repositories);
    }

    private getSettings():CmisSettings {
        return {'url': this.repoUrl.text, 'user': this.repoUser.text, 'password': this.repoPassword.text, 'uploadType':this.repoUploadType.text};
    }

    private storeSettings(settings:CmisSettings) {
        localStorage.setItem('url', settings.url);
        localStorage.setItem('user', settings.user);
        secureStorage.setItem('password', settings.password);
        localStorage.setItem('uploadType', settings.uploadType);
    }
}