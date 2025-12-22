import { TestBed } from '@angular/core/testing';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { ComparePortfolioExcelSheetBaseService } from './compare-portfolio-excel-sheet-base.service';

describe('ComparePortfolioExcelSheetBaseService', () => {
  let service: TestExcelSheetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [TestExcelSheetService]
    });

    service = TestBed.inject(TestExcelSheetService);
  });

  describe('buildExcelSheet', () => {
    it('with portfolio but no comparison portfolio build expected sheet data', () => {
      // arrange
      const portfolioDetails = {
        portfolioName: 'portfolio 1'
      } as PortfolioDetailOptions;

      const portfolioMonthlyUtilization = [
        [
          {
            group: 'all aircraft',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 99
          }
        ],
        [
          {
            group: 'a320',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 88
          }
        ]
      ] as MonthlyUtilization[][];

      // act
      const excelSheetData = service.buildExcelSheet(portfolioDetails, portfolioMonthlyUtilization, undefined, undefined);
      expect(excelSheetData[0].excelData.length).toBe(2);
      expect(excelSheetData[0].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft',
        'Avg. of Selected Period': 99,
        'Total of Selected Period': 99,
        'Jan 2017': 99
      });
      expect(excelSheetData[0].excelData[1]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'a320',
        Metrics: 'Aircraft',
        'Total of Selected Period': 88,
        'Avg. of Selected Period': 88,
        'Jan 2017': 88
      });
      expect(excelSheetData[0].headersInOrder).toEqual([
        'Portfolio',
        'Grouping',
        'Metrics',
        'Avg. of Selected Period',
        'Total of Selected Period',
        'Jan 2017'
      ]);
    });

    it('with portfolio and comparison portfolio and no operator build expected sheet data', () => {
      // arrange
      const portfolioDetails = {
        portfolioName: 'portfolio 1'
      } as PortfolioDetailOptions;

      const portfolioMonthlyUtilization = [
        [
          {
            group: 'all aircraft',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 99
          }
        ]
      ] as MonthlyUtilization[][];

      const comparisonPortfolioDetails = {
        portfolioName: 'portfolio 2'
      } as PortfolioDetailOptions;

      const comparisonPortfolioMonthlyUtilization = [
        [
          {
            group: 'all aircraft',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 88
          }
        ]
      ] as MonthlyUtilization[][];

      // act
      const excelSheetData = service.buildExcelSheet(
        portfolioDetails,
        portfolioMonthlyUtilization,
        comparisonPortfolioDetails,
        comparisonPortfolioMonthlyUtilization
      );

      // assert
      expect(excelSheetData[0].excelData.length).toBe(2);
      expect(excelSheetData[0].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft',
        'Total of Selected Period': 99,
        'Avg. of Selected Period': 99,
        'Jan 2017': 99
      });
      expect(excelSheetData[0].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft',
        'Total of Selected Period': 88,
        'Avg. of Selected Period': 88,
        'Jan 2017': 88
      });
      expect(excelSheetData[0].headersInOrder).toEqual([
        'Portfolio',
        'Grouping',
        'Metrics',
        'Avg. of Selected Period',
        'Total of Selected Period',
        'Jan 2017'
      ]);
    });

    it('portfolioDetailOptions has an operator and comparisonPortfolioDetailOptions is undefined then include an operator column', () => {
      // arrange
      const portfolioDetails = {
        portfolioName: 'portfolio 1',
        operatorId: 1,
        operatorName: 'operator 1'
      } as PortfolioDetailOptions;

      const portfolioMonthlyUtilization = [
        [
          {
            group: 'all aircraft',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 99
          }
        ]
      ] as MonthlyUtilization[][];

      // act
      const excelSheetData = service.buildExcelSheet(portfolioDetails, portfolioMonthlyUtilization, undefined, undefined);

      // assert
      expect(excelSheetData[0].excelData.length).toBe(1);
      expect(excelSheetData[0].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Operator: 'operator 1',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft',
        'Total of Selected Period': 99,
        'Avg. of Selected Period': 99,
        'Jan 2017': 99
      });
      expect(excelSheetData[0].headersInOrder).toEqual([
        'Portfolio',
        'Operator',
        'Grouping',
        'Metrics',
        'Avg. of Selected Period',
        'Total of Selected Period',
        'Jan 2017'
      ]);
    });

    it('portfolioDetailOptions does not have an operator but comparisonPortfolioDetailOptions does then include an operator column', () => {
      // arrange
      const portfolioDetails = {
        portfolioName: 'portfolio 1'
      } as PortfolioDetailOptions;

      const portfolioMonthlyUtilization = [
        [
          {
            group: 'all aircraft',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 99
          }
        ]
      ] as MonthlyUtilization[][];

      const comparisonPortfolioDetails = {
        portfolioName: 'portfolio 2',
        operatorId: 2,
        operatorName: 'operator 2'
      } as PortfolioDetailOptions;

      const comparisonPortfolioMonthlyUtilization = [
        [
          {
            group: 'all aircraft',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 99
          }
        ]
      ] as MonthlyUtilization[][];

      // act
      const excelSheetData = service.buildExcelSheet(
        portfolioDetails,
        portfolioMonthlyUtilization,
        comparisonPortfolioDetails,
        comparisonPortfolioMonthlyUtilization
      );

      // assert
      expect(excelSheetData[0].excelData.length).toBe(2);
      expect(excelSheetData[0].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Operator: undefined,
        Grouping: 'all aircraft',
        Metrics: 'Aircraft',
        'Total of Selected Period': 99,
        'Avg. of Selected Period': 99,
        'Jan 2017': 99
      });
      expect(excelSheetData[0].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Operator: 'operator 2',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft',

        'Total of Selected Period': 99,
        'Avg. of Selected Period': 99,
        'Jan 2017': 99
      });
      expect(excelSheetData[0].headersInOrder).toEqual([
        'Portfolio',
        'Operator',
        'Grouping',
        'Metrics',
        'Avg. of Selected Period',
        'Total of Selected Period',
        'Jan 2017'
      ]);
    });

    it('portfolioDetailOptions and comparisonPortfolioDetailOptions have an operator then include an operator column', () => {
      // arrange
      const portfolioDetails = {
        portfolioName: 'portfolio 1',
        operatorId: 1,
        operatorName: 'operator 1'
      } as PortfolioDetailOptions;

      const portfolioMonthlyUtilization = [
        [
          {
            group: 'all aircraft',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 99
          }
        ]
      ] as MonthlyUtilization[][];

      const comparisonPortfolioDetails = {
        portfolioName: 'portfolio 2',
        operatorId: 2,
        operatorName: 'operator 2'
      } as PortfolioDetailOptions;

      const comparisonPortfolioMonthlyUtilization = [
        [
          {
            group: 'all aircraft',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 99
          }
        ]
      ] as MonthlyUtilization[][];

      // act
      const excelSheetData = service.buildExcelSheet(
        portfolioDetails,
        portfolioMonthlyUtilization,
        comparisonPortfolioDetails,
        comparisonPortfolioMonthlyUtilization
      );

      // assert
      expect(excelSheetData[0].excelData.length).toBe(2);
      expect(excelSheetData[0].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Operator: 'operator 1',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft',
        'Total of Selected Period': 99,
        'Avg. of Selected Period': 99,
        'Jan 2017': 99
      });
      expect(excelSheetData[0].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Operator: 'operator 2',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft',
        'Total of Selected Period': 99,
        'Avg. of Selected Period': 99,
        'Jan 2017': 99
      });
      expect(excelSheetData[0].headersInOrder).toEqual([
        'Portfolio',
        'Operator',
        'Grouping',
        'Metrics',
        'Avg. of Selected Period',
        'Total of Selected Period',
        'Jan 2017'
      ]);
    });
  });
});

export class TestExcelSheetService extends ComparePortfolioExcelSheetBaseService {
  protected buildPortfolioRows(
    includeOperatorColumn: boolean,
    includeLessorColumn: boolean,
    portfolioDetailOptions: PortfolioDetailOptions,
    monthlyUtilization: MonthlyUtilization[][]
  ): {}[] {
    const rows: {}[] = [];

    monthlyUtilization.forEach((monthlyUtilizationGroup) => {
      rows.push(
        super.BuildRow(
          portfolioDetailOptions,
          includeOperatorColumn,
          includeLessorColumn,
          'Aircraft',
          monthlyUtilizationGroup,
          monthlyUtilizationGroup.map((x) => x.numberOfAircraftInGroup)
        )
      );
    });

    return rows;
  }
}
