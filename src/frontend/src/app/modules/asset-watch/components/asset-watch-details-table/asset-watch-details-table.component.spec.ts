import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { AssetWatchDetailsTableComponent } from './asset-watch-details-table.component';
import { TableModule } from 'primeng/table';
import { FormControl, FormGroup } from '@angular/forms';
import { AircraftWatchlistFilterForm } from '../../models/aircraft-watchlist-filter-form';
import { FilterPanelForm } from '../../models/filter-panel-form';
import { AssetWatchService } from '../../services/asset-watch.service';
import { AssetWatchDetailsTableService } from './asset-watch-details-table.service';
import { TimePeriodOption } from '../../models/time-period-option';
import { AssetWatchGridRequest } from '../../models/asset-watch-grid-request';
import { of } from 'rxjs';
import { AssetWatchExportExcelService } from '../../services/asset-watch-export-excel.service';
import { ExportExcelService } from 'src/app/modules/shared/services/export-excel-service';
import { AssetWatchStore } from '../../services/asset-watch-store';
import { MessageService, SortEvent } from 'primeng/api';
import { AppStore } from '../../../../app-store';
import { PortfoliosService } from '../../../shared/services/portfolios.service';
import { AppUserService } from '../../../../app-user.service';
import { AssetWatchGridModel } from '../../models/asset-watch-grid-model';

describe('AssetWatchDetailsTableComponent', () => {
  let component: AssetWatchDetailsTableComponent;
  let fixture: ComponentFixture<AssetWatchDetailsTableComponent>;
  let assetWatchServiceSpy: AssetWatchService;
  let assetWatchDetailsTableServiceSpy: AssetWatchDetailsTableService;
  let portfoliosServiceSpy: jasmine.SpyObj<PortfoliosService>;
  let appStore: AppStore;
  let assetWatchExportExcelService: AssetWatchExportExcelService;

  beforeEach(async () => {
    assetWatchDetailsTableServiceSpy = jasmine.createSpyObj('AssetWatchDetailsTableService', ['setupTableHeaders']);
    assetWatchServiceSpy = jasmine.createSpyObj('AssetWatchService', [
      'getAssetWatchFilterData',
      'getMaintenanceActivityData',
      'getAssetWatchListGrid',
      'getParams'
    ]);
    portfoliosServiceSpy = jasmine.createSpyObj('PortfoliosService', ['getPortfolios']);

    (assetWatchServiceSpy.getAssetWatchListGrid as jasmine.Spy).and.returnValue(of({ assetWatchListDataGrid: [] }));

    TestBed.configureTestingModule({
      declarations: [AssetWatchDetailsTableComponent],
      imports: [TableModule],
      providers: [
        { provide: AssetWatchService, useValue: assetWatchServiceSpy },
        { provide: AssetWatchDetailsTableService, useValue: assetWatchDetailsTableServiceSpy },
        { provide: PortfoliosService, useValue: portfoliosServiceSpy },
        AssetWatchExportExcelService,
        ExportExcelService,
        AssetWatchStore,
        AppStore,
        MessageService,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AssetWatchDetailsTableComponent);
    appStore = TestBed.inject(AppStore);
    assetWatchExportExcelService = TestBed.inject(AssetWatchExportExcelService);
    component = fixture.componentInstance;

    component.aircraftWatchlistFilterForm = new FormGroup<AircraftWatchlistFilterForm>(new AircraftWatchlistFilterForm());
    component.filterPanelForm = new FormGroup<FilterPanelForm>(new FilterPanelForm());
    component.selectedTimePeriodControl = new FormControl<TimePeriodOption>(TimePeriodOption.Last7Days, { nonNullable: true });
    portfoliosServiceSpy.getPortfolios.and.returnValue(of(portfolios));
    appStore.loadPortfolios();
    appStore.setSelectedPortfolioId(portfolios[0].id);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call onResize', () => {
      spyOn(component, 'onResize');
      component.ngOnInit();
      expect(component.onResize).toHaveBeenCalled();
    });

    it('table headers should be defined', () => {
      component.ngOnInit();
      expect(component.tableHeaders).toBeDefined();
    });
  });

  describe('excel export', () => {
    it('should call assetWatchExportExcelService.exportDetailsTableExcel when exportExcel is called', () => {
      component.currentAssetWatchGridRequest = new AssetWatchGridRequest(
        component.filterPanelForm,
        component.selectedTimePeriodControl,
        portfolios[0].id,
        component.aircraftWatchlistFilterForm
      );
      const spy = spyOn(assetWatchExportExcelService, 'exportDetailsTableExcel').and.returnValue(of(undefined));
      component.exportExcel();
      expect(spy).toHaveBeenCalledWith(component.tableData, component.currentAssetWatchGridRequest);
    });
  });

  describe('on filter criteria change, api should be called with skip value 0 based on isModal value', () => {
    it('for different isModal values', () => {
      // Test when isModal is true
      component.isModal = true;
      fixture.detectChanges();

      // Set values without emitting events
      component.filterPanelForm.setValue(
        {
          regions: ['1'],
          countries: ['2'],
          cities: ['3'],
          airports: ['a'],
          routeCategory: 'b',
          operators: [4],
          lessors: [5],
          aircraftSeries: [6],
          engineSeries: [7],
          aircraftSerialNumbers: [8],
          startDate: '2021-01-01',
          endDate: '2021-01-31'
        },
        { emitEvent: false }
      );

      component.aircraftWatchlistFilterForm.setValue(
        {
          minNoOfFlights: 0,
          minTotalGroundStay: 0,
          minIndividualGroundStay: 0,
          minCurrentGroundStay: 0,
          maxCurrentGroundStay: 0,
          maxIndividualGroundStay: 0,
          filterByOptions: []
        },
        { emitEvent: false }
      );

      // Trigger subject in your component to emulate combined latest streams
      component.ngOnInit();

      expect(assetWatchServiceSpy.getAssetWatchListGrid).toHaveBeenCalledTimes(1);

      // Test when isModal is false
      component.isModal = false;
      fixture.detectChanges();

      // Set values and allowing emitting events
      component.filterPanelForm.patchValue({ regions: ['7'] }, { emitEvent: true });
      component.aircraftWatchlistFilterForm.patchValue({ minNoOfFlights: 1 }, { emitEvent: true });

      // Trigger subject in your component to emulate combined latest streams
      component.ngOnInit();

      // Expectations for the case when isModal is false
      const requestWhenNotModal = new AssetWatchGridRequest(
        component.filterPanelForm,
        component.selectedTimePeriodControl,
        portfolios[0].id,
        component.aircraftWatchlistFilterForm
      );
      expect(assetWatchServiceSpy.getAssetWatchListGrid).toHaveBeenCalledWith(requestWhenNotModal);
    });
  });

  describe('on filter criteria change api should be called with skip value 0', () => {
    it('on timeperiod change', () => {
      fixture.detectChanges();
      component.selectedTimePeriodControl.setValue(TimePeriodOption.Last6Months, { emitEvent: false });
      component.selectedTimePeriodControl.setValue(TimePeriodOption.Last1Month, { emitEvent: true });
      component.filterPanelForm.controls.operators.setValue([1], { emitEvent: true });
      component.aircraftWatchlistFilterForm.controls.minNoOfFlights.setValue(1, { emitEvent: true });
      fixture.detectChanges();
      const request = new AssetWatchGridRequest(
        component.filterPanelForm,
        component.selectedTimePeriodControl,
        portfolios[0].id,
        component.aircraftWatchlistFilterForm
      );
      expect(assetWatchServiceSpy.getAssetWatchListGrid).toHaveBeenCalledWith(request);
    });
  });

  describe('sortComparisionWithOrder', () => {
    it('should compare numbers correctly', () => {
      const mockSortEvent: SortEvent = { order: 1 };
      const result = component.sortComparisionWithOrder(mockSortEvent, 10, 20);
      expect(result).toEqual(-1);
    });
  });

  describe('convertToType', () => {
    it('should convert numbers correctly', () => {
      const result = component.convertToType('100');
      expect(result).toEqual(100);
    });
  });

  describe('customSortForAircraftSerialNumber', () => {
    it('should sort strings correctly for ascending sorting', () => {
      const obj1 = { aircraftSerialNumber: 'abc' } as AssetWatchGridModel;
      const obj2 = { aircraftSerialNumber: 'xyz' } as AssetWatchGridModel;
      const mockSortEvent: SortEvent = { data: [obj1, obj2], field: 'aircraftSerialNumber', order: 1 };
      component.sortBy.name = 'aircraftSerialNumber';
      component.gridCustomSort = true;
      spyOn(component, 'customSortForAircraftSerialNumber').and.callThrough();
      component.customSort(mockSortEvent);
      expect(mockSortEvent.data).toEqual([obj1, obj2]);
    });
    it('should sort strings correctly for descending sorting', () => {
      const obj1 = { aircraftSerialNumber: 'abc' } as AssetWatchGridModel;
      const obj2 = { aircraftSerialNumber: 'xyz' } as AssetWatchGridModel;
      const mockSortEvent: SortEvent = { data: [obj1, obj2], field: 'aircraftSerialNumber', order: -1 };
      component.sortBy.name = 'aircraftSerialNumber';
      component.gridCustomSort = true;
      spyOn(component, 'customSortForAircraftSerialNumber').and.callThrough();
      component.customSort(mockSortEvent);
      expect(mockSortEvent.data).toEqual([obj2, obj1]);
    });

    it('should ensure all numeric fields come first for ascending sorting', () => {
      const obj1 = { aircraftSerialNumber: 'abc' } as AssetWatchGridModel;
      const obj2 = { aircraftSerialNumber: '123' } as AssetWatchGridModel;
      const obj3 = { aircraftSerialNumber: 'xyz' } as AssetWatchGridModel;
      const obj4 = { aircraftSerialNumber: '456' } as AssetWatchGridModel;
      const mockSortEvent: SortEvent = { data: [obj1, obj2, obj3, obj4], field: 'aircraftSerialNumber', order: 1 };
      component.sortBy.name = 'aircraftSerialNumber';
      component.gridCustomSort = true;
      spyOn(component, 'customSortForAircraftSerialNumber').and.callThrough();
      component.customSort(mockSortEvent);
      expect(mockSortEvent.data).toEqual([obj2, obj4, obj1, obj3]);
    });

    it('should prioritize string values for descending sorting', () => {
      const obj1 = { aircraftSerialNumber: 'abc' } as AssetWatchGridModel;
      const obj2 = { aircraftSerialNumber: '123' } as AssetWatchGridModel;
      const obj3 = { aircraftSerialNumber: 'xyz' } as AssetWatchGridModel;
      const obj4 = { aircraftSerialNumber: '456' } as AssetWatchGridModel;
      const mockSortEvent: SortEvent = { data: [obj1, obj2, obj3, obj4], field: 'aircraftSerialNumber', order: -1 };
      component.sortBy.name = 'aircraftSerialNumber';
      component.gridCustomSort = true;
      spyOn(component, 'customSortForAircraftSerialNumber').and.callThrough();
      component.customSort(mockSortEvent);
      expect(mockSortEvent.data).toEqual([obj3, obj1, obj4, obj2]);
    });
  });

  describe('customSort', () => {
    it('should handle SortEvent correctly for aircraftSerialNumber', () => {
      const mockSortEvent: SortEvent = { data: ['aircraftSerialNumber1', 'aircraftSerialNumber2'], field: 'aircraftSerialNumber' };
      component.sortBy.name = 'aircraftSerialNumber';
      component.gridCustomSort = true;
      spyOn(component, 'customSortForAircraftSerialNumber').and.callThrough();
      component.customSort(mockSortEvent);
      expect(component.customSortForAircraftSerialNumber).toHaveBeenCalled();
    });

    it('should use default primeng sorting for columns other than aircraftSerialNumber', () => {
      const mockSortEvent: SortEvent = { data: ['aircraftSerialNumber1', 'aircraftSerialNumber2'], field: 'registrationNumber' };
      component.sortBy.name = 'registrationNumber';
      component.gridCustomSort = false;
      spyOn(component, 'customSortForAircraftSerialNumber').and.callThrough();
      component.customSort(mockSortEvent);
      expect(component.customSortForAircraftSerialNumber).not.toHaveBeenCalled();
    });
  });

  const portfolios = [
    {
      id: 9,
      name: 'port1',
      dateModified: '',
      dateCreated: '',
      numberOfAircraft: 35
    }
  ];
});
