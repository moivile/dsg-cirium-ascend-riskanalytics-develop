import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FleetDistributionTabComponent } from './components/fleet-distribution-tab/fleet-distribution-tab.component';
import { FleetTrendsTabComponent } from './components/fleet-trends-tab/fleet-trends-tab.component';
import { MarketActivityTabComponent } from './components/market-activity-tab/market-activity-tab.component';
import { fleetDistributionPath, fleetTrendsPath, marketActivityPath } from '../../route.constants';
import { FleetInsightsComponent } from './fleet-insights.component';

const routes: Routes = [
  {
    path: '',
    component: FleetInsightsComponent,
    children: [
      { path: fleetDistributionPath, component: FleetDistributionTabComponent },
      { path: fleetTrendsPath, component: FleetTrendsTabComponent },
      { path: marketActivityPath, component: MarketActivityTabComponent },
      { path: '', redirectTo: fleetDistributionPath, pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleetInsightsRoutingModule {}
