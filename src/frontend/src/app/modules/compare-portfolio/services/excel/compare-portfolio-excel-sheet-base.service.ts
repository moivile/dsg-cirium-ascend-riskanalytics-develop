import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { ExcelSheetData } from '../../../shared/models/excel-sheet-data';
import { DateConstants } from '../../../shared/models/date-constants';
import * as dayjs from 'dayjs';
import { MSNUtilizationPerAircraft } from '../../models/monthly-utilization-per-aircraft';

export abstract class ComparePortfolioExcelSheetBaseService {
  buildExcelSheet(
    portfolioDetailOptions: PortfolioDetailOptions,
    monthlyUtilization: MonthlyUtilization[][],
    comparisonPortfolioDetailOptions?: PortfolioDetailOptions,
    comparisonMonthlyUtilization?: MonthlyUtilization[][]
  ): ExcelSheetData[] {
    const includeOperatorColumn = portfolioDetailOptions.operatorId || comparisonPortfolioDetailOptions?.operatorId ? true : false;
    const includeLessorColumn = portfolioDetailOptions.lessorId || comparisonPortfolioDetailOptions?.lessorId ? true : false;

    const sheetHeaders = this.buildHeaders(includeOperatorColumn, includeLessorColumn, monthlyUtilization[0]);

    const rows: { [property: string]: any }[] = this.buildRows(
      includeOperatorColumn,
      includeLessorColumn,
      portfolioDetailOptions,
      monthlyUtilization,
      comparisonPortfolioDetailOptions,
      comparisonMonthlyUtilization
    );
    const numberOfMonths = monthlyUtilization[0].length;
    for (let i = 0; i < rows.length; i++) {
      const portfolio = rows[i]['Portfolio'];
      const grouping = rows[i]['Grouping'];
      const operator = rows[i]['Operator'];
      const lessor = rows[i]['Lessor'];
      let totalMetric, divisorMetric;
      switch (rows[i]['Metrics']) {
        case 'Average Monthly Tracked Hours':
          totalMetric = 'Total Monthly Tracked Hours';
          divisorMetric = 'Tracked Aircraft';
          break;
        case 'Average Monthly Tracked H/C Ratio':
          totalMetric = 'Total Monthly Tracked Hours';
          divisorMetric = 'Total Monthly Tracked Cycles';
          break;
        case 'Average Monthly Tracked Cycles':
          totalMetric = 'Total Monthly Tracked Cycles';
          divisorMetric = 'Tracked Aircraft';
          break;
        default:
          totalMetric = rows[i]['Total of Selected Period'];
          divisorMetric = numberOfMonths;
          break;
      }
      const avg = this.calculateAvgForMetric(rows, portfolio, grouping, operator, lessor, totalMetric, divisorMetric);
      rows[i]['Avg. of Selected Period'] = avg;
    }
    const excelData: ExcelSheetData[] = [];
    const distinctMetrics = this.getDistinctPropertyValues(rows, 'Metrics' as keyof (typeof rows)[0]);
    distinctMetrics.forEach((metric) => {
      const elements = rows.filter((row: { [property: string]: any }) => row['Metrics'] === metric);
      excelData.push({
        excelData: elements,
        excelNumberFormat: '0',
        headersInOrder: sheetHeaders,
        isPivot: false
      });
    });

    return excelData;
  }

  calculateAvgForMetric(
    rows: { [property: string]: any }[],
    portfolio: string,
    grouping: string,
    operator: string|undefined,
    lessor: string|undefined,
    totalMetric: string | number,
    divisorMetric: string | number
  ): number {
    if (!isNaN(+totalMetric) && !isNaN(+divisorMetric)) {
      return Math.round(this.calculateAverage(+totalMetric, +divisorMetric) * 100) / 100;
    }
    const total = rows.filter(
      (x) =>
        x['Portfolio'] === portfolio &&
        x['Grouping'] === grouping &&
        x['Metrics'] === totalMetric &&
        x['Operator'] === operator &&
        x['Lessor'] === lessor
    )[0]['Total of Selected Period'];
    const divisor = rows.filter(
      (x) =>
        x['Portfolio'] === portfolio &&
        x['Grouping'] === grouping &&
        x['Metrics'] === divisorMetric &&
        x['Operator'] === operator &&
        x['Lessor'] === lessor
    )[0]['Total of Selected Period'];
    const avg = this.calculateAverage(total, divisor);
    if (isNaN(avg)) {
      return 0;
    }
    return Math.round(avg * 100) / 100;
  }

