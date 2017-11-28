import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { InfoHeaderComponent } from './info-header/info-header.component';
import { ContractObserverComponent } from './contract-observer/contract-observer.component';
import { AppRoutingModule } from './/app-routing.module';
import { MainComponent } from './main/main.component';
import { DonateComponent } from './donate/donate.component';
import { AboutComponent } from './about/about.component';
import { Web3ConnectService } from './shared/web3-connect.service';
import { TestpageComponent } from './testpage/testpage.component';


@NgModule({
  declarations: [
    AppComponent,
    InfoHeaderComponent,
    ContractObserverComponent,
    MainComponent,
    DonateComponent,
    AboutComponent,
    TestpageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [Web3ConnectService],
  bootstrap: [AppComponent]
})
export class AppModule { }
