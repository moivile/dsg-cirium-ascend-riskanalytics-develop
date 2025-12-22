import { Injectable } from '@angular/core';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { ComparePortfolioExcelSheetBaseService } from './compare-portfolio-excel-sheet-base.service';

@Injectable()
export class ComparePortfolioTrackedUtilizationExcelSheetService extends ComparePortfolioExcelSheetBaseService {

  protected override buildPortfolioRows(
    includeOperatorColumn: boolean,
    includeLessorColumn: boolean,
    portfolioDetailOptions: PortfolioDetailOptions,
    monthlyUtilization: MonthlyUtilization[][]): {}[] {

    const rows: {}[] = [];

    monthlyUtilization.forEach(monthlyUtilizationGroup => {
      rows.push(super.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Aircraft in Group', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.numberOfAircraftInGroup)));
      rows.push(this.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Tracked Aircraft', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.numberOfAircraftWithHours)));
      rows.push(this.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Average Monthly Tracked Hours', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.averageHours)));
      rows.push(this.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Total Monthly Tracked Hours', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.totalHours)));
      rows.push(this.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Average Monthly Tracked Cycles', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.averageCycles)));
      rows.push(this.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn,'Total Monthly Tracked Cycles', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.totalCycles)));
      rows.push(this.BuildRow(portfolioDetailOptions, includeOperatorColumn, includeLessorColumn, 'Average Monthly Tracked H/C Ratio', monthlyUtilizationGroup, monthlyUtilizationGroup.map(x => x.averageHoursPerCycle)));

    });

    return rows;
  }
}
