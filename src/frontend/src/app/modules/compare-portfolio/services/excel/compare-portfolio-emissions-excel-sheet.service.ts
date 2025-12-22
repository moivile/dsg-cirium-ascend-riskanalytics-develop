import { Injectable } from '@angular/core';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { ComparePortfolioExcelSheetBaseService } from './compare-portfolio-excel-sheet-base.service';

@Injectable()
export class ComparePortfolioEmissionsExcelSheetService extends ComparePortfolioExcelSheetBaseService {

  protected override buildPortfolioRows(
    includeOperatorColumn: boolean,
    includeLessorColumn: boolean,
    portfolioDetailOptions: PortfolioDetailOptions,
    monthlyUtilization: MonthlyUtilization[][]): {}[] {

    const rows: {}[] = [];

    monthlyUtilization.forEach(monthlyUtilizationGroup => {
      rows.push(super.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Average Monthly CO2 per Seat (kg)', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.averageCo2KgPerSeat)));
      rows.push(super.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Total Monthly CO2 per Seat (kg)', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.totalCo2KgPerSeat)));
      rows.push(super.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Total Monthly CO2 per ASK (g)', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.totalCo2GPerAsk)));
      rows.push(super.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Total Monthly CO2 per ASM (g)', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.totalCo2GPerAsm)));
      rows.push(super.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Average Monthly CO2 per ASK (g)', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.averageCo2GPerAsk)));
      rows.push(super.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Average Monthly CO2 per ASM (g)', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.averageCo2GPerAsm)));
      rows.push(this.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Tracked Aircraft', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.numberOfAircraftWithCo2KgPerSeat)));
    });

    return rows;
  }
}
