import { cmis } from './lib/cmis';

export class CmisSession {

    private static _initialized: boolean = false;

    private static _session: cmis.CmisSession = null;

    public static init(url: string, user: string, password: string): Promise<void> {


        console.log("Initializing CMIS Session with url: " + url + ", user: " + user + ', password: ' + password);
        CmisSession._session = new cmis.CmisSession(url);
        // if (err) {
        //     CmisSession._session.setErrorHandler(err);
        // }

        return CmisSession._session.setCredentials(user, password).loadRepositories().then(() => {
            console.log('CMIS Session initialized');
            CmisSession._initialized = true;
            // cb();
        });
        // } else {

        // just call the callback if we already initialized the session
        // cb()
        // }
    }

    public static getSession(): cmis.CmisSession {
        if (CmisSession._initialized == false) {
            console.error("CmisSession not yet initialized! Call CmisSession.init first!");
        } else {
            return CmisSession._session;
        }
    }
}

export interface CmisRepository {
    name: string;
    url: string;
    user: string;
    password: string;

}