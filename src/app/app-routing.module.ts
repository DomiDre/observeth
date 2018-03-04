import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main/main.component';
import { DonateComponent } from './donate/donate.component';
import { AboutComponent } from './about/about.component';
import { TestpageComponent } from './testpage/testpage.component';
import { NoMetamaskComponent } from './no-metamask/no-metamask.component';
import { LiveEthereumObserverComponent } from './live-ethereum-observer/live-ethereum-observer.component';
import { EtherObserverComponent } from './ether-observer/ether-observer.component';
import { TokenObserverComponent } from './token-observer/token-observer.component';
import { MywalletComponent } from './mywallet/mywallet.component';
import { DexTrackComponent } from './dex-track/dex-track.component';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full'},
  { path: 'main', component:MainComponent},
  { path: 'EtherObserver', component:EtherObserverComponent},
  { path: 'TokenObserver', component:TokenObserverComponent},
  { path: 'DexTrack', component:DexTrackComponent},
  { path: 'About', component:AboutComponent},
  { path: 'Donate', component:DonateComponent},
  { path: 'Testpage', component:TestpageComponent},
  { path: 'NoMetamask', component:NoMetamaskComponent},
  { path: 'LiveEtherWatch', component: LiveEthereumObserverComponent},
  { path: 'MyWallet', component: MywalletComponent}
];

@NgModule({  
  imports: [ RouterModule.forRoot(routes)], //, {useHash: true}) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}