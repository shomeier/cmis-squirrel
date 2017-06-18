import { Button, CollectionView, CollectionViewProperties, Composite, CompositeProperties, Page, PageProperties, Picker, NavigationView, ImageView, TextView, TextInput, ToggleButton, Widget, device, ui } from 'tabris';
import { CmisSession, CmisSettings } from './cmisSession'
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
    private repoCmisType: TextInput;
    private repoUploadFormat: ToggleButton;
    // private repoUploadQuality: TextInput;

    private navigationView: NavigationView;

    constructor(navigationView: NavigationView, properties?: PageProperties) {
        super(properties);
        this.navigationView = navigationView;
        this.imageView = this.createLogo();
        let inputForm = this.createInputForm();
        let activityConnect = new Activity(inputForm);
        this.button = new Button({
            bottom: 10, centerX: 0,
            background: '#3b283e',
            textColor: '#f3f4e4',
            id: 'connectButton',
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
            top: 40, centerX: 0,
            id: 'logo',
            image: 'icons/squirrel200.png'
        }).appendTo(this);
    }

    private createInputForm(): Widget {
        let widget = new Composite({
            left: 20, right: 20, bottom: ["#connectButton", 30],
            id: 'inputForm',
            background: '#f3f4e4'
        }).appendTo(this);
        new TextView({
            id: 'repoUrlLabel',
            text: 'CMIS Browser-Binding URL:'
        }).appendTo(widget);
        this.repoUrl = this.createTextInput(widget, 'repoUrl', 'repoUrlLabel', 'url', '');
        new TextView({
            top: ['#repoUrl', 5],
            id: 'repoUserLabel',
            text: 'Username:'
        }).appendTo(widget);
        this.repoUser = this.createTextInput(widget, 'repoUser', 'repoUserLabel', 'user', '');
        new TextView({
            top: ['#repoUser', 5],
            id: 'repoPasswordLabel',
            text: 'Password:'
        }).appendTo(widget);
        this.repoPassword = this.createTextInput(widget, 'repoPassword', 'repoPasswordLabel', 'password', '');
        new TextView({
            top: ['#repoPassword', 5],
            id: 'repoCmisTypeLabel',
            text: "CMIS Type ID for uploaded images:"
        }).appendTo(widget);
        this.repoCmisType = this.createTextInput(widget, 'repoCmisType', 'repoCmisTypeLabel', 'cmisType', 'cmis:document');
        new TextView({
            top: ['#repoCmisType', 5],
            id: 'repoUploadFormatLabel',
            text: "Upload Format:"
        }).appendTo(widget);
        this.repoUploadFormat = this.createToggleButton(widget, 'repoUploadFormat', 'repoUploadFormatLabel', 'uploadFormat', 'JPG');
        // this.repoUploadQuality = this.createTextInput(widget, 'repoUploadQuality', 'repoUploadQualityLabel', 'uploadQuality', '50');

        return widget;
    }

    private getRepositories(): string[] {
        let session = CmisSession.getSession();
        return Object.keys(session.repositories);
    }

    private getSettings(): CmisSettings {
        return { 'url': this.repoUrl.text, 'user': this.repoUser.text, 'password': this.repoPassword.text, 'cmisType': this.repoCmisType.text, 'uploadFormat': this.repoUploadFormat.text };
    }

    private storeSettings(settings: CmisSettings): void {
        localStorage.setItem('url', settings.url);
        localStorage.setItem('user', settings.user);
        // password in secure storage
        secureStorage.setItem('password', settings.password);
        localStorage.setItem('cmisType', settings.cmisType);
        localStorage.setItem('uploadFormat', settings.uploadFormat);
    }

    private disableLogo(): void {
        this.imageView.enabled = false;
    }

    private enableLogo(): void {
        this.imageView.enabled = true;
    }

    private createTextInput(parent: Composite, id, topId, itemKey, dflt: string): TextInput {
        let store = localStorage.getItem(itemKey) || dflt;
        if (itemKey == 'password') {
            store = secureStorage.getItem(itemKey) || dflt;
        }
        return new TextInput({
            left: 0, right: 0, top: ['#' + topId, 1],
            id: id,
            text: store
        }).on('focus', () => {
            this.disableLogo();
        }).on('blur', () => {
            this.enableLogo();
        }).appendTo(parent);
    }

    private createToggleButton(parent: Composite, id, topId, itemKey, dflt: string): ToggleButton {
        let store = localStorage.getItem(itemKey) || dflt;
        return new ToggleButton({
            left: 0, right: 0, top: ['#' + topId, 1],
            id: id,
            background: '#3b283e',
            // textColor: '#f3f4e4',
            textColor: '#d2cab5',
            checked: (store == 'JPG'),
            text: store
        }).on('select', ({ target, checked }) => {
            console.log("Select Event ...value: " + checked);
            if (checked) {
                target.text = 'JPG';
            } else {
                target.text = 'PNG';
            }
        }).appendTo(parent);
    }
}