import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PortfolioOverviewTabComponent } from './components/portfolio-overview-tab/portfolio-overview-tab.component';

const routes: Routes = [
  {
    path: '',
    component: PortfolioOverviewTabComponent
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
export class PortfolioOverviewRoutingModule {
}
