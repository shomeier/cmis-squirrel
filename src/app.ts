import { ActivityIndicator, ui, Button, TextView, NavigationView, Page } from 'tabris';
import { cmis } from './lib/cmis';
import RepositoriesPage from './repositoriesPage';
import FolderPage from './folderPage';

let contentNavigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0,
  id: 'contentNavigationView'
}).appendTo(ui.contentView);

let repositoriesPage = new RepositoriesPage(contentNavigationView, {
  title: 'CMIS Repositories',
  id: 'repositoriesPage'
}).appendTo(contentNavigationView);
