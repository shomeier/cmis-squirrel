import { Button, CollectionView, CollectionViewProperties, Composite, CompositeProperties, Page, PageProperties, NavigationView, ImageView, TextView, TextInput, Widget, device } from 'tabris';
import { CmisSession, CmisRepository } from './cmisSession'
import FolderPage from './folderPage';
import Activity from './activity';

export default class RepositoriesPage extends Page {

    private button: Button;

    private imageView: ImageView;

    private repoUrl:TextInput;
    private repoUser:TextInput;
    private repoPassword:TextInput;

    private navigationView: NavigationView;

    constructor(navigationView: NavigationView, properties?: PageProperties) {
        super(properties);
        this.navigationView = navigationView;
        this.imageView = this.createLogo();
        let inputForm = this.createInputForm();
        let activityConnect = new Activity(inputForm);
        this.button = new Button({
            top: ['#inputForm', 10], centerX: 0,
            background: '#3b283e',
            textColor: '#f3f4e4',
            text: 'Connect to repository'
        }).on('select', () => {
            console.log('Connection to repository ...');
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
            text: 'http://192.168.1.102:8083/cmisBrowser'
            // text: 'https://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser'
        }).appendTo(widget);
        this.repoUser = new TextInput({
            left: 0, right: 0, top: ["#repoUrl", 10],
            id: 'repoUser',
            message: 'Username ...',
            text: 'test'
        }).appendTo(widget);
        this.repoPassword = new TextInput({
            left: 0, right: 0, top: ["#repoUser", 10],
            type: 'password',
            id: 'repoPassword',
            message: 'Password ...',
            text: 'test'
        }).appendTo(widget);
        
        // new Picker({
        //     left: 0, right: 0, top: ["#repoPassword", 20],
        //     itemCount: AIRPORTS.length,
        //     itemText: (index) => AIRPORTS[index].name,
        //     selectionIndex: 1
        // }).appendTo(widget);

        return widget;
    }
}