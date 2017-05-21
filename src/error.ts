import { ActivityIndicator, Button, Composite, Widget, WidgetCollection, TextView, ui, device } from 'tabris';


export default class ErrorMessage {

    constructor(error: Error) {

        console.log('In ErrorMessage: ' + JSON.stringify(error));
        this.disableWidgets();
        console.log('After disabling widgets...');
        let errorName: string = error.name;
        let errorMessage: string = error.message;
        console.log("errorName: " + errorName);
        console.log("errorMessage: " + errorMessage);

        if (errorMessage.startsWith('{') && errorMessage.endsWith('}')) {
            // The error can contain of an 'exception' and 'message' part 
            let parsedMsg = JSON.parse(error.message);
            console.log("Parsed Message: " + parsedMsg);
            if (parsedMsg) {
                errorName = parsedMsg.exception;
                errorMessage = parsedMsg.message;
            }
        }
        console.log("errorName: " + errorName);
        console.log("errorMessage: " + errorMessage);

        let composite = new Composite({
            left: 20, right: 20, centerY: 0,
            // width: 200, height: 75,
            background: '#3b283e'
        }).appendTo(ui.contentView);
        let captionText = new TextView({
            top: 3, centerX: 0,
            textColor: '#f3f4e4',
            id: 'captionText',
            font: device.platform === 'iOS' ? '23px .HelveticaNeueInterface-Regular' : '20px Roboto Medium',
            text: errorName
        }).appendTo(composite);
        let line = new Composite({
            left: 10, right: 10,
            height: 1,
            top: ['#captionText', 5],
            id: 'line',
            background: '#d2cab5'
        }).appendTo(composite);
        let errorText = new TextView({
            centerX: 0, top: ['#line', 20],
            textColor: '#f3f4e4',
            id: 'errorText',
            text: ' Error: ' + errorMessage + ' '
        }).appendTo(composite);
        let button = new Button({
            centerX: 0, top: ['#errorText', 20], bottom: 5, width: 100,
            background: '#f3f4e4',
            textColor: '#3b283e',
            text: 'OK'
        }).on('select', () => {
            this.enableWidgets();
            composite.dispose();
        }).appendTo(composite);
    }

    private disableWidgets() {
        ui.contentView.apply({
            'NavigationView': { enabled: false },
            'Page': { enabled: false },
            'CollectionView': { enabled: false }
        });
    }

    private enableWidgets() {
        ui.contentView.apply({
            'NavigationView': { enabled: true },
            'Page': { enabled: true },
            'CollectionView': { enabled: true }
        });
    }
}
