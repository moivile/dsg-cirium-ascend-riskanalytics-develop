import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Filter, PortfolioOverviewFilterService } from './portfolio-overview-filter.service';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { PortfolioAircraftService } from '../../../shared/services/portfolio-aircraft.service';
import { Aircraft } from '../../../shared/models/aircraft';

describe('PortfolioOverviewFilterService', () => {

  let service: PortfolioOverviewFilterService;
  let mockRouter: any;
  let portfolioOverviewStoreSpy: PortfolioOverviewStore;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('mockRouter', ['url']);
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfolioAircraftService', ['getPortfolioAircraft']);
    portfolioOverviewStoreSpy = jasmine.createSpyObj<PortfolioOverviewStore>('PortfolioOverviewStore', ['setSortBy', 'getSortOptionByKey']);

    TestBed.configureTestingModule({
      providers: [
        PortfolioOverviewFilterService,
        { provide: Router, useValue: mockRouter },
        { provide: PortfolioOverviewStore, useValue: portfolioOverviewStoreSpy },
        { provide: PortfolioAircraftService, useValue: portfoliosServiceSpy }
      ]
    });

    service = TestBed.inject(PortfolioOverviewFilterService);

  });

  describe('filter', () => {
    it('returns filtered data', () => {
      // arrange
      const fleet: Aircraft[] = [
        {
          aircraftFamily: 'DC-4 Family',
          status: 'Storage'
        },
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option'
        },
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option'
        },
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option'
        }
      ] as Aircraft[];

      const filters: Filter[] = [
        {
          displayName: 'Status',
          filterName: 'status',
          selectedFilters: ['LOI to Option'],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: 'In Service', count: 1103 },
            { name: 'Storage', count: 291 },
            { name: 'On Order', count: 219 },
            { name: 'LOI to Option', count: 118 },
            { name: 'On Option', count: 59 }],
          showMore: false,
          filterOptionsCount: 0,
          filterNames: []
        }
      ];

      // act
      const filteredFleet = service.filterFleetData(fleet, filters);

      // assert
      const expectedFilteredFleet = [
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option'
        },
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option'
        },
        {
          aircraftFamily: '787 Family',
          status: 'LOI to Option'
        }
      ] as Aircraft[];

      expect(filteredFleet).toEqual(expectedFilteredFleet);
    });
  });

  describe('getFleetsFilterOptions', () => {
    it('gets available filterOptions from fleet', () => {
      // arrange
      const fleet: Aircraft[] = [
        {
          aircraftFamily: 'DC-4 Family',
          aircraftManufacturer: 'Boeing (McDonnell-Douglas)',
          aircraftMarketClass: 'Utility Pistons',
          aircraftType: 'DC-4',
          engineSeries: 'R-2000 Twin Wasp',
          operator: 'American Airlines',
          status: 'Storage',
          lessorOrganization: 'Lessor'
        },
        {
          aircraftFamily: '787 Family',
          aircraftManufacturer: 'Boeing',
          aircraftMarketClass: 'Widebody Jets',
          aircraftType: '787',
          engineSeries: 'GEnx 1B70',
          operator: 'American Airlines',
          status: 'LOI to Option',
          lessorOrganization: 'Lessor'
        },
        {
          aircraftFamily: '787 Family',
          aircraftManufacturer: 'Boeing',
          aircraftMarketClass: 'Widebody Jets',
          aircraftType: '787',
          engineSeries: 'GEnx 1B70',
          operator: 'American Airlines',
          status: 'LOI to Option',
          lessorOrganization: 'Lessor'
        },
        {
          aircraftFamily: '787 Family',
          aircraftManufacturer: 'Boeing',
          aircraftMarketClass: 'Widebody Jets',
          aircraftType: '787',
          engineSeries: 'GEnx 1B70',
          operator: 'American Airlines',
          status: 'LOI to Option',
          lessorOrganization: 'Lessor'
        }
      ] as Aircraft[];

      mockRouter.url = `airlines/-353/fleet`;
      // act
      const filterOptions = service.getFleetsFilterOptions(fleet);

      // assert
      const expectedFilterOptions = [
        {
          displayName: 'Operator',
          filterName: 'operator',
          selectedFilters: [],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: 'American Airlines', count: 4 }
          ],
          showMore: false,
          filterOptionsCount: 1,
          filterNames: []
        },
        {
          displayName: 'Lessor',
          filterName: 'lessorOrganization',
          selectedFilters: [],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: 'Lessor', count: 4 }
          ],
          showMore: false,
          filterOptionsCount: 1,
          filterNames: []
        },
        {
          displayName: 'Status',
          filterName: 'status',
          selectedFilters: [],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: 'LOI to Option', count: 3 },
            { name: 'Storage', count: 1 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
        {
          displayName: 'Aircraft Manufacturer',
          filterName: 'aircraftManufacturer',
          selectedFilters: [],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: 'Boeing', count: 3 },
            { name: 'Boeing (McDonnell-Douglas)', count: 1 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
        {
          displayName: 'Aircraft Market Class',
          filterName: 'aircraftMarketClass',
          selectedFilters: [],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: 'Widebody Jets', count: 3 },
            { name: 'Utility Pistons', count: 1 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
        {
          displayName: 'Aircraft Family',
          filterName: 'aircraftFamily',
          selectedFilters: [],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: '787 Family', count: 3 },
            { name: 'DC-4 Family', count: 1 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
        {
          displayName: 'Aircraft Type',
          filterName: 'aircraftType',
          selectedFilters: [],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: '787', count: 3 },
            { name: 'DC-4', count: 1 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
        {
          displayName: 'Engine Series',
          filterName: 'engineSeries',
          selectedFilters: [],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: 'GEnx 1B70', count: 3 },
            { name: 'R-2000 Twin Wasp', count: 1 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        }
      ];

      expect(filterOptions).toEqual(expectedFilterOptions);
    });
  });

  describe('updateFilterOptions', () => {
    it('updates filterOptions in descending order', () => {
      // arrange
      const fleet: Aircraft[] = [
        {
          aircraftFamily: '737 Family',
          aircraftMarketClass: 'Narrowbody Jets'
        },
        {
          aircraftFamily: '787 Family',
          aircraftMarketClass: 'Widebody Jets'
        },
        {
          aircraftFamily: '787 Family',
          aircraftMarketClass: 'Widebody Jets'
        },
        {
          aircraftFamily: '787 Family',
          aircraftMarketClass: 'Widebody Jets'
        }
      ] as Aircraft[];

      const filters: Filter[] = [
        {
          displayName: 'Aircraft Family',
          filterName: 'aircraftFamily',
          selectedFilters: ['787 Family'],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: '737 Family', count: 1 },
            { name: '787 Family', count: 3 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
        {
          selectedFilters: [],
          defaultSelectedFilters: [],
          displayName: 'Aircraft Market Class',
          filterName: 'aircraftMarketClass',
          filterOptions: [
            { name: 'Narrowbody Jets', count: 1 },
            { name: 'Widebody Jets', count: 3 },
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
      ];

      // act
      service.updateFilterOptions(filters, fleet);

      const updatedFilters = filters;

      // assert
      const expectedUpdatedFilters = [
        {
          displayName: 'Aircraft Family',
          filterName: 'aircraftFamily',
          selectedFilters: ['787 Family'],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: '787 Family', count: 3 },
            { name: '737 Family', count: 1 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
        {
          selectedFilters: [],
          defaultSelectedFilters: [],
          displayName: 'Aircraft Market Class',
          filterName: 'aircraftMarketClass',
          filterOptions: [
            { name: 'Widebody Jets', count: 3 },
            { name: 'Narrowbody Jets', count: 0 }
          ],
          showMore: false,
          filterOptionsCount: 1,
          filterNames: []
        }
      ];
      expect(updatedFilters).toEqual(expectedUpdatedFilters);
    });

    it('counts aircraft by filter with all filters applied except current filter', () => {
      // arrange
      const fleet: Aircraft[] = [
        {
          aircraftMarketClass: 'Utility Pistons',
          status: 'Storage'
        },
        {
          aircraftMarketClass: 'Utility Pistons',
          status: 'Storage'
        },
        {
          aircraftMarketClass: 'Widebody Jets',
          status: 'LOI to Option'
        },
        {
          aircraftMarketClass: 'Widebody Jets',
          status: 'LOI to Option'
        }
      ] as Aircraft[];

      const filters: Filter[] = [
        {
          displayName: 'Status',
          filterName: 'status',
          selectedFilters: ['Storage'],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: 'Storage', count: 2 },
            { name: 'LOI to Option', count: 2 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
        {
          selectedFilters: [],
          defaultSelectedFilters: [],
          displayName: 'Aircraft Market Class',
          filterName: 'aircraftMarketClass',
          filterOptions: [
            { name: 'Utility Pistons', count: 2 },
            { name: 'Widebody Jets', count: 2 },
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
      ];

      // act
      service.updateFilterOptions(filters, fleet);

      const updatedFilters = filters;

      // assert
      const expectedUpdatedFilters = [
        {
          displayName: 'Status',
          filterName: 'status',
          selectedFilters: ['Storage'],
          defaultSelectedFilters: [],
          filterOptions: [
            { name: 'Storage', count: 2 },
            { name: 'LOI to Option', count: 2 }
          ],
          showMore: false,
          filterOptionsCount: 2,
          filterNames: []
        },
        {
          selectedFilters: [],
          defaultSelectedFilters: [],
          displayName: 'Aircraft Market Class',
          filterName: 'aircraftMarketClass',
          filterOptions: [
            { name: 'Utility Pistons', count: 2 },
            { name: 'Widebody Jets', count: 0 }
          ],
          showMore: false,
          filterOptionsCount: 1,
          filterNames: []
        }
      ];
      expect(updatedFilters).toEqual(expectedUpdatedFilters);
    });

  });

  describe('getDefaultFilters', () => {

    it('should see all filters', () => {
      // arrange
      mockRouter.url = `airlines/-353/fleet`;

      // act
      const defaultFilterOptions = service.getDefaultFilters();

      // assert
      const expectedDefaultFilterNames = ['operator',
        'lessorOrganization',
        'status',
        'aircraftManufacturer',
        'aircraftMarketClass',
        'aircraftFamily',
        'aircraftType',
        'engineSeries'
      ];

      const defaultFilterOptionNames = defaultFilterOptions.map(defaultFilter => {
        return defaultFilter.filterName;
      });

      expect(defaultFilterOptionNames).toEqual(expectedDefaultFilterNames);
    });
  });

  describe('calculateSelectedFilterCount', () => {
    it('calculates selected filter count', () => {
      // arrange

      const filters: Filter[] = [
        {
          filterName: 'aircraftFamily',
          selectedFilters: ['787 Family'],
        } as Filter,
        {
          filterName: 'aircraftMarketClass',
          selectedFilters: ['Narrowbody Jets'],
        } as Filter
      ];

      // act
      service.calculateSelectedFilterCount(filters);

      const selectedFilterCount = service.calculateSelectedFilterCount(filters);

      // assert
      const expectedSelectedFilterCount = 2;
      expect(selectedFilterCount).toEqual(expectedSelectedFilterCount);
    });
  });

});
