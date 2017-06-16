import { Page, TextView, WebView, ui } from 'tabris';

const TITLE = 'About';
const LICENSE_TEXT = `<big>CMIS Squirrel v0.1.0</big><br/>
<big>OpenSource CMIS Client</big><br/>
<b>License:</b> Apache License v2.0<br/>
<b>Contributors:</b>
    Sascha Homeier,
    Michael Wirth (aka "Der Schwob")<br/>
<b>Icons:</b><br/>
    <i>Squirrel-Icon</i> created by Andi asmara - Freepik.com<br/>
    <i>Acorn-Icon</i> made by freepik from www.flaticon.com<br/>
    <i>Other Icons</i> made by Madebyoliver from www.flaticon.com<br/>`;
const GITHUB_LINK = 'https://github.com/shomeier/cmis-squirrel'
const ALV2_LINK = 'http://www.apache.org/licenses/LICENSE-2.0.txt';

export default class AboutPage extends Page {

    constructor(properties) {
        super(Object.assign({ title: TITLE }, properties));
        this.on({
            appear: () => ui.find('#aboutAction').first().visible = false,
            disappear: () => ui.find('#aboutAction').first().visible = true
        });
        this._createUI();
        this._applyLayout();
    }

    _createUI() {
        this.append(
            new TextView({ id: 'licenseLabel', text: LICENSE_TEXT, markupEnabled: true }),
            new TextView({ id: 'githubLink', text: GITHUB_LINK }).on('tap', () => {
                console.log("TAP: 1");
                new WebView({ url: GITHUB_LINK }).appendTo(this);
                console.log("TAP: 2");
            })
        );
    }

    _applyLayout() {
        this.apply({
            '#licenseLabel': { left: 16, right: 16, top: 16 },
            '#githubLink': { left: 16, right: 16, top: 'prev() 8', textColor: 'rgba(71, 161, 238, 0.75)'},
        });
    }
}