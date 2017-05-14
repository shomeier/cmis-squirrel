import { ActivityIndicator, Widget, ui } from 'tabris';


export default class Activity {

    private static _activityIndicator: ActivityIndicator = null;

    public static startActivity(widget: Widget): void {
        if (!Activity._activityIndicator) {
            Activity._activityIndicator = new ActivityIndicator({
                centerX: 0,
                centerY: 0,
                visible: false,
            }).appendTo(ui.contentView);
        }

         Activity._activityIndicator.visible = true;
        widget.enabled = false;
    }

    public static stopActivity(widget: Widget): void {
        Activity._activityIndicator.visible = false;
        widget.enabled = true;
    }
}
