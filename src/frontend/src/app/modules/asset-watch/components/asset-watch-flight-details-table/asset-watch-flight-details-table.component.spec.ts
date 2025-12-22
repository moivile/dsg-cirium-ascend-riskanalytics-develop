import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableModule } from 'primeng/table';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AssetWatchFlightDetailsTableComponent } from './asset-watch-flight-details-table.component';
import { AssetWatchService } from '../../services/asset-watch.service';
import { AssetWatchFlightDetailsTableService } from './asset-watch-flight-details-table.service';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { AssetWatchGridRequest } from '../../models/asset-watch-grid-request';
import { AssetWatchExportExcelService } from '../../services/asset-watch-export-excel.service';
import { ExportExcelService } from 'src/app/modules/shared/services/export-excel-service';
import { AssetWatchStore } from '../../services/asset-watch-store';
import { AppStore } from 'src/app/app-store';
import { PortfoliosService } from 'src/app/modules/shared/services/portfolios.service';
import { of } from 'rxjs';
import { AppUserService } from '../../../../app-user.service';
import { ElementRef } from '@angular/core';

describe('AssetWatchFlightDetailsTableComponent', () => {
  let component: AssetWatchFlightDetailsTableComponent;
  let fixture: ComponentFixture<AssetWatchFlightDetailsTableComponent>;
  let assetWatchServiceSpy: AssetWatchService;
  let assetWatchDetailsTableServiceSpy: AssetWatchFlightDetailsTableService;
  let appStore: AppStore;
  let portfoliosServiceSpy: jasmine.SpyObj<PortfoliosService>;

  beforeEach(() => {
    assetWatchDetailsTableServiceSpy = jasmine.createSpyObj('AssetWatchFlightDetailsTableService', ['setupTableHeaders']);
    assetWatchServiceSpy = jasmine.createSpyObj('AssetWatchService', [
      'getMaintenanceActivityData',
      'getAssetWatchFilterData',
      'getAssetWatchListGrid',
      'getParams',
      'getFlightDetailsData'
    ]);
    portfoliosServiceSpy = jasmine.createSpyObj('PortfoliosService', ['getPortfolios']);
    TestBed.configureTestingModule({
      imports: [TableModule],
      declarations: [AssetWatchFlightDetailsTableComponent],
      providers: [
        DynamicDialogConfig,
        { provide: AssetWatchService, useValue: assetWatchServiceSpy },
        { provide: AssetWatchFlightDetailsTableService, useValue: assetWatchDetailsTableServiceSpy },
        { provide: PortfoliosService, useValue: portfoliosServiceSpy },
        AssetWatchExportExcelService,
        ExportExcelService,
        AssetWatchStore,
        AppStore,
        MessageService,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } },
      ]
    });
    fixture = TestBed.createComponent(AssetWatchFlightDetailsTableComponent);
    appStore = TestBed.inject(AppStore);
    component = fixture.componentInstance;
    portfoliosServiceSpy.getPortfolios.and.returnValue(of(portfolios));
    appStore.loadPortfolios();
    appStore.setSelectedPortfolioId(portfolios[0].id);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('table headers should be defined on ngOnInit', () => {
    component.ngOnInit();
    expect(component.tableHeaders).toBeDefined();
  });

  it('pop-up header text should have aircraft serial number', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };
    component.recordCount = 20;
    component.ngOnInit();
    fixture.detectChanges();
    const h5Element: HTMLElement = fixture.nativeElement.querySelector('h5');
    expect(h5Element.textContent).toContain(component.dynamicDialogConfig.data.rowValue.aircraftSerialNumber);
  });
  it('pop-up header text should have aircraft registration number', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };
    component.recordCount = 20;
    component.ngOnInit();
    fixture.detectChanges();
    const h5Element: HTMLElement = fixture.nativeElement.querySelector('h5');
    expect(h5Element.textContent).toContain(component.dynamicDialogConfig.data.rowValue.aircraftRegistrationNumber);
  });
  it('pop-up header text should have aircraft series', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftSeries: '737 - 800',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };
    component.recordCount = 20;
    component.ngOnInit();
    fixture.detectChanges();
    const h5Element: HTMLElement = fixture.nativeElement.querySelector('h5');
    expect(h5Element.textContent).toContain(component.dynamicDialogConfig.data.rowValue.aircraftSeries);
  });

  it('pop-up header text should have aircraft record count', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };
    component.recordCount = 20;
    component.ngOnInit();
    fixture.detectChanges();
    const h5Element: HTMLElement = fixture.nativeElement.querySelector('h5');
    expect(h5Element.textContent).toContain(component.recordCount);
  });

  it('fetch flight details data on ngOnInit', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };

    component.ngOnInit();
    const lazyLoadEvent: LazyLoadEvent = {
      first: 0,
      rows: 50,
      sortField: 'columnName',
      sortOrder: -1,
      filters: {
        columnName: {
          value: 'yourFilterValue',
          matchMode: 'contains'
        }
      }
    };
    const request = new AssetWatchGridRequest(
      component.dynamicDialogConfig.data.filterPanelForm,
      component.dynamicDialogConfig.data.selectedTimePeriodControl,
      component.dynamicDialogConfig.data.selectedPortfolioId,
      component.dynamicDialogConfig.data.aircraftWatchlistFilterForm,
      component.pageNumber,
      component.pageSize
    );
    component.tableLazyLoad(lazyLoadEvent, 'col', true);
    expect(assetWatchServiceSpy.getFlightDetailsData).toHaveBeenCalledWith(
      request,
      component.dynamicDialogConfig.data.rowValue.aircraftId,
      'col',
      'DESC'
    );
  });

  it('excel export check for all records', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };
    const request = new AssetWatchGridRequest(
      component.dynamicDialogConfig.data.filterPanelForm,
      component.dynamicDialogConfig.data.selectedTimePeriodControl,
      component.dynamicDialogConfig.data.selectedPortfolioId,
      component.dynamicDialogConfig.data.aircraftWatchlistFilterForm,
      component.pageNumber,
      component.recordCount
    );
    component.exportExcel();
    expect(assetWatchServiceSpy.getFlightDetailsData).toHaveBeenCalledWith(request, 40879, component.columnName, component.sortOrder);
  });

  it('fetch flight details data on ngOnInit', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };

    component.ngOnInit();
    const lazyLoadEvent: LazyLoadEvent = {
      first: 0,
      rows: 50,
      sortField: 'columnName',
      sortOrder: -1,
      filters: {
        columnName: {
          value: 'yourFilterValue',
          matchMode: 'contains'
        }
      }
    };
    const request = new AssetWatchGridRequest(
      component.dynamicDialogConfig.data.filterPanelForm,
      component.dynamicDialogConfig.data.selectedTimePeriodControl,
      component.dynamicDialogConfig.data.selectedPortfolioId,
      component.dynamicDialogConfig.data.aircraftWatchlistFilterForm,
      component.pageNumber,
      component.pageSize
    );
    component.tableLazyLoad(lazyLoadEvent, 'col', true);
    expect(assetWatchServiceSpy.getFlightDetailsData).toHaveBeenCalledWith(
      request,
      component.dynamicDialogConfig.data.rowValue.aircraftId,
      'col',
      'DESC'
    );
  });

  it('excel export check for all records', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };
    const request = new AssetWatchGridRequest(
      component.dynamicDialogConfig.data.filterPanelForm,
      component.dynamicDialogConfig.data.selectedTimePeriodControl,
      component.dynamicDialogConfig.data.selectedPortfolioId,
      component.dynamicDialogConfig.data.aircraftWatchlistFilterForm,
      component.pageNumber,
      component.recordCount
    );
    component.exportExcel();
    expect(assetWatchServiceSpy.getFlightDetailsData).toHaveBeenCalledWith(request, 40879, component.columnName, component.sortOrder);
  });

  it('getFlightDetailData with getExcelData as false, loading should be true', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };
    component.getFlightDetailData(component.pageNumber, component.pageSize, false, component.columnName, component.sortOrder);
    expect(component.loading).toBeTruthy();
  });

  it('getFlightDetailData with getExcelData as true, loading should be false', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };
    component.getFlightDetailData(component.pageNumber, component.pageSize, true, component.columnName, component.sortOrder);
    expect(component.loading).toBeFalsy();
  });

  it('getExcelData as true, make service call with recordCount instead of pageSize', () => {
    component.dynamicDialogConfig.data = {
      aircraftWatchlistFilterForm: {
        value: {
          maintenanceActivity: null,
          minIndividualGroundStay: 0,
          maxIndividualGroundStay: 0,
          minNoOfFlights: 0,
          minTotalGroundStay: 0
        }
      },
      filterPanelForm: {
        value: {
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          countries: [],
          endDate: '2023-10-17',
          engineSeries: [],
          lessors: [],
          operators: [],
          regions: [],
          startDate: '2023-10-10'
        }
      },
      rowValue: {
        aircraftId: 40879,
        aircraftRegistrationNumber: '9M-MXA',
        aircraftSerialNumber: '40128',
        aircraftType: '737 NG',
        maintenanceActivity: null,
        managerName: 'Malaysia Airlines',
        numberOfFlights: 23,
        timesBetweenMinMaxIndGroundStay: 23,
        operatorName: 'Malaysia Airlines',
        totalGroundStayHours: 60
      },
      selectedPortfolioId: portfolios[0].id,
      selectedTimePeriodControl: {
        value: 'Last 7 Days'
      }
    };
    component.pageSize = 50;
    component.recordCount = 200;
    const request = new AssetWatchGridRequest(
      component.dynamicDialogConfig.data.filterPanelForm,
      component.dynamicDialogConfig.data.selectedTimePeriodControl,
      component.dynamicDialogConfig.data.selectedPortfolioId,
      component.dynamicDialogConfig.data.aircraftWatchlistFilterForm,
      component.pageNumber,
      component.recordCount
    );
    component.columnName = 'Col';
    component.sortOrder = 'ASC';
    component.getFlightDetailData(component.pageNumber, component.pageSize, true, component.columnName, component.sortOrder);
    expect(assetWatchServiceSpy.getFlightDetailsData).toHaveBeenCalledWith(request, 40879, 'Col', 'ASC');
  });

  describe('showSortIcon', () => {
    beforeEach(() => {
      component.flightDetailsTableContainer = new ElementRef({
        querySelectorAll: () => [
          { style: { display: 'block' }, classList: { contains: () => true } },
          { style: { display: 'block' }, classList: { contains: () => true } },
          { style: { display: 'block' }, classList: { contains: () => true } },
        ],
      });
    });

    it('should hide all sort icons except the selected one', () => {
      const mockSortIcons = [
        { style: { display: 'block' }, classList: { contains: () => true } },
        { style: { display: 'block' }, classList: { contains: () => true } },
        { style: { display: 'block' }, classList: { contains: () => true } },
      ];
      component.flightDetailsTableContainer = new ElementRef({
        querySelectorAll: () => mockSortIcons,
      });

      component.showSortIcon('Flight', 1);

      expect(mockSortIcons[0].style.display).toBe('none');
      expect(mockSortIcons[1].style.display).toBe('block');
      expect(mockSortIcons[2].style.display).toBe('none');
    });

    it('should not proceed if flightDetailsTableContainer is null', () => {
      component.flightDetailsTableContainer = new ElementRef(null); // Explicitly set to null
      const mockSortIcons = [
        { style: { display: 'block' }, classList: { contains: () => true } },
        { style: { display: 'block' }, classList: { contains: () => true } },
        { style: { display: 'block' }, classList: { contains: () => true } },
      ];

      component.showSortIcon('Flight', 1);

      expect(mockSortIcons[0].style.display).toBe('block');
      expect(mockSortIcons[1].style.display).toBe('block');
      expect(mockSortIcons[2].style.display).toBe('block');
    });
  });

  const portfolios = [
    {
      dateCreated: '2023-04-27T07:49:15.424666',
      dateModified: '2023-04-27T07:49:15.42374',
      id: 11,
      name: 'American Airlines',
      numberOfAircraft: 49,
      userId: 'auth0|61801cdfbe378400715e6769'
    }
  ];
});
