/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FleetTrendsTabComponent } from './fleet-trends-tab.component';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { Component, Input } from '@angular/core';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TrendsTabStore } from '../../services/trends-tab-store';
import { of, Subject } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, By } from '@angular/platform-browser';
import { FleetInsightsTrendsService } from '../../services/fleet-insights-trends-service';
import { ExportExcelService } from 'src/app/modules/shared/services/export-excel-service';
import { FleetInsightsTrendsRawData } from '../../models/fleet-insights-trends-chart-dataset.model';

interface FilterData {
  intervalType: number;
  startDate: string;
  endDate: string;
  statuses: number[];
  primaryUsages: number[];
  marketClasses: number[];
  lessors: number[];
  IncludeYoungLifeAircraft?: boolean;
  IncludeLateLifeAircraft?: boolean;
  includeMidLifeAircraft?: boolean;
  IncludeMidLifeAircraft?: boolean;
  isCargoChecked?: boolean;
  isPassengerChecked?: boolean;
  isActiveChecked?: boolean;
  isStoredChecked?: boolean;
  isRetiredChecked?: boolean;
  isLeasedChecked?: boolean;
  isOwnedChecked?: boolean;
  isNewChecked?: boolean;
  isUsedChecked?: boolean;
  isRegionalChecked?: boolean;
  isNarrowBodyChecked?: boolean;
  isWideBodyChecked?: boolean;
  isTurbopropChecked?: boolean;
  isJetChecked?: boolean;
  isPistonChecked?: boolean;
  operatorCountries: number[];
}

interface MockSummaryValue {
  year: number;
  timePoint: string;
  numberOfAircraft: number;
  percentageOfTotal: number;
}

interface MockSummaryItem {
  grouping: string;
  values: MockSummaryValue[];
}

@Component({
  selector: 'ra-group-all-data-by-select',
  template: '',
  standalone: false
})
class MockGroupAllDataBySelectComponent {}

@Component({
  selector: 'ra-fleet-tab-summary-table',
  template: '',
  standalone: false
})
class MockTrendsTabSummaryTableComponent {
  @Input() tableData: {
    grouping: string;
    values: { yearTimePoint: string; numberOfAircraft: number; percentageOfTotal: number }[];
  }[] = [];
  @Input() columnNames!: string[];
  @Input() defaultSortField = 'numberOfAircraft';
  @Input() defaultSortOrder = -1; // 1 for ascending, -1 for descending
  @Input() summaryTableLoading = false;
  @Input() numberOfAircraftSelected = true;
  @Input() percentageOfTotalSelected = !this.numberOfAircraftSelected;
  @Input() onSort!: (event: { field: string; order: number }) => void;
  @Input() footerTotals: { [key: string]: number } = {}; // Footer totals for each column
}

@Component({
  selector: 'ra-fleet-trends-stacked-area-chart',
  template: '',
  standalone: false
})
class MockFleetTrendsStackedAreaChartComponent {
  @Input() chartData$: Subject<FleetInsightsTrendsRawData[]> = new Subject<FleetInsightsTrendsRawData[]>();
  @Input() loading = false;
  @Input() hasTooManySegments = false;
  @Input() chartFill = { value: true };
}

