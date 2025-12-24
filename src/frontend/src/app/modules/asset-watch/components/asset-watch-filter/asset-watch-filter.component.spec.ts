import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { AssetWatchFilterComponent } from './asset-watch-filter.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AssetWatchService } from '../../services/asset-watch.service';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FilterPanelForm, dateFormat } from '../../models/filter-panel-form';
import { Portfolio } from '../../../shared/models/portfolio';
import { of, Subject } from 'rxjs';
import { PortfoliosService } from '../../../shared/services/portfolios.service';
import { FilterPanelFormOptions } from '../../models/filter-panel-form-options';
import { AircraftWatchlistFilterValues } from '../../models/aircraft-watchlist-filter-values';
import { TimePeriodOption, getFilterPanelFormEndDate, getFilterPanelFormStartDate } from '../../models/time-period-option';
import { AssetWatchStore } from '../../services/asset-watch-store';
import { AppStore } from 'src/app/app-store';
import { MessageService, TreeNode } from 'primeng/api';
import { AppUserService } from '../../../../app-user.service';
import { AircraftWatchlistFilterForm } from '../../models/aircraft-watchlist-filter-form';
import { SavedSearchModel } from '../../models/saved-search-model';
import { FilterByWatchlistOption } from '../../models/filter-by-watchlist-option';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AssetWatchFilterComponent', () => {
  let component: AssetWatchFilterComponent;
  let fixture: ComponentFixture<AssetWatchFilterComponent>;
  let assetWatchServiceSpy: jasmine.SpyObj<AssetWatchService>;
  let portfoliosServiceSpy: jasmine.SpyObj<PortfoliosService>;
  let activatedRoute: any;
  let appStore: AppStore;

  beforeEach(() => {
    assetWatchServiceSpy = jasmine.createSpyObj('AssetWatchService', [
      'getAssetWatchFilterData',
      'getCitiesData',
      'getAirportsData',
      'getMaintenanceActivityData',
      'getCountriesData'
    ]);
    portfoliosServiceSpy = jasmine.createSpyObj('PortfoliosService', ['getPortfolios']);

    TestBed.configureTestingModule({
      declarations: [AssetWatchFilterComponent],
      imports: [MultiSelectModule,
        DatePickerModule,
        SelectModule,
        CheckboxModule,
        FormsModule,
        ReactiveFormsModule],
      providers: [
        { provide: AssetWatchService, useValue: assetWatchServiceSpy },
        { provide: PortfoliosService, useValue: portfoliosServiceSpy },
        AssetWatchStore,
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => null }),
            snapshot: { paramMap: { get: () => null } }
          }
        },
        AppStore,
        MessageService,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    activatedRoute = TestBed.inject(ActivatedRoute);
    appStore = TestBed.inject(AppStore);
    portfoliosServiceSpy.getPortfolios.and.returnValue(of(portfolios));
    assetWatchServiceSpy.getAssetWatchFilterData.and.returnValue(of(filterOptions));
    (assetWatchServiceSpy.getCitiesData as jasmine.Spy).and.returnValue(of([]));
    (assetWatchServiceSpy.getAirportsData as jasmine.Spy).and.returnValue(of([]));
    assetWatchServiceSpy.getMaintenanceActivityData.and.returnValue(of([]));
    fixture = TestBed.createComponent(AssetWatchFilterComponent);
    component = fixture.componentInstance;
    component.filterPanelForm = new FormGroup<FilterPanelForm>(new FilterPanelForm());

    component.selectedTimePeriodControl = new FormControl<TimePeriodOption>(TimePeriodOption.Last7Days, { nonNullable: true });
    component.aircraftWatchlistFilterForm = new FormGroup<AircraftWatchlistFilterForm>(new AircraftWatchlistFilterForm());
    component.watchlistFilterValues = { currentGroundStayAOG: null, currentMaxGroundStayAOG: null };
    component.canDeactivate = () => of(true);
    component.triggerOpenSavedSearch$ = new Subject<void>();
    appStore.loadPortfolios();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set filter options when selected portfolio changes', fakeAsync(() => {
    appStore.setSelectedPortfolioId(portfolios[1].id);
    flush();
    expect(component.filterPanelForm.value).toEqual(
      jasmine.objectContaining({
        regions: [],
        countries: [],
        operators: [],
        lessors: [],
        aircraftSeries: [],
        engineSeries: [],
        aircraftSerialNumbers: []
      })
    );
  }));

  it('should set start and end date when time period changes', () => {
    const startDate = getFilterPanelFormStartDate(TimePeriodOption.Last7Days);
    const endDate = getFilterPanelFormEndDate();
    component.selectedTimePeriodControl.setValue(TimePeriodOption.Last7Days);
    expect(component.periodForm.value).toEqual({
      periodFormStartDate: startDate.toDate(),
      periodFormEndDate: endDate.toDate()
    });
    expect(component.filterPanelForm.value).toEqual({
      aircraftSerialNumbers: [],
      aircraftSeries: [],
      engineSeries: [],
      lessors: [],
      operators: [],
      regions: [],
      countries: [],
      routeCategory: null,
      startDate: startDate.format(dateFormat),
      endDate: endDate.format(dateFormat)
    });
  });

  it('should set start and end date when periodForm changes', () => {
    const startDate = getFilterPanelFormStartDate(TimePeriodOption.Last7Days);
    const endDate = getFilterPanelFormEndDate();
    component.periodForm.setValue({
      periodFormStartDate: startDate.toDate(),
      periodFormEndDate: endDate.toDate()
    });
    expect(component.selectedTimePeriodControl.value).toEqual(TimePeriodOption.SelectDateRange);
    expect(component.filterPanelForm.value).toEqual({
      aircraftSerialNumbers: [],
      aircraftSeries: [],
      engineSeries: [],
      lessors: [],
      operators: [],
      regions: [],
      countries: [],
      routeCategory: null,
      startDate: startDate.format(dateFormat),
      endDate: endDate.format(dateFormat)
    });
  });

  it('should reset filters', () => {
    component.resetFilters();

    expect(component.selectedTimePeriodControl.value).toEqual(TimePeriodOption.Last7Days);
    expect(component.periodForm.value).toEqual({
      periodFormStartDate: getFilterPanelFormStartDate(TimePeriodOption.Last7Days).toDate(),
      periodFormEndDate: getFilterPanelFormEndDate().toDate()
    });
    expect(component.filterPanelForm.value).toEqual({
      aircraftSerialNumbers: [],
      aircraftSeries: [],
      engineSeries: [],
      lessors: [],
      operators: [],
      regions: [],
      countries: [],
      routeCategory: null,
      startDate: getFilterPanelFormStartDate(TimePeriodOption.Last7Days).format(dateFormat),
      endDate: getFilterPanelFormEndDate().format(dateFormat)
    });
  });

  it('on init cities dropdown should be disabled', () => {
    component.ngOnInit();
    expect(component.filterPanelForm.controls.cities.disabled).toEqual(true);
  });

  it('on init airports dropdown should be disabled', () => {
    component.ngOnInit();
    expect(component.filterPanelForm.controls.airports.disabled).toEqual(true);
  });

  it('on selection from countries dropdown cities should be enabled', () => {
    component.filterPanelForm.controls.countries.setValue(['1']);
    expect(component.filterPanelForm.controls.cities.enabled).toEqual(true);
  });

  it('on reset from countries dropdown airports as well as cities should be disabled', () => {
    component.filterPanelForm.controls.countries.reset([]);
    expect(component.filterPanelForm.controls.airports.disabled).toEqual(true);
    expect(component.filterPanelForm.controls.cities.disabled).toEqual(true);
  });
  it('should set isStartEndDateFilterVisible to false after resetting filters', () => {
    component.resetFilters();
    expect(component.isStartEndDateFilterVisible).toBeFalse();
  });

  it('should initialize filters correctly', () => {
    expect(component.selectedTimePeriodControl.value).toEqual(TimePeriodOption.Last7Days);
    expect(component.filterPanelForm.controls.startDate.value).toEqual(
      getFilterPanelFormStartDate(TimePeriodOption.Last7Days).format(dateFormat)
    );
    expect(component.filterPanelForm.controls.endDate.value).toEqual(getFilterPanelFormEndDate().format(dateFormat));
  });

  it('should initialize filter panel form with saved search', () => {
    const savedSearch: SavedSearchModel = testSavedSearch;
    component.initFilterPanelFormWithSavedSearch(savedSearch);
    expect(component.filterPanelForm.controls.regions.value).toEqual(savedSearch.regionCodes);
    expect(component.filterPanelForm.controls.startDate.value).toEqual(savedSearch.dateFrom);
    expect(component.filterPanelForm.controls.endDate.value).toEqual(savedSearch.dateTo);
    expect(component.filterPanelForm.controls.operators.value).toEqual(savedSearch.operatorIds);
    expect(component.filterPanelForm.controls.lessors.value).toEqual(savedSearch.lessorIds);
    expect(component.filterPanelForm.controls.aircraftSeries.value).toEqual(savedSearch.aircraftSeriesIds);
    expect(component.filterPanelForm.controls.engineSeries.value).toEqual(savedSearch.engineSerieIds);
    expect(component.filterPanelForm.controls.aircraftSerialNumbers.value).toEqual(savedSearch.aircraftIds);
    expect(component.filterPanelForm.controls.countries.value).toEqual(savedSearch.countryCodes);
  });

  it('should initialize aircraft watchlist filter form with saved search', () => {
    const savedSearch = testSavedSearch;

    const maintenanceActivityTreeNode: TreeNode = {
      key: FilterByWatchlistOption[FilterByWatchlistOption.MaintenanceActivity],
      label: FilterByWatchlistOption.MaintenanceActivity.toString(),
      children: []
    };

    component.initAircraftWatchlistFilterFormWithSavedSearch(savedSearch, maintenanceActivityTreeNode, true);
    expect(component.aircraftWatchlistFilterForm.controls.minCurrentGroundStay.value).toEqual(savedSearch.minCurrentGroundStay);
    expect(component.aircraftWatchlistFilterForm.controls.minNoOfFlights.value).toEqual(savedSearch.minNoOfFlights);
    expect(component.aircraftWatchlistFilterForm.controls.minTotalGroundStay.value).toEqual(savedSearch.minTotalGroundStay);
    expect(component.aircraftWatchlistFilterForm.controls.minIndividualGroundStay.value).toEqual(savedSearch.minIndividualGroundStay);
    expect(component.aircraftWatchlistFilterForm.controls.maxIndividualGroundStay.value).toEqual(savedSearch.maxIndividualGroundStay);
  });

  it('should initialize filter panel form with default values', () => {
    component.initFilterPanelFormWithDefaultValues();
    expect(component.filterPanelForm.controls.startDate.value).toEqual(
      getFilterPanelFormStartDate(TimePeriodOption.Last7Days).format(dateFormat)
    );
    expect(component.filterPanelForm.controls.endDate.value).toEqual(getFilterPanelFormEndDate().format(dateFormat));
  });

  it('should initialize aircraft watchlist filter form with default values', () => {
    component.initAircraftWatchlistFilterFormWithDefaultValues(true);
    expect(component.aircraftWatchlistFilterForm.controls.minCurrentGroundStay.value).toEqual(0);
    expect(component.aircraftWatchlistFilterForm.controls.minNoOfFlights.value).toEqual(0);
    expect(component.aircraftWatchlistFilterForm.controls.minTotalGroundStay.value).toEqual(0);
    expect(component.aircraftWatchlistFilterForm.controls.minIndividualGroundStay.value).toEqual(0);
    expect(component.aircraftWatchlistFilterForm.controls.maxIndividualGroundStay.value).toEqual(0);
  });

  it('should call canDeactivate with previousPortfolioId when setSelectedPortfolioId is called', fakeAsync(() => {
    const previousPortfolioId = 1;
    const currentPortfolioId = 2;

    spyOn(component, 'canDeactivate').and.returnValue(of(true));

    appStore.setSelectedPortfolioId(previousPortfolioId);
    appStore.setSelectedPortfolioId(currentPortfolioId);

    flush();

    expect(component.canDeactivate).toHaveBeenCalledWith(previousPortfolioId);
  }));
});

