import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, take, tap } from 'rxjs';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { ExcelSheetData } from '../../../shared/models/excel-sheet-data';
import { ComparePortfolioEmissionsExcelSheetService } from './compare-portfolio-emissions-excel-sheet.service';
import { ComparePortfolioTrackedUtilizationExcelSheetService } from './compare-portfolio-tracked-utilization-excel-sheet.service';
import { MetricOptions } from '../../models/metric-options';
import { UtilizationService } from '../../../shared/services/utilization.service';
import { Metric } from '../../models/metric';
import { MSNUtilizationPerAircraft } from '../../models/monthly-utilization-per-aircraft';

@Injectable()
export class ComparePortfolioExcelExportService {
  excelName = 'compare-portfolio-metrics';
  constructor(
    private readonly utilizationService: UtilizationService,
    private readonly comparePortfolioTrackedUtilizationExcelSheetService: ComparePortfolioTrackedUtilizationExcelSheetService,
    private readonly comparePortfolioEmissionsExcelSheetService: ComparePortfolioEmissionsExcelSheetService,
    private readonly exportExcelService: ExportExcelService
  ) {}

  export(
    portfolioDetailOptions: PortfolioDetailOptions,
    comparisonPortfolioDetailOptions: PortfolioDetailOptions | undefined,
    metricOptions: MetricOptions,
    metric: Metric[],
    isEmissions: boolean,
    isHoursAndCycle: boolean
  ): void {
    const monthlyUtilization$ = this.getMonthlyUtilization(portfolioDetailOptions, isEmissions, isHoursAndCycle);
    const comparisonMonthlyUtilization$ = this.getComparisonMonthlyUtilization(
      comparisonPortfolioDetailOptions,
      isEmissions,
      isHoursAndCycle
    );
    const getPortfolioMSNData = portfolioDetailOptions.portfolioId ? true : false;
    const getComparisonMSNData = comparisonPortfolioDetailOptions?.portfolioId ? true : false;
    combineLatest([
      monthlyUtilization$,
      comparisonMonthlyUtilization$,
      getPortfolioMSNData
        ? this.utilizationService.getMonthlyUtilizationPerAircraft(
            portfolioDetailOptions.portfolioId,
            metricOptions.endMonthIndex,
            metricOptions.startMonthIndex,
            metricOptions.endYear,
            metricOptions.startYear,
            isEmissions,
            portfolioDetailOptions.operatorId,
            portfolioDetailOptions.lessorId,
            portfolioDetailOptions.groupByOptions?.key,
            portfolioDetailOptions.groupByOptions?.filterIds
          )
        : of(null),
      comparisonPortfolioDetailOptions && getComparisonMSNData
        ? this.utilizationService.getMonthlyUtilizationPerAircraft(
            comparisonPortfolioDetailOptions.portfolioId,
            metricOptions.endMonthIndex,
            metricOptions.startMonthIndex,
            metricOptions.endYear,
            metricOptions.startYear,
            isEmissions,
            comparisonPortfolioDetailOptions.operatorId,
            comparisonPortfolioDetailOptions.lessorId,
            comparisonPortfolioDetailOptions.groupByOptions?.key,
            comparisonPortfolioDetailOptions.groupByOptions?.filterIds
          )
        : of(null)
    ])
      .pipe(
        take(1),
        map(([monthlyUtilization, comparisonMonthlyUtilization, utilizationPerAircraft, comparisonUtilizationPerAircraft]) => {
          const { trackedUtilizationExcelSheetData, emissionsExcelSheetData, MSNSheet, comparisonMSNSheet, filterCriteria } =
            this.computeSheetData(
              portfolioDetailOptions,
              comparisonPortfolioDetailOptions,
              metricOptions,
              monthlyUtilization,
              comparisonMonthlyUtilization,
              utilizationPerAircraft,
              comparisonUtilizationPerAircraft,
              isEmissions
            );

          return this.buildExcelSheets(
            isEmissions,
            filterCriteria,
            emissionsExcelSheetData,
            trackedUtilizationExcelSheetData,
            MSNSheet,
            comparisonMSNSheet,
            portfolioDetailOptions.portfolioName,
            comparisonPortfolioDetailOptions?.portfolioName
          );
        }),
        tap((excelSheets) => {
          this.exportExcelService.exportExcelSheetDataForMetricsPage(
            excelSheets,
            this.excelName,
            metricOptions,
            isEmissions,
            true,
            portfolioDetailOptions,
            comparisonPortfolioDetailOptions
          );
        })
      )
      .subscribe();
  }

