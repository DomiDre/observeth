import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContractObserverComponent } from './contract-observer/contract-observer.component';
import { MainComponent } from './main/main.component';
import { DonateComponent } from './donate/donate.component';
import { AboutComponent } from './about/about.component';
import { TestpageComponent } from './testpage/testpage.component';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full'},
  { path: 'main', component:MainComponent},
  { path: 'ContractObserve', component:ContractObserverComponent},
  { path: 'About', component:AboutComponent},
  { path: 'Donate', component:DonateComponent},
  { path: 'Testpage', component:TestpageComponent}
];

@NgModule({  
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}