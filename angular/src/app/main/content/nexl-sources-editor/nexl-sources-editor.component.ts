import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {jqxTabsComponent} from "jqwidgets-scripts/jqwidgets-ts/angular_jqxtabs";
import {HttpRequestService} from "../../../services/http.requests.service";
import {GlobalComponentsService} from "../../../services/global-components.service";
import {MESSAGE_TYPE, MessageService} from "../../../services/message.service";
import * as $ from 'jquery';
import {LocalStorageService, SAVE_NEXL_SOURCE_CONFIRM} from "../../../services/localstorage.service";
import {UtilsService} from "../../../services/utils.service";

const TAB_CONTENT = 'tabs-content-';
const TITLE_ID = 'tabs-title-';
const TITLE_TOOLTIP = 'tabs-title-tooltip-';
const TITLE_TEXT = 'tabs-title-text-';
const TITLE_MODIFICATION_ICON = 'tabs-title-modification-icon-';
const TITLE_CLOSE_ICON = 'tabs-title-close-icon-';
const ATTR_IS_NEW_FILE = 'is-new-file';


@Component({
  selector: '.app-nexl-sources-editor',
  templateUrl: './nexl-sources-editor.component.html',
  styleUrls: ['./nexl-sources-editor.component.css'],
})
export class NexlSourcesEditorComponent implements AfterViewInit {
  @ViewChild('nexlSourcesTabs') nexlSourcesTabs: jqxTabsComponent;

  idSeqNr = 0;
  hasWritePermission = false;

  constructor(private http: HttpRequestService, private globalComponentsService: GlobalComponentsService, private messageService: MessageService) {
    this.messageService.getMessage().subscribe(message => {
      this.handleMessages(message);
    });
  }

  static obj2Array(obj: any) {
    let result = [];
    for (let key in obj) {
      result.push(key + '="' + obj[key] + '"');
    }
    return result.join(' ');
  }

  handleMessages(message) {
    switch (message.type) {
      case MESSAGE_TYPE.AUTH_CHANGED: {
        this.updateTabsPermissions(message.data);
        return;
      }

      case MESSAGE_TYPE.LOAD_NEXL_SOURCE: {
        this.loadNexlSource(message.data);
        return;
      }

      case MESSAGE_TYPE.CONTENT_AREA_RESIZED: {
        this.resizeAce();
        return;
      }

      case MESSAGE_TYPE.CLOSE_DELETED_TABS: {
        this.closeDeletedTabs(message.data);
        return;
      }

      case MESSAGE_TYPE.SAVE_NEXL_SOURCE: {
        this.saveNexlSource(message.data);
        return;
      }

      case MESSAGE_TYPE.CLOSE_ALL_TABS: {
        this.closeAllTabs();
        return;
      }

      case MESSAGE_TYPE.CREATE_NEXL_SOURCE: {
        this.createNexlSource(message.data);
        return;
      }

      case MESSAGE_TYPE.ITEM_MOVED: {
        this.itemMoved(message.data);
        return;
      }
    }
  }

  itemMoved(data) {
    let oldRelativePath = data.oldRelativePath;
    oldRelativePath = UtilsService.IS_WIN ? oldRelativePath.toLocaleLowerCase() : oldRelativePath;

    for (let index = 0; index < this.nexlSourcesTabs.length(); index++) {
      let tabsRelativePath = this.resolveTabAttr(index, 'relative-path');
      let idSeqNr = this.resolveTabAttr(index, 'id-seq-nr');
      tabsRelativePath = UtilsService.IS_WIN ? tabsRelativePath.toLocaleLowerCase() : tabsRelativePath;

      if (tabsRelativePath === oldRelativePath) {
        this.setTabAttr(index, 'relative-path', data.newRelativePath);
        $('#' + TITLE_TEXT + idSeqNr).text(data.newLabel);
        $('#' + TITLE_TOOLTIP + idSeqNr).text(data.newRelativePath);
        continue;
      }
    }
  }

  createNexlSource(data) {
    const nexlSource = this.loadNexlSourceInner(data);
    this.changeFileStatus(nexlSource, true);
    $('#' + TITLE_ID + nexlSource.idSeqNr).attr(ATTR_IS_NEW_FILE, true);
  }

  closeAllTabs() {
    let promise: any = Promise.resolve();

    for (let tabNr = this.nexlSourcesTabs.length() - 1; tabNr >= 0; tabNr--) {
      const idSeqNr = this.resolveTabAttr(tabNr, 'id-seq-nr');
      promise = promise.then(() => this.closeTabInner(idSeqNr));
    }
  }

  changeFileStatus(tabInfo: any, isChanged: boolean) {
    $('#' + TITLE_MODIFICATION_ICON + tabInfo.idSeqNr).css('display', isChanged ? 'inline-block' : 'none');
    $('#' + TITLE_ID + tabInfo.idSeqNr).attr('is-changed', isChanged);

    // sending message to tree
    this.messageService.sendMessage({
      type: MESSAGE_TYPE.TAB_CONTENT_CHANGED,
      data: {
        isChanged: isChanged,
        relativePath: tabInfo.relativePath
      }
    });
  }

  saveNexlSource(relativePath: string) {
    if (LocalStorageService.loadRaw(SAVE_NEXL_SOURCE_CONFIRM) === false.toString()) {
      this.saveNexlSourceInner(relativePath);
      return;
    }

    // confirming...
    const opts = {
      title: 'Confirm save',
      label: 'Please note you can evaluate nexl expression without saving a file. Are you sure you want to save a file ?',
      checkBoxText: 'Don\'t show it again',
      callback: (callbackData: any) => {
        LocalStorageService.storeRaw(SAVE_NEXL_SOURCE_CONFIRM, !callbackData.checkBoxVal);
        if (callbackData.isConfirmed === true) {
          this.saveNexlSourceInner(relativePath);
        }
      },
    };

    this.globalComponentsService.confirmBox.open(opts);
  }

  saveNexlSourceInner(relativePath: string, callback?: (boolean) => void) {
    if (relativePath === undefined) {
      const tabNr = this.nexlSourcesTabs.val();
      if (tabNr < 0) {
        return;
      }

      relativePath = this.resolveTabAttr(tabNr, 'relative-path');
    }

    const tabInfo = this.resolveTabInfoByRelativePath(relativePath);
    const content = ace.edit(TAB_CONTENT + tabInfo.idSeqNr).getValue();

    this.globalComponentsService.loader.open();

    this.http.post({relativePath: relativePath, content: content}, '/sources/save-nexl-source', 'text').subscribe(
      (content: any) => {
        this.globalComponentsService.notification.openSuccess('File saved !');
        this.globalComponentsService.loader.close();
        this.changeFileStatus(tabInfo, false);
        $('#' + TITLE_ID + tabInfo.idSeqNr).attr(ATTR_IS_NEW_FILE, false);
        if (callback !== undefined) {
          callback(true);
        }
      },
      (err) => {
        this.globalComponentsService.loader.close();
        this.globalComponentsService.notification.openError('Failed to save nexl source\nReason : ' + err.statusText);
        console.log(err);
        if (callback !== undefined) {
          callback(false);
        }
      }
    );
  }

  closeDeletedTabs4Dir(relativePath: string) {
    // adding slash to the end
    relativePath = relativePath + UtilsService.SERVER_INFO.SLASH;

    relativePath = UtilsService.IS_WIN ? relativePath.toLocaleLowerCase() : relativePath;

    const tabsLength = this.nexlSourcesTabs.length();
    for (let index = tabsLength - 1; index >= 0; index--) {
      let tabsRelativePath = this.resolveTabAttr(index, 'relative-path');
      tabsRelativePath = UtilsService.IS_WIN ? tabsRelativePath.toLocaleLowerCase() : tabsRelativePath;

      if (tabsRelativePath.indexOf(relativePath) === 0) {
        const idSeqNr = this.resolveTabAttr(index, 'id-seq-nr');
        this.closeTabInnerInner(idSeqNr);
      }
    }
  }

  closeDeletedTabs4File(relativePath: string) {
    relativePath = UtilsService.IS_WIN ? relativePath.toLocaleLowerCase() : relativePath;

    for (let index = 0; index < this.nexlSourcesTabs.length(); index++) {
      let tabsRelativePath = this.resolveTabAttr(index, 'relative-path');
      tabsRelativePath = UtilsService.IS_WIN ? tabsRelativePath.toLocaleLowerCase() : tabsRelativePath;

      if (tabsRelativePath === relativePath) {
        const idSeqNr = this.resolveTabAttr(index, 'id-seq-nr');
        this.closeTabInnerInner(idSeqNr);
        return;
      }
    }
  }

  closeDeletedTabs(data: any) {
    if (data.isDir === true) {
      this.closeDeletedTabs4Dir(data.relativePath);
    } else {
      this.closeDeletedTabs4File(data.relativePath);
    }
  }

  updateTabsPermissions(data: any) {
    if (data.hasWritePermission === this.hasWritePermission) {
      return;
    }

    // updating opened tabs
    this.hasWritePermission = data.hasWritePermission;
  }

  resizeAce() {
    setTimeout(() => {
      // iterating over tabs
      for (let index = 0; index < this.nexlSourcesTabs.length(); index++) {
        const id = this.resolveTabAttr(index, 'id');
        ace.edit(id).resize();
      }
    }, 200);
  }

  resolveTabAttr(tabNr: number, attrName: string) {
    return this.nexlSourcesTabs.getContentAt(tabNr).firstElementChild.getAttribute(attrName);
  }

  setTabAttr(tabNr: number, attrName: string, attrValue: string) {
    this.nexlSourcesTabs.getContentAt(tabNr).firstElementChild.setAttribute(attrName, attrValue);
  }

  resolveTabInfoByRelativePath(relativePath: string): any {
    relativePath = UtilsService.IS_WIN ? relativePath.toLocaleLowerCase() : relativePath;

    for (let index = 0; index < this.nexlSourcesTabs.length(); index++) {
      let path = this.resolveTabAttr(index, 'relative-path');
      path = UtilsService.IS_WIN ? path.toLocaleLowerCase() : path;
      if (path === relativePath) {
        return {
          id: this.resolveTabAttr(index, 'id'),
          index: index,
          relativePath: path,
          idSeqNr: this.resolveTabAttr(index, 'id-seq-nr')
        };
      }
    }
  }

  resolveTabByRelativePath(relativePath: string): number {
    const tabInfo = this.resolveTabInfoByRelativePath(relativePath);
    return tabInfo === undefined ? -1 : tabInfo.index;
  }

  loadNexlSource(data: any) {
    // is tab already opened ?
    const tabInfo = this.resolveTabInfoByRelativePath(data.relativePath);
    if (tabInfo !== undefined && tabInfo.index >= 0) {
      this.nexlSourcesTabs.val(tabInfo.index + '');
      return;
    }

    this.globalComponentsService.loader.open();

    // loading file content by relativePath
    this.http.post({relativePath: data.relativePath}, '/sources/load-nexl-source', 'text').subscribe(
      (content: any) => {
        data.body = content.body;
        this.loadNexlSourceInner(data);
        this.globalComponentsService.loader.close();
      },
      (err) => {
        this.globalComponentsService.loader.close();
        this.globalComponentsService.notification.openError('Failed to read nexl source content\nReason : ' + err.statusText);
        console.log(err);
      }
    );
  }

  makeId(data: any, prefix: string) {
    return prefix + data.idSeqNr;
  }

  ngAfterViewInit(): void {
    this.nexlSourcesTabs.scrollPosition('both');
    this.nexlSourcesTabs.removeFirst();
    ace.config.set('basePath', 'nexl/site/ace');
  }

  makeTitle(data: any) {
    const modified = '<span style="color:red;display: none;" id="' + this.makeId(data, TITLE_MODIFICATION_ICON) + '">*&nbsp;</span>';
    const theTitle = '<span style="position:relative; top: -2px;" id="' + this.makeId(data, TITLE_TEXT) + '">' + data.label + '</span>';
    const closeIcon = '<img style="position:relative; top: 2px; left: 4px;" src="/nexl/site/images/close-tab.png" id="' + this.makeId(data, TITLE_CLOSE_ICON) + '"/>';
    const attrs = {
      id: this.makeId(data, TITLE_ID),
      'id-seq-nr': data.idSeqNr
    };
    return '<span ' + NexlSourcesEditorComponent.obj2Array(attrs) + '>' + modified + theTitle + closeIcon + '</span>';
  }

  makeBody(data: any) {
    const attrs = {
      id: this.makeId(data, TAB_CONTENT),
      'id-seq-nr': data.idSeqNr,
      'relative-path': data.relativePath
    };

    return '<div ' + NexlSourcesEditorComponent.obj2Array(attrs) + '>' + data.body + '</div>';
  }

