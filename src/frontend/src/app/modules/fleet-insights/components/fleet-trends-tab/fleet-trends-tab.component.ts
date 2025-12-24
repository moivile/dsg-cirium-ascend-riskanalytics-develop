import { Component, OnInit, OnDestroy } from '@angular/core';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { TrendsTabStore } from '../../services/trends-tab-store';
import { distinctUntilChanged, filter, Subject, tap } from 'rxjs';
import { IntervalType } from '../../models/interval-type.enum';
import dayjs from 'dayjs';
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat';
import { GroupSummaryWithTimeline, SummaryDatePointValue } from '../../models/summary-response-model';
import { Dialog } from 'primeng/dialog';
import { FleetInsightsTrendsRawData } from '../../models/fleet-insights-trends-chart-dataset.model';
dayjs.extend(customParseFormatPlugin);
import { ExcelSheetData } from 'src/app/modules/shared/models/excel-sheet-data';
import { ExportExcelService } from 'src/app/modules/shared/services/export-excel-service';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { isEqual } from 'lodash';
dayjs.extend(quarterOfYear);

interface Row {
  grouping: string;
  values: Value[];
}

interface Value {
  numberOfAircraft?: number;
  percentageOfTotal?: number;
}

interface SheetTotals {
  [key: string]: number | string;
}

type FilterFunction = (trendsTabLeftPanelFiltersWithNames: any) => Array<{ Criteria: string; Selection: string }>;

@Component({
    selector: 'ra-fleet-trends-tab',
    templateUrl: './fleet-trends-tab.component.html',
    styleUrls: ['./fleet-trends-tab.component.scss'],
    providers: [TrendsTabStore],
    standalone: false
})
export class FleetTrendsTabComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  tabs = [{ title: 'Summary (0)', active: true }];
  loading = false;
  displayModalTable = false;
  displayModalChart = false;
  modalTitle = this.tabs[0].title;
  chartData$: Subject<FleetInsightsTrendsRawData[]> = new Subject<FleetInsightsTrendsRawData[]>();
  hasTooManySegments = false;
  aircraftRecordCount = 0;
  defaultSortField = 'numberOfAircraft';
  defaultSortOrder = -1;
  defaultRowCount = 100;
  columnNames: string[] = [];
  tableData: { grouping: string; values: { yearTimePoint: string; numberOfAircraft: number | 0; percentageOfTotal: number | 0 }[] }[] = [];
  columns: string[] | undefined;
  numberOfAircraftSelected = { value: true };
  intervalType = 1;
  startDate: string | undefined;
  endDate: string | undefined;
  summaryTableLoading = false;
  summaryTableRows = 0;
  footerTotals: { [key: string]: number } = {};
  excelSheetCriteria: ExcelSheetData = this.initializeSheetData('0');
  noDataMessage = 'No data available for the selected criteria. Please adjust your filters and try again.';
  groupText = 'Grouping';
  totalText = 'Total';
  chartFill = { value: !this.numberOfAircraftSelected.value };
  numberChartDataBackup: FleetInsightsTrendsRawData[] = [];
  percentageChartDataBackup: FleetInsightsTrendsRawData[] = [];

  constructor(
    private readonly fleetInsightsStore: FleetInsightsStore,
    public readonly trendsTabStore: TrendsTabStore,
    private readonly exportExcelService: ExportExcelService
  ) {}

  ngOnInit(): void {
    this.fleetInsightsStore.trendsTabLeftPanelFiltersWithNames$
      .pipe(
        filter((filters) => {
          return filters !== null && filters.intervalType !== undefined && filters.startDate !== undefined && filters.endDate !== undefined;
        }),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        tap((filters) => {
          this.excelSheetCriteria = this.initializeSheetData('0');
          this.excelSheetCriteria = this.populateExcelSheetWithTrendsTabLeftPanelFilters(this.excelSheetCriteria, filters);
        }),
        distinctUntilChanged((prev, curr) => {
          return (
            prev !== null &&
            curr !== null &&
            prev.intervalType === curr.intervalType &&
            prev.startDate === curr.startDate &&
            prev.endDate === curr.endDate
          );
        })
      )
      .subscribe((changedValues) => {
        this.summaryTableLoading = true;
        if (changedValues && changedValues.intervalType && changedValues.startDate && changedValues.endDate) {
          this.intervalType = changedValues.intervalType;
          this.startDate = changedValues.startDate;
          this.endDate = changedValues.endDate;
          this.columnNames = [...this.calculateColumnNames(changedValues.intervalType, changedValues.startDate, changedValues.endDate)];
        }
      });

    this.trendsTabStore.trendsSummaryList$
      .pipe(
        filter((summaryList) => summaryList !== null),
        distinctUntilChanged((prev, curr) => prev === curr)
      )
      .subscribe((fleetTrendsSummaryList) => {
        if (fleetTrendsSummaryList) {
          if (fleetTrendsSummaryList.summaryList !== undefined) {
            this.summaryTableLoading = false;
            this.tabs[0].title = `Summary (${fleetTrendsSummaryList.summaryList?.length})`;
            this.summaryTableRows = fleetTrendsSummaryList.summaryList?.length;
            this.prepareTableData(fleetTrendsSummaryList.summaryList);
            this.prepareChartData();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNumberOfAircraftSelected(event: Event): void {
    this.numberOfAircraftSelected.value = event.target ? (event.target as HTMLInputElement).checked : false;
    this.prepareChartFill(!this.numberOfAircraftSelected.value);
  }

  onPercentageOfAircraftSelected(event: Event): void {
    this.numberOfAircraftSelected.value = event.target ? !(event.target as HTMLInputElement).checked : false;
    this.prepareChartFill(!this.numberOfAircraftSelected.value);
  }

  prepareChartFill(selectedValue: boolean): void {
    this.chartFill.value = selectedValue;
    if (this.chartData$ instanceof Subject) {
      selectedValue ? this.chartData$.next(this.percentageChartDataBackup) : this.chartData$.next(this.numberChartDataBackup);
    }
  }
  prepareTableData(summaryList: GroupSummaryWithTimeline[]): void {
    this.updateColumnNamesFromBackendData(summaryList);

    this.tableData = this.createInitialTableData(summaryList);

    this.sortTableDataByLastColumn();

    this.calculateFooterTotals();
  }

  calculateFooterTotals(): void {
    const totals: { [key: string]: number } = {};

    this.columnNames.forEach((column) => {
      totals[column] = 0;
    });

    this.tableData.forEach((row) => {
      row.values.forEach((value) => {
        if (totals[value.yearTimePoint] !== undefined) {
          totals[value.yearTimePoint] += value.numberOfAircraft;
        }
      });
    });

    this.footerTotals = { ...totals };
  }

  calculateColumnNames(intervalType: IntervalType, startDate: string, endDate: string): string[] {
    const columnNames: string[] = [];
    let current = this.parseMonthYearString(startDate);

    const finalEndDate = this.parseMonthYearString(endDate);

    switch (intervalType) {
      case IntervalType.Monthly:
        while (current <= finalEndDate) {
          columnNames.push(current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
          current.setMonth(current.getMonth() + 1);
        }
        break;

      case IntervalType.Quarter:
        {
          const finalMonth = dayjs(finalEndDate).month(11).startOf('month');
          const currentMonth = dayjs().startOf('month');

          //in order not to go into the future
          const finalQuarter = (finalMonth.isAfter(currentMonth) ? currentMonth : finalMonth).startOf('quarter').toDate();

          current = dayjs(current).startOf('quarter').toDate();

          while (current <= finalQuarter) {
            columnNames.push(`Q${this.getQuarter(current)} ${current.getFullYear()}`);
            current = this.addQuarters(current, 1);
          }
        }
        break;

      case IntervalType.Year:
        while (current <= finalEndDate) {
          columnNames.push(current.getFullYear().toString());
          current.setFullYear(current.getFullYear() + 1);
        }
        break;

      default:
        throw new Error('Invalid Interval Type');
    }

    return columnNames;
  }

  getYearTimePoint(intervalType: number, year: number, timePoint: string): string {
    let yearTimePoint = '';
    switch (intervalType) {
      case IntervalType.Monthly:
        yearTimePoint = dayjs(`${year}-${timePoint}-01`).format('MMM YYYY');
        break;

      case IntervalType.Quarter:
        yearTimePoint = `Q${timePoint} ${year}`;
        break;

      case IntervalType.Year:
        yearTimePoint = `${year}`;
        break;

      default:
        throw new Error('Invalid Interval Type');
    }
    return yearTimePoint;
  }

  parseMonthYearString(dateString: string): Date {
    if (!dateString) {
      throw new Error('Empty date string provided');
    }

    const formats = ['MMMM YYYY', 'MMM YYYY', 'YYYY'];

    for (const format of formats) {
      const parsedDate = dayjs(dateString, format);
      if (parsedDate.isValid()) {
        return parsedDate.toDate();
      }
    }

    throw new Error(`Invalid date format: ${dateString}`);
  }

  getQuarter(date: Date): number {
    const month = date.getMonth();
    return Math.floor(month / 3) + 1;
  }

  addQuarters(date: Date, quarters: number): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + quarters * 3);
    return newDate;
  }

  onSort(event: { field: string; order: number }): void {
    const { field, order } = event;

    this.tableData = [...this.tableData].sort((a, b) => {
      if (field === 'grouping') {
        return order * a.grouping.localeCompare(b.grouping);
      } else {
        const valueA = a.values.find((v) => v.yearTimePoint === field)?.numberOfAircraft ?? 0;
        const valueB = b.values.find((v) => v.yearTimePoint === field)?.numberOfAircraft ?? 0;
        return order * (valueA - valueB);
      }
    });
  }

  showModalTable(): void {
    this.modalTitle = this.tabs[0].title;
    this.displayModalTable = true;
  }

  closeModal(): void {
    this.displayModalTable = false;
    this.displayModalChart = false;
  }

  maximizeModalTable(modal: Dialog): void {
    modal.maximize();
  }

  maximizeModalChart(modal: Dialog): void {
    this.prepareChartFill(!this.numberOfAircraftSelected.value);
    setTimeout(() => {
      modal.maximize();
    }, 2000);
  }

  showModalChart(): void {
    this.displayModalChart = true;
  }

  prepareChartData(): void {
    if (!this.tableData.length || !this.columnNames.length) {
      this.numberChartDataBackup = [];
      this.percentageChartDataBackup = [];
      this.chartData$.next([]);
      return;
    }

    this.hasTooManySegments = this.tableData.length > 10;

    this.percentageChartDataBackup = this.getChartData(false);
    this.numberChartDataBackup = this.getChartData(true);
    this.chartData$.next(this.numberOfAircraftSelected.value ? this.numberChartDataBackup : this.percentageChartDataBackup);
  }

  getChartData(numberOfAircraftSelected: boolean): FleetInsightsTrendsRawData[] {
    const chartData = this.columnNames.map((timePoint) => {
      let formattedTimePoint = timePoint;

      if (this.intervalType === IntervalType.Quarter && timePoint.includes('Quarter')) {
        const matches = timePoint.match(/Quarter (\d+) (\d+)/);
        if (matches && matches.length === 3) {
          const quarter = matches[1];
          const year = matches[2];
          formattedTimePoint = `Q${quarter} ${year}`;
        }
      }

      const dataPoint: FleetInsightsTrendsRawData = { timePoint: formattedTimePoint };

      this.tableData.forEach((item) => {
        const value = item.values.find((v) => v.yearTimePoint === timePoint);
        if (numberOfAircraftSelected) {
          dataPoint[item.grouping] = value?.numberOfAircraft !== undefined ? Number(value.numberOfAircraft) : 0;
        } else {
          dataPoint[item.grouping] = value?.percentageOfTotal !== undefined ? Number(value.percentageOfTotal) : 0;
        }
      });

      return dataPoint;
    });

    return chartData;
  }

  exportSummaryToExcel(): void {
    const excelData: Map<string, ExcelSheetData> = new Map<string, ExcelSheetData>();

    const numberSheetData = this.initializeSheetData('0');
    const percentageSheetData = this.initializeSheetData('0');

    this.addGroupingHeader(numberSheetData, percentageSheetData);

    const numberSheetTotals = this.initializeTotals(this.totalText);
    const percentageSheetTotals = this.initializeTotals(this.totalText);

    this.populateSheetData(numberSheetData, percentageSheetData, numberSheetTotals, percentageSheetTotals);

    this.addColumnHeaders(numberSheetData, percentageSheetData);

    this.finalizeSheetData(excelData, numberSheetData, percentageSheetData);

    const fileName = this.exportExcelService.buildFileName('Summary');
    this.exportExcelService.exportExcelSheetData(excelData, fileName, false, true);
  }

  private createInitialTableData(summaryList: GroupSummaryWithTimeline[]): any[] {
    const columnSet = new Set(this.columnNames);

    return summaryList.map((entry) => {
      const valuesMap = this.initializeValuesMap(columnSet);
      this.populateValuesMap(valuesMap, entry.values);

      return {
        grouping: entry.grouping,
        values: Array.from(valuesMap.entries()).map(([yearTimePoint, data]) => ({
          yearTimePoint,
          ...data
        }))
      };
    });
  }

  private initializeValuesMap(columnSet: Set<string>): Map<string, { numberOfAircraft: number; percentageOfTotal: number }> {
    const valuesMap = new Map<string, { numberOfAircraft: number; percentageOfTotal: number }>();

    columnSet.forEach((column) => {
      valuesMap.set(column, { numberOfAircraft: 0, percentageOfTotal: 0.0 });
    });

    return valuesMap;
  }

  private populateValuesMap(
    valuesMap: Map<string, { numberOfAircraft: number; percentageOfTotal: number }>,
    values: SummaryDatePointValue[]
  ): void {
    values.forEach((value: any) => {
      const yearTimePoint = this.getYearTimePoint(this.intervalType, value.year, value.timePoint);

      if (valuesMap.has(yearTimePoint)) {
        valuesMap.set(yearTimePoint, {
          numberOfAircraft: value.numberOfAircraft ?? 0,
          percentageOfTotal: value.percentageOfTotal !== undefined && value.percentageOfTotal !== null ? value.percentageOfTotal : 0.0
        });
      }
    });
  }

  private sortTableDataByLastColumn(): void {
    this.tableData.sort((a, b) => {
      const aLastValue = a.values[a.values.length - 1]?.numberOfAircraft || 0;
      const bLastValue = b.values[b.values.length - 1]?.numberOfAircraft || 0;
      return bLastValue - aLastValue;
    });

    this.tableData = [...this.tableData];
  }

  private initializeSheetData(format: string): ExcelSheetData {
    return {
      excelData: [],
      headersInOrder: [],
      excelNumberFormat: format,
      isPivot: false
    };
  }

  private addGroupingHeader(numberSheetData: ExcelSheetData, percentageSheetData: ExcelSheetData): void {
    numberSheetData.headersInOrder?.push(this.groupText);
    percentageSheetData.headersInOrder?.push(this.groupText);
  }

  private initializeTotals(groupingValue: string): SheetTotals {
    return { Grouping: groupingValue };
  }

  private populateSheetData(
    numberSheetData: ExcelSheetData,
    percentageSheetData: ExcelSheetData,
    numberSheetTotals: SheetTotals,
    percentageSheetTotals: SheetTotals
  ): void {
    this.tableData.forEach((row: Row) => {
      const numberRow: Record<string, number | string> = { Grouping: row.grouping };
      const percentageRow: Record<string, number | string> = { Grouping: row.grouping };

      this.columnNames.forEach((column: string, index: number) => {
        const value: Value = row.values[index] || {};
        numberRow[column.toString() + ' '] = value.numberOfAircraft || 0;
        percentageRow[column.toString() + ' '] = value.percentageOfTotal || 0;

        numberSheetTotals[column.toString() + ' '] =
          ((numberSheetTotals[column.toString() + ' '] as number) || 0) + (value.numberOfAircraft || 0);
        percentageSheetTotals[column.toString() + ' '] = 100;
      });

      numberSheetData.excelData.push(numberRow);
      percentageSheetData.excelData.push(percentageRow);
    });

    numberSheetData.excelData.push(numberSheetTotals);
    percentageSheetData.excelData.push(percentageSheetTotals);
  }

  private addColumnHeaders(numberSheetData: ExcelSheetData, percentageSheetData: ExcelSheetData): void {
    this.columnNames?.forEach((column) => {
      numberSheetData.headersInOrder?.push(column.toString() + ' ');
      percentageSheetData.headersInOrder?.push(column.toString() + ' ');
    });
  }

  private finalizeSheetData(
    excelData: Map<string, ExcelSheetData>,
    numberSheetData: ExcelSheetData,
    percentageSheetData: ExcelSheetData
  ): void {
    excelData.set('Criteria', this.excelSheetCriteria);
    excelData.set('Number of Aircraft', numberSheetData);
    excelData.set('Percentage of Total Aircraft', percentageSheetData);
  }

  private populateArrayCriteria: FilterFunction = (trendsTabLeftPanelFiltersWithNames) => {
    const criteriaPairs: Array<{ Criteria: string; Selection: string }> = [];
    const arrayFields = [
      { key: 'statuses', label: 'Status' },
      { key: 'primaryUsages', label: 'Primary Usage' },
      { key: 'marketClasses', label: 'Market Class' },
      { key: 'aircraftManufacturers', label: 'Aircraft Manufacturer' },
      { key: 'aircraftFamilies', label: 'Aircraft Family' },
      { key: 'aircraftTypes', label: 'Aircraft Type' },
      { key: 'aircraftMasterSeries', label: 'Aircraft Master Series' },
      { key: 'aircraftSeries', label: 'Aircraft Series' },
      { key: 'aircraftSubSeries', label: 'Aircraft Sub Series' },
      { key: 'engineManufacturers', label: 'Engine Manufacturer' },
      { key: 'engineFamilies', label: 'Engine Family' },
      { key: 'engineTypes', label: 'Engine Type' },
      { key: 'engineMasterSeries', label: 'Engine Master Series' },
      { key: 'engineSeries', label: 'Engine Series' },
      { key: 'engineSubSeries', label: 'Engine Sub Series' },
      { key: 'operators', label: 'Operator' },
      { key: 'operatorTypes', label: 'Operator Type' },
      { key: 'operatorGroups', label: 'Operator Group' },
      { key: 'operatorRegions', label: 'Operator Region' },
      { key: 'operatorCountries', label: 'Operator Country/Subregion' },
      { key: 'lessors', label: 'Lessor' },
      { key: 'trendsOwnerships', label: 'Ownership' },
      { key: 'leaseStatuses', label: 'Lease Status' }
    ];

    arrayFields.forEach((field) => {
      const values = trendsTabLeftPanelFiltersWithNames[field.key];
      if (values?.length > 0) {
        criteriaPairs.push({
          Criteria: field.label,
          Selection: values.join(', ')
        });
      }
    });

    return criteriaPairs;
  };

  private populateSingleCriteria = (): Array<{ Criteria: string; Selection: string }> => {
    return [
      { Criteria: 'Start Date', Selection: this.columnNames[0] },
      { Criteria: 'End Date', Selection: this.columnNames[this.columnNames.length - 1] }
    ];
  };

  private populateIntervalType = (trendsTabLeftPanelFiltersWithNames: any): Array<{ Criteria: string; Selection: string }> => {
    const intervalTypeMap = {
      1: 'Monthly',
      2: 'Quarterly',
      3: 'Yearly'
    };
    const intervalType = trendsTabLeftPanelFiltersWithNames?.intervalType;
    return intervalType && intervalType in intervalTypeMap
      ? [{ Criteria: 'Interval', Selection: intervalTypeMap[intervalType as keyof typeof intervalTypeMap] }]
      : [];
  };

  private populateAgeBandsCriteria = (trendsTabLeftPanelFiltersWithNames: any): Array<{ Criteria: string; Selection: string }> => {
    const checkedAgeBands = [];
    if (trendsTabLeftPanelFiltersWithNames.IncludeYoungLifeAircraft) {
      checkedAgeBands.push('Young');
    }
    if (trendsTabLeftPanelFiltersWithNames.IncludeMidLifeAircraft) {
      checkedAgeBands.push('Mid-life');
    }
    if (trendsTabLeftPanelFiltersWithNames.IncludeLateLifeAircraft) {
      checkedAgeBands.push('Late-life');
    }

    const criteriaPairs = [];
    if (checkedAgeBands.length > 0) {
      criteriaPairs.push({ Criteria: 'Age Bands', Selection: checkedAgeBands.join(', ') });

      if (trendsTabLeftPanelFiltersWithNames.rangeValues?.length) {
        criteriaPairs.push({ Criteria: 'Age Range', Selection: trendsTabLeftPanelFiltersWithNames.rangeValues.join(' - ') });
      }
    }

    return criteriaPairs;
  };

  private populateExcelSheetWithTrendsTabLeftPanelFilters(
    excelSheetCriteria: ExcelSheetData,
    trendsTabLeftPanelFiltersWithNames: any
  ): ExcelSheetData {
    excelSheetCriteria.excelData.push(
      ...this.populateSingleCriteria(),
      ...this.populateIntervalType(trendsTabLeftPanelFiltersWithNames),
      ...this.populateAgeBandsCriteria(trendsTabLeftPanelFiltersWithNames),
      ...this.populateArrayCriteria(trendsTabLeftPanelFiltersWithNames)
    );

    return excelSheetCriteria;
  }

  private updateColumnNamesFromBackendData(summaryList: GroupSummaryWithTimeline[]): void {
    if (!summaryList || summaryList.length === 0) {
      return;
    }

    const timePointsSet = new Set<string>();

    summaryList.forEach((group) => {
      group.values.forEach((value) => {
        const yearTimePoint = this.getYearTimePoint(this.intervalType, value.year, value.timePoint);
        timePointsSet.add(yearTimePoint);
      });
    });

    const timePoints = Array.from(timePointsSet);

    this.columnNames = this.sortTimePoints(timePoints);
  }

  private sortTimePoints(timePoints: string[]): string[] {
    return timePoints.sort((a, b) => {
      switch (this.intervalType) {
        case IntervalType.Monthly:
          return this.compareMonthlyTimePoints(a, b);
        case IntervalType.Quarter:
          return this.compareQuarterlyTimePoints(a, b);
        case IntervalType.Year:
          return this.compareYearlyTimePoints(a, b);
        default:
          return a.localeCompare(b);
      }
    });
  }

  private compareMonthlyTimePoints(a: string, b: string): number {
    const dateA = this.parseMonthYearString(a);
    const dateB = this.parseMonthYearString(b);
    return dateA.getTime() - dateB.getTime();
  }
  private compareQuarterlyTimePoints(a: string, b: string): number {
    const [quarterA, yearA] = a.split(' ');
    const [quarterB, yearB] = b.split(' ');

    const yearDiff = parseInt(yearA) - parseInt(yearB);
    if (yearDiff !== 0) {
      return yearDiff;
    }

    const qNumA = parseInt(quarterA.replace('Q', ''));
    const qNumB = parseInt(quarterB.replace('Q', ''));
    return qNumA - qNumB;
  }

  private compareYearlyTimePoints(a: string, b: string): number {
    return parseInt(a) - parseInt(b);
  }
}
