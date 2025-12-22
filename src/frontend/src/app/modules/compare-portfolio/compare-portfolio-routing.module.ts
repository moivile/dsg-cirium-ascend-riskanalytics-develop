import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComparePortfolioTabComponent } from './components/compare-portfolio-tab/compare-portfolio-tab.component';

const routes: Routes = [
  {
    path: '',
    component: ComparePortfolioTabComponent
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
export class ComparePortfolioRoutingModule {
}
