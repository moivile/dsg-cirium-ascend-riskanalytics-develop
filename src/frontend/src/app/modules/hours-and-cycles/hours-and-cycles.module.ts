import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HoursAndCyclesTabComponent } from './components/hours-and-cycles-tab/hours-and-cycles-tab.component';
import { HoursAndCyclesRoutingModule } from './hours-and-cycles-routing.module';
import { ComparePortfolioModule } from './../compare-portfolio/compare-portfolio.module';



@NgModule({
  declarations: [
    HoursAndCyclesTabComponent
  ],
  imports: [
    CommonModule,
    HoursAndCyclesRoutingModule,
    ComparePortfolioModule
  ]
})
export class HoursAndCyclesModule { }
