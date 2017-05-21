import { cmis } from './lib/cmis';
import ErrorMessage from './error';

export interface CmisSettings {
    url, user, password, uploadType: string;
}
export class CmisSession {

    private static _initialized: boolean = false;

    private static _session: cmis.CmisSession = null;

    public static init(settings: CmisSettings): Promise<void> {

        console.log("Initializing CMIS Session with url: " + settings.url
            + ", user: " + settings.user
            + ', password: ' + settings.password
            + ', uploadType: ' + settings.uploadType);
        CmisSession._session = new cmis.CmisSession(settings.url);
        CmisSession._session.setErrorHandler((err) => {
            new ErrorMessage(err);
        });

        return CmisSession._session.setCredentials(settings.user, settings.password).loadRepositories().then(() => {
            console.log('CMIS Session initialized');
            CmisSession._initialized = true;
        });
    }

    public static getSession(): cmis.CmisSession {
        if (CmisSession._initialized == false) {
            console.error("CmisSession not yet initialized! Call CmisSession.init first!");
        } else {
            return CmisSession._session;
        }
    }
}