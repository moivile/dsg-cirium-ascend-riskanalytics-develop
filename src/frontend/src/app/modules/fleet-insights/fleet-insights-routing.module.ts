import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FleetDistributionTabComponent } from './components/fleet-distribution-tab/fleet-distribution-tab.component';
import { FleetTrendsTabComponent } from './components/fleet-trends-tab/fleet-trends-tab.component';
import { MarketActivityTabComponent } from './components/market-activity-tab/market-activity-tab.component';
import { assetAIRoute, fleetDistributionRoute, fleetTrendsRoute, marketActivityRoute } from '../../route.constants';
import { FleetInsightsComponent } from './fleet-insights.component';
import { AssetAiTabComponent } from './components/asset-ai-tab/asset-ai-tab.component';

const routes: Routes = [
  {
    path: '',
    component: FleetInsightsComponent,
    children: [
      { path: fleetDistributionRoute, component: FleetDistributionTabComponent },
      { path: fleetTrendsRoute, component: FleetTrendsTabComponent },
      { path: marketActivityRoute, component: MarketActivityTabComponent },
      { path: assetAIRoute, component: AssetAiTabComponent },
      { path: '', redirectTo: fleetDistributionRoute, pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleetInsightsRoutingModule {}
