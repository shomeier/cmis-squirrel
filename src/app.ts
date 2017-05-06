import { ActivityIndicator, ui, Button, TextView, NavigationView, Page } from 'tabris';
import { cmis } from './lib/cmis';
import { SingleCmisSession } from './singleCmisSession'
import RepositoriesCollectionView from './repositoriesComposite';
import ContentCollectionView from './contentComposite';
import WidgetFactory from './widgetFactory';

const alfrescoUrl = "http://cmis.alfresco.com/alfresco/api/-default-/public/cmis/versions/1.1/browser";

let username = 'admin';
let password = 'admin';
// let session = new cmis.CmisSession(alfrescoUrl);
// session.setCredentials(username, password);
// session.loadRepositories().then(() => {
//      // assert(parseFloat(session.defaultRepository.cmisVersionSupported) >= .99, "CMIS Version should be at least 1.0");
//      console.log("Loading repos ...");
//      console.log("REPO: " + JSON.stringify(session.defaultRepository.repositoryUrl));
//       session.getRepositoryInfo().then(data => {
//         console.log("getRepositoryInfo ...");
//         console.log("getRepositoryInfo: " + JSON.stringify(data));
//       })
// }).catch(err => console.log("Error: " + err));
// let session = SingleCmisSession.initCmisSession(alfrescoUrl);

let activityIndicator = new ActivityIndicator({
  centerX: 0,
  centerY: 0,
  visible: false,
}).appendTo(ui.contentView);

let contentNavigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  id: 'contentNavigationView'
}).appendTo(ui.contentView);

let repositoryPage = WidgetFactory.createRepositoryPage(contentNavigationView);
repositoryPage.appendTo(contentNavigationView);
// let repositoriesComposite = new RepositoriesComposite({
//   left: 0, top: 0, right: 0, bottom: 0
// }).appendTo(ui.contentView);


// let repositoriesCollection = ui.contentView.find('#repositoriesCollection')
// repositoriesCollection.on('select', ({ item }) => {
//   console.log('selected XXX: ' + JSON.stringify(item));
//   let contentNavigationView = new NavigationView({
//     left: 0, top: 0, right: 0, bottom: 0,
//     visible: true,
//     id: 'contentNavigationView'
//   }).appendTo(ui.contentView);
//   // ui.contentView.find('#contentNavigationView').set('visible', true);
//   let session = SingleCmisSession.initCmisSession(item.url);
//   session.setCredentials(username, password);
//   session.setErrorHandler((err) => console.log(err));
//   session.loadRepositories().then(() => {
//     //      // assert(parseFloat(session.defaultRepository.cmisVersionSupported) >= .99, "CMIS Version should be at least 1.0");
//     //      console.log("Loading repos ...");
//     console.log("REPO: " + JSON.stringify(session.defaultRepository.repositoryId));
//     let page = new Page({
//       title: '/',
//       autoDispose: false
//     }).appendTo(contentNavigationView);
//     session.getRepositoryInfo().then((data) => {
//       // console.log("data[session.defaultRepository.repositoryId]: " + JSON.stringify(data[session.defaultRepository.repositoryId]));
//       let contentComposite = new ContentComposite(data[session.defaultRepository.repositoryId].rootFolderId, {
//         left: 0, top: 0, right: 0, bottom: 0
//       });
//       console.log("Appending to page ...");
//       contentComposite.appendTo(page);
//       // ui.contentView.find('#contentCollection').appendTo(page);
//       // contentComposite.on('select', () => {
//       //   new ContentComposite(data[session.defaultRepository.repositoryId].rootFolderId, {
//       //     left: 0, top: 0, right: 0, bottom: 0
//       //   });
//       // }).appendTo(page);
//       console.log("Appended to page ...");
//     });
//   });
// });


// const button = new Button({
//   centerX: 0, top: 100,
//   text: 'Show Message TTTT'
// }).appendTo(ui.contentView);

// const textView = new TextView({
//   centerX: 0, top: [button, 50],
//   font: '24px'
// }).appendTo(ui.contentView);

// button.on('select', () => { textView.text = 'Tabris.js rocks!!!!!!!!'; console.log("tessstAAAAAABB") });