  calculateAverage(totalMetricValue: number, totalTrackedAircrafts: number): number {
    return totalTrackedAircrafts !== 0 ? totalMetricValue / totalTrackedAircrafts : NaN;
  }

  getDistinctPropertyValues<T, K extends keyof T>(array: T[], propertyName: K): T[K][] {
    const uniqueValues = new Set(array.map((item) => item[propertyName]));
    return Array.from(uniqueValues);
  }

  buildFilterCriteriaSheet(
    portfolioDetailOptions: PortfolioDetailOptions,
    endMonthIndex: number,
    startMonthIndex: number,
    endYear: number,
    startYear: number,
    comparisonPortfolioDetailOptions?: PortfolioDetailOptions
  ): ExcelSheetData[] {
    const sheetHeaders = ['Criteria', 'Selection'];
    const rows = [
      {
        Criteria: 'Portfolio',
        Selection: portfolioDetailOptions.portfolioName
      },
      {
        Criteria: 'Comparison Portfolio',
        Selection: comparisonPortfolioDetailOptions ? comparisonPortfolioDetailOptions.portfolioName : 'Not Selected'
      },
      {
        Criteria: 'Start Month',
        Selection: dayjs(`${startYear}-${startMonthIndex + 1}-01`).format(DateConstants.MMMYYYY)
      },
      {
        Criteria: 'End Month',
        Selection: dayjs(`${endYear}-${endMonthIndex + 1}-01`).format(DateConstants.MMMYYYY)
      }
    ];
    const excelData: ExcelSheetData[] = [];
    excelData.push({
      excelData: rows,
      excelNumberFormat: '0',
      headersInOrder: sheetHeaders,
      isPivot: false
    });

    return excelData;
  }

  buildMSNExcelSheet(
    portfolioDetailOptions: PortfolioDetailOptions,
    monthlyUtilization: MSNUtilizationPerAircraft[] | undefined,
    endMonthIndex: number,
    startMonthIndex: number,
    endYear: number,
    startYear: number,
    isEmissions: boolean
  ): ExcelSheetData[] {
    const sheetHeaders = this.buildMSNTabHeaders(
      monthlyUtilization ? monthlyUtilization : [],
      isEmissions,
      endMonthIndex,
      startMonthIndex,
      endYear,
      startYear
    );
    const rows = this.BuildMSNTable(
      portfolioDetailOptions,
      monthlyUtilization ? monthlyUtilization : [],
      endMonthIndex,
      startMonthIndex,
      endYear,
      startYear,
      isEmissions
    );
    const excelData: ExcelSheetData[] = [];
    if ((rows as {}[]).length === 0) {
      return [];
    }
    excelData.push({
      excelData: [rows],
      excelNumberFormat: '0',
      headersInOrder: sheetHeaders,
      isPivot: false
    });
    return excelData;
  }

  protected abstract buildPortfolioRows(
    includeOperatorColumn: boolean,
    includeLessorColumn: boolean,
    portfolioDetailOptions: PortfolioDetailOptions,
    monthlyUtilization: MonthlyUtilization[][]
  ): {}[];

