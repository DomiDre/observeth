import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { ParticlesModule } from 'angular-particle';

import { AppComponent } from './app.component';

import { InfoHeaderComponent } from './info-header/info-header.component';
import { TokenObserverComponent } from './token-observer/token-observer.component';
import { AppRoutingModule } from './/app-routing.module';
import { MainComponent } from './main/main.component';
import { DonateComponent } from './donate/donate.component';
import { AboutComponent } from './about/about.component';
import { Web3ConnectService } from './shared/web3-connect.service';
import { TestpageComponent } from './testpage/testpage.component';
import { NoMetamaskComponent } from './no-metamask/no-metamask.component';
import { LiveEthereumObserverComponent } from './live-ethereum-observer/live-ethereum-observer.component';
import { EtherObserverComponent } from './ether-observer/ether-observer.component';


@NgModule({
  declarations: [
    AppComponent,
    InfoHeaderComponent,
    TokenObserverComponent,
    MainComponent,
    DonateComponent,
    AboutComponent,
    TestpageComponent,
    NoMetamaskComponent,
    LiveEthereumObserverComponent,
    EtherObserverComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ParticlesModule,
    AppRoutingModule
  ],
  providers: [Web3ConnectService],
              // {provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