  buildExcelSheets(
    isEmissions: boolean,
    filterCriteria: ExcelSheetData[],
    emissionsExcelSheetData: ExcelSheetData[],
    trackedUtilizationExcelSheetData: ExcelSheetData[],
    MSNSheet: ExcelSheetData[],
    comparisonMSNSheet: ExcelSheetData[],
    portfolioName: string,
    comparisonPortfolioName: string | undefined
  ): Map<string, ExcelSheetData[]> {
    const excelSheetsData = new Map<string, ExcelSheetData[]>();

    if (isEmissions) {
      this.excelName = 'Emissions_Analysis';
      excelSheetsData.set('Filter Criteria', filterCriteria);
      excelSheetsData.set('Emissions', emissionsExcelSheetData);
    } else {
      this.excelName = 'Hours_and_Cycles_Analysis';
      excelSheetsData.set('Filter Criteria', filterCriteria);
      excelSheetsData.set('Tracked Utilization', trackedUtilizationExcelSheetData);
    }
    MSNSheet?.length > 0 && excelSheetsData.set(('MSN - ' + portfolioName).substring(0, 30), MSNSheet);
    if (comparisonPortfolioName === portfolioName) {
      comparisonPortfolioName = '(1)' + 'MSN - ' + comparisonPortfolioName;
    } else {
      comparisonPortfolioName = 'MSN - ' + comparisonPortfolioName;
    }
    comparisonPortfolioName = comparisonPortfolioName.substring(0, 30);
    comparisonMSNSheet?.length > 0 && excelSheetsData.set(comparisonPortfolioName, comparisonMSNSheet);

    return excelSheetsData;
  }

  computeSheetData(
    portfolioDetailOptions: PortfolioDetailOptions,
    comparisonPortfolioDetailOptions: PortfolioDetailOptions | undefined,
    metricOptions: MetricOptions,
    monthlyUtilization: MonthlyUtilization[][],
    comparisonMonthlyUtilization: MonthlyUtilization[][],
    utilizationPerAircraft: MSNUtilizationPerAircraft[] | null,
    comparisonUtilizationPerAircraft: MSNUtilizationPerAircraft[] | null,
    isEmissions: boolean
  ): {
    trackedUtilizationExcelSheetData: ExcelSheetData[];
    emissionsExcelSheetData: ExcelSheetData[];
    MSNSheet: ExcelSheetData[];
    comparisonMSNSheet: ExcelSheetData[];
    filterCriteria: ExcelSheetData[];
  } {
    const monthlyUtilizationByDate = this.getMonthlyUtilizationByDate(monthlyUtilization, metricOptions);
    const comparisonMonthlyUtilizationByDate = this.getMonthlyUtilizationByDate(comparisonMonthlyUtilization, metricOptions);
    const trackedUtilizationExcelSheetData = this.comparePortfolioTrackedUtilizationExcelSheetService.buildExcelSheet(
      portfolioDetailOptions,
      monthlyUtilizationByDate,
      comparisonPortfolioDetailOptions,
      comparisonMonthlyUtilizationByDate
    );

    const emissionsExcelSheetData = this.comparePortfolioEmissionsExcelSheetService.buildExcelSheet(
      portfolioDetailOptions,
      monthlyUtilizationByDate,
      comparisonPortfolioDetailOptions,
      comparisonMonthlyUtilizationByDate
    );

    const { MSNSheet, comparisonMSNSheet } = this.buildMSNExcelSheets(
      portfolioDetailOptions,
      utilizationPerAircraft,
      metricOptions,
      isEmissions,
      comparisonPortfolioDetailOptions,
      comparisonUtilizationPerAircraft
    );
    const filterCriteria = this.comparePortfolioTrackedUtilizationExcelSheetService.buildFilterCriteriaSheet(
      portfolioDetailOptions,
      metricOptions.endMonthIndex,
      metricOptions.startMonthIndex,
      metricOptions.endYear,
      metricOptions.startYear,
      comparisonPortfolioDetailOptions
    );
    return { trackedUtilizationExcelSheetData, emissionsExcelSheetData, MSNSheet, comparisonMSNSheet, filterCriteria };
  }

