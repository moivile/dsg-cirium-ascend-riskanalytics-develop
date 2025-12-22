import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateEditPortfolioTabComponent } from './components/create-edit-portfolio-tab/create-edit-portfolio-tab.component';

const routes: Routes = [
  {
    path: '',
    component: CreateEditPortfolioTabComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateEditPortfolioRoutingModule {}
