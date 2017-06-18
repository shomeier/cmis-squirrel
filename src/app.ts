import { Action, ActivityIndicator, ui, Button, TextView, NavigationView, Page, device } from 'tabris';
import { cmis } from './lib/cmis';
import Base64 from './lib/base64';
import ServersPage from './serversPage';
import FolderPage from './folderPage';
import AboutPage from './aboutPage';
declare var global: any;

const ABOUT_ACTION_TITLE = 'About';

let navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  id: 'contentNavigationView'
}).appendTo(ui.contentView);

// squirrel bg: '#f3f4e4'
// squirrel itself (dark brown):  '#3b283e'
// squirrel shadow: '#d2cab5'
let repositoriesPage = new ServersPage(navigationView, {
  title: 'CMIS Squirrel',
  background: '#f3f4e4',
  id: 'serversPage'
}).appendTo(navigationView);

new Action({
  id: 'aboutAction',
  title: ABOUT_ACTION_TITLE,
  placementPriority: 'high',
  image: {
    src: 'icons/acorn.png',
    scale: 3
  }
}).on('select', () => new AboutPage({
  id: 'aboutPage',
  background: '#f3f4e4'
}).appendTo(navigationView))
  .appendTo(navigationView);

// We need to set our 'atob' method to global scope for FileReader.readAsArrayBuffer()
// See also here: https://github.com/eclipsesource/tabris-js/issues/899
if (device.platform === "iOS") {
  // var base64 = require('base64');
  // global.btoa = base64.btoa;
  global.atob = Base64.atob;
}