import { NgModule } from '@angular/core';
import { CheckboxModule, ButtonModule, SplitButtonModule, InputTextModule, 
        InputTextareaModule, OverlayPanelModule, DialogModule, 
        SpinnerModule, SidebarModule, SliderModule, TooltipModule,  } from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import {AdvGrowlModule} from 'primeng-advanced-growl';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    SplitButtonModule,
    InputTextModule,
    InputTextareaModule,
    OverlayPanelModule,
    DialogModule,
    SidebarModule,
    SpinnerModule,
    SliderModule,
    TooltipModule,
    AdvGrowlModule
  ],
  exports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CheckboxModule,
    ButtonModule,
    SplitButtonModule,
    InputTextModule,
    InputTextareaModule,
    OverlayPanelModule,
    DialogModule,
    SidebarModule,
    SpinnerModule,
    SliderModule,
    TooltipModule,
    AdvGrowlModule
  ],
  providers: [],
})
export class PrimeNgModule { }
