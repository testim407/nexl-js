import {jqxLoaderComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxloader";
import {NotificationComponent} from "../misc/notification/notification.component";
import {InputBoxComponent} from "../misc/inputbox/inputbox.component";
import {ConfirmBoxComponent} from "../misc/confirmbox/confirmbox.component";

export class GlobalComponentsService {
  loader: jqxLoaderComponent;
  notification: NotificationComponent;
  inputBox: InputBoxComponent;
  confirmBox: ConfirmBoxComponent;
}