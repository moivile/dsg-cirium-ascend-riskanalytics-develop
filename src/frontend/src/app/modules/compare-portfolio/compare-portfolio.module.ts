import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { SharedModule } from '../shared/shared.module';
import { TreeSelectModule } from 'primeng/treeselect';
import { DatePickerModule } from 'primeng/datepicker';
import { BaseChartDirective } from 'ng2-charts';

import { ComparePortfolioRoutingModule } from './compare-portfolio-routing.module';
import { ComparePortfolioTabComponent } from './components/compare-portfolio-tab/compare-portfolio-tab.component';
import { PortfolioDetailComponent } from './components/portfolio-detail/portfolio-detail.component';
import { PortfolioDetailOptionsComponent } from './components/portfolio-detail-options/portfolio-detail-options.component';
import { MonthlyUtilizationChartComponent } from './components/monthly-utilization-chart/monthly-utilization-chart.component';
import { TooltipModule } from 'primeng/tooltip';
import { ComparePortfolioExcelExportService } from './services/excel/compare-portfolio-excel-export.service';
import { ComparePortfolioTrackedUtilizationExcelSheetService } from './services/excel/compare-portfolio-tracked-utilization-excel-sheet.service';
import { ComparePortfolioEmissionsExcelSheetService } from './services/excel/compare-portfolio-emissions-excel-sheet.service';
import { UtilizationService } from '../shared/services/utilization.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

import { PrimeNGTableService } from './../shared/services/primeng-table-service';
import { ComparePortfolioTableComponent } from './components/compare-portfolio-table/compare-portfolio-table.component';

@NgModule({
  declarations: [
    ComparePortfolioTabComponent,
    PortfolioDetailComponent,
    PortfolioDetailOptionsComponent,
    MonthlyUtilizationChartComponent,
    ComparePortfolioTableComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ComparePortfolioRoutingModule,
    SharedModule,
    TreeSelectModule,
    SelectModule,
    InputNumberModule,
    TableModule,
    DialogModule,
    DatePickerModule,
    BaseChartDirective,
    TooltipModule,
    ReactiveFormsModule
  ],
  exports: [ComparePortfolioTabComponent],
  providers: [
    ComparePortfolioExcelExportService,
    ComparePortfolioTrackedUtilizationExcelSheetService,
    PrimeNGTableService,
    ComparePortfolioEmissionsExcelSheetService,
    UtilizationService
  ]
})
export class ComparePortfolioModule { }
