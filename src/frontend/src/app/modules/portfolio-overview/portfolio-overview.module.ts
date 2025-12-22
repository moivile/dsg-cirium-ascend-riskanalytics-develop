import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { PortfolioOverviewRoutingModule } from './portfolio-overview-routing.module';

import { PortfolioOverviewTabComponent } from './components/portfolio-overview-tab/portfolio-overview-tab.component';
import { PortfolioOverviewSummaryCountsComponent } from './components/portfolio-overview-summary-counts/portfolio-overview-summary-counts.component';
import { PortoflioOverviewSummaryMetricsComponent } from './components/portfolio-overview-summary-metrics/portfolio-overview-summary-metrics.component';
import { PortfolioOverviewGroupingComponent } from './components/portfolio-overview-grouping/portfolio-overview-grouping.component';

import { DropdownModule } from 'primeng/dropdown';
import { PortfolioOverviewStackedBarChartComponent } from './components/portfolio-overview-stacked-bar-chart/portfolio-overview-stacked-bar-chart.component';
import { DialogModule } from 'primeng/dialog';
import { PortfolioOverviewTableComponent } from './components/portfolio-overview-table/portfolio-overview-table.component';
import { TableModule } from 'primeng/table';
import { IsLastColumnPipe } from './components/portfolio-overview-table/table-is-last-column.pipe';
import { SharedModule } from '../shared/shared.module';
import { PortfolioOverviewAccordionComponent } from './components/portfolio-overview-accordion/portfolio-overview-accordion.component';
import { PortfolioOverviewJitterChartComponent } from './components/portfolio-overview-jitter-chart/portfolio-overview-jitter-chart.component';
import { PortfolioOverviewDetailsTableComponent } from './components/portfolio-overview-details-table/portfolio-overview-details-table.component';
import { PortfolioOverviewFilterComponent } from './components/portfolio-overview-filter/portfolio-overview-filter.component';
import { TooltipModule } from 'primeng/tooltip';
import { DisplayedFilterOptionsPipe } from './components/portfolio-overview-filter/displayed-filter-options.pipe';
import { PortfolioOverviewFilterExcelService } from './components/portfolio-overview-filter/portfolio-overview-filter-excel-service';

@NgModule({
  declarations: [
    PortfolioOverviewTabComponent,
    PortfolioOverviewSummaryCountsComponent,
    PortoflioOverviewSummaryMetricsComponent,
    PortfolioOverviewGroupingComponent,
    PortfolioOverviewStackedBarChartComponent,
    PortfolioOverviewTableComponent,
    IsLastColumnPipe,
    PortfolioOverviewAccordionComponent,
    PortfolioOverviewJitterChartComponent,
    PortfolioOverviewDetailsTableComponent,
    PortfolioOverviewFilterComponent,
    DisplayedFilterOptionsPipe
  ],
  imports: [
    CommonModule,
    PortfolioOverviewRoutingModule,
    DropdownModule,
    FormsModule,
    NgChartsModule,
    DialogModule,
    TableModule,
    SharedModule,
    TooltipModule
  ],
  providers: [
    PortfolioOverviewFilterExcelService
  ]
})
export class PortfolioOverviewModule { }
