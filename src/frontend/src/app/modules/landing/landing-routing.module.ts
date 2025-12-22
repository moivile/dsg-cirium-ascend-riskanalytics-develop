import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingTabComponent } from './components/landing-tab/landing-tab.component';

const routes: Routes = [
  {
    path: '',
    component: LandingTabComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class LandingRoutingModule {
}


//create component then routing