  closeTabInnerInner(idSeqNr: number) {
    const relativePath = $('#' + TAB_CONTENT + idSeqNr).attr('relative-path');

    // ATTR_IS_NEW_FILE means is the file was created but hasn't ever saved. In this case it must be removed from the tree
    const isNewFile = $('#' + TITLE_ID + idSeqNr).attr(ATTR_IS_NEW_FILE);
    if (isNewFile === true.toString()) {
      this.messageService.sendMessage({
        type: MESSAGE_TYPE.REMOVE_FILE_FROM_TREE,
        data: relativePath
      });
    }

    // destroying tooltip
    jqwidgets.createInstance($('#' + TITLE_ID + idSeqNr), 'jqxTooltip').destroy();
    // destroying ace
    ace.edit(TAB_CONTENT + idSeqNr).destroy();
    // removing tab
    this.nexlSourcesTabs.removeAt(this.resolveTabByRelativePath(relativePath));
  }

  closeTab(event: any) {
    const idSeqNr = event.target.parentElement.getAttribute('id-seq-nr');
    this.closeTabInner(idSeqNr).then();
  }

  closeTabInner(idSeqNr: number) {
    return new Promise((resolve, reject) => {
      const relativePath = $('#' + TAB_CONTENT + idSeqNr).attr('relative-path');

      const isChanged = $('#' + TITLE_ID + idSeqNr).attr('is-changed') === 'true';
      if (!isChanged) {
        this.closeTabInnerInner(idSeqNr);
        resolve();
        return;
      }

      const opts = {
        label: 'The [' + relativePath + '] file contains unsaved data. Are you sure you want to close it and lose all changes ?',
        title: 'File close confirmation',
        callback: (callbackData: any) => {
          if (callbackData.isConfirmed === true) {
            const tabInfo = this.resolveTabInfoByRelativePath(relativePath);
            this.changeFileStatus(tabInfo, false);
            this.closeTabInnerInner(idSeqNr);
          }

          resolve();
        }
      };

      this.globalComponentsService.confirmBox.open(opts);
    });
  }

  bindTitle(data: any) {
    // binding close action
    $('#' + this.makeId(data, TITLE_CLOSE_ICON)).click((event) => {
      this.closeTab(event);
    });

    // binding tooltip
    jqwidgets.createInstance($('#' + this.makeId(data, TITLE_ID)), 'jqxTooltip', {
      content: '<div style="height: 8px;"></div>Path : [<span style="cursor: pointer; text-decoration: underline" id="' + this.makeId(data, TITLE_TOOLTIP) + '">' + data.relativePath + '</span>]',
      position: 'mouse',
      closeOnClick: true,
      autoHide: true,
      autoHideDelay: 99999,
      animationShowDelay: 400,
      showDelay: 600,
      trigger: 'hover',
      height: '40px'
    });

    // binding click on tool tip
    $('#' + this.makeId(data, TITLE_TOOLTIP)).click(() => {
      this.messageService.sendMessage({
        type: MESSAGE_TYPE.SELECT_ITEM_IN_TREE,
        data: $('#' + TITLE_TOOLTIP + data.idSeqNr).text()
      });
    });
  }

  bindBody(data: any) {
    const aceEditor = ace.edit(this.makeId(data, TAB_CONTENT));

    aceEditor.setOptions({
      fontSize: "10pt",
      autoScrollEditorIntoView: true,
      theme: "ace/theme/xcode",
      mode: "ace/mode/javascript"
    });

    aceEditor.$blockScrolling = Infinity;
    aceEditor.resize();

    aceEditor.on("change", (event) => {
      this.changeFileStatus(data, true);
    });
  }

  loadNexlSourceInner(data: any) {
    this.idSeqNr++;
    data.idSeqNr = this.idSeqNr;

    const title = this.makeTitle(data);
    const body = this.makeBody(data);
    this.nexlSourcesTabs.addLast(title, body);
    this.sendTabsCountMsg();

    this.bindTitle(data);
    this.bindBody(data);

    return data;
  }

  onTabSelect(event: any) {
    const idSeqNr = this.resolveTabAttr(event.args.item, 'id-seq-nr');
    ace.edit(TAB_CONTENT + idSeqNr).focus();
  }

  sendTabsCountMsg() {
    this.messageService.sendMessage({
      type: MESSAGE_TYPE.TABS_COUNT_CHANGED,
      data: this.nexlSourcesTabs.length()
    });
  }
}
