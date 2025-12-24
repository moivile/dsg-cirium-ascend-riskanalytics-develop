import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FleetInsightsRoutingModule } from './fleet-insights-routing.module';
import { FleetDistributionTabComponent } from './components/fleet-distribution-tab/fleet-distribution-tab.component';
import { FleetTrendsTabComponent } from './components/fleet-trends-tab/fleet-trends-tab.component';
import { MarketActivityTabComponent } from './components/market-activity-tab/market-activity-tab.component';
import { FleetInsightsComponent } from './fleet-insights.component';
import { FleetInsightsFilterPanelComponent } from './components/fleet-insights-filter-panel/fleet-insights-filter-panel.component';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    FleetInsightsComponent,
    FleetInsightsFilterPanelComponent,
    FleetDistributionTabComponent,
    FleetTrendsTabComponent,
    MarketActivityTabComponent
  ],
  imports: [CommonModule, FleetInsightsRoutingModule, SelectModule, TooltipModule]
})
export class FleetInsightsModule { }
