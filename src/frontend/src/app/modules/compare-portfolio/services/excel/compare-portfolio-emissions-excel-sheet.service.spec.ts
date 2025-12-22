import { TestBed } from '@angular/core/testing';
import { ComparePortfolioEmissionsExcelSheetService } from './compare-portfolio-emissions-excel-sheet.service';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { MonthlyUtilization } from '../../models/monthly-utilization';

describe('ComparePortfolioEmissionsExcelSheetService', () => {
  let service: ComparePortfolioEmissionsExcelSheetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      providers: [ComparePortfolioEmissionsExcelSheetService]
    });

    service = TestBed.inject(ComparePortfolioEmissionsExcelSheetService);
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
            averageCo2KgPerSeat: 1,
            totalCo2KgPerSeat: 1,
            totalCo2GPerAsk: 1,
            totalCo2GPerAsm: 1,
            numberOfAircraftWithCo2KgPerSeat: 1,
            averageCo2GPerAsk: 1,
            averageCo2GPerAsm: 1,
            numberOfAircraftWithCo2GPerAsk: 1
          },
          {
            group: 'all aircraft',
            year: 2017,
            month: 2,
            numberOfAircraftInGroup: 99,
            averageCo2KgPerSeat: 2,
            totalCo2KgPerSeat: 2,
            totalCo2GPerAsk: 2,
            totalCo2GPerAsm: 2,
            numberOfAircraftWithCo2KgPerSeat: 2,
            averageCo2GPerAsk: 2,
            averageCo2GPerAsm: 2,
            numberOfAircraftWithCo2GPerAsk: 2
          }
        ],
        [
          {
            group: 'a320',
            year: 2017,
            month: 1,
            numberOfAircraftInGroup: 1,
            averageCo2KgPerSeat: 3,
            totalCo2KgPerSeat: 3,
            totalCo2GPerAsk: 3,
            totalCo2GPerAsm: 3,
            numberOfAircraftWithCo2KgPerSeat: 3,
            averageCo2GPerAsk: 3,
            averageCo2GPerAsm: 3,
            numberOfAircraftWithCo2GPerAsk: 3
          },
          {
            group: 'a320',
            year: 2017,
            month: 2,
            numberOfAircraftInGroup: 1,
            averageCo2KgPerSeat: 4,
            totalCo2KgPerSeat: 4,
            totalCo2GPerAsk: 4,
            totalCo2GPerAsm: 4,
            numberOfAircraftWithCo2KgPerSeat: 4,
            averageCo2GPerAsk: 4,
            averageCo2GPerAsm: 4,
            numberOfAircraftWithCo2GPerAsk: 4
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
        Metrics: 'Average Monthly CO2 per Seat (kg)',
        'Avg. of Selected Period': 1.5,
        'Total of Selected Period': 3,
        'Jan 2017': 1,
        'Feb 2017': 2
      });
      expect(excelSheetData[1].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly CO2 per Seat (kg)',
        'Avg. of Selected Period': 1.5,
        'Total of Selected Period': 3,
        'Jan 2017': 1,
        'Feb 2017': 2
      });
      expect(excelSheetData[2].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly CO2 per ASK (g)',
        'Avg. of Selected Period': 1.5,
        'Total of Selected Period': 3,
        'Jan 2017': 1,
        'Feb 2017': 2
      });
      expect(excelSheetData[2].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly CO2 per ASK (g)',
        'Avg. of Selected Period': 1.5,
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
            averageCo2KgPerSeat: 1,
            totalCo2KgPerSeat: 1,
            totalCo2GPerAsk: 1,
            totalCo2GPerAsm: 1,
            numberOfAircraftWithCo2KgPerSeat: 1,
            averageCo2GPerAsk: 1,
            averageCo2GPerAsm: 1,
            numberOfAircraftWithCo2GPerAsk: 1
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
            averageCo2KgPerSeat: 2,
            totalCo2KgPerSeat: 2,
            totalCo2GPerAsk: 2,
            totalCo2GPerAsm: 2,
            numberOfAircraftWithCo2KgPerSeat: 2,
            averageCo2GPerAsk: 2,
            averageCo2GPerAsm: 2,
            numberOfAircraftWithCo2GPerAsk: 2
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
      expect(excelSheetData.length).toBe(7);
      console.log(excelSheetData);

      expect(excelSheetData[0].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly CO2 per Seat (kg)',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[0].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly CO2 per Seat (kg)',
        'Avg. of Selected Period': 2,
        'Total of Selected Period': 2,
        'Jan 2017': 2
      });
      expect(excelSheetData[1].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly CO2 per Seat (kg)',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[1].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly CO2 per Seat (kg)',
        'Avg. of Selected Period': 2,
        'Total of Selected Period': 2,
        'Jan 2017': 2
      });
      expect(excelSheetData[2].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly CO2 per ASK (g)',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[2].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly CO2 per ASK (g)',
        'Avg. of Selected Period': 2,
        'Total of Selected Period': 2,
        'Jan 2017': 2
      });
      expect(excelSheetData[3].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly CO2 per ASM (g)',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });

      expect(excelSheetData[3].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Total Monthly CO2 per ASM (g)',
        'Avg. of Selected Period': 2,
        'Total of Selected Period': 2,
        'Jan 2017': 2
      });
      expect(excelSheetData[4].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly CO2 per ASK (g)',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[4].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly CO2 per ASK (g)',
        'Avg. of Selected Period': 2,
        'Total of Selected Period': 2,
        'Jan 2017': 2
      });
      expect(excelSheetData[5].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly CO2 per ASM (g)',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[5].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Average Monthly CO2 per ASM (g)',
        'Avg. of Selected Period': 2,
        'Total of Selected Period': 2,
        'Jan 2017': 2
      });
      expect(excelSheetData[6].excelData[0]).toEqual({
        Portfolio: 'portfolio 1',
        Grouping: 'all aircraft',
        Metrics: 'Tracked Aircraft',
        'Avg. of Selected Period': 1,
        'Total of Selected Period': 1,
        'Jan 2017': 1
      });
      expect(excelSheetData[6].excelData[1]).toEqual({
        Portfolio: 'portfolio 2',
        Grouping: 'all aircraft',
        Metrics: 'Tracked Aircraft',
        'Avg. of Selected Period': 2,
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
    it('calculate average metric for Total Monthly CO2 per Seat (kg), where total metric and divisor metric are numeric', () => {
      // arrange
      const monthlyUtilization = [
        {
          Portfolio: '12345',
          Grouping: 'All aircraft',
          Metrics: 'Total Monthly CO2 per Seat (kg)',
          'Avg. of Selected Period': 10,
          'Total of Selected Period': 990,
          totalCo2KgPerSeat: 99,
          averageCo2KgPerSeat: 99,
          'Jan 2024': 99
        }
      ];
      // act
      const avg = service.calculateAvgForMetric(monthlyUtilization, '12345', 'All aircraft',undefined,undefined, 990, 1);
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