const portfolios = [
  { id: 1, name: 'Portfolio 1' },
  { id: 2, name: 'Portfolio 2' }
] as Portfolio[];

const filterOptions = {
  operators: [
    { id: 350501, name: 'AerSale' },
    { id: -353, name: 'American Airlines' }
  ],
  regions: [
    { id: '350501', name: 'Europe' },
    { id: '-353', name: 'Asia' }
  ],
  lessors: [
    { id: 566280, name: 'ABL Aviation' },
    { id: 420399, name: 'AerCap' }
  ],
  aircraftSeries: [
    { id: 269, name: '707-120' },
    { id: 270, name: '707-120B' }
  ],
  engineSeries: [
    { id: 269, name: 'CF34-8E' },
    { id: 270, name: 'CF6-50C' }
  ],
  aircraftSerialNumbers: [
    { id: 762, name: '0762 (A320)' },
    { id: 803, name: '0803 (A320)' }
  ],
  countries: [
    { id: '350501', name: 'United States' },
    { id: '-353', name: 'Canada' }
  ]
} as FilterPanelFormOptions;

const testSavedSearch: SavedSearchModel = {
  id: 66,
  portfolioId: 224,
  portfolioName: '777 737',
  name: 'Test Saved Searches',
  description: '',
  isActive: true,
  userId: 'auth0|61801cdfbe378400715e6769',
  dateCreated: new Date('2024-07-10'),
  dateModified: new Date('2024-07-13'),
  maintenanceActivityIds: [],
  minNoOfFlights: 0,
  minTotalGroundStay: 0,
  minIndividualGroundStay: 0,
  minCurrentGroundStay: 12,
  maxCurrentGroundStay: 15,
  maxIndividualGroundStay: 0,
  showAircraftOnGround: true,
  regionCodes: ['350501'],
  period: 'SelectDateRange',
  routeCategory: 'International',
  dateFrom: '2024-01-10',
  dateTo: '2024-07-08',
  operatorIds: [350501, -353],
  lessorIds: [566280, 420399],
  aircraftSeriesIds: [269, 270],
  engineSerieIds: [269, 270],
  aircraftIds: [762, 803],
  countryCodes: ['350501', '-353'],
  cityIds: ['350501', '-353'],
  airportCodes: ['350501', '-353']
} as unknown as SavedSearchModel;
