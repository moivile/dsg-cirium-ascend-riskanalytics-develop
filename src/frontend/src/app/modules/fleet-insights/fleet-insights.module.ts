import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FleetInsightsRoutingModule } from './fleet-insights-routing.module';
import { FleetDistributionTabComponent } from './components/fleet-distribution-tab/fleet-distribution-tab.component';
import { FleetTrendsTabComponent } from './components/fleet-trends-tab/fleet-trends-tab.component';
import { MarketActivityTabComponent } from './components/market-activity-tab/market-activity-tab.component';
import { FleetInsightsComponent } from './fleet-insights.component';
import { FleetInsightsFilterPanelComponent } from './components/fleet-insights-filter-panel/fleet-insights-filter-panel.component';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { TreeSelectModule } from 'primeng/treeselect';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FleetInsightsStore } from './services/fleet-insights-store';
import { AccordionModule } from 'primeng/accordion';
import { MultiselectGroupComponent } from './components/multiselect-group/multiselect-group.component';
import { GroupAllDataBySelectComponent } from './components/group-all-data-by-select/group-all-data-by-select.component';
import { DistributionTabAircraftTableComponent } from './components/distribution-tab-aircraft-table/distribution-tab-aircraft-table.component';
import { TableModule } from 'primeng/table';
import { DistributionTabSummaryTableComponent } from './components/distribution-tab-summary-table/distribution-tab-summary-table.component';
import { MarketActivitySummaryTableComponent } from './components/market-activity-summary-table/market-activity-summary-table.component';
import { FleetTabSummaryTableComponent } from './components/fleet-tab-summary-table/fleet-tab-summary-table.component';
import { FleetInsightAccordionComponent } from './components/fleet-insight-accordion/fleet-insight-accordion.component';
import { FleetInsightHorizontalBarChartComponent } from './components/fleet-insight-horizontal-bar-chart/fleet-insight-horizontal-bar-chart.component';
import { SharedModule } from '../shared/shared.module';
import { SliderModule } from 'primeng/slider';
import { FleetAgeBandSliderComponent } from './components/fleet-age-band-slider/fleet-age-band-slider.component';
import { FleetInsightsIntervalDateRangeFilterComponent } from './components/fleet-insights-interval-date-range-filter/fleet-insights-interval-date-range-filter.component';
import { FleetTrendsStackedAreaChartComponent } from './components/fleet-trends-stacked-area-chart/fleet-trends-stacked-area-chart/fleet-trends-stacked-area-chart.component';
import { MarketActivityHorizontalChartComponent } from './components/market-activity-horizontal-chart/market-activity-horizontal-chart.component';
import { MarketActivityLineChartComponent } from './components/market-activity-line-chart/market-activity-line-chart.component';
import { MarketActivityAccordionComponent } from './components/market-activity-accordion/market-activity-accordion.component';
import { MarketActivityTabStore } from './services/market-activity-tab-store';
import { BaseChartDirective } from 'ng2-charts';
import { AssetAiTabComponent } from './components/asset-ai-tab/asset-ai-tab.component';
import { SmartVirtualScrollDirective } from '../shared/directives/smart-virtual-scroll.directive';
import { AgChartsModule } from 'ag-charts-angular';
import { FleetInsightPieChartComponent } from './components/fleet-insight-pie-chart/fleet-insight-pie-chart.component';

@NgModule({
  declarations: [
    FleetInsightsComponent,
    FleetInsightsFilterPanelComponent,
    FleetInsightAccordionComponent,
    FleetDistributionTabComponent,
    FleetInsightHorizontalBarChartComponent,
    FleetInsightPieChartComponent,
    FleetTrendsTabComponent,
    MarketActivityTabComponent,
    AssetAiTabComponent,
    MarketActivityHorizontalChartComponent,
    MarketActivityLineChartComponent,
    MarketActivityAccordionComponent,
    MultiselectGroupComponent,
    GroupAllDataBySelectComponent,
    DistributionTabAircraftTableComponent,
    DistributionTabSummaryTableComponent,
    MarketActivitySummaryTableComponent,
    FleetTabSummaryTableComponent,
    FleetAgeBandSliderComponent,
    FleetInsightsIntervalDateRangeFilterComponent
  ],
  imports: [
    CommonModule,
    FleetInsightsRoutingModule,
    DropdownModule,
    TooltipModule,
    DatePickerModule,
    MultiSelectModule,
    TreeSelectModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    BaseChartDirective,
    DialogModule,
    TableModule,
    SharedModule,
    SliderModule,
    FleetTrendsStackedAreaChartComponent,
    SmartVirtualScrollDirective,
    AgChartsModule
  ],
  providers: [FleetInsightsStore, MarketActivityTabStore]
})
export class FleetInsightsModule {}
