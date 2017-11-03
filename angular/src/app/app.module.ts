import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {MainMenuComponent} from './main-menu/main-menu.component';
import {AuthMenuComponent} from './auth-menu/auth-menu.component';
import {NexlLogoComponent} from './nexl-logo/nexl-logo.component';
import {NexlSourcesExplorerComponent} from './nexl-sources-explorer/nexl-sources-explorer.component';
import {NexlSourcesEditorComponent} from './nexl-source-editor/nexl-sources-editor.component';
import {NexlExpressionsTesterComponent} from './nexl-expressions-tester/nexl-expressions-tester.component';

import {jqxMenuComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxmenu';
import {jqxTreeComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxtree';
import {jqxExpanderComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxexpander';
import {jqxTabsComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxtabs';
import {jqxSplitterComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxsplitter';
import {jqxComboBoxComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxcombobox';
import {jqxButtonComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxbuttons';

@NgModule({
	declarations: [
		AppComponent,

		jqxMenuComponent,
		jqxTreeComponent,
		jqxExpanderComponent,
		jqxTabsComponent,
		jqxSplitterComponent,
		jqxComboBoxComponent,
		jqxButtonComponent,

		NexlLogoComponent,
		MainMenuComponent,
		AuthMenuComponent,
		NexlSourcesExplorerComponent,
		NexlSourcesEditorComponent,
		NexlExpressionsTesterComponent
	],
	imports: [
		BrowserModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
}