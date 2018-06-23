import {Component, ViewChild} from '@angular/core';
import {jqxWindowComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxwindow";
import {jqxButtonComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxbuttons";
import {jqxRibbonComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxribbon";
import {UtilsService} from "../../services/utils.service";
import {GlobalComponentsService} from "../../services/global-components.service";
import {HttpRequestService} from "../../services/http.requests.service";
import jqxValidator = jqwidgets.jqxValidator;
import {MESSAGE_TYPE, MessageService} from "../../services/message.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  @ViewChild('settingsWindow') settingsWindow: jqxWindowComponent;
  @ViewChild('ribbon') ribbon: jqxRibbonComponent;
  @ViewChild('validator') validator: jqxValidator;
  @ViewChild('jsFilesEncoding') jsFilesEncoding: any;
  @ViewChild('httpTimeout') httpTimeout: any;
  @ViewChild('httpBinding') httpBiding: any;
  @ViewChild('httpPort') httpPort: any;
  @ViewChild('httpsBinding') httpsBiding: any;
  @ViewChild('httpsPort') httpsPort: any;
  @ViewChild('sslKeyLocation') sslKeyLocation: any;
  @ViewChild('sslCertLocation') sslCertLocation: any;

  @ViewChild('ldapUrl') ldapUrl: any;
  @ViewChild('ldapBaseDN') ldapBaseDN: any;
  @ViewChild('ldapUsername') ldapUsername: any;
  @ViewChild('ldapPassword') jqxPasswordInputComponent: any;
  @ViewChild('ldapFindBy') ldapFindBy: any;

  @ViewChild('logLevel') logLevel: any;
  @ViewChild('logRotateFileSize') logRotateFileSize: any;
  @ViewChild('logRotateFilesCount') logRotateFilesCount: any;
  @ViewChild('saveButton') saveButton: jqxButtonComponent;
  @ViewChild('cancelButton') cancelButton: jqxButtonComponent;

  settings: any = {};
  isAdmin = false;
  jsFilesRootDirBefore: string;
  isSaving = false;
  width = 190;
  encodings = [];
  logLevels = [];

  validationRules =
    [
      {input: '#jsFilesRootDir', message: 'JS files root dir is required!', action: 'keyup, blur', rule: 'required'},
      {
        input: '#httpTimeout', message: 'HTTP timeout must be a positive integer', action: 'keyup, blur',
        rule: (): any => {
          const val = this.httpTimeout.val() || '';
          return UtilsService.isPositiveIneger(val);
        }
      },
      {input: '#httpBinding', message: 'HTTP bindings is required!', action: 'keyup, blur', rule: 'required'},
      {input: '#httpPort', message: 'HTTP port is required!', action: 'keyup, blur', rule: 'required'},
      {
        input: '#httpPort', message: 'HTTP port must be a positive integer', action: 'keyup, blur',
        rule: (): any => {
          const val = this.httpPort.val() || '';
          return UtilsService.isPositiveIneger(val);
        }
      },
      {
        input: '#httpsPort', message: 'HTTPS port must be a positive integer', action: 'keyup, blur',
        rule: (): any => {
          const val = this.httpsPort.val() || '';
          return UtilsService.isPositiveIneger(val);
        }
      },

      {input: '#logFileLocation', message: 'Log file location is required!', action: 'keyup, blur', rule: 'required'},
      {
        input: '#logRotateFileSize', message: 'Log rotate file size must be a positive integer', action: 'keyup, blur',
        rule: (): any => {
          const val = this.logRotateFileSize.val() || '';
          return UtilsService.isPositiveIneger(val);
        }
      },
      {
        input: '#logRotateFilesCount',
        message: 'Log rotate files count must be a positive integer',
        action: 'keyup, blur',
        rule: (): any => {
          const val = this.logRotateFilesCount.val() || '';
          return UtilsService.isPositiveIneger(val);
        }
      }
    ];


  constructor(private http: HttpRequestService, private globalComponentsService: GlobalComponentsService, private messageService: MessageService) {
    this.messageService.getMessage().subscribe(
      (message) => {
        switch (message.type) {
          case MESSAGE_TYPE.AUTH_CHANGED: {
            this.isAdmin = message.data.isAdmin;
            return;
          }

          case MESSAGE_TYPE.OPEN_SETTINGS_WINDOW: {
            this.open();
            return;
          }
        }
      });
  }

  openInner() {
    this.jsFilesRootDirBefore = undefined;

    // loading data
    this.http.post({}, '/settings/load', 'json').subscribe(
      (data: any) => {
        this.settings = data.body;
        this.globalComponentsService.loader.close();
        this.logLevel.val(this.settings['log-level']);
        this.jsFilesEncoding.val(this.settings['js-files-encoding']);
        this.jsFilesRootDirBefore = this.settings['js-files-root-dir'];
        this.settingsWindow.open();
      },
      err => {
        this.globalComponentsService.loader.close();
        this.globalComponentsService.notification.openError('Failed to load settings\nReason : ' + err.statusText);
        console.log(err);
      });

  }

  open() {
    if (!this.isAdmin) {
      return;
    }

    // opening indicator
    this.globalComponentsService.loader.open();

    if (this.encodings.length > 0 && this.logLevels.length > 0) {
      this.openInner();
      return;
    }

    // loading available values from server
    this.http.post({}, '/settings/avail-values', 'json').subscribe(
      (data: any) => {
        this.encodings = data.body.encodings;
        this.logLevels = data.body.logLevels;
        this.openInner();
      },
      err => {
        this.globalComponentsService.loader.close();
        this.globalComponentsService.notification.openError('Failed to load settings\nReason : ' + err.statusText);
        console.log(err);
      }
    );
  }

  initContent = () => {
    this.ribbon.createComponent();
    this.saveButton.createComponent();
    this.cancelButton.createComponent();
  };

  validate() {
    this.validator.validate(document.getElementById('validationForm'));
  }

  save() {
    this.isSaving = true;
    this.validate();
  }

  onValidationSuccess() {
    if (!this.isSaving) {
      return;
    }

    this.settingsWindow.close();
    this.globalComponentsService.loader.open();

    this.http.post(this.settings, '/settings/save', 'json').subscribe(
      () => {
        this.globalComponentsService.loader.close();
        this.globalComponentsService.notification.openSuccess('Updated settings');
        if (this.jsFilesRootDirBefore !== this.settings['js-files-root-dir']) {
          this.messageService.sendMessage(MESSAGE_TYPE.RELOAD_JS_FILES);
        }
      },
      err => {
        this.globalComponentsService.loader.close();
        this.globalComponentsService.notification.openError('Failed to save settings\nReason : ' + err.statusText);
        console.log(err);
      });
  }

  onValidationError() {
    this.isSaving = false;
  }

  onOpen() {
    this.isSaving = false;
  }
}
