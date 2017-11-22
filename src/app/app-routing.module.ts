import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ContractObserverComponent } from './contract-observer/contract-observer.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full'},
  { path: 'main', component:MainComponent},
  { path: 'ContractObserve', component:ContractObserverComponent}
];

@NgModule({  
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}