import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HoursAndCyclesTabComponent } from './components/hours-and-cycles-tab/hours-and-cycles-tab.component';

const routes: Routes = [
  {
    path: '',
    component: HoursAndCyclesTabComponent
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
export class HoursAndCyclesRoutingModule {
}
