import { NgModule } from '@angular/core';
import { CheckboxModule, ButtonModule, DataTableModule, DataListModule,
        DropdownModule, InputTextModule, 
        InputTextareaModule, OverlayPanelModule, DialogModule, 
        SpinnerModule, SidebarModule, SliderModule, SplitButtonModule, TooltipModule, 
        PanelModule } from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import {AdvGrowlModule} from 'primeng-advanced-growl';

@NgModule({
  imports: [
    AdvGrowlModule,
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    CheckboxModule,
    DataListModule,
    DataTableModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    OverlayPanelModule,
    PanelModule,
    SidebarModule,
    SpinnerModule,
    SplitButtonModule,
    SliderModule,
    TooltipModule,
  ],
  exports: [
    AdvGrowlModule,
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    CheckboxModule,
    DataListModule,
    DataTableModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    OverlayPanelModule,
    PanelModule,
    SidebarModule,
    SplitButtonModule,
    SpinnerModule,
    SliderModule,
    TooltipModule,
  ],
  providers: [],
  declarations: [],
})
export class PrimeNgModule { }
