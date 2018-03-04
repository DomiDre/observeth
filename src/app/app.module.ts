import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { ParticlesModule } from 'angular-particle';

import { AppComponent } from './app.component';
import { PrimeNgModule } from './shared/primeng.module';
import { AppRoutingModule } from './/app-routing.module';

import { InfoHeaderComponent } from './info-header/info-header.component';
import { MainComponent } from './main/main.component';
import { DonateComponent } from './donate/donate.component';
import { AboutComponent } from './about/about.component';
import { TestpageComponent } from './testpage/testpage.component';
import { NoMetamaskComponent } from './no-metamask/no-metamask.component';

import { Web3ConnectService } from './shared/web3-connect.service';
import { TxTreaterService } from './shared/tx-treater.service';

import { LiveEthereumObserverComponent } from './live-ethereum-observer/live-ethereum-observer.component';

import { EtherObserverComponent } from './ether-observer/ether-observer.component';
import { EtherObserverOptionsComponent } from './ether-observer/ether-observer-options/ether-observer-options.component'

import { TokenObserverComponent } from './token-observer/token-observer.component';
import { TokenObserverOptionsComponent } from './token-observer/token-observer-options/token-observer-options.component'

import { FiltersComponent } from './shared/filters/filters.component';
import { StatisticsComponent } from './shared/statistics/statistics.component';

import { RelativeDatePipe } from './shared/relative_time.pipe';
import { MywalletComponent } from './mywallet/mywallet.component';
import { MywalletOptionsComponent } from './mywallet/mywallet-options/mywallet-options.component';
import { DexTrackComponent } from './dex-track/dex-track.component'


@NgModule({
  declarations: [
    AppComponent,
    InfoHeaderComponent,
    MainComponent,
    DonateComponent,
    AboutComponent,
    TestpageComponent,
    NoMetamaskComponent,

    EtherObserverComponent,
    EtherObserverOptionsComponent,
    
    LiveEthereumObserverComponent,
    
    TokenObserverComponent,
    TokenObserverOptionsComponent,
    
    FiltersComponent,
    StatisticsComponent,
    
    RelativeDatePipe,
    
    MywalletComponent,
    
    MywalletOptionsComponent,
    
    DexTrackComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    PrimeNgModule,
    FormsModule,
    ParticlesModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [Web3ConnectService,
              TxTreaterService,
              DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