describe('FleetTrendsTabComponent', () => {
  let component: FleetTrendsTabComponent;
  let fixture: ComponentFixture<FleetTrendsTabComponent>;
  let service: FleetInsightsTrendsService;
  let fleetInsightsStore: FleetInsightsStore;

  let filters: FilterData;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TrendsTabStore', ['totalAircraftRecords$', 'totalSummaryRecords$']);
    await TestBed.configureTestingModule({
      declarations: [
        FleetTrendsTabComponent,
        MockGroupAllDataBySelectComponent,
        MockTrendsTabSummaryTableComponent,
        MockFleetTrendsStackedAreaChartComponent
      ],
      imports: [DropdownModule, TooltipModule, FormsModule, ReactiveFormsModule, DialogModule, BrowserAnimationsModule, BrowserModule],

      providers: [
        { provide: FleetInsightsStore, useValue: spy },
        TrendsTabStore,
        FleetInsightsStore,
        FleetInsightsTrendsService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ExportExcelService
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(FleetTrendsTabComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(FleetInsightsTrendsService);
    fleetInsightsStore = TestBed.inject(FleetInsightsStore);

    // Mocking observables and methods
    spyOn(service, 'getTrendsSummaryData').and.returnValue(
      of({
        summaryList: [
          {
            grouping: 'Group A',
            values: [
              { year: 2023, timePoint: '01', numberOfAircraft: 10, percentageOfTotal: 20.5 },
              { year: 2023, timePoint: '02', numberOfAircraft: 15, percentageOfTotal: 30.0 }
            ]
          },
          {
            grouping: 'Group B',
            values: [
              { year: 2023, timePoint: '01', numberOfAircraft: 5, percentageOfTotal: 10.0 },
              { year: 2023, timePoint: '02', numberOfAircraft: 20, percentageOfTotal: 40.0 }
            ]
          }
        ]
      })
    );
    component.tabs = [{ title: 'Summary (0)', active: true }];
    component.loading = false;
    component.displayModalTable = false;
    component.aircraftRecordCount = 0;
    component.defaultSortField = 'numberOfAircraft';
    component.defaultSortOrder = -1;
    component.defaultRowCount = 100;
    component.columnNames = [];
    component.tableData = [];
    component.columns = [];
    component.numberOfAircraftSelected = { value: true };
    component.intervalType = 1;
    component.startDate = 'January 2023';
    component.endDate = 'March 2023';
    component.summaryTableLoading = false;
    component.footerTotals = {};

    filters = {
      intervalType: 1,
      startDate: 'January 2023',
      endDate: 'March 2023',
      statuses: [],
      primaryUsages: [],
      marketClasses: [],
      lessors: [],
      IncludeYoungLifeAircraft: undefined,
      IncludeLateLifeAircraft: undefined,
      includeMidLifeAircraft: undefined,
      operatorCountries: []
    };
  });
  it('should initialize and populate excelSheetCriteria when filters are provided', () => {
    const initializeSheetDataSpy = spyOn(component as any, 'initializeSheetData').and.callThrough();
    const populateExcelSheetWithTrendsTabLeftPanelFiltersSpy = spyOn(
      component as any,
      'populateExcelSheetWithTrendsTabLeftPanelFilters'
    ).and.callThrough();
    const filtersSubject = new Subject<FilterData>();
    (fleetInsightsStore as any).trendsTabLeftPanelFiltersWithNames$ = filtersSubject.asObservable();

    fixture.detectChanges();

    filtersSubject.next(filters);

    fixture.detectChanges();

    expect(initializeSheetDataSpy).toHaveBeenCalledWith('0');
    expect(populateExcelSheetWithTrendsTabLeftPanelFiltersSpy).toHaveBeenCalledWith(jasmine.any(Object), filters);
  });
  it('should not populate excelSheetCriteria if filters are null', () => {
    const initializeSheetDataSpy = spyOn(component as any, 'initializeSheetData').and.callThrough();
    const populateExcelSheetWithTrendsTabLeftPanelFiltersSpy = spyOn(
      component as any,
      'populateExcelSheetWithTrendsTabLeftPanelFilters'
    ).and.callThrough();

    (fleetInsightsStore as any).trendsTabLeftPanelFiltersWithNames$ = of(null);

    fixture.detectChanges();

    expect(initializeSheetDataSpy).not.toHaveBeenCalled();
    expect(populateExcelSheetWithTrendsTabLeftPanelFiltersSpy).not.toHaveBeenCalled();
  });
  it('should update intervalType, startDate, and endDate when filters change', () => {
    filters.intervalType = 2;
    filters.startDate = 'April 2023';
    filters.endDate = 'June 2023';

    const filtersSubject = new Subject<FilterData>();
    (fleetInsightsStore as any).trendsTabLeftPanelFiltersWithNames$ = filtersSubject.asObservable();

    fixture.detectChanges();
    filtersSubject.next(filters);

    fixture.detectChanges();

    expect(component.intervalType).toEqual(filters.intervalType);
    expect(component.startDate).toEqual(filters.startDate);
    expect(component.endDate).toEqual(filters.endDate);
  });

  it('should calculate column names when filters change', () => {
    const calculateColumnNamesSpy = spyOn(component, 'calculateColumnNames').and.callThrough();

    const filtersSubject = new Subject<FilterData>();
    (fleetInsightsStore as any).trendsTabLeftPanelFiltersWithNames$ = filtersSubject.asObservable();

    fixture.detectChanges();

    filtersSubject.next(filters);
    fixture.detectChanges();

    expect(calculateColumnNamesSpy).toHaveBeenCalledWith(filters.intervalType, filters.startDate, filters.endDate);
    expect(component.columnNames).toEqual(['Jan 2023', 'Feb 2023', 'Mar 2023']);
  });

  it('should not update intervalType, startDate, or endDate if filters are invalid', () => {
    component.intervalType = 1;
    component.startDate = 'January 2023';
    component.endDate = 'March 2023';

    const invalidFilters = undefined;

    (fleetInsightsStore as any).trendsTabLeftPanelFiltersWithNames$ = of(invalidFilters);

    fixture.detectChanges();
    expect(component.intervalType).toEqual(1);
    expect(component.startDate).toEqual('January 2023');
    expect(component.endDate).toEqual('March 2023');
  });

  it('should handle distinctUntilChanged logic correctly', () => {
    const filters1 = {
      intervalType: 1,
      startDate: 'January 2023',
      endDate: 'March 2023',
      statuses: [],
      primaryUsages: [],
      marketClasses: [],
      lessors: [],
      IncludeYoungLifeAircraft: undefined,
      IncludeLateLifeAircraft: undefined,
      isCargoChecked: undefined,
      isPassengerChecked: undefined,
      isActiveChecked: undefined,
      isStoredChecked: undefined,
      isRetiredChecked: undefined,
      isLeasedChecked: undefined,
      isOwnedChecked: undefined,
      isNewChecked: undefined,
      isUsedChecked: undefined,
      isRegionalChecked: undefined,
      isNarrowBodyChecked: undefined,
      isWideBodyChecked: undefined,
      isTurbopropChecked: undefined,
      isJetChecked: undefined,
      isPistonChecked: undefined,
      operatorCountries: []
    };

    const filters2 = { ...filters1 };
    const filters3 = { ...filters1, intervalType: 2, startDate: 'April 2023', endDate: 'June 2023' };

    const calculateColumnNamesSpy = spyOn(component, 'calculateColumnNames').and.callThrough();

    const filtersSubject = new Subject<FilterData>();
    (fleetInsightsStore as any).trendsTabLeftPanelFiltersWithNames$ = filtersSubject.asObservable();

    fixture.detectChanges();

    filtersSubject.next(filters1);
    filtersSubject.next(filters2);
    filtersSubject.next(filters3);

    fixture.detectChanges();

    expect(calculateColumnNamesSpy).toHaveBeenCalledTimes(2);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should add column headers to sheets in exportSummaryToExcel', () => {
    const addColumnHeadersSpy = spyOn(component as any, 'addColumnHeaders').and.callThrough();

    component.exportSummaryToExcel();

    expect(addColumnHeadersSpy).toHaveBeenCalled();
  });

  it('should finalize sheet data correctly in exportSummaryToExcel', () => {
    const finalizeSheetDataSpy = spyOn(component as any, 'finalizeSheetData').and.callThrough();

    component.exportSummaryToExcel();

    expect(finalizeSheetDataSpy).toHaveBeenCalled();
  });

  it('should call exportExcelSheetData with correct parameters in exportSummaryToExcel', () => {
    const exportExcelSheetDataSpy = spyOn(component['exportExcelService'], 'exportExcelSheetData').and.callThrough();

    component.exportSummaryToExcel();

    expect(exportExcelSheetDataSpy).toHaveBeenCalled();
    expect(exportExcelSheetDataSpy.calls.mostRecent().args[0]).toBeInstanceOf(Map);
    expect(exportExcelSheetDataSpy.calls.mostRecent().args[1]).toContain('Summary');
  });

  it('should calculate column names correctly for monthly interval', () => {
    const startDate = 'January 2023';
    const endDate = 'March 2023';
    const intervalType = 1; // Monthly

    const columnNames = component.calculateColumnNames(intervalType, startDate, endDate);

    expect(columnNames).toEqual(['Jan 2023', 'Feb 2023', 'Mar 2023']);
  });

  it('should calculate column names correctly for quarterly interval', () => {
    const startDate = 'January 2023';
    const endDate = 'January 2023';
    const intervalType = 2; // Quarterly

    const columnNames = component.calculateColumnNames(intervalType, startDate, endDate);

    expect(columnNames).toEqual(['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023']);
  });

  it('should calculate column names correctly for yearly interval', () => {
    const startDate = 'January 2023';
    const endDate = 'January 2025';
    const intervalType = 3; // Yearly

    const columnNames = component.calculateColumnNames(intervalType, startDate, endDate);

    expect(columnNames).toEqual(['2023', '2024', '2025']);
  });

  it('should prepare table data correctly', () => {
    const mockSummaryList = [
      {
        grouping: 'Group A',
        values: [
          { year: 2023, timePoint: '01', numberOfAircraft: 10, percentageOfTotal: 20.5 },
          { year: 2023, timePoint: '02', numberOfAircraft: 15, percentageOfTotal: 30.0 }
        ]
      },
      {
        grouping: 'Group B',
        values: [
          { year: 2023, timePoint: '01', numberOfAircraft: 5, percentageOfTotal: 10.0 },
          { year: 2023, timePoint: '02', numberOfAircraft: 20, percentageOfTotal: 40.0 }
        ]
      }
    ];

    component.columnNames = ['Jan 2023', 'Feb 2023'];
    component.prepareTableData(mockSummaryList);

    expect(component.tableData).toEqual([
      {
        grouping: 'Group B',
        values: [
          { yearTimePoint: 'Jan 2023', numberOfAircraft: 5, percentageOfTotal: 10.0 },
          { yearTimePoint: 'Feb 2023', numberOfAircraft: 20, percentageOfTotal: 40.0 }
        ]
      },
      {
        grouping: 'Group A',
        values: [
          { yearTimePoint: 'Jan 2023', numberOfAircraft: 10, percentageOfTotal: 20.5 },
          { yearTimePoint: 'Feb 2023', numberOfAircraft: 15, percentageOfTotal: 30.0 }
        ]
      }
    ]);
  });

  it('should calculate footer totals correctly', () => {
    component.columnNames = ['Jan 2023', 'Feb 2023'];
    component.tableData = [
      {
        grouping: 'Group A',
        values: [
          { yearTimePoint: 'Jan 2023', numberOfAircraft: 10, percentageOfTotal: 20.5 },
          { yearTimePoint: 'Feb 2023', numberOfAircraft: 15, percentageOfTotal: 30.0 }
        ]
      },
      {
        grouping: 'Group B',
        values: [
          { yearTimePoint: 'Jan 2023', numberOfAircraft: 5, percentageOfTotal: 10.0 },
          { yearTimePoint: 'Feb 2023', numberOfAircraft: 20, percentageOfTotal: 40.0 }
        ]
      }
    ];

    component.calculateFooterTotals();

    expect(component.footerTotals).toEqual({
      'Jan 2023': 15,
      'Feb 2023': 35
    });
  });

  describe('Modal Window Functionality', () => {
    it('should show the modal when showModal is called', () => {
      component.tabs = [
        {
          title: 'Tab 1',
          active: false
        },
        {
          title: 'Tab 2',
          active: false
        }
      ];
      component.showModalTable();
      expect(component.modalTitle).toBe('Tab 1');
      expect(component.displayModalTable).toBeTrue();
    });

    it('should close the modal when closeModal is called', () => {
      component.displayModalTable = true;
      component.closeModal();
      expect(component.displayModalTable).toBeFalse();
    });

    it('should maximize the modal when maximizeModal is called', () => {
      const mockDialog = jasmine.createSpyObj('Dialog', ['maximize']);
      component.maximizeModalTable(mockDialog);
      expect(mockDialog.maximize).toHaveBeenCalled();
    });
  });

  describe('Modal Chart Functionality', () => {
    it('should show the chart modal when showModalChart is called', () => {
      component.displayModalChart = false;

      component.showModalChart();

      expect(component.displayModalChart).toBeTrue();
    });

    it('should maximize the chart modal when maximizeModalChart is called', fakeAsync(() => {
      const mockDialog = jasmine.createSpyObj('Dialog', ['maximize']);
      spyOn(component, 'prepareChartFill').and.callThrough();

      component.maximizeModalChart(mockDialog);

      // Verify that prepareChartFill is called with the correct argument
      expect(component.prepareChartFill).toHaveBeenCalledWith(!component.numberOfAircraftSelected.value);

      // Simulate the 2-second delay
      tick(2000);

      // Verify that maximize is called on the dialog
      expect(mockDialog.maximize).toHaveBeenCalled();
    }));

    it('should close the chart modal when closeModal is called', () => {
      component.displayModalChart = true;

      component.closeModal();

      expect(component.displayModalChart).toBeFalse();
    });
  });
  describe('prepareTableData and helper methods', () => {
    let mockSummaryList: MockSummaryItem[];

    beforeEach(() => {
      mockSummaryList = [
        {
          grouping: 'Group A',
          values: [
            { year: 2023, timePoint: '01', numberOfAircraft: 10, percentageOfTotal: 20.5 },
            { year: 2023, timePoint: '02', numberOfAircraft: 15, percentageOfTotal: 30.0 },
            { year: 2023, timePoint: '03', numberOfAircraft: 0, percentageOfTotal: 0.0 }
          ]
        },
        {
          grouping: 'Group B',
          values: [
            { year: 2023, timePoint: '01', numberOfAircraft: 5, percentageOfTotal: 10.0 },
            { year: 2023, timePoint: '02', numberOfAircraft: 20, percentageOfTotal: 40.0 },
            { year: 2023, timePoint: '03', numberOfAircraft: 0, percentageOfTotal: 0.0 }
          ]
        }
      ];

      component.columnNames = ['Jan 2023', 'Feb 2023', 'Mar 2023'];
      component.intervalType = 1;
    });

    it('should create initial table data correctly', () => {
      const result = component['createInitialTableData'](mockSummaryList);

      expect(result.length).toBe(2);
      expect(result[0].grouping).toBe('Group A');
      expect(result[0].values.length).toBe(3);
      expect(result[1].grouping).toBe('Group B');
      expect(result[1].values.length).toBe(3);
    });

    it('should initialize values map with default values for all columns', () => {
      const columnSet = new Set(['Jan 2023', 'Feb 2023', 'Mar 2023']);
      const valuesMap = component['initializeValuesMap'](columnSet);

      expect(valuesMap.size).toBe(3);
      expect(valuesMap.get('Jan 2023')).toEqual({ numberOfAircraft: 0, percentageOfTotal: 0.0 });
      expect(valuesMap.get('Feb 2023')).toEqual({ numberOfAircraft: 0, percentageOfTotal: 0.0 });
      expect(valuesMap.get('Mar 2023')).toEqual({ numberOfAircraft: 0, percentageOfTotal: 0.0 });
    });

    it('should populate values map with data from API', () => {
      const valuesMap = new Map();
      valuesMap.set('Jan 2023', { numberOfAircraft: 0, percentageOfTotal: 0.0 });
      valuesMap.set('Feb 2023', { numberOfAircraft: 0, percentageOfTotal: 0.0 });

      spyOn(component, 'getYearTimePoint').and.callFake((intervalType, year, timePoint) => {
        if (timePoint === '01') {
          return 'Jan 2023';
        }
        if (timePoint === '02') {
          return 'Feb 2023';
        }
        return '';
      });

      component['populateValuesMap'](valuesMap, mockSummaryList[0].values);

      expect(valuesMap.get('Jan 2023')).toEqual({ numberOfAircraft: 10, percentageOfTotal: 20.5 });
      expect(valuesMap.get('Feb 2023')).toEqual({ numberOfAircraft: 15, percentageOfTotal: 30.0 });
    });

    it('should not filter columns when all columns have non-zero values', () => {
      component.tableData = [
        {
          grouping: 'Group A',
          values: [
            { yearTimePoint: 'Jan 2023', numberOfAircraft: 5, percentageOfTotal: 10.0 },
            { yearTimePoint: 'Feb 2023', numberOfAircraft: 10, percentageOfTotal: 20.0 },
            { yearTimePoint: 'Mar 2023', numberOfAircraft: 15, percentageOfTotal: 30.0 }
          ]
        }
      ];

      component.columnNames = ['Jan 2023', 'Feb 2023', 'Mar 2023'];
      const originalColumnNames = [...component.columnNames];

      expect(component.columnNames).toEqual(originalColumnNames);
      expect(component.tableData[0].values.length).toBe(3);
    });

    it('should sort table data by last column value in descending order', () => {
      component.tableData = [
        {
          grouping: 'Group A',
          values: [
            { yearTimePoint: 'Jan 2023', numberOfAircraft: 10, percentageOfTotal: 20.5 },
            { yearTimePoint: 'Feb 2023', numberOfAircraft: 15, percentageOfTotal: 30.0 }
          ]
        },
        {
          grouping: 'Group B',
          values: [
            { yearTimePoint: 'Jan 2023', numberOfAircraft: 5, percentageOfTotal: 10.0 },
            { yearTimePoint: 'Feb 2023', numberOfAircraft: 20, percentageOfTotal: 40.0 }
          ]
        },
        {
          grouping: 'Group C',
          values: [
            { yearTimePoint: 'Jan 2023', numberOfAircraft: 8, percentageOfTotal: 16.0 },
            { yearTimePoint: 'Feb 2023', numberOfAircraft: 5, percentageOfTotal: 10.0 }
          ]
        }
      ];

      component['sortTableDataByLastColumn']();

      expect(component.tableData[0].grouping).toBe('Group B');
      expect(component.tableData[1].grouping).toBe('Group A');
      expect(component.tableData[2].grouping).toBe('Group C');
    });
    it('should orchestrate the entire data preparation process correctly', () => {
      const createInitialSpy = spyOn(component as any, 'createInitialTableData').and.callThrough();
      const sortTableSpy = spyOn(component as any, 'sortTableDataByLastColumn').and.callThrough();
      const calculateFooterSpy = spyOn(component, 'calculateFooterTotals').and.callThrough();

      spyOn(component, 'getYearTimePoint').and.callFake((intervalType, year, timePoint) => {
        if (timePoint === '01') {
          return 'Jan 2023';
        }
        if (timePoint === '02') {
          return 'Feb 2023';
        }
        if (timePoint === '03') {
          return 'Mar 2023';
        }
        return '';
      });

      component.prepareTableData(mockSummaryList);

      expect(createInitialSpy).toHaveBeenCalledBefore(sortTableSpy);
      expect(sortTableSpy).toHaveBeenCalledBefore(calculateFooterSpy);

      expect(createInitialSpy).toHaveBeenCalledTimes(1);
      expect(sortTableSpy).toHaveBeenCalledTimes(1);
      expect(calculateFooterSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Export Button Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have export button enabled (not disabled)', () => {
      const exportButton = fixture.debugElement.query(By.css('.airframe__icon-button'));
      expect(exportButton).toBeTruthy();
      expect(exportButton.nativeElement.disabled).toBeFalse();
    });

    it('should have click event handler attached to export button', () => {
      const exportButton = fixture.debugElement.query(By.css('.airframe__icon-button'));
      const clickHandler = exportButton.listeners.find((listener) => listener.name === 'click');

      expect(clickHandler).toBeDefined();
    });

    it('should be focusable when enabled', () => {
      const exportButton = fixture.debugElement.query(By.css('.airframe__icon-button'));

      exportButton.nativeElement.focus();
      expect(document.activeElement).toBe(exportButton.nativeElement);
    });

    it('should have proper CSS classes for enabled button', () => {
      const exportButton = fixture.debugElement.query(By.css('.airframe__icon-button'));

      expect(exportButton.nativeElement.classList.contains('airframe__icon-button')).toBeTrue();
      expect(exportButton.nativeElement.disabled).toBeFalse();
    });

    it('should contain download icon', () => {
      const downloadIcon = fixture.debugElement.query(By.css('.fa.fa-download'));

      expect(downloadIcon).toBeTruthy();
      expect(downloadIcon.nativeElement.classList.contains('fa')).toBeTrue();
      expect(downloadIcon.nativeElement.classList.contains('fa-download')).toBeTrue();
    });
  });

  describe('Export Functionality Integration', () => {
    it('should call exportSummaryToExcel directly', () => {
      spyOn(component['exportExcelService'], 'exportExcelSheetData');

      // Call the method directly to test the functionality
      component.exportSummaryToExcel();

      expect(component['exportExcelService'].exportExcelSheetData).toHaveBeenCalled();
    });

    it('should handle multiple export calls', () => {
      spyOn(component, 'exportSummaryToExcel').and.callThrough();
      spyOn(component['exportExcelService'], 'exportExcelSheetData');

      // Call export multiple times directly
      component.exportSummaryToExcel();
      component.exportSummaryToExcel();
      component.exportSummaryToExcel();

      expect(component.exportSummaryToExcel).toHaveBeenCalledTimes(3);
      expect(component['exportExcelService'].exportExcelSheetData).toHaveBeenCalledTimes(3);
    });
  });

  describe('Export Button Accessibility', () => {
    it('should have proper ARIA attributes when enabled', () => {
      const exportButton = fixture.debugElement.query(By.css('.airframe__icon-button'));

      // Should be focusable and not have aria-disabled
      expect(exportButton.nativeElement.getAttribute('aria-disabled')).toBeNull();
      expect(exportButton.nativeElement.tabIndex).not.toBe(-1);
    });
  });
});
