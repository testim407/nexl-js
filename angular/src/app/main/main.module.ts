import {NgModule} from "@angular/core";

import {jqxMenuComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxmenu';
import {jqxTreeComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxtree';
import {jqxExpanderComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxexpander';
import {jqxTabsComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxtabs';
import {jqxSplitterComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxsplitter';
import {jqxComboBoxComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxcombobox';
import {jqxButtonComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxbuttons';
import {jqxTooltipComponent} from 'jqwidgets-framework/jqwidgets-ts/angular_jqxtooltip';
import {HttpModule} from "@angular/http";

import {HeaderComponent} from './header/header.component';
import {NexlLogoComponent} from './header/nexl-logo/nexl-logo.component';
import {MainMenuComponent} from './header/main-menu/main-menu.component';
import {AuthMenuComponent} from './header/auth-menu/auth-menu.component';

import {ContentComponent} from './content/content.component';
import {NexlSourcesExplorerComponent} from './content/nexl-sources-explorer/nexl-sources-explorer.component';
import {NexlSourcesEditorComponent} from './content/nexl-source-editor/nexl-sources-editor.component';
import {NexlExpressionsTesterComponent} from './content/nexl-expressions-tester/nexl-expressions-tester.component';

import {NexlSourcesService} from "../services/nexl-sources.service";
import {MainComponent} from "./main.component";
import {BrowserModule} from '@angular/platform-browser';

@NgModule({
	declarations: [
		jqxMenuComponent,
		jqxTreeComponent,
		jqxExpanderComponent,
		jqxTabsComponent,
		jqxSplitterComponent,
		jqxComboBoxComponent,
		jqxButtonComponent,
		jqxTooltipComponent,

		HeaderComponent,
		NexlLogoComponent,
		MainMenuComponent,
		AuthMenuComponent,
		NexlSourcesExplorerComponent,
		NexlSourcesEditorComponent,
		NexlExpressionsTesterComponent,
		HeaderComponent,
		ContentComponent,
		MainComponent
	],

	imports: [
		HttpModule,
		BrowserModule
	],

	providers: [
		NexlSourcesService
	],

	exports: [
		MainComponent
	]
})
export class MainModule {

}