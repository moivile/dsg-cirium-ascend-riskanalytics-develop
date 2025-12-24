import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';

import { MarketActivityTabComponent } from './market-activity-tab.component';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { MarketActivityTabStore } from '../../services/market-activity-tab-store';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { AppStore } from 'src/app/app-store';
import { MarketActivityFiltersWithNames } from '../../models/market-activity-excel-export.model';
import { ExcelSheetData } from '../../../shared/models/excel-sheet-data';
import { MetricType } from '../../models/metric-type.enum';

@Component({
    selector: 'ra-market-activity-summary-table',
    template: '',
    standalone: false
})
class MockMarketActivitySummaryTableComponent {}

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
  @Input() numberOfAircraftSelected = { value: true };
  @Input() percentageOfTotalSelected = !this.numberOfAircraftSelected.value;
  @Input() onSort!: (event: { field: string; order: number }) => void;
  @Input() footerTotals: { [key: string]: number } = {}; // Footer totals for each column
}

describe('MarketActivityTabComponent', () => {
  let component: MarketActivityTabComponent;
  let fixture: ComponentFixture<MarketActivityTabComponent>;
  let fleetInsightsStoreSpy: jasmine.SpyObj<FleetInsightsStore>;
  let marketActivityTabLeftPanelFiltersWithNamesSubject: Subject<any>;

  beforeEach(async () => {
    marketActivityTabLeftPanelFiltersWithNamesSubject = new Subject();

    const spy = jasmine.createSpyObj('FleetInsightsStore', ['updateMarketActivityTabLeftPanelFilters'], {
      marketActivityTabSummaryFilters$: of({
        marketActivityTabLeftPanelFilters: {},
        groupAllDataByValue: null
      }),
      marketActivityTabLeftPanelFiltersWithNames$: marketActivityTabLeftPanelFiltersWithNamesSubject.asObservable(),
      groupAllDataByLabel$: of('Market Class')
    });

    setTimeout(() => {
      marketActivityTabLeftPanelFiltersWithNamesSubject.next({
        intervalType: 'Monthly',
        startDate: 'January 2023',
        endDate: 'December 2023',
        orders: ['Test Order'],
        deliveries: ['Test Delivery'],
        statuses: ['Active'],
        primaryUsages: ['Passenger'],
        marketClasses: ['Narrowbody'],
        aircraftManufacturers: ['Boeing'],
        operators: ['Test Operator'],
        lessors: ['Test Lessor'],
        rangeValues: ['10', '20'],
        includeYoungLifeAircraft: true,
        includeMidLifeAircraft: false,
        includeLateLifeAircraft: false
      });
    });

    await TestBed.configureTestingModule({
      declarations: [
        MarketActivityTabComponent,
        MockGroupAllDataBySelectComponent,
        MockMarketActivitySummaryTableComponent,
        MockTrendsTabSummaryTableComponent
      ],
      imports: [DropdownModule, TooltipModule, DialogModule, NoopAnimationsModule, ReactiveFormsModule],
      providers: [
        { provide: FleetInsightsStore, useValue: spy },
        MarketActivityTabStore,
        FleetInsightsStore,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ExportExcelService,
        AppStore
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketActivityTabComponent);
    component = fixture.componentInstance;
    fleetInsightsStoreSpy = TestBed.inject(FleetInsightsStore) as jasmine.SpyObj<FleetInsightsStore>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set tab title and modalTitle based on summary count', () => {
    expect(component.tabs[0].title).toBe('Summary (0)');
    expect(component.modalTitle).toBe('Summary (0)');
  });

  it('should open details table modal when showModal is called', () => {
    expect(component.displayModal).toBeFalse();
    component.showModal();
    expect(component.displayModal).toBeTrue();
  });

  it('should close both table and chart modals when closeModal is called', () => {
    // open both modals
    component.displayModal = true;
    component.displayModalChart = true;
    component.closeModal();
    expect(component.displayModal).toBeFalse();
    expect(component.displayModalChart).toBeFalse();
  });

  it('should display summary table inside modal when modal is visible', () => {
    component.showModal();
    fixture.detectChanges();
    const dialogDebug = fixture.debugElement.query(By.css('p-dialog'));
    expect(dialogDebug).toBeTruthy();
    // header title
    const titleDebug = fixture.debugElement.query(By.css('p-dialog .p-dialog-header .p-dialog-title'));
    expect(titleDebug.nativeElement.textContent).toContain(component.modalTitle);
    // summary table component inside modal
    const tableDebug = fixture.debugElement.query(By.css('p-dialog ra-market-activity-summary-table'));
    expect(tableDebug).toBeTruthy();
  });

  describe('ra-fleet-tab-summary-table', () => {
    it('should render trends table when active tab is 1', () => {
      component.activeIndex = 1;
      fixture.detectChanges();

      const trendsTableDebug = fixture.debugElement.query(By.css('ra-fleet-tab-summary-table'));
      expect(trendsTableDebug).toBeTruthy();
    });

    it('should pass correct inputs to trends table component', () => {
      component.activeIndex = 1;
      component.tableData = [
        {
          grouping: 'Test Group',
          values: [{ yearTimePoint: '2023', numberOfAircraft: 10, percentageOfTotal: 50 }]
        }
      ];
      component.columnNames = ['2023'];
      component.footerTotals = { '2023': 10 };
      fixture.detectChanges();

      const trendsTableDebug = fixture.debugElement.query(By.css('ra-fleet-tab-summary-table'));
      const trendsTableComponent = trendsTableDebug.componentInstance;

      expect(trendsTableComponent.tableData).toEqual(component.tableData);
      expect(trendsTableComponent.columnNames).toEqual(component.columnNames);
      expect(trendsTableComponent.defaultSortField).toBe('numberOfAircraft');
      expect(trendsTableComponent.defaultSortOrder).toBe(-1);
      expect(trendsTableComponent.footerTotals).toEqual(component.footerTotals);
      expect(trendsTableComponent.numberOfAircraftSelected).toEqual(component.numberOfAircraftSelected);
    });

    it('should prepare table data correctly from trends data', () => {
      const mockTrendsData = [
        {
          grouping: 'Boeing 737',
          period: '2023',
          numberOfEvents: 15,
          percentageOfTotal: 60
        },
        {
          grouping: 'Airbus A320',
          period: '2023',
          numberOfEvents: 10,
          percentageOfTotal: 40
        }
      ];

      component.prepareTableData(mockTrendsData);

      expect(component.tableData).toEqual([
        {
          grouping: 'Boeing 737',
          values: [{ yearTimePoint: '2023', numberOfAircraft: 15, percentageOfTotal: 60 }]
        },
        {
          grouping: 'Airbus A320',
          values: [{ yearTimePoint: '2023', numberOfAircraft: 10, percentageOfTotal: 40 }]
        }
      ]);
      expect(component.columnNames).toEqual(['2023']);
    });

    it('should calculate footer totals correctly', () => {
      component.tableData = [
        {
          grouping: 'Boeing 737',
          values: [
            { yearTimePoint: '2023', numberOfAircraft: 15, percentageOfTotal: 60 },
            { yearTimePoint: '2024', numberOfAircraft: 20, percentageOfTotal: 55 }
          ]
        },
        {
          grouping: 'Airbus A320',
          values: [
            { yearTimePoint: '2023', numberOfAircraft: 10, percentageOfTotal: 40 },
            { yearTimePoint: '2024', numberOfAircraft: 15, percentageOfTotal: 45 }
          ]
        }
      ];
      component.columnNames = ['2023', '2024'];

      component.calculateFooterTotals();

      expect(component.footerTotals).toEqual({
        '2023': 25,
        '2024': 35
      });
    });

    it('should sort table data correctly by grouping', () => {
      component.tableData = [
        {
          grouping: 'Zebra',
          values: [{ yearTimePoint: '2023', numberOfAircraft: 5, percentageOfTotal: 25 }]
        },
        {
          grouping: 'Alpha',
          values: [{ yearTimePoint: '2023', numberOfAircraft: 10, percentageOfTotal: 75 }]
        }
      ];

      component.onSort({ field: 'grouping', order: 1 });

      expect(component.tableData[0].grouping).toBe('Alpha');
      expect(component.tableData[1].grouping).toBe('Zebra');
    });

    it('should sort table data correctly by year column', () => {
      component.tableData = [
        {
          grouping: 'Group A',
          values: [{ yearTimePoint: '2023', numberOfAircraft: 5, percentageOfTotal: 25 }]
        },
        {
          grouping: 'Group B',
          values: [{ yearTimePoint: '2023', numberOfAircraft: 15, percentageOfTotal: 75 }]
        }
      ];

      component.onSort({ field: '2023', order: -1 });

      expect(component.tableData[0].grouping).toBe('Group B');
      expect(component.tableData[1].grouping).toBe('Group A');
    });

    it('should get column names from table data with most values', () => {
      component.tableData = [
        {
          grouping: 'Group A',
          values: [{ yearTimePoint: '2023', numberOfAircraft: 5, percentageOfTotal: 25 }]
        },
        {
          grouping: 'Group B',
          values: [
            { yearTimePoint: '2023', numberOfAircraft: 10, percentageOfTotal: 50 },
            { yearTimePoint: '2024', numberOfAircraft: 15, percentageOfTotal: 75 }
          ]
        }
      ];

      const columnNames = component.getColumnNamesFromTableData();

      expect(columnNames).toEqual(['2023', '2024']);
    });

    it('should return empty array for column names when no table data', () => {
      component.tableData = [];

      const columnNames = component.getColumnNamesFromTableData();

      expect(columnNames).toEqual([]);
    });

    it('should update trends tab title with correct count', () => {
      const mockTrendsData = [
        { grouping: 'Group A', period: '2023', numberOfEvents: 5, percentageOfTotal: 25 },
        { grouping: 'Group B', period: '2023', numberOfEvents: 10, percentageOfTotal: 75 }
      ];

      component.activeIndex = 1;
      component.prepareTableData(mockTrendsData);

      expect(component.tabs[1].title).toBe('Trends (2)');
    });
  });

  describe('Excel Export Functionality', () => {
    let exportExcelService: ExportExcelService;
    let exportExcelSheetDataSpy: jasmine.Spy;

    beforeEach(() => {
      exportExcelService = TestBed.inject(ExportExcelService);
      exportExcelSheetDataSpy = spyOn(exportExcelService, 'exportExcelSheetData').and.stub();
      spyOn(exportExcelService, 'buildFileName').and.returnValue('test-filename.xlsx');
      spyOn(console, 'error');
      spyOn(console, 'warn');
      spyOn(window, 'alert');

      component['isExporting'] = false;
      component['summaryData'] = [
        { grouping: 'Boeing 737', numberOfEvents: 25, percentageOfTotal: 50 },
        { grouping: 'Airbus A320', numberOfEvents: 15, percentageOfTotal: 30 }
      ];
    });

    it('should prevent multiple simultaneous exports', () => {
      component['isExporting'] = true;
      spyOn(fleetInsightsStoreSpy.marketActivityTabLeftPanelFiltersWithNames$, 'pipe');

      component.onDownloadToExcel();

      expect(fleetInsightsStoreSpy.marketActivityTabLeftPanelFiltersWithNames$.pipe).not.toHaveBeenCalled();
    });

    it('should export summary data when active tab is 0', fakeAsync(() => {
      component.activeIndex = 0;
      spyOn(component, 'exportSummaryToExcel');
      spyOn(component, 'exportTrendsToExcel');

      marketActivityTabLeftPanelFiltersWithNamesSubject.next({
        intervalType: 'Monthly',
        startDate: 'January 2023',
        endDate: 'December 2023',
        orders: ['Test Order'],
        deliveries: ['Test Delivery'],
        statuses: ['Active'],
        primaryUsages: ['Passenger'],
        marketClasses: ['Narrowbody'],
        aircraftManufacturers: ['Boeing'],
        operators: ['Test Operator'],
        lessors: ['Test Lessor'],
        rangeValues: ['10', '20'],
        includeYoungLifeAircraft: true,
        includeMidLifeAircraft: false,
        includeLateLifeAircraft: false
      });

      component.onDownloadToExcel();
      tick();

      try {
        tick(1000);
      } catch (e) {}

      expect(component.exportSummaryToExcel).toHaveBeenCalled();
      expect(component.exportTrendsToExcel).not.toHaveBeenCalled();
    }));

    it('should export trends data when active tab is 1', fakeAsync(() => {
      component.activeIndex = 1;
      spyOn(component, 'exportSummaryToExcel');
      spyOn(component, 'exportTrendsToExcel');

      marketActivityTabLeftPanelFiltersWithNamesSubject.next({
        intervalType: 'Monthly',
        startDate: 'January 2023',
        endDate: 'December 2023',
        orders: ['Test Order'],
        deliveries: ['Test Delivery'],
        statuses: ['Active'],
        primaryUsages: ['Passenger'],
        marketClasses: ['Narrowbody'],
        aircraftManufacturers: ['Boeing'],
        operators: ['Test Operator'],
        lessors: ['Test Lessor'],
        rangeValues: ['10', '20'],
        includeYoungLifeAircraft: true,
        includeMidLifeAircraft: false,
        includeLateLifeAircraft: false
      });

      component.onDownloadToExcel();
      tick();
      try {
        tick(1000);
      } catch (e) {}

      expect(component.exportTrendsToExcel).toHaveBeenCalled();
      expect(component.exportSummaryToExcel).not.toHaveBeenCalled();
    }));

    it('should handle null filter data gracefully', () => {
      component['isExporting'] = false;

      exportExcelSheetDataSpy.calls.reset();

      expect(() => component.onDownloadToExcel()).not.toThrow();

      expect(component['isExporting']).toBe(true);
    });

    it('should reset isExporting flag on completion', fakeAsync(() => {
      marketActivityTabLeftPanelFiltersWithNamesSubject.next({
        intervalType: 'Monthly',
        startDate: 'January 2023',
        endDate: 'December 2023',
        orders: ['Test Order'],
        deliveries: ['Test Delivery'],
        statuses: ['Active'],
        primaryUsages: ['Passenger'],
        marketClasses: ['Narrowbody'],
        aircraftManufacturers: ['Boeing'],
        operators: ['Test Operator'],
        lessors: ['Test Lessor'],
        rangeValues: ['10', '20'],
        includeYoungLifeAircraft: true,
        includeMidLifeAircraft: false,
        includeLateLifeAircraft: false
      });

      component.onDownloadToExcel();
      tick();
      try {
        tick(1000);
      } catch (e) {}

      expect(component['isExporting']).toBeFalse();
    }));

    describe('Summary Export', () => {
      it('should not export when no summary data available', () => {
        component['summaryData'] = [];

        component.exportSummaryToExcel({} as any);

        expect(exportExcelService.exportExcelSheetData).not.toHaveBeenCalled();
      });

      it('should create correct Excel data for summary export', () => {
        const mockCriteriaSheet = {
          excelData: [],
          excelNumberFormat: '0',
          headersInOrder: [],
          isPivot: false
        } as ExcelSheetData;

        component.exportSummaryToExcel(mockCriteriaSheet);

        expect(exportExcelService.buildFileName).toHaveBeenCalledWith('Market_Activity_Summary');
        expect(exportExcelService.exportExcelSheetData).toHaveBeenCalled();
        const [excelDataMap] = exportExcelSheetDataSpy.calls.mostRecent().args;
        expect(excelDataMap.has('Criteria')).toBeTrue();
        expect(excelDataMap.has('Data')).toBeTrue();

        const dataSheet = excelDataMap.get('Data');
        expect(dataSheet).toBeDefined();
        expect(dataSheet?.excelData).toContain(
          jasmine.objectContaining({
            Grouping: 'Boeing 737',
            'Number of Events': 25,
            'Percentage of Total': 50
          })
        );
        expect(dataSheet?.excelData).toContain(
          jasmine.objectContaining({
            Grouping: 'Total',
            'Number of Events': 40,
            'Percentage of Total': 100
          })
        );
      });
    });

    describe('Trends Export', () => {
      beforeEach(() => {
        component.tableData = [
          {
            grouping: 'Boeing 737',
            values: [
              { yearTimePoint: '2023', numberOfAircraft: 15, percentageOfTotal: 60 },
              { yearTimePoint: '2024', numberOfAircraft: 20, percentageOfTotal: 55 }
            ]
          }
        ];
        component.columnNames = ['2023', '2024'];
      });

      it('should create correct Excel data for trends export', () => {
        const mockCriteriaSheet = {
          excelData: [],
          excelNumberFormat: '0',
          headersInOrder: [],
          isPivot: false
        } as ExcelSheetData;

        component.exportTrendsToExcel(mockCriteriaSheet);

        expect(exportExcelService.buildFileName).toHaveBeenCalledWith('Market_Activity_Trends');
        expect(exportExcelService.exportExcelSheetData).toHaveBeenCalled();
        const [excelDataMap] = exportExcelSheetDataSpy.calls.mostRecent().args;
        expect(excelDataMap.has('Criteria')).toBeTrue();
        expect(excelDataMap.has('Number of Aircraft')).toBeTrue();
        expect(excelDataMap.has('Number of Aircraft')).toBeTrue();
      });
    });

    describe('Criteria Sheet Creation', () => {
      it('should create criteria sheet with all filter data', () => {
        const mockFilters: MarketActivityFiltersWithNames = {
          intervalType: 'Monthly',
          startDate: 'January 2023',
          endDate: 'December 2023',
          orders: ['Test Order'],
          deliveries: ['Test Delivery'],
          statuses: ['Active'],
          primaryUsages: ['Passenger'],
          marketClasses: ['Narrowbody'],
          aircraftManufacturers: ['Boeing'],
          operators: ['Test Operator'],
          lessors: ['Test Lessor'],
          rangeValues: ['10', '20'],
          includeYoungLifeAircraft: true,
          includeMidLifeAircraft: false,
          includeLateLifeAircraft : false
        };

        const criteriaSheet = (component as any).createCriteriaSheet(mockFilters, 'Market Class');

        expect(criteriaSheet.excelData).toContain(
          jasmine.objectContaining({
            Criteria: 'Group All Data By',
            Selection: 'Market Class'
          })
        );
        expect(criteriaSheet.excelData).toContain(
          jasmine.objectContaining({
            Criteria: 'Interval Type',
            Selection: 'Monthly'
          })
        );
        expect(criteriaSheet.excelData).toContain(
          jasmine.objectContaining({
            Criteria: 'Orders',
            Selection: 'Test Order'
          })
        );
        expect(criteriaSheet.excelData).toContain(
          jasmine.objectContaining({
            Criteria: 'Age Bands',
            Selection: 'Young'
          })
        );
      });

      it('should handle empty filter arrays', () => {
        const mockFilters: MarketActivityFiltersWithNames = {
          intervalType: 'Monthly',
          orders: [],
          statuses: [],
          includeYoungLifeAircraft: false,
          includeMidLifeAircraft: false,
          includeLateLifeAircraft : false
        };

        const criteriaSheet = (component as any).createCriteriaSheet(mockFilters, 'Market Class');

        const ordersEntry = criteriaSheet.excelData.find((entry: any) => entry.Criteria === 'Orders');
        const statusesEntry = criteriaSheet.excelData.find((entry: any) => entry.Criteria === 'Status');
        const ageBandsEntry = criteriaSheet.excelData.find((entry: any) => entry.Criteria === 'Age Bands');

        expect(ordersEntry).toBeUndefined();
        expect(statusesEntry).toBeUndefined();
        expect(ageBandsEntry).toBeUndefined();
      });
    });
  });

  it('should update trendMetricType$ and numberOfAircraftSelected when trendMetricControl changes', () => {
    // initial expectations
    expect(component.trendMetricType$.getValue()).toBe(MetricType.Number);
    expect(component.numberOfAircraftSelected.value).toBeTrue();

    // change to Percentage and assert
    component.trendMetricControl.setValue(MetricType.Percentage);
    fixture.detectChanges();

    expect(component.trendMetricType$.getValue()).toBe(MetricType.Percentage);
    expect(component.numberOfAircraftSelected.value).toBeFalse();

    // change back to Number and assert
    component.trendMetricControl.setValue(MetricType.Number);
    fixture.detectChanges();

    expect(component.trendMetricType$.getValue()).toBe(MetricType.Number);
    expect(component.numberOfAircraftSelected.value).toBeTrue();
  });
});