  protected BuildRow(
    portfolioDetailOptions: PortfolioDetailOptions,
    includeOperatorColumn: boolean,
    includeLessorColumn: boolean,
    metric: string,
    monthlyUtilizationGroup: MonthlyUtilization[],
    monthlyValues: any[]
  ): {} {
    let row: { [property: string]: any } = {};

    row = {
      Portfolio: portfolioDetailOptions.portfolioName,
      Grouping: monthlyUtilizationGroup[0].group,
      Metrics: metric
    };

    if (includeOperatorColumn) {
      row['Operator'] = portfolioDetailOptions.operatorName;
    }

    if (includeLessorColumn) {
      row['Lessor'] = portfolioDetailOptions.lessorName;
    }
    row['Avg. of Selected Period'] = 0;
    row['Total of Selected Period'] = 0;
    let totalValue = 0;
    monthlyUtilizationGroup.forEach((monthlyUtilization, index) => {
      const monthYearKey = this.buildMonthYearKey(monthlyUtilization);
      row[monthYearKey] = monthlyValues[index];
      totalValue += monthlyValues[index];
    });
    row['Total of Selected Period'] = totalValue;
    return row;
  }

  transformDataToTable(
    data: MSNUtilizationPerAircraft[],
    endMonthIndex: number,
    startMonthIndex: number,
    endYear: number,
    startYear: number,
    isEmissions: boolean
  ): {}[] {
    // Generate an array of months and years for the given range
    const dateRange = this.generateDateRange(startMonthIndex, startYear, endMonthIndex, endYear);
    if (isEmissions) {
      return this.mapEmissionGroupedDataToRows(data, dateRange);
    } else {
      return this.mapUtlilizationGroupedDataToRows(data, dateRange);
    }
  }

  mapUtlilizationGroupedDataToRows(groupedData: MSNUtilizationPerAircraft[], dateRange: string[]): {}[] {
    const rowArray: {}[] = [];
    groupedData.forEach((element) => {
      const totalHoursArray: string[] = [];
      const totalCyclesArray: string[] = [];
      const averageHoursPerCycleArray: string[] = [];
      const trackedAircraftsArray: string[] = [];
      const row = [element.registration, element.series, element.serialNumber];
      dateRange.forEach((date) => {
        const index = element.yearMonth.findIndex((x) => x === date);
        if (index === -1) {
          totalHoursArray.push('-');
          totalCyclesArray.push('-');
          averageHoursPerCycleArray.push('-');
          trackedAircraftsArray.push('0');
        } else {
          totalHoursArray.push(element.totalHours[index]?.toString());
          totalCyclesArray.push(element.totalCycles[index]?.toString());
          averageHoursPerCycleArray.push(element.averageHoursPerCycle[index]?.toString());
          trackedAircraftsArray.push('1');
        }
      });
      row.push(...totalHoursArray);
      row.push(...totalCyclesArray);
      row.push(...averageHoursPerCycleArray);
      row.push(...trackedAircraftsArray);
      rowArray.push(row);
    });
    return rowArray;
  }

  mapEmissionGroupedDataToRows(groupedData: MSNUtilizationPerAircraft[], dateRange: string[]): {}[] {
    const rowArray: {}[] = [];
    groupedData.forEach((element) => {
      const row: string[] = [element.registration, element.series, element.serialNumber];
      const cO2EmissionPerKgArray: string[] = [];
      const averageCo2KgPerSeatArray: string[] = [];
      const averageCo2GPerAskArray: string[] = [];
      const trackedAircraftsArray: string[] = [];
      const averageCo2GPerAsmArray: string[] = [];
      dateRange.forEach((date) => {
        const index = element.yearMonth.findIndex((x) => x === date);
        if (index === -1) {
          cO2EmissionPerKgArray.push('-');
          averageCo2KgPerSeatArray.push('-');
          averageCo2GPerAskArray.push('-');
          averageCo2GPerAsmArray.push('-');
          trackedAircraftsArray.push('0');
        } else {
          cO2EmissionPerKgArray.push(element.cO2EmissionPerKg[index]?.toString());
          averageCo2KgPerSeatArray.push(element.averageCo2KgPerSeat[index]?.toString());
          averageCo2GPerAskArray.push(element.averageCo2GPerAsk[index]?.toString());
          averageCo2GPerAsmArray.push(element.averageCo2GPerAsm[index]?.toString());
          trackedAircraftsArray.push('1');
        }
      });
      row.push(...cO2EmissionPerKgArray);
      row.push(...averageCo2KgPerSeatArray);
      row.push(...averageCo2GPerAskArray);
      row.push(...averageCo2GPerAsmArray);
      row.push(...trackedAircraftsArray);
      rowArray.push(row);
    });
    return rowArray;
  }

  // Helper function to generate the range of dates with a four-digit year format
  generateDateRange(startMonth: number, startYear: number, endMonth: number, endYear: number): string[] {
    const dates: string[] = [];
    let currentYear = startYear;
    let currentMonth = startMonth;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      dates.push(`${currentYear}_${currentMonth < 10 ? currentMonth : currentMonth}`);
      if (currentMonth === 12) {
        currentMonth = 1;
        currentYear++;
      } else {
        currentMonth++;
      }
    }

    return dates;
  }

  protected BuildMSNTable(
    portfolioDetailOptions: PortfolioDetailOptions,
    monthlyUtilizationGroup: MSNUtilizationPerAircraft[],
    endMonthIndex: number,
    startMonthIndex: number,
    endYear: number,
    startYear: number,
    isEmissions: boolean
  ): {} {
    const table = this.transformDataToTable(monthlyUtilizationGroup, endMonthIndex, startMonthIndex, endYear, startYear, isEmissions);
    return table;
  }

  private buildRows(
    includeOperatorColumn: boolean,
    includeLessorColumn: boolean,
    portfolioDetailOptions: PortfolioDetailOptions,
    monthlyUtilization: MonthlyUtilization[][],
    comparisonPortfolioDetailOptions: PortfolioDetailOptions | undefined,
    comparisonMonthlyUtilization: MonthlyUtilization[][] | undefined
  ): {}[] {
    const rows = this.buildPortfolioRows(includeOperatorColumn, includeLessorColumn, portfolioDetailOptions, monthlyUtilization);

    if (comparisonPortfolioDetailOptions && comparisonMonthlyUtilization) {
      const comparisonPortfolioRows = this.buildPortfolioRows(
        includeOperatorColumn,
        includeLessorColumn,
        comparisonPortfolioDetailOptions,
        comparisonMonthlyUtilization
      );

      rows.push(...comparisonPortfolioRows);
    }

    return rows;
  }

  private buildHeaders(includeOperatorColumn: boolean, includeLessorColumn: boolean, monthlyUtilizations: MonthlyUtilization[]): string[] {
    const headersInOrder: string[] = [];

    headersInOrder.push('Portfolio');

    if (includeOperatorColumn) {
      headersInOrder.push('Operator');
    }

    if (includeLessorColumn) {
      headersInOrder.push('Lessor');
    }

    headersInOrder.push('Grouping');
    headersInOrder.push('Metrics');
    headersInOrder.push('Avg. of Selected Period');
    headersInOrder.push('Total of Selected Period');

    monthlyUtilizations.forEach((x) => {
      headersInOrder.push(this.buildMonthYearKey(x));
    });

    return headersInOrder;
  }

  private buildMSNTabHeaders(
    monthlyUtilizations: MSNUtilizationPerAircraft[],
    isEmissions: boolean,
    endMonthIndex: number,
    startMonthIndex: number,
    endYear: number,
    startYear: number
  ): string[] {
    const headersInOrder: string[] = ['Registration', 'Series', 'Serial Number'];
    const dateRange = this.generateDateRange(startMonthIndex, startYear, endMonthIndex, endYear);
    const numOfPoints = isEmissions ? 5 : 4;

    for (let i = 0; i < numOfPoints; i++) {
      dateRange?.forEach((x) => {
        headersInOrder.push(this.buildMonthYearKeyForMSN(x));
      });
    }
    return headersInOrder;
  }
  private buildMonthYearKeyForMSN(x: string): string {
    const year = x.split('_')[0];
    const month = x.split('_')[1];
    return dayjs(`${year}-${month}-01`).format(DateConstants.MMMYYYY);
  }

  private buildMonthYearKey(x: MonthlyUtilization): string {
    return dayjs(`${x.year}-${x.month}-01`).format(DateConstants.MMMYYYY);
  }
}
