import { TestBed } from '@angular/core/testing';
import { PortfolioOverviewFilterExcelService } from './portfolio-overview-filter-excel-service';
import { Filter } from './portfolio-overview-filter.service';
import { ExcelSheetData } from '../../../shared/models/excel-sheet-data';


describe('PortfolioOverviewExcelDataService', () => {
  let service: PortfolioOverviewFilterExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PortfolioOverviewFilterExcelService,
      ]
    });
    service = TestBed.inject(PortfolioOverviewFilterExcelService);
  });

  describe('buildFiltersExcelSheetData()', () => {
    it('should return filtered excel data', () => {
      // arrange
      const filters: Filter[] = [
        {
          displayName: 'Operator',
          filterName: 'operator',
          selectedFilters: ['American Airlines'],
          defaultSelectedFilters: ['American Airlines'],
          filterOptions: [
            {
              name: 'American Airlines',
              count: 1244
            },
            {
              name: 'Envoy Air',
              count: 120
            },
            {
              name: 'PSA Airlines',
              count: 108
            },
            {
              name: 'Piedmont Airlines',
              count: 145
            },
          ],
          filterOptionsCount: 4,
          showMore: true
        },
        {
          displayName: 'Status',
          filterName: 'status',
          selectedFilters: ['In Service', 'Storage', 'On Order'],
          defaultSelectedFilters: ['In Service', 'Storage', 'On Order'],
          filterOptions: [
            {
              name: 'In Service',
              count: 1244
            },
            {
              name: 'Storage',
              count: 120
            },
            {
              name: 'On Order',
              count: 108
            },
            {
              name: 'On Option',
              count: 145
            },
          ],
          filterOptionsCount: 6,
          showMore: true
        },
        {
          displayName: 'Lessor',
          filterName: 'lessorOrganization',
          selectedFilters: ['AerCap', 'Avolon'],
          defaultSelectedFilters: [],
          filterOptions: [
            {
              name: 'AerCap',
              count: 12
            },
            {
              name: 'Avolon',
              count: 120
            }
          ],
          filterOptionsCount: 2,
          showMore: true
        },
      ] as Filter[];

      const expectedDetailsTable = {
        excelData: [
          {
            'Filter Type': 'Operator',
            'Filter Name': 'American Airlines',
            'Value': 1244,
          },
          {
            'Filter Type': 'Status',
            'Filter Name': 'In Service',
            'Value': 1244,
          },
          {
            'Filter Type': null,
            'Filter Name': 'Storage',
            'Value': 120,
          },
          {
            'Filter Type': null,
            'Filter Name': 'On Order',
            'Value': 108,
          },
          {
            'Filter Type': 'Lessor',
            'Filter Name': 'AerCap',
            'Value': 12,
          },
          {
            'Filter Type': null,
            'Filter Name': 'Avolon',
            'Value': 120,
          },
        ],
        isPivot: false,
        excelNumberFormat: '0',
        headersInOrder: ['Filter Type', 'Filter Name', 'Value']
      } as ExcelSheetData;

      // act
      const detailsTable = service.buildFiltersExcelSheetData(filters);

      // assertions
      expect(detailsTable.excelData).toEqual(expectedDetailsTable.excelData);
      expect(detailsTable.isPivot).toEqual(expectedDetailsTable.isPivot);
      expect(detailsTable.excelNumberFormat).toEqual(expectedDetailsTable.excelNumberFormat);
      expect(detailsTable.headersInOrder).toEqual(expectedDetailsTable.headersInOrder);
    });
  });
});
