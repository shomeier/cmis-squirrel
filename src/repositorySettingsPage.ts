import { Button, CollectionView, CollectionViewProperties, Composite, CompositeProperties, Page, PageProperties, Picker, NavigationView, ImageView, TextView, Widget, device, TextInput } from 'tabris';
import { CmisSession, CmisRepository } from './cmisSession'

export default class RepositorySettingsPage extends Page {

    private button: Button;

    private imageView: ImageView;

    private collectionView: CollectionView;

    private navigationView: NavigationView;

    private repoName:TextInput;
    private repoUrl:TextInput;
    private repoUser:TextInput;
    private repoPassword:TextInput;

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
        this.createInputForm();
        this.button = new Button({
            top: ['#formWidget', 10], centerX: 0,
            background: '#3b283e',
            textColor: '#f3f4e4',
            text: 'Save Settings'
        }).on('select', () => {
            console.log('Save button pressed ...');
            let repo:CmisRepository = {
                name: this.repoName.text,
                url: this.repoUrl.text,
                user: this.repoUser.text,
                password: this.repoPassword.text,
            };
            CmisSession.addRepository(repo).then(() => {
                console.log("In returnded Promise");
            })
        }).appendTo(this);
    }

    private createInputForm() {
        let widget = new Composite({
            left: 10, right: 10, top: 10,
            id: 'formWidget',
            background: '#f3f4e4'
        }).appendTo(this);
        this.repoName = new TextInput({
            left: 0, right: 0,
            id: 'repoName',
            message: 'Enter a short name for the repository here ...'
        }).on('accept', function ({ text }) {
            // new TextView({
            //     top: 'prev() 20', left: '20%',
            //     text: text
            // }).appendTo(widget);
        }).appendTo(widget);
        this.repoUrl = new TextInput({
            left: 0, right: 0, top: ["#repoName", 10],
            id: 'repoUrl',
            message: 'URL of the CMIS repository ...'
        }).appendTo(widget);
        this.repoUser = new TextInput({
            left: 0, right: 0, top: ["#repoUrl", 10],
            id: 'repoUser',
            message: 'Username ...'
        }).appendTo(widget);
       this.repoPassword = new TextInput({
            left: 0, right: 0, top: ["#repoUser", 10],
            type: 'password',
            id: 'repoPassword',
            message: 'Password ...'
        }).appendTo(widget);
        // new Picker({
        //     left: 0, right: 0, top: ["#repoPassword", 20],
        //     itemCount: AIRPORTS.length,
        //     itemText: (index) => AIRPORTS[index].name,
        //     selectionIndex: 1
        // }).appendTo(widget);
    }
}