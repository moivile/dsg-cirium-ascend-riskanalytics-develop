import { TestBed } from '@angular/core/testing';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AssetWatchSavedSearchFiltersViewComponent } from './asset-watch-saved-search-filters-view.component';
import { FilterPanelFormOptions } from '../../models/filter-panel-form-options';
import { IdNamePairModel } from '../../../shared/models/id-name-pair-model';
import { SavedSearchModel } from '../../models/saved-search-model';

describe('AssetWatchSavedSearchFiltersViewComponent', () => {
  let component: AssetWatchSavedSearchFiltersViewComponent;
  let dynamicDialogConfigMock: Partial<DynamicDialogConfig>;

  beforeEach(() => {
    dynamicDialogConfigMock = {
      data: {
        savedSearch: testSavedSearchModel,
        filterOptions: testFilterPanelFormOptions
      }
    };

    TestBed.configureTestingModule({
      providers: [AssetWatchSavedSearchFiltersViewComponent, { provide: DynamicDialogConfig, useValue: dynamicDialogConfigMock }]
    });
    component = TestBed.inject(AssetWatchSavedSearchFiltersViewComponent);
  });

  describe('convertToSavedSearchFilters', () => {
    it('should populate savedSearchCriteriaList based on savedSearch and filterOptions', () => {
      component.savedSearch = testSavedSearchModel;
      component.filterOptions = {
        regions: [{ id: '1', name: 'Region 1' }],
        countries: [],
        cities: [],
        airports: [],
        operators: [],
        lessors: [],
        aircraftSeries: [],
        engineSeries: [],
        aircraftSerialNumbers: [],
        maintenanceActivities: []
      } as FilterPanelFormOptions;

      component.convertToSavedSearchFilters(component.savedSearch);

      expect(component.savedSearchCriteriaList.length).toBeGreaterThan(0);

      expect(component.savedSearchCriteriaList).toEqual(
        jasmine.arrayContaining([
          jasmine.objectContaining({ criteria: 'Portfolio', selection: 'Global Portfolio' }),
          jasmine.objectContaining({ criteria: 'Regions', selection: 'Asia, Europe, North America' }),
          jasmine.objectContaining({ criteria: 'Countries/Subregions', selection: 'Germany, Japan, United States' }),
          jasmine.objectContaining({ criteria: 'Cities', selection: 'Berlin, New York, Tokyo' }),
          jasmine.objectContaining({
            criteria: 'Airports',
            selection: 'Berlin Tegel Airport, JFK International Airport, Tokyo Haneda Airport'
          }),
          jasmine.objectContaining({ criteria: 'Route Category', selection: 'International' }),
          jasmine.objectContaining({ criteria: 'Operator', selection: 'All Nippon Airways, American Airlines, Lufthansa' }),
          jasmine.objectContaining({
            criteria: 'Lessor',
            selection: 'Air Lease Corporation, GE Capital Aviation Services, SMBC Aviation Capital'
          }),
          jasmine.objectContaining({ criteria: 'Aircraft Series', selection: 'Airbus A320, Boeing 737, Embraer E-Jet' }),
          jasmine.objectContaining({ criteria: 'Engine Series', selection: 'CFM56, GE90, V2500' }),
          jasmine.objectContaining({ criteria: 'Serial', selection: 'SN12345, SN54321, SN67890' }),
          jasmine.objectContaining({ criteria: 'Min. No. of Flights', selection: '50' }),
          jasmine.objectContaining({ criteria: 'Min. Total Ground Stay', selection: '120' }),
          jasmine.objectContaining({ criteria: 'Min. Individual Ground Stay', selection: '24' }),
          jasmine.objectContaining({ criteria: 'Max. Individual Ground Stay', selection: '50' }),
          jasmine.objectContaining({ criteria: 'Min. Current Ground Stay (Hours)', selection: '6' }),
          jasmine.objectContaining({ criteria: 'Current AOG', selection: 'Yes' }),
          jasmine.objectContaining({ criteria: 'Maintenance Activity', selection: 'A Check, C Check' })
        ])
      );
    });
  });

  describe('getNames', () => {
    it('should return correct criteria and selection for given ids and options', () => {
      const ids = [1, 2];
      const options: IdNamePairModel[] = [
        { id: 1, name: 'Option 1' },
        { id: 2, name: 'Option 2' }
      ];

      const result = component['getNames']('Test Criteria', ids, options);

      expect(result.criteria).toEqual('Test Criteria');
      expect(result.selection).toEqual('Option 1, Option 2');
    });
  });

  const testSavedSearchModel: SavedSearchModel = {
    id: 123,
    name: 'Comprehensive Test Search',
    portfolioName: 'Global Portfolio',
    regionCodes: ['1', '2', '3'],
    countryCodes: ['10', '20', '30'],
    cities: ['100', '200', '300'],
    airportCodes: ['1000', '2000', '3000'],
    routeCategory: 'International',
    period: 'LastYear',
    dateFrom: '2022-0-1',
    dateTo: '2022-11-31',
    operatorIds: [111, 222, 333],
    lessorIds: [1111, 2222, 3333],
    aircraftSeriesIds: [11111, 22222, 33333],
    engineSerieIds: [111111, 222222, 333333],
    aircraftIds: [1111111, 2222222, 3333333],
    minNoOfFlights: 50,
    minTotalGroundStay: 120, // in hours
    minIndividualGroundStay: 24, // in hours
    minCurrentGroundStay: 6, // in hours
    maxCurrentGroundStay: 12, // in hours
    maxIndividualGroundStay: 50, // in hours
    showAircraftOnGround: true,
    maintenanceActivityIds: [12345, 67890],
    isActive: false,
    userId: '',
    dateCreated: new Date(),
    dateModified: new Date(),
    portfolioId: 0,
    displayMaintenanceActivity: false
  };

  const testFilterPanelFormOptions: FilterPanelFormOptions = {
    regions: [
      { id: '1', name: 'North America' },
      { id: '2', name: 'Europe' },
      { id: '3', name: 'Asia' }
    ],
    countries: [
      { id: '10', name: 'United States', regionCode: '1' },
      { id: '20', name: 'Germany', regionCode: '7' },
      { id: '30', name: 'Japan', regionCode: '3' }
    ],
    cities: [
      { id: '100', name: 'New York' },
      { id: '200', name: 'Berlin' },
      { id: '300', name: 'Tokyo' }
    ],
    airports: [
      { id: '1000', name: 'JFK International Airport' },
      { id: '2000', name: 'Berlin Tegel Airport' },
      { id: '3000', name: 'Tokyo Haneda Airport' }
    ],
    operators: [
      { id: 111, name: 'American Airlines' },
      { id: 222, name: 'Lufthansa' },
      { id: 333, name: 'All Nippon Airways' }
    ],
    lessors: [
      { id: 1111, name: 'Air Lease Corporation' },
      { id: 2222, name: 'GE Capital Aviation Services' },
      { id: 3333, name: 'SMBC Aviation Capital' }
    ],
    aircraftSeries: [
      { id: 11111, name: 'Boeing 737' },
      { id: 22222, name: 'Airbus A320' },
      { id: 33333, name: 'Embraer E-Jet' }
    ],
    engineSeries: [
      { id: 111111, name: 'CFM56' },
      { id: 222222, name: 'V2500' },
      { id: 333333, name: 'GE90' }
    ],
    aircraftSerialNumbers: [
      { id: 1111111, name: 'SN12345' },
      { id: 2222222, name: 'SN67890' },
      { id: 3333333, name: 'SN54321' }
    ],
    maintenanceActivities: [
      { id: 12345, name: 'A Check' },
      { id: 67890, name: 'C Check' }
    ]
  };
});
