import {Component, ViewChild} from '@angular/core';
import {jqxWindowComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxwindow";
import {jqxButtonComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxbuttons";
import jqxValidator = jqwidgets.jqxValidator;
import {MESSAGE_TYPE, MessageService} from "../../services/message.service";
import {jqxInputComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxinput";
import {AppearanceService, THEMES} from "../../services/appearance.service";
import {jqxCheckBoxComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxcheckbox";

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.css']
})
export class AppearanceComponent {
  @ViewChild('appearanceWindow') appearanceWindow: jqxWindowComponent;
  @ViewChild('appearanceValidator') appearanceValidator: jqxValidator;
  @ViewChild('saveButton') saveButton: jqxButtonComponent;
  @ViewChild('cancelButton') cancelButton: jqxButtonComponent;

  @ViewChild('fontSize') fontSize: jqxInputComponent;
  // @ViewChild('theme') theme: jqxDropDownListComponent;
  @ViewChild('maxExecutionHistoryItems') maxExecutionHistoryItems: jqxInputComponent;
  @ViewChild('autoscrollFromSource') autoscrollFromSource: jqxCheckBoxComponent;

  isSaving = false;
  width = 190;
  themes = THEMES;

  appearanceData = {};

  appearanceValidationRules =
    [
      {
        input: '#fontSize',
        message: 'Font size must be a positive integer',
        action: 'keyup, blur',
        rule: (): any => {
          return AppearanceService.validate('font-size', this.fontSize.val());
        }
      },
      {
        input: '#maxExecutionHistoryItems',
        message: 'Items count must be a positive integer',
        action: 'keyup, blur',
        rule: (): any => {
          return AppearanceService.validate('max-execution-history-items', this.maxExecutionHistoryItems.val());
        }
      }
    ];

  constructor(private messageService: MessageService) {
    this.messageService.getMessage().subscribe(
      (message) => {
        switch (message.type) {
          case MESSAGE_TYPE.OPEN_APPEARANCE_WINDOW: {
            this.open();
            return;
          }
        }
      });
  }

  open() {
    this.appearanceData = AppearanceService.load();
    // this.theme.val(this.appearanceData['theme']);
    this.autoscrollFromSource.val(this.appearanceData['autoscroll-from-source']);
    this.isSaving = false;
    this.appearanceWindow.open();
  }

  initContent = () => {
    this.saveButton.createComponent();
    this.cancelButton.createComponent();
  };

  save() {
    this.isSaving = true;
    this.appearanceValidator.validate(document.getElementById('appearanceForm'));
  }

  onValidationSuccess() {
    if (!this.isSaving) {
      return;
    }

    AppearanceService.save(this.appearanceData);
    this.messageService.sendMessage(MESSAGE_TYPE.UPDATE_UI);
    this.appearanceWindow.close();
  }

  onValidationError() {
    this.isSaving = false;
  }

  onOpen() {
  }

  onKeyPress(event) {
    if (event.keyCode === 13) {
      this.save();
      return;
    }
  }
}
