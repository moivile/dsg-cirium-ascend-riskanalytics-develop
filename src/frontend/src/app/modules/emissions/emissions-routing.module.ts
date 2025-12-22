import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmissionsTabComponent } from './components/emissions-tab/emissions-tab.component';

const routes: Routes = [
  {
    path: '',
    component: EmissionsTabComponent
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
export class EmissionsRoutingModule {
}
