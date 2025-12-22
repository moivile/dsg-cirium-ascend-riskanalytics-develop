import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmissionsTabComponent } from './components/emissions-tab/emissions-tab.component';
import { EmissionsRoutingModule } from './emissions-routing.module';
import { ComparePortfolioModule } from './../compare-portfolio/compare-portfolio.module';
import { BaseUpsellPageComponent } from '../shared/components/base-upsell-page/base-upsell-page.component';
import { EmissionsUpsellComponent } from './components/emissions-upsell/emissions-upsell.component';



@NgModule({
  declarations: [
    EmissionsTabComponent,
    EmissionsUpsellComponent
  ],
  imports: [
    CommonModule,
    EmissionsRoutingModule,
    ComparePortfolioModule,
    BaseUpsellPageComponent
  ]
})
export class EmissionsModule { }
