import {Component, ViewChild} from '@angular/core';
import {jqxWindowComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxwindow";
import {jqxButtonComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxbuttons";
import {jqxRibbonComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxribbon";
import jqxValidator = jqwidgets.jqxValidator;
import {UtilsService} from "../../services/utils.service";
import {jqxGridComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxgrid";
import {SettingsService} from "../../services/settings.service";
import {LoaderService} from "../../services/loader.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  @ViewChild('settingsWindow') settingsWindow: jqxWindowComponent;
  @ViewChild('pathWindow') pathWindow: any;
  @ViewChild('ribbon') ribbon: jqxRibbonComponent;
  @ViewChild('validator') validator: jqxValidator;
  @ViewChild('httpTimeout') httpTimeout: any;
  @ViewChild('httpBinding') httpBiding: any;
  @ViewChild('httpPort') httpPort: any;
  @ViewChild('httpsBinding') httpsBiding: any;
  @ViewChild('httpsPort') httpsPort: any;
  @ViewChild('sslKeyLocation') sslKeyLocation: any;
  @ViewChild('sslCertLocation') sslCertLocation: any;
  @ViewChild('logRotateFileSize') logRotateFileSize: any;
  @ViewChild('logRotateFilesCount') logRotateFilesCount: any;
  @ViewChild('callbacksGrid') callbacksGrid: jqxGridComponent;
  @ViewChild('saveButton') saveButton: jqxButtonComponent;
  @ViewChild('cancelButton') cancelButton: jqxButtonComponent;

  settings = {};
  isSaving: boolean;
  width = 190;
  encodings = ['utf8', 'ascii'];
  themes = ['android', 'arctic', 'base', 'black', 'blackberry', 'bootstrap', 'classic', 'dark', 'darkblue', 'energyblue', 'flat', 'fresh', 'glacier', 'highcontrast', 'light', 'metro', 'metrodark', 'mobile', 'office', 'orange', 'shinyblack', 'summer', 'ui-darkness', 'ui-le-frog', 'ui-lightness', 'ui-overcast', 'ui-redmond', 'ui-smoothness', 'ui-start', 'ui-sunny', 'web', 'windowsphone'];
  logLevels = ['fatal', 'error', 'info', 'debug', 'verbose'];
  callbackSource =
    {
      localdata: [],
      datafields: [
        {name: 'admins', type: 'string', map: '0'}
      ],
      datatype: 'array'
    };
  callbacksDataAdapter = new jqx.dataAdapter(this.callbackSource);
  callbackColumns: any[] =
    [
      {
        text: 'Callbacks',
        datafield: 'Callbacks',
        align: 'center',
        width: '360px'
      },
      {
        text: ' ',
        align: 'center',
        sortable: false,
        editable: false,
        showeverpresentrow: false,
        columntype: 'button',
        cellsrenderer: (): string => {
          return 'Delete';
        },
        buttonclick: (row: number): void => {
          const rowdata = this.callbacksGrid.getrowdata(row);
          this.callbacksGrid.deleterow(rowdata.uid);
        }
      }
    ];

  validationRules =
    [
      {input: '#nexlSourcesDir', message: 'nexl sources dir is required!', action: 'keyup, blur', rule: 'required'},
      {
        input: '#httpTimeout', message: 'HTTP timeout must be a positive integer', action: 'keyup, blur',
        rule: (input: any, commit: any): any => {
          const val = this.httpTimeout.val() || '0';
          return UtilsService.isPositiveIneger(val);
        }
      },
      {input: '#httpBinding', message: 'HTTP bindings is required!', action: 'keyup, blur', rule: 'required'},
      {input: '#httpPort', message: 'HTTP port is required!', action: 'keyup, blur', rule: 'required'},
      {
        input: '#httpPort', message: 'HTTP port must be a positive integer', action: 'keyup, blur',
        rule: (input: any, commit: any): any => {
          const val = this.httpPort.val() || '';
          return UtilsService.isPositiveIneger(val);
        }
      },
      {
        input: '#httpsPort', message: 'HTTPS port must be a positive integer', action: 'keyup, blur',
        rule: (input: any, commit: any): any => {
          const val = this.httpsPort.val() || '0';
          return UtilsService.isPositiveIneger(val);
        }
      },
      {
        input: '#sslCertLocation',
        message: 'You have to provide all those HTTPS binding and SSL setting for HTTPS connector. Leave those 4 fields empty if don\'t need SSL connection',
        action: 'keyup, blur',
        rule: (input: any, commit: any): any => {
          const vals = [this.httpsBiding.val(), this.httpsPort.val(), this.sslKeyLocation.val(), this.sslCertLocation.val()];
          return UtilsService.areAllEmpty(vals) || UtilsService.areAllNotEmpty(vals);
        }
      }
    ];

  constructor(private settingsService: SettingsService, private loaderService: LoaderService) {

  }

  open() {
    // opening indicator
    this.loaderService.loader.open();

    // loading data
    this.settingsService.load().subscribe(
      (data: any) => {
        this.settings = data.body;
        this.loaderService.loader.close();
        this.settingsWindow.open();
      },
      err => {
        this.loaderService.loader.close();
        alert('Something went wrong !');
        console.log(err);
      });
  }

  initContent = () => {
    this.ribbon.createComponent();
    this.saveButton.createComponent();
    this.cancelButton.createComponent();
  }

  validate() {
    this.validator.validate(document.getElementById('settingsForm'));
  }

  save() {
    this.isSaving = true;
    this.validate();
  }

  onValidationSuccess(event) {
    if (!this.isSaving) {
      return;
    }

    this.settingsWindow.close();
    this.loaderService.loader.open();

    this.settingsService.save(this.settings).subscribe(
      val => {
        this.loaderService.loader.close();
      },
      err => {
        this.loaderService.loader.close();
        alert('Something went wrong !');
        console.log(err);
      });
  }

  onValidationError(event) {
    this.isSaving = false;
  }

  addNewItem() {
    this.callbacksGrid.addrow(1, {});
  }
}