  buildMSNExcelSheets(
    options: PortfolioDetailOptions,
    utilizationPerAircraft: MSNUtilizationPerAircraft[] | null,
    metricOptions: MetricOptions,
    isEmissions: boolean,
    comparisonOptions: PortfolioDetailOptions | null | undefined,
    comparisonUtilizationPerAircraft: MSNUtilizationPerAircraft[] | null
  ): {
    MSNSheet: ExcelSheetData[];
    comparisonMSNSheet: ExcelSheetData[];
  } {
    const buildSheet = (sheetOptions: PortfolioDetailOptions, sheetData: MSNUtilizationPerAircraft[]): ExcelSheetData[] => {
      const serviceToCall = isEmissions
        ? this.comparePortfolioEmissionsExcelSheetService
        : this.comparePortfolioTrackedUtilizationExcelSheetService;
      return serviceToCall.buildMSNExcelSheet(
        sheetOptions,
        sheetData,
        metricOptions.endMonthIndex + 1,
        metricOptions.startMonthIndex + 1,
        metricOptions.endYear,
        metricOptions.startYear,
        isEmissions
      );
    };

    const MSNSheet = utilizationPerAircraft && options ? buildSheet(options, utilizationPerAircraft) : [];
    const comparisonMSNSheet =
      comparisonUtilizationPerAircraft && comparisonOptions ? buildSheet(comparisonOptions, comparisonUtilizationPerAircraft) : [];

    return { MSNSheet, comparisonMSNSheet };
  }

  private getComparisonMonthlyUtilization(
    comparisonPortfolioDetailOptions: PortfolioDetailOptions | undefined,
    isEmissions: boolean,
    isHoursAndCycle: boolean
  ): Observable<MonthlyUtilization[][]> {
    if (comparisonPortfolioDetailOptions) {
      return this.getMonthlyUtilization(comparisonPortfolioDetailOptions, isEmissions, isHoursAndCycle);
    } else {
      return of<MonthlyUtilization[][]>([]);
    }
  }

  private getMonthlyUtilization(
    portfolioDetailOptions: PortfolioDetailOptions,
    isEmissions: boolean,
    isHoursAndCycle: boolean
  ): Observable<MonthlyUtilization[][]> {
    return this.utilizationService.getMonthlyUtilization(
      portfolioDetailOptions.portfolioId,
      true,
      isEmissions,
      isHoursAndCycle,
      portfolioDetailOptions.groupByOptions?.key,
      portfolioDetailOptions.groupByOptions?.filterIds,
      portfolioDetailOptions.operatorId,
      portfolioDetailOptions.lessorId
    );
  }

  private getMonthlyUtilizationByDate(monthlyUtilization: MonthlyUtilization[][], metricOptions: MetricOptions): MonthlyUtilization[][] {
    return monthlyUtilization.map((monthlyUtilization: MonthlyUtilization[]) => {
      return monthlyUtilization.filter(
        (x) =>
          ((x.year === metricOptions.startYear && x.month >= metricOptions.startMonthIndex + 1) || x.year > metricOptions.startYear) &&
          ((x.year === metricOptions.endYear && x.month <= metricOptions.endMonthIndex + 1) || x.year < metricOptions.endYear)
      );
    });
  }
}
