import { ActivityIndicator, Composite, Widget, ui } from 'tabris';


export default class Activity {

    private activityIndicator: ActivityIndicator;

    private widget: Widget;

    constructor(widget: Widget) {
        this.widget = widget;
        this.activityIndicator = new ActivityIndicator({
            centerX: 0,
            centerY: 0,
            visible: false,
        });
        if (widget instanceof Composite && !widget.isDisposed) {
            this.activityIndicator.appendTo(widget);
        } else {
            this.activityIndicator.appendTo(ui.contentView);
        }
    }

    public startActivity(): void {
        this.activityIndicator.visible = true;
        this.widget.enabled = false;
    }

    public stopActivity(): void {
        this.activityIndicator.visible = false;
        this.widget.enabled = true;
    }
}
