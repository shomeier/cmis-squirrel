import { cmis } from './lib/cmis';

export class SingleCmisSession {

    private static _instance: SingleCmisSession = new SingleCmisSession();

    private static _cmisSession: cmis.CmisSession = null;

    public static initCmisSession(url): cmis.CmisSession {
        SingleCmisSession._cmisSession = new cmis.CmisSession(url);
        // SingleCmisSession._cmisSession.loadRepositories().then(() => {
        //     //      // assert(parseFloat(session.defaultRepository.cmisVersionSupported) >= .99, "CMIS Version should be at least 1.0");
        //     //      console.log("Loading repos ...");
        //     console.log("REPO: " + JSON.stringify(SingleCmisSession._cmisSession.defaultRepository.repositoryUrl));
        // }
        return SingleCmisSession._cmisSession;
    }

    public static getCmisSession(): cmis.CmisSession {
    return SingleCmisSession._cmisSession;
}
}