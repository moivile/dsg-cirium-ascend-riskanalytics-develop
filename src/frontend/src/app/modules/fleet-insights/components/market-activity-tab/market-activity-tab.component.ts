import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { BehaviorSubject, combineLatest, startWith, Subject, takeUntil, tap, withLatestFrom, firstValueFrom } from 'rxjs';
import { MetricType } from '../../models/metric-type.enum';
import { MarketActivityTabStore } from '../../services/market-activity-tab-store';
import { MarketActivityTrendsModel } from '../../models/market-activity-trends-model';
import { TableDataGroup, TableValue } from '../../models/trends-table-data.model';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { ExcelSheetData } from '../../../shared/models/excel-sheet-data';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { AppStore } from 'src/app/app-store';
import { Row, Value, SheetTotals, SummaryDataRow, MarketActivityFiltersWithNames } from '../../models/market-activity-excel-export.model';
import { maxPieChartSegments } from '../../fleet-insights-constants';

@Component({
  selector: 'ra-market-activity-tab',
  templateUrl: './market-activity-tab.component.html',
  styleUrl: './market-activity-tab.component.scss',
  providers: [MarketActivityTabStore],
  standalone: false
})
export class MarketActivityTabComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  MetricType = MetricType;
  metricControl: FormControl = new FormControl(MetricType.Number, { nonNullable: true });
  trendMetricControl: FormControl = new FormControl(MetricType.Number, { nonNullable: true });
  loading = false;
  metricType$ = new BehaviorSubject<MetricType>(MetricType.Number);
  trendMetricType$ = new BehaviorSubject<MetricType>(MetricType.Number);
  displayModalChart = false;
  displayModalTrendChart = false;

  chartData$ = new BehaviorSubject<any[]>([]);
  showPieChart = false;
  private chartDataBackup: any[] = [];

  activeIndex = 0;
  tabs = [{ title: 'Summary' }, { title: 'Trends' }];
  displayModal = false;
  modalTitle = this.tabs[0].title;

  noDataMessage = 'No data available for the selected criteria. Please adjust your filters and try again.';

  tableData: TableDataGroup[] = [];
  columnNames: string[] = [];
  defaultSortField = 'numberOfAircraft';
  defaultSortOrder = -1;
  defaultRowCount = 100;
  trendsTableLoading = false;
  footerTotals: { [key: string]: number } = {};
  numberOfAircraftSelected = { value: true };
  private isExporting = false;
  groupText = 'Grouping';
  totalText = 'Total';

  private summaryData: SummaryDataRow[] = [];

  constructor(
    private readonly fleetInsightsStore: FleetInsightsStore,
    public readonly marketActivityTabStore: MarketActivityTabStore,
    private readonly exportExcelService: ExportExcelService,
    public readonly appStore: AppStore
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chartData$.complete();
    this.metricType$.complete();
    this.trendMetricType$.complete();
  }

  ngOnInit(): void {
    this.trendMetricControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((metricType) => {
          this.trendMetricType$.next(metricType);
          this.numberOfAircraftSelected.value = (metricType === MetricType.Number);
        })
      )
      .subscribe();

    combineLatest([
      this.metricControl.valueChanges.pipe(startWith(this.metricControl.value)),
      this.marketActivityTabStore.marketActivitySummaryData$
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap(([metricType, summaryData]) => {
          this.metricType$.next(metricType);
          this.summaryData = summaryData || [];
          this.chartDataBackup = summaryData || [];
          this.updateChartVisibility(summaryData || []);
          this.chartData$.next(summaryData || []);
          this.isExporting = false;
        })
      )
      .subscribe();

    this.marketActivityTabStore.totalSummaryRecords$.pipe(takeUntil(this.destroy$)).subscribe((totalSummaryRecords) => {
      this.tabs[0].title = `Summary (${totalSummaryRecords})`;
      this.modalTitle = this.tabs[0].title;
    });

    this.marketActivityTabStore.trendsLoading$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (trendsLoading) => {
        this.trendsTableLoading = trendsLoading;
      },
      error: () => {
        this.trendsTableLoading = false;
      }
    });

    this.marketActivityTabStore.marketActivityTrendsData$.pipe(takeUntil(this.destroy$)).subscribe((trendsData) => {
      this.prepareTableData(trendsData);
      this.trendsTableLoading = false;
    });
  }

  prepareTableData(trendsData: MarketActivityTrendsModel[]): void {
    const grouped = trendsData.reduce((acc, curr) => {
      if (!acc[curr.grouping]) {
        acc[curr.grouping] = [];
      }
      acc[curr.grouping].push({
        yearTimePoint: curr.period,
        numberOfAircraft: curr.numberOfEvents ?? 0,
        percentageOfTotal: curr.percentageOfTotal ?? 0
      });
      return acc;
    }, {} as Record<string, TableValue[]>);

    this.tableData = Object.entries(grouped).map(([grouping, values]) => ({
      grouping,
      values
    }));
    this.tabs[1].title = `Trends (${this.tableData.length})`;

    this.columnNames = this.getColumnNamesFromTableData();

    this.calculateFooterTotals();

    if (this.columnNames.length > 0) {
      const lastColumn = this.columnNames[this.columnNames.length - 1];
      this.onSort({ field: lastColumn, order: -1 });
    }
  }

  getColumnNamesFromTableData(): string[] {
    if (!this.tableData || this.tableData.length === 0) {
      return [];
    }
    const groupWithMostValues = this.tableData.reduce(
      (max, curr) => (curr.values.length > max.values.length ? curr : max),
      this.tableData[0]
    );
    return groupWithMostValues.values.map((v) => v.yearTimePoint);
  }

  calculateFooterTotals(): void {
    this.footerTotals = {};
    const groupMaps = this.tableData.map((group) => {
      const map = new Map<string, number>();
      for (const v of group.values) {
        map.set(v.yearTimePoint, v.numberOfAircraft);
      }
      return map;
    });

    for (const column of this.columnNames) {
      this.footerTotals[column] = groupMaps.reduce((sum, map) => {
        return sum + (map.get(column) ?? 0);
      }, 0);
    }
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

  showModalChart(): void {
    this.displayModalChart = true;
  }

  showModalTrendChart(): void {
    this.displayModalTrendChart = true;
  }

  updateChartVisibility(data: any[]): void {
    const segmentCount = data?.length || 0;
    const isPercentage = this.metricControl.value === MetricType.Percentage;
    this.showPieChart = isPercentage && segmentCount > 0 && segmentCount <= maxPieChartSegments;
  }

  maximizeModalChart(modal: Dialog): void {
    setTimeout(() => {
      modal.maximize();
    }, 500);
  }

  closeModal(): void {
    this.displayModal = false;
    this.displayModalChart = false;
    this.displayModalTrendChart = false;
  }

  onTabChange(index: number): void {
    this.activeIndex = index;
  }

  showModal(): void {
    this.displayModal = true;
  }

  maximizeModal(modal: Dialog): void {
    modal.maximize();
  }

  async onDownloadToExcel(): Promise<void> {
    if (this.isExporting) {
      return;
    }

    this.isExporting = true;

    try {
      const [marketActivityTabLeftPanelFiltersWithNames, groupAllDataByLabel] = await firstValueFrom(
        this.fleetInsightsStore.marketActivityTabLeftPanelFiltersWithNames$.pipe(
          withLatestFrom(this.fleetInsightsStore.groupAllDataByLabel$)
        )
      );

      if (!marketActivityTabLeftPanelFiltersWithNames) {
        return;
      }

      const criteriaSheet = this.createCriteriaSheet(marketActivityTabLeftPanelFiltersWithNames, groupAllDataByLabel);

      if (this.activeIndex === 0) {
        this.exportSummaryToExcel(criteriaSheet);
      } else {
        this.exportTrendsToExcel(criteriaSheet);
      }
    } finally {
      this.isExporting = false;
    }
  }

  exportTrendsToExcel(criteriaSheet: ExcelSheetData): void {
    const excelData: Map<string, ExcelSheetData> = new Map<string, ExcelSheetData>();

    const numberSheetData = this.initializeSheetData('0');

    this.addGroupingHeader(numberSheetData);

    const numberSheetTotals = this.initializeTotals(this.totalText);

    this.populateSheetData(numberSheetData, numberSheetTotals);

    this.addColumnHeaders(numberSheetData);

    excelData.set('Criteria', criteriaSheet);
    excelData.set('Number of Aircraft', numberSheetData);

    const fileName = this.exportExcelService.buildFileName('Market_Activity_Trends');
    this.exportExcelService.exportExcelSheetData(excelData, fileName, false, true);
  }

  exportSummaryToExcel(criteriaSheet: ExcelSheetData): void {
    if (!this.summaryData || this.summaryData.length === 0) {
      return;
    }

    const excelData: Map<string, ExcelSheetData> = new Map<string, ExcelSheetData>();
    const excelSheetData: ExcelSheetData = this.initializeSheetData('0');

    const sortedSummaryData = [...this.summaryData].sort((a, b) => b.numberOfEvents - a.numberOfEvents);

    sortedSummaryData.forEach((row) => {
      excelSheetData.excelData.push({
        Grouping: row.grouping,
        'Number of Events': row.numberOfEvents,
        'Percentage of Total': row.percentageOfTotal
      });
    });

    excelSheetData.excelData.push({
      Grouping: 'Total',
      'Number of Events': sortedSummaryData.reduce((acc, curr) => acc + curr.numberOfEvents, 0),
      'Percentage of Total': 100
    });

    excelData.set('Criteria', criteriaSheet);
    excelData.set('Data', excelSheetData);

    const fileName = this.exportExcelService.buildFileName('Market_Activity_Summary');
    this.exportExcelService.exportExcelSheetData(excelData, fileName, false, true);
  }

  private createCriteriaSheet(
    marketActivityTabLeftPanelFiltersWithNames: MarketActivityFiltersWithNames,
    groupAllDataByLabel: string
  ): ExcelSheetData {
    const excelSheetCriteria: ExcelSheetData = this.initializeSheetData('0');

    excelSheetCriteria.excelData.push({
      Criteria: 'Group All Data By',
      Selection: groupAllDataByLabel || 'N/A'
    });

    this.populateExcelSheetWithMarketActivityFilters(excelSheetCriteria, marketActivityTabLeftPanelFiltersWithNames);

    return excelSheetCriteria;
  }

  private populateExcelSheetWithMarketActivityFilters(
    excelSheetCriteria: ExcelSheetData,
    marketActivityTabLeftPanelFiltersWithNames: MarketActivityFiltersWithNames
  ): void {
    this.addDateAndIntervalFilters(excelSheetCriteria, marketActivityTabLeftPanelFiltersWithNames);
    this.addEventFilters(excelSheetCriteria, marketActivityTabLeftPanelFiltersWithNames);
    this.addGeneralFilters(excelSheetCriteria, marketActivityTabLeftPanelFiltersWithNames);
    this.addAircraftAndEngineFilters(excelSheetCriteria, marketActivityTabLeftPanelFiltersWithNames);
    this.addOperatorAndLessorFilters(excelSheetCriteria, marketActivityTabLeftPanelFiltersWithNames);
  }

  private addDateAndIntervalFilters(excelSheetCriteria: ExcelSheetData, filters: MarketActivityFiltersWithNames): void {
    if (filters?.intervalType) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Interval Type',
        Selection: filters.intervalType
      });
    }

    if (filters?.startDate) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Start Date',
        Selection: filters.startDate
      });
    }

    if (filters?.endDate) {
      excelSheetCriteria.excelData.push({
        Criteria: 'End Date',
        Selection: filters.endDate
      });
    }
  }

  private addEventFilters(excelSheetCriteria: ExcelSheetData, filters: MarketActivityFiltersWithNames): void {
    const eventFilters = [
      { key: 'orders', label: 'Orders' },
      { key: 'deliveries', label: 'Deliveries' },
      { key: 'slb', label: 'Sale & Lease-back' },
      { key: 'entryToService', label: 'Entry to Service' },
      { key: 'cancellations', label: 'Cancellations' },
      { key: 'purchasesSales', label: 'Purchases/Sales' },
      { key: 'leaseStart', label: 'Lease Start' },
      { key: 'leaseEnd', label: 'Lease End' },
      { key: 'parked', label: 'Parked' },
      { key: 'conversions', label: 'Conversions' },
      { key: 'retirements', label: 'Retirements' }
    ];

    eventFilters.forEach(({ key, label }) => {
      const filterValue = filters[key as keyof MarketActivityFiltersWithNames] as string[] | undefined;
      if (filterValue && Array.isArray(filterValue) && filterValue.length > 0) {
        excelSheetCriteria.excelData.push({
          Criteria: label,
          Selection: filterValue.join(', ')
        });
      }
    });
  }

  private addGeneralFilters(excelSheetCriteria: ExcelSheetData, filters: MarketActivityFiltersWithNames): void {
    if (filters?.statuses && Array.isArray(filters.statuses) && filters.statuses.length > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Status',
        Selection: filters.statuses.join(', ')
      });
    }

    if (filters?.primaryUsages && Array.isArray(filters.primaryUsages) && filters.primaryUsages.length > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Primary Usage',
        Selection: filters.primaryUsages.join(', ')
      });
    }

    this.addAgeBandFilters(excelSheetCriteria, filters);

    if (filters?.marketClasses && Array.isArray(filters.marketClasses) && filters.marketClasses.length > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Market Class',
        Selection: filters.marketClasses.join(', ')
      });
    }
  }

  private addAgeBandFilters(excelSheetCriteria: ExcelSheetData, filters: MarketActivityFiltersWithNames): void {
    if (filters.includeYoungLifeAircraft || filters.includeMidLifeAircraft || filters.includeLateLifeAircraft) {
      const checkedAgeBands: string[] = [];

      if (filters.includeYoungLifeAircraft) {
        checkedAgeBands.push('Young');
      }

      if (filters.includeMidLifeAircraft) {
        checkedAgeBands.push('Mid-life');
      }

      if (filters.includeLateLifeAircraft) {
        checkedAgeBands.push('Late-life');
      }

      excelSheetCriteria.excelData.push({
        Criteria: 'Age Bands',
        Selection: checkedAgeBands.join(', ')
      });

      if (filters.rangeValues && Array.isArray(filters.rangeValues) && filters.rangeValues.length > 0) {
        excelSheetCriteria.excelData.push({
          Criteria: 'Age Range',
          Selection: filters.rangeValues.join(' - ')
        });
      }
    }
  }

  private addAircraftAndEngineFilters(excelSheetCriteria: ExcelSheetData, filters: MarketActivityFiltersWithNames): void {
    const aircraftFilters = [
      { key: 'aircraftManufacturers', label: 'Aircraft Manufacturer' },
      { key: 'aircraftFamilies', label: 'Aircraft Family' },
      { key: 'aircraftTypes', label: 'Aircraft Type' },
      { key: 'aircraftMasterSeries', label: 'Aircraft Master Series' },
      { key: 'aircraftSeries', label: 'Aircraft Series' },
      { key: 'aircraftSubSeries', label: 'Aircraft Sub Series' }
    ];

    const engineFilters = [
      { key: 'engineManufacturers', label: 'Engine Manufacturer' },
      { key: 'engineFamilies', label: 'Engine Family' },
      { key: 'engineTypes', label: 'Engine Type' },
      { key: 'engineMasterSeries', label: 'Engine Master Series' },
      { key: 'engineSeries', label: 'Engine Series' },
      { key: 'engineSubSeries', label: 'Engine Sub Series' }
    ];

    [...aircraftFilters, ...engineFilters].forEach(({ key, label }) => {
      const filterValue = filters[key as keyof MarketActivityFiltersWithNames] as string[] | undefined;
      if (filterValue && Array.isArray(filterValue) && filterValue.length > 0) {
        excelSheetCriteria.excelData.push({
          Criteria: label,
          Selection: filterValue.join(', ')
        });
      }
    });
  }

  private addOperatorAndLessorFilters(excelSheetCriteria: ExcelSheetData, filters: MarketActivityFiltersWithNames): void {
    const operatorFilters = [
      { key: 'operators', label: 'Operator' },
      { key: 'operatorTypes', label: 'Operator Type' },
      { key: 'operatorGroups', label: 'Operator Group' },
      { key: 'operatorRegions', label: 'Operator Region' },
      { key: 'operatorCountries', label: 'Operator Country/Subregion' }
    ];

    operatorFilters.forEach(({ key, label }) => {
      const filterValue = filters[key as keyof MarketActivityFiltersWithNames] as string[] | undefined;
      if (filterValue && Array.isArray(filterValue) && filterValue.length > 0) {
        excelSheetCriteria.excelData.push({
          Criteria: label,
          Selection: filterValue.join(', ')
        });
      }
    });

    if (filters?.lessors && Array.isArray(filters.lessors) && filters.lessors.length > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Lessor',
        Selection: filters.lessors.join(', ')
      });
    }
  }

  private initializeSheetData(format: string): ExcelSheetData {
    return {
      excelData: [],
      headersInOrder: [],
      excelNumberFormat: format,
      isPivot: false
    };
  }

  private addGroupingHeader(numberSheetData: ExcelSheetData): void {
    numberSheetData.headersInOrder?.push(this.groupText);
  }

  private initializeTotals(groupingValue: string): SheetTotals {
    return { Grouping: groupingValue };
  }

  private populateSheetData(numberSheetData: ExcelSheetData, numberSheetTotals: SheetTotals): void {
    this.tableData.forEach((tableRow: TableDataGroup) => {
      const numberRow: Record<string, number | string> = { Grouping: tableRow.grouping };

      this.columnNames.forEach((column: string, index: number) => {
        const tableValue: TableValue = tableRow.values[index] || {};
        numberRow[column.toString() + ' '] = tableValue.numberOfAircraft || 0;

        numberSheetTotals[column.toString() + ' '] =
          ((numberSheetTotals[column.toString() + ' '] as number) || 0) + (tableValue.numberOfAircraft || 0);
      });

      numberSheetData.excelData.push(numberRow);
    });

    numberSheetData.excelData.push(numberSheetTotals);
  }

  private addColumnHeaders(numberSheetData: ExcelSheetData): void {
    this.columnNames?.forEach((column) => {
      numberSheetData.headersInOrder?.push(column.toString() + ' ');
    });
  }
}
