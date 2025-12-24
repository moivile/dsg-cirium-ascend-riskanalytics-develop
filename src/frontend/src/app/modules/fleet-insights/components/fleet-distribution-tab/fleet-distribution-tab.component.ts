import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { combineLatest, distinctUntilChanged, map, startWith, Subject, takeUntil, tap, withLatestFrom, BehaviorSubject } from 'rxjs';
import { MetricType } from '../../models/metric-type.enum';
import { FleetInsightsAircraftSummaryModel } from '../../models/fleet-insights-aircraft-summary-model';
import { DistributionTabStore } from '../../services/distribution-tab-store';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { ExcelSheetData } from '../../../shared/models/excel-sheet-data';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { DistributionTabAircraftTableComponent } from '../distribution-tab-aircraft-table/distribution-tab-aircraft-table.component';
import { AppStore } from '../../../../app-store';
import dayjs from 'dayjs';

import { DateConstants } from '../../../shared/models/date-constants';
import { maxPieChartSegments } from '../../fleet-insights-constants';

@Component({
  selector: 'ra-fleet-distribution-tab',
  templateUrl: './fleet-distribution-tab.component.html',
  styleUrl: './fleet-distribution-tab.component.scss',
  providers: [DistributionTabStore],
  standalone: false
})
export class FleetDistributionTabComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  MetricType = MetricType;
  metricControl: FormControl = new FormControl(MetricType.Number, { nonNullable: true });
  activeIndex = 0;
  tabs = [{ title: 'Summary' }, { title: 'Aircraft' }, { title: 'Availability' }];
  loading = false;
  chartData$ = new BehaviorSubject<FleetInsightsAircraftSummaryModel[]>([]);
  chartDataBackup: FleetInsightsAircraftSummaryModel[] = [];
  metricType$ = new BehaviorSubject<MetricType>(MetricType.Number);
  displayModal = false;
  displayModalChart = false;
  modalTitle = 'Details Table';
  showPieChart = false;

  @ViewChild(DistributionTabAircraftTableComponent)
  private distributionTabAircraftTableComponent!: DistributionTabAircraftTableComponent;
  isAvailabilities = false;
  isAircraft = !this.isAvailabilities;
  aircraftRecordCount = 0;
  noDataMessage = '';
  isTestFeatureEnabled$ = this.appStore.isTestFeatureEnabled$;

  constructor(
    private readonly fleetInsightsStore: FleetInsightsStore,
    public readonly distributionTabStore: DistributionTabStore,
    private readonly exportExcelService: ExportExcelService,
    public readonly appStore: AppStore
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chartData$.complete();
    this.metricType$.complete();
  }
  ngOnInit(): void {
    this.setNoDataMessage();

    combineLatest([this.metricControl.valueChanges.pipe(startWith(this.metricControl.value)), this.distributionTabStore.summaryList$])
      .pipe(
        takeUntil(this.destroy$),
        tap(([metricType, aircraftList]) => {
          this.metricType$.next(metricType);
          this.chartDataBackup = aircraftList;
          this.updateChartVisibility(aircraftList);
          this.chartData$.next(aircraftList || []);
        })
      )
      .subscribe();

    this.fleetInsightsStore.distributionTabLeftPanelFiltersWithNames$
      .pipe(
        takeUntil(this.destroy$),
        map((filters: { availabilities: string | string[] } | null) => {
          return Array.isArray(filters?.availabilities) && filters.availabilities.length > 0;
        }),
        distinctUntilChanged((prev: boolean, curr: boolean) => {
          return prev === curr;
        })
      )
      .subscribe((isAvailable: boolean) => {
        this.isAvailabilities = isAvailable;
        this.isAircraft = !isAvailable;
        this.showTabTitle();
      });

    this.distributionTabStore.totalSummaryRecords$.pipe(takeUntil(this.destroy$)).subscribe((totalSummaryRecords) => {
      this.tabs[0].title = `Summary (${totalSummaryRecords})`;
      this.modalTitle = this.tabs[0].title;
      this.setModalTitle(this.activeIndex);
    });

    this.distributionTabStore.totalAircraftRecords$.pipe(takeUntil(this.destroy$)).subscribe((totalRecords) => {
      this.aircraftRecordCount = totalRecords;
      this.showTabTitle();
      this.setModalTitle(this.activeIndex);
    });
  }

  setNoDataMessage(): void {
    if (this.activeIndex > 1) {
      this.noDataMessage = 'View aircraft by selecting an availability type from the filter panel.';
    } else {
      this.noDataMessage = 'View aircraft by removing availability filters from the filter panel.';
    }
  }

  updateChartVisibility(data: FleetInsightsAircraftSummaryModel[]): void {
    const segmentCount = data ? data.length : 0;
    const isPercentage = this.metricControl.value === MetricType.Percentage;
    this.showPieChart = isPercentage && segmentCount > 0 && segmentCount <= maxPieChartSegments;
  }

  showTabTitle(): void {
    if (this.isAvailabilities) {
      this.tabs[2].title = `Availability (${this.aircraftRecordCount})`;
      this.tabs[1].title = `Aircraft`;
    } else {
      this.tabs[1].title = `Aircraft (${this.aircraftRecordCount})`;
      this.tabs[2].title = `Availability`;
    }
  }

  onTabChange(index: number): void {
    this.activeIndex = index;
    this.setNoDataMessage();
    this.setModalTitle(index);
  }

  setModalTitle(tabNumber: number): void {
    this.modalTitle = this.tabs[tabNumber].title;
  }

  onDownloadToExcel(): void {
    if (this.activeIndex === 0) {
      this.exportSummaryToExcel();
    } else {
      this.exportAircraftListToExcel();
    }
  }

  exportAircraftListToExcel(): void {
    // Get all aircraft from child component
    this.distributionTabAircraftTableComponent
      .getAllAircraftForExport()
      .pipe(withLatestFrom(this.fleetInsightsStore.distributionTabLeftPanelFiltersWithNames$))
      .subscribe(([aircraftList, distributionTabLeftPanelFiltersWithNames]) => {
        // Build Excel data
        const excelData: Map<string, ExcelSheetData> = new Map<string, ExcelSheetData>();

        const excelSheetCriteria: ExcelSheetData = {
          excelData: [],
          headersInOrder: null,
          excelNumberFormat: '0',
          isPivot: false
        };

        this.populateExcelSheetWithDistributionTabLeftPanelFilters(excelSheetCriteria, distributionTabLeftPanelFiltersWithNames);

        const excelSheetData: ExcelSheetData = {
          excelData: [],
          headersInOrder: null,
          excelNumberFormat: '0',
          isPivot: false
        };

        // Populate rows
        aircraftList.forEach((air) => {
          const rowData: { [key: string]: any } = {
            Serial: air.aircraftSerialNumber,
            Registration: air.aircraftRegistrationNumber,
            Status: air.status,
            Manufacturer: air.aircraftManufacturer,
            'Aircraft Series': air.aircraftSeries,
            'Engine Series': air.engineSeries,
            'Delivery Date': this.formatDateForExport(air.deliveryDate),
            Age: air.aircraftAgeYears,
            'Primary Usage': air.aircraftUsage,
            Operator: air.operator,
            Manager: air.manager,
            Owner: air.owner,
            Ownership: air.ownership,
            'Lease Status': air.leaseStatus,
            'Lease Start': this.formatDateForExport(air.leaseStart),
            'Lease End': this.formatDateForExport(air.leaseEnd),
            'Lease End Date Scheduled/Estimated': air.leaseStatus ? (air.isLeaseEndEstimated ? 'Estimated' : 'Scheduled') : null
          };
          // Conditionally add availability if isAvailabilities is true
          if (this.isAvailabilities) {
            rowData['Availability'] = air.availability;
          }
          excelSheetData.excelData.push(rowData);
        });

        excelData.set('Criteria', excelSheetCriteria);
        excelData.set('Data', excelSheetData);

        const fileName = this.exportExcelService.buildFileName('AircraftList');
        this.exportExcelService.exportExcelSheetData(excelData, fileName, false, true);
      });
  }

  exportSummaryToExcel(): void {
    const excelData: Map<string, ExcelSheetData> = new Map<string, ExcelSheetData>();

    const excelSheetCriteria: ExcelSheetData = {
      excelData: [],
      headersInOrder: null,
      excelNumberFormat: '0',
      isPivot: false
    };

    const excelSheetData: ExcelSheetData = {
      excelData: [],
      headersInOrder: null,
      excelNumberFormat: '0',
      isPivot: false
    };

    this.distributionTabStore.summaryList$
      .pipe(
        takeUntil(this.destroy$),
        withLatestFrom(this.fleetInsightsStore.distributionTabLeftPanelFiltersWithNames$, this.fleetInsightsStore.groupAllDataByLabel$),
        tap(([summaryData, distributionTabLeftPanelFiltersWithNames, groupAllDataByLabel]) => {
          excelSheetCriteria.excelData.push({ Criteria: 'Group All Data By', Selection: groupAllDataByLabel });
          this.populateExcelSheetWithDistributionTabLeftPanelFilters(excelSheetCriteria, distributionTabLeftPanelFiltersWithNames);

          summaryData.sort((a, b) => b.numberOfAircraft - a.numberOfAircraft);

          summaryData.forEach((row) => {
            excelSheetData.excelData.push({
              Grouping: row.grouping,
              'Number of Aircraft': row.numberOfAircraft,
              'Percentage of Total': row.percentageOfTotal
            });
          });

          // Add totals row
          excelSheetData.excelData.push({
            Grouping: 'Total',
            'Number of Aircraft': summaryData.reduce((acc, curr) => acc + curr.numberOfAircraft, 0),
            'Percentage of Total': 100
          });
        })
      )
      .subscribe();

    excelData.set('Criteria', excelSheetCriteria);
    excelData.set('Data', excelSheetData);

    const fileName = this.exportExcelService.buildFileName('Summary');
    this.exportExcelService.exportExcelSheetData(excelData, fileName, false, true);
  }

  showModal(): void {
    if ((this.activeIndex === 1 && this.isAvailabilities) || (this.activeIndex === 2 && !this.isAvailabilities)) {
      this.displayModal = false;
    } else {
      this.displayModal = true;
    }
  }

  maximizeModalChart(modal: Dialog): void {
    this.chartData$.next(this.chartDataBackup);
    setTimeout(() => {
      modal.maximize();
    }, 2000);
  }

  closeModal(): void {
    this.displayModal = false;
    this.displayModalChart = false;
  }

  maximizeModal(modal: Dialog): void {
    modal.maximize();
  }

  showModalChart(): void {
    this.displayModalChart = true;
  }

  private populateExcelSheetWithDistributionTabLeftPanelFilters(
    excelSheetCriteria: ExcelSheetData,
    distributionTabLeftPanelFiltersWithNames: any
  ): void {
    excelSheetCriteria.excelData.push({ Criteria: 'Date', Selection: distributionTabLeftPanelFiltersWithNames?.date });

    if (distributionTabLeftPanelFiltersWithNames?.statuses?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Status',
        Selection: distributionTabLeftPanelFiltersWithNames?.statuses.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.primaryUsages?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Primary Usage',
        Selection: distributionTabLeftPanelFiltersWithNames?.primaryUsages.join(', ')
      });
    }

    if (
      distributionTabLeftPanelFiltersWithNames.IncludeYoungLifeAircraft ||
      distributionTabLeftPanelFiltersWithNames.IncludeMidLifeAircraft ||
      distributionTabLeftPanelFiltersWithNames.IncludeLateLifeAircraft
    ) {
      const checkedAgeBands: string[] = [];

      if (distributionTabLeftPanelFiltersWithNames.IncludeYoungLifeAircraft) {
        checkedAgeBands.push('Young');
      }

      if (distributionTabLeftPanelFiltersWithNames.IncludeMidLifeAircraft) {
        checkedAgeBands.push('Mid-life');
      }

      if (distributionTabLeftPanelFiltersWithNames.IncludeLateLifeAircraft) {
        checkedAgeBands.push('Late-life');
      }

      excelSheetCriteria.excelData.push({
        Criteria: 'Age Bands',
        Selection: checkedAgeBands.join(', ')
      });

      if (distributionTabLeftPanelFiltersWithNames.rangeValues?.length || 0 > 0) {
        excelSheetCriteria.excelData.push({
          Criteria: 'Age Range',
          Selection: distributionTabLeftPanelFiltersWithNames.rangeValues.join(' - ')
        });
      }
    }

    if (distributionTabLeftPanelFiltersWithNames?.marketClasses?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Market Class',
        Selection: distributionTabLeftPanelFiltersWithNames?.marketClasses.join(', ')
      });
    }

    // Aircraft section
    if (distributionTabLeftPanelFiltersWithNames?.aircraftManufacturers?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Aircraft Manufacturer',
        Selection: distributionTabLeftPanelFiltersWithNames?.aircraftManufacturers.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.aircraftFamilies?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Aircraft Family',
        Selection: distributionTabLeftPanelFiltersWithNames?.aircraftFamilies.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.aircraftTypes?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Aircraft Type',
        Selection: distributionTabLeftPanelFiltersWithNames?.aircraftTypes.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.aircraftMasterSeries?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Aircraft Master Series',
        Selection: distributionTabLeftPanelFiltersWithNames?.aircraftMasterSeries.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.aircraftSeries?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Aircraft Series',
        Selection: distributionTabLeftPanelFiltersWithNames?.aircraftSeries.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.aircraftSubSeries?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Aircraft Sub Series',
        Selection: distributionTabLeftPanelFiltersWithNames?.aircraftSubSeries.join(', ')
      });
    }

    //Engine section
    if (distributionTabLeftPanelFiltersWithNames?.engineManufacturers?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Engine Manufacturer',
        Selection: distributionTabLeftPanelFiltersWithNames?.engineManufacturers.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.engineFamilies?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Engine Family',
        Selection: distributionTabLeftPanelFiltersWithNames?.engineFamilies.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.engineTypes?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Engine Type',
        Selection: distributionTabLeftPanelFiltersWithNames?.engineTypes.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.engineMasterSeries?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Engine Master Series',
        Selection: distributionTabLeftPanelFiltersWithNames?.engineMasterSeries.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.engineSeries?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Engine Series',
        Selection: distributionTabLeftPanelFiltersWithNames?.engineSeries.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.engineSubSeries?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Engine Sub Series',
        Selection: distributionTabLeftPanelFiltersWithNames?.engineSubSeries.join(', ')
      });
    }

    // Operator section
    if (distributionTabLeftPanelFiltersWithNames?.operators?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Operator',
        Selection: distributionTabLeftPanelFiltersWithNames?.operators.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.operatorTypes?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Operator Type',
        Selection: distributionTabLeftPanelFiltersWithNames?.operatorTypes.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.operatorGroups?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Operator Group',
        Selection: distributionTabLeftPanelFiltersWithNames?.operatorGroups.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.operatorRegions?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Operator Region',
        Selection: distributionTabLeftPanelFiltersWithNames?.operatorRegions.join(', ')
      });
    }

    if (distributionTabLeftPanelFiltersWithNames?.operatorCountries?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Operator Country/Subregion',
        Selection: distributionTabLeftPanelFiltersWithNames?.operatorCountries.join(', ')
      });
    }

    // Lessor
    if (distributionTabLeftPanelFiltersWithNames?.lessors?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Lessor',
        Selection: distributionTabLeftPanelFiltersWithNames?.lessors.join(', ')
      });
    }

    // Ownership
    if (distributionTabLeftPanelFiltersWithNames?.ownerships?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Ownership',
        Selection: distributionTabLeftPanelFiltersWithNames?.ownerships.join(', ')
      });
    }

    // Lease Status
    if (distributionTabLeftPanelFiltersWithNames?.leaseStatuses?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Lease Status',
        Selection: distributionTabLeftPanelFiltersWithNames?.leaseStatuses.join(', ')
      });
    }

    // Availability
    if (distributionTabLeftPanelFiltersWithNames?.availabilities?.length || 0 > 0) {
      excelSheetCriteria.excelData.push({
        Criteria: 'Availability',
        Selection: distributionTabLeftPanelFiltersWithNames?.availabilities.join(', ')
      });
    }
  }

  private formatDateForExport(dateString: string | null | undefined): string {
    if (!dateString || dateString.trim() === '') {
      return '';
    }

    const date = dayjs(dateString);
    if (!date.isValid()) {
      return '';
    }

    return date.format(DateConstants.DDMMYYYY);
  }
}
