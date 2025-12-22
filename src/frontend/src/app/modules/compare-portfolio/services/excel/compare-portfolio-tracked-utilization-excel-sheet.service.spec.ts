import { TestBed } from '@angular/core/testing';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { ComparePortfolioTrackedUtilizationExcelSheetService } from './compare-portfolio-tracked-utilization-excel-sheet.service';

describe('ComparePortfolioTrackedUtilizationExcelSheetService', () => {
  let service: ComparePortfolioTrackedUtilizationExcelSheetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [ComparePortfolioTrackedUtilizationExcelSheetService]
    });

    service = TestBed.inject(ComparePortfolioTrackedUtilizationExcelSheetService);
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
            numberOfAircraftInGroup: 99,
            averageHours: 1,
            totalHours: 1,
            numberOfAircraftWithHours: 1,
            averageCycles: 1,
            totalCycles: 1,
            numberOfAircraftWithCycles: 1,
            averageHoursPerCycle: 1,
            numberOfAircraftWithHoursPerCycle: 1
          },
          {
            group: 'all aircraft',
            year: 2017,
            month: 2,
            numberOfAircraftInGroup: 99,
            averageHours: 2,
            totalHours: 2,
            numberOfAircraftWithHours: 2,
            averageCycles: 2,
            totalCycles: 2,
            numberOfAircraftWithCycles: 2,
            averageHoursPerCycle: 2,
            numberOfAircraftWithHoursPerCycle: 2
          }
        ],
        [
          {
            group: 'a320',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 88,
            averageHours: 3,
            totalHours: 3,
            numberOfAircraftWithHours: 3,
            averageCycles: 3,
            totalCycles: 3,
            numberOfAircraftWithCycles: 3,
            averageHoursPerCycle: 3,
            numberOfAircraftWithHoursPerCycle: 3
          },
          {
            group: 'a320',
            year: 2017,
            month: 2,
            numberOfAircraftInGroup: 88,
            averageHours: 4,
            totalHours: 4,
            numberOfAircraftWithHours: 4,
            averageCycles: 4,
            totalCycles: 4,
            numberOfAircraftWithCycles: 4,
            averageHoursPerCycle: 4,
            numberOfAircraftWithHoursPerCycle: 4
          }
        ]
      ] as MonthlyUtilization[][];

      // act
      const excelSheetData = service.buildExcelSheet(portfolioDetails, portfolioMonthlyUtilization, undefined, undefined);

      // assert
      expect(excelSheetData.length).toBe(7);

      expect(excelSheetData[0].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft in Group',
        'Avg. of Selected Period': 99,
        'Total of Selected Period': 198,
        'Jan 2017': 99,
        'Feb 2017': 99
      });
      expect(excelSheetData[1].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Tracked Aircraft',
        'Avg. of Selected Period': 1.5,
        'Total of Selected Period': 3,
        'Jan 2017': 1,
        'Feb 2017': 2
      });
      expect(excelSheetData[2].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly Tracked Hours',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 3,
        'Jan 2017': 1,
        'Feb 2017': 2
      });
      expect(excelSheetData[2].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly Tracked Hours',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 3,
        'Jan 2017': 1,
        'Feb 2017': 2
      });
      expect(excelSheetData[2].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly Tracked Hours',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 3,
        'Jan 2017': 1,
        'Feb 2017': 2
      });
      expect(excelSheetData[2].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly Tracked Hours',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 3,
        'Jan 2017': 1,
        'Feb 2017': 2
      });
      expect(excelSheetData[2].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly Tracked Hours',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 3,
        'Jan 2017': 1,
        'Feb 2017': 2
      });
      expect(excelSheetData[0].headersInOrder).toEqual([
        'Portfolio',
        'Grouping',
        'Metrics',
        'Avg. of Selected Period',
        'Total of Selected Period',
        'Jan 2017',
        'Feb 2017'
      ]);
    });

    it('with portfolio and comparison portfolio build expected sheet data', () => {
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
            numberOfAircraftInGroup: 99,
            averageHours: 1,
            totalHours: 1,
            numberOfAircraftWithHours: 1,
            averageCycles: 1,
            totalCycles: 1,
            numberOfAircraftWithCycles: 1,
            averageHoursPerCycle: 1,
            numberOfAircraftWithHoursPerCycle: 1
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
            numberOfAircraftInGroup: 88,
            averageHours: 2,
            totalHours: 2,
            numberOfAircraftWithHours: 2,
            averageCycles: 2,
            totalCycles: 2,
            numberOfAircraftWithCycles: 2,
            averageHoursPerCycle: 2,
            numberOfAircraftWithHoursPerCycle: 2
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
      expect(excelSheetData.length).toBe(7);

      expect(excelSheetData[0].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft in Group',
        'Avg. of Selected Period': 99,
        'Total of Selected Period': 99,
        'Jan 2017': 99
      });
      expect(excelSheetData[0].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Aircraft in Group',
        'Avg. of Selected Period': 88,
        'Total of Selected Period': 88,
        'Jan 2017': 88
      });
      expect(excelSheetData[1].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Tracked Aircraft',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[1].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Tracked Aircraft',
        'Avg. of Selected Period': 2,
        'Total of Selected Period': 2,
        'Jan 2017': 2
      });
      expect(excelSheetData[2].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly Tracked Hours',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[2].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly Tracked Hours',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 2,
        'Jan 2017': 2
      });
      expect(excelSheetData[3].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly Tracked Hours',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[3].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly Tracked Hours',
        'Avg. of Selected Period': 2,
        'Total of Selected Period': 2,
        'Jan 2017': 2
      });
      expect(excelSheetData[4].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly Tracked Cycles',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[4].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly Tracked Cycles',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 2,
        'Jan 2017': 2
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
  });
  describe('calculateAvgForMetric', () => {
    it('calculate average metric for Average Monthly Tracked H/C Ratio, where total metric and divisor metric are string', () => {
      // arrange
      const monthlyUtilization = [
        {
          Portfolio: '12345',
          Grouping: 'All aircraft',
          Metrics: 'Average Monthly Tracked H/C Ratio',
          'Avg. of Selected Period': 10,
          'Total of Selected Period': 990,
          totalHours: 99,
          totalCycles: 99,
          'Jan 2024': 99
        },
        {
          Portfolio: '12345',
          Grouping: 'All aircraft',
          Metrics: 'Total Monthly Tracked Hours',
          'Avg. of Selected Period': 10,
          'Total of Selected Period': 990,
          totalHours: 99,
          totalCycles: 99,
          'Jan 2024': 99
        },
        {
          Portfolio: '12345',
          Grouping: 'All aircraft',
          Metrics: 'Total Monthly Tracked Cycles',
          'Avg. of Selected Period': 10,
          'Total of Selected Period': 990,
          totalCycles: 99,
          totalHours: 99,
          'Jan 2024': 99
        }
      ];
      // act
      const avg = service.calculateAvgForMetric(
        monthlyUtilization,
        '12345',
        'All aircraft',
        undefined,
        undefined,
        'Total Monthly Tracked Hours',
        'Total Monthly Tracked Cycles'
      );
      // assert
      expect(avg).toBe(1);
    });
    it('calculate average metric for Total Monthly Tracked Hours, where total metric and divisor metric are numeric', () => {
      // arrange
      const monthlyUtilization = [
        {
          Portfolio: '12345',
          Grouping: 'All aircraft',
          Metrics: 'Total Monthly Tracked Hours',
          'Avg. of Selected Period': 10,
          'Total of Selected Period': 990,
          totalHours: 99,
          totalCycles: 99,
          'Jan 2024': 99
        }
      ];
      // act
      const avg = service.calculateAvgForMetric(monthlyUtilization, '12345', 'All aircraft', undefined, undefined, 990, 1);
      // assert
      expect(avg).toBe(990);
    });
  });
  describe('buildFilterCriteriaSheet', () => {
    it('build expected filter criteria sheet data', () => {
      // arrange
      const portfolioDetails = {
        portfolioName: 'portfolio 1',
        operatorId: 1,
        operatorName: 'operator 1',
        lessorId: 1,
        lessorName: 'lessor 1'
      } as PortfolioDetailOptions;

      const comparisonPortfolioDetails = {
        portfolioName: 'portfolio 2',
        operatorId: 2,
        operatorName: 'operator 2',
        lessorId: 2,
        lessorName: 'lessor 2'
      } as PortfolioDetailOptions;

      // act
      const excelSheetData = service.buildFilterCriteriaSheet(portfolioDetails, 5, 4, 2024, 2023, comparisonPortfolioDetails);

      // assert
      const dataArray = excelSheetData[0].excelData as {}[];
      expect(excelSheetData.length).toBe(1);
      expect(dataArray.length).toBe(4);
      expect(dataArray[0]).toEqual({ Criteria: 'Portfolio', Selection: 'portfolio 1' });
      expect(dataArray[1]).toEqual({ Criteria: 'Comparison Portfolio', Selection: 'portfolio 2' });
      expect(dataArray[2]).toEqual({ Criteria: 'Start Month', Selection: 'May 2023' });
      expect(dataArray[3]).toEqual({ Criteria: 'End Month', Selection: 'Jun 2024' });
    });
  });
});
