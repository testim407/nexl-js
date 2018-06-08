import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {MESSAGE_TYPE, MessageService} from "../../services/message.service";
import {GlobalComponentsService} from "../../services/global-components.service";
import {HttpRequestService} from "../../services/http.requests.service";
import {jqxComboBoxComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxcombobox";
import * as queryString from "querystring";
import {jqxExpanderComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxexpander";
import {jqxButtonComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxbuttons";
import {ArgsComponent} from "./args/args.component";
import {environment} from '../../../../environments/environment';
import * as $ from 'jquery';

const URL_TEMPLATE = `
<div style="text-align: left; display: block; padding: 10px;">
    <span style="text-decoration: underline;" id="tooltipRootUrl"></span>
    <span style="border: 2px dashed green; padding: 5px;" id="tooltipRelativePath"></span>
    <span style="" id="tooltipQuestionChar">?</span>
    <span style="border: 2px solid red; padding: 5px;" id="tooltipExpression"></span>
    <span style="" id="tooltipAmpersand">&</span>
    <span style="border: 2px dotted blue; padding: 5px;" id="tooltipArgs"></span>

    <br/>
    <br/>

    <div
            style="border: 2px dashed green; padding: 5px;width: 15px;height: 15px; float: left;"></div>
    <div style="position: relative; top: 6px; left: 6px;float: left;"> - relative path to JavaScript file</div>
    <div style="clear: both;"></div>

    <div id="tooltipExpressionExplanation" style="padding-top: 10px;">
        <div
                style="border: 2px solid red; padding: 5px;width: 15px;height: 15px; float: left;"></div>
        <div style="position: relative; top: 6px; left: 6px;float: left;"> - nexl expression</div>
        <div style="clear: both;"></div>
    </div>

    <div id="tooltipArgsExplanation" style="padding-top: 10px;">
        <div
                style="border: 2px dotted blue; padding: 5px;width: 15px;height: 15px; float: left;"></div>
        <div style="position: relative; top: 6px; left: 6px;float: left;"> - arguments</div>
        <div style="clear: both;"></div>
    </div>
    
    <div id="tooltipEmptyExpressionExplanation" style="padding-top: 15px;">
        <img src='./nexl/site/images/tip.png' style="position: relative; top: 2px;"/>
        Please note empty nexl expression is evaluated to undefined value.<br/>
        You can specify automatically executed nexl expression in your JavaScript file in the following way :<br/>
        <span style="padding-top: 5px; padding-left: 150px; font-weight: bold;">nexl.defaultExpression = '\${myExpression...}';</span>  
    </div>
</div>
   
`;

@Component({
  selector: '.app-nexl-expressions-tester',
  templateUrl: './nexl-expressions-tester.component.html',
  styleUrls: ['./nexl-expressions-tester.component.css']
})
export class NexlExpressionsTesterComponent implements AfterViewInit {
  @ViewChild('nexlExpression') nexlExpression: jqxComboBoxComponent;
  @ViewChild('outputArea') outputArea: jqxExpanderComponent;
  @ViewChild('expressionArea') expressionArea: jqxExpanderComponent;

  @ViewChild('evalButton') evalButton: jqxButtonComponent;
  @ViewChild('assembleButton') assembleButton: jqxButtonComponent;
  @ViewChild('argsButton') argsButton: jqxButtonComponent;

  @ViewChild('argsWindow') argsWindow: ArgsComponent;
  @ViewChild('template') template: ElementRef;

  urlTemplate: string = URL_TEMPLATE;

  output: string = '';
  url: string = '';
  urlEncoded: string = '';
  hasReadPermission = false;
  tabsCount = 0;
  currentArgs: any = {};
  relativePath: string = '';

  constructor(private messageService: MessageService, private globalComponentsService: GlobalComponentsService, private http: HttpRequestService) {
    this.messageService.getMessage().subscribe((msg) => {
      this.handleMessages(msg);
    });
  }

  handleMessages(msg: any) {
    switch (msg.type) {
      case MESSAGE_TYPE.GET_CURRENT_TAB: {
        this.evalInner(msg.data);
        return;
      }

      case MESSAGE_TYPE.AUTH_CHANGED: {
        this.updatePermissions(msg.data);
        return;
      }

      case MESSAGE_TYPE.TABS_COUNT_CHANGED: {
        this.tabsCountChanged(msg.data);
        return;
      }

      case MESSAGE_TYPE.EVAL_NEXL_EXPRESSION: {
        this.eval();
        return;
      }

      case MESSAGE_TYPE.TAB_SELECTED: {
        this.tabSelected(msg.data);
        return;
      }

      case MESSAGE_TYPE.TOGGLE_ARGS_WINDOW: {
        if (!this.isDisabled()) {
          this.argsWindow.toggleOpen();
        }
        return;
      }
    }
  }

  tabSelected(relativePath: string) {
    this.relativePath = relativePath;
    this.updateUrl();
  }

  updatePermissions(data: any) {
    if (data.hasReadPermission === this.hasReadPermission) {
      return;
    }

    this.hasReadPermission = data.hasReadPermission;
    this.updateComponentsState();
  }


  eval() {
    // todo : remove after jqx fix
    if (this.isDisabled()) {
      return;
    }

    this.globalComponentsService.loader.open();
    this.messageService.sendMessage(MESSAGE_TYPE.REQUEST_CURRENT_TAB);
  }

  evalInner(tabInfo: any) {
    if (tabInfo === undefined) {
      this.globalComponentsService.loader.close();
      return;
    }

    let data: any = {};

    if (tabInfo.nexlSourceContent !== undefined) {
      data['nexl-source-content'] = tabInfo.nexlSourceContent;
    }

    if (this.nexlExpression.val() !== '') {
      data.expression = this.nexlExpression.val();
    }

    // args
    for (let key in this.currentArgs) {
      data[key] = this.currentArgs[key];
    }

    data = queryString.stringify(data);

    // evaluating nexl expression
    this.http.post2Root(data, tabInfo.relativePath, 'text').subscribe(
      (info: any) => {
        this.output = info.body;
        this.globalComponentsService.loader.close();
        this.globalComponentsService.notification.openSuccess('Successfully evaluated nexl expression. See output');
      },
      (err) => {
        this.output = '';
        this.globalComponentsService.loader.close();
        console.log(err);
        if (err.status > 554 && err.status < 600) {
          this.globalComponentsService.notification.openInfo(err.statusText);
        } else {
          this.globalComponentsService.notification.openError(err.statusText);
        }
      }
    );

  }

  assemble() {
    // todo : remove after jqx fix
    if (this.isDisabled()) {
      return;
    }

  }

  args() {
    // todo : remove after jqx fix
    if (this.isDisabled()) {
      return;
    }

    this.argsWindow.toggleOpen();
  }

  onKeyPress(event) {
    if (event.keyCode === 13) {
      this.eval();
    }
  }

  private tabsCountChanged(tabsCount: number) {
    this.tabsCount = tabsCount;
    this.updateComponentsState();
  }

  private updateComponentsState() {
    let isDisabled = this.isDisabled();
    this.outputArea.disabled(isDisabled);
    this.expressionArea.disabled(isDisabled);
    this.nexlExpression.disabled(isDisabled);
    this.evalButton.disabled(isDisabled);
    this.argsButton.disabled(isDisabled);
    this.assembleButton.disabled(isDisabled);
    this.updateUrl();
  }

  private isDisabled() {
    return !this.hasReadPermission || this.tabsCount < 1;
  }

  onArgs(data: any) {
    this.currentArgs = data;
    this.updateUrl();
  }

  updateUrl() {
    if (this.isDisabled()) {
      this.url = '';
      this.urlEncoded = '';
      return;
    }

    const rootUrl = environment.rootUrl;
    const relativePathSlashed = this.relativePath.replace(/^[\\/]/, '/').replace(/\\/g, '/');
    const url = rootUrl + relativePathSlashed;
    const expression = this.nexlExpression.val();
    const argsAsArray = this.args2Array();
    const args4Tooltip = this.args2Str(argsAsArray, false);

    if (expression !== '') {
      argsAsArray.unshift({
        key: 'expression',
        value: expression
      });
    }

    const argsAsStr = this.args2Str(argsAsArray, false);
    const argsAsStrEncoded = this.args2Str(argsAsArray, true);

    // updating this.url, this.urlEncoded
    if (argsAsStr === '') {
      this.url = url;
      this.urlEncoded = url;
    } else {
      this.url = url + '?' + argsAsStr;
      this.urlEncoded = url + '?' + argsAsStrEncoded;
    }

    // updating tooltip
    $('#tooltipRootUrl').text(rootUrl);
    $('#tooltipRelativePath').text(relativePathSlashed);
    $('#tooltipExpression').text(`expression=${expression}`);
    $('#tooltipArgs').text(args4Tooltip);

    if (expression === '' && args4Tooltip === '') {
      $('#tooltipQuestionChar').css('display', 'none');
      $('#tooltipExpression').css('display', 'none');
      $('#tooltipAmpersand').css('display', 'none');
      $('#tooltipArgs').css('display', 'none');

      $('#tooltipExpressionExplanation').css('display', 'none');
      $('#tooltipArgsExplanation').css('display', 'none');
      $('#tooltipEmptyExpressionExplanation').css('display', '');
      return;
    }

    if (expression !== '' && args4Tooltip !== '') {
      $('#tooltipQuestionChar').css('display', '');
      $('#tooltipExpression').css('display', '');
      $('#tooltipAmpersand').css('display', '');
      $('#tooltipArgs').css('display', '');

      $('#tooltipExpressionExplanation').css('display', '');
      $('#tooltipArgsExplanation').css('display', '');
      $('#tooltipEmptyExpressionExplanation').css('display', 'none');
      return;
    }

    if (expression !== '') {
      $('#tooltipQuestionChar').css('display', '');
      $('#tooltipExpression').css('display', '');
      $('#tooltipAmpersand').css('display', 'none');
      $('#tooltipArgs').css('display', 'none');

      $('#tooltipExpressionExplanation').css('display', '');
      $('#tooltipArgsExplanation').css('display', 'none');
      $('#tooltipEmptyExpressionExplanation').css('display', 'none');
      return;
    }

    if (args4Tooltip !== '') {
      $('#tooltipQuestionChar').css('display', '');
      $('#tooltipExpression').css('display', 'none');
      $('#tooltipAmpersand').css('display', 'none');
      $('#tooltipArgs').css('display', '');

      $('#tooltipExpressionExplanation').css('display', 'none');
      $('#tooltipArgsExplanation').css('display', '');
      $('#tooltipEmptyExpressionExplanation').css('display', '');
      return;
    }
  }

  args2Array() {
    const result = [];
    for (let key in this.currentArgs) {
      result.push({
        key: key,
        value: this.currentArgs[key]
      });
    }

    return result;
  }

  args2Str(args: any[], encode: boolean) {
    let result = '';
    args.forEach(
      (item) => {
        result += item.key;
        result += '=';
        result += encode ? encodeURIComponent(item.value) : item.value;
        result += '&';
      });

    // removing last ampersand if present
    return result.replace(/&$/, '');
  }

  onExpressionChange() {
    this.updateUrl();
  }

  ngAfterViewInit() {
    this.nexlExpression.elementRef.nativeElement.addEventListener('keyup',
      () => {
        this.updateUrl();
      });
  }

  onUrlClick() {
    window.open(this.urlEncoded);
    return false;
  }
}