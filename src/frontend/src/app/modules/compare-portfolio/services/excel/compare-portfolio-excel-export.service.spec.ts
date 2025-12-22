import { TestBed } from '@angular/core/testing';
import { ComparePortfolioExcelExportService } from './compare-portfolio-excel-export.service';
import { ComparePortfolioTrackedUtilizationExcelSheetService } from './compare-portfolio-tracked-utilization-excel-sheet.service';
import { ComparePortfolioEmissionsExcelSheetService } from './compare-portfolio-emissions-excel-sheet.service';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { of } from 'rxjs';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { MetricOptions } from '../../models/metric-options';
import { UtilizationService } from '../../../shared/services/utilization.service';
import { ExcelSheetData } from 'src/app/modules/shared/models/excel-sheet-data';

describe('ComparePortfolioExcelExportService', () => {
  let service: ComparePortfolioExcelExportService;

  let utilizationServiceSpy: any;
  let trackedUtilizationExcelSheetServiceSpy: any;
  let emissionsExcelSheetServiceSpy: any;
  let exportExcelServiceSpy: any;

  beforeEach(async () => {
    utilizationServiceSpy = jasmine.createSpyObj('UtilizationService', ['getMonthlyUtilization', 'getMonthlyUtilizationPerAircraft']);
    trackedUtilizationExcelSheetServiceSpy = jasmine.createSpyObj('ComparePortfolioTrackedUtilizationExcelSheetService', [
      'buildExcelSheet',
      'getDistinctPropertyValues',
      'buildFilterCriteriaSheet',
      'buildMSNExcelSheet',
      'buildPortfolioRows',
      'BuildRow',
      'transformDataToTable',
      'mapUtlilizationGroupedDataToRows',
      'mapEmissionGroupedDataToRows',
      'generateDateRange',
      'buildRows',
      'buildHeaders',
      'buildMSNTabHeaders',
      'buildMonthYearKeyForMSN',
      'buildMonthYearKey'
    ]);
    emissionsExcelSheetServiceSpy = jasmine.createSpyObj('ComparePortfolioEmissionsExcelSheetService', [
      'buildExcelSheet',
      'getDistinctPropertyValues',
      'buildFilterCriteriaSheet',
      'buildMSNExcelSheet',
      'buildPortfolioRows',
      'BuildRow',
      'transformDataToTable',
      'mapUtlilizationGroupedDataToRows',
      'mapEmissionGroupedDataToRows',
      'generateDateRange',
      'buildRows',
      'buildHeaders',
      'buildMSNTabHeaders',
      'buildMonthYearKeyForMSN',
      'buildMonthYearKey'
    ]);
    exportExcelServiceSpy = jasmine.createSpyObj('ExportExcelService', ['exportExcelSheetData', 'exportExcelSheetDataForMetricsPage']);

    await TestBed.configureTestingModule({
      imports: [],
      providers: [
        ComparePortfolioExcelExportService,
        { provide: UtilizationService, useValue: utilizationServiceSpy },
        { provide: ComparePortfolioTrackedUtilizationExcelSheetService, useValue: trackedUtilizationExcelSheetServiceSpy },
        { provide: ComparePortfolioEmissionsExcelSheetService, useValue: emissionsExcelSheetServiceSpy },
        { provide: ExportExcelService, useValue: exportExcelServiceSpy }
      ]
    });

    service = TestBed.inject(ComparePortfolioExcelExportService);
  });

  describe('export', () => {
    it('builds tracked utilization excel sheet', () => {
      // arrange
      const portfolioDetailOptions = { portfolioId: 1 } as PortfolioDetailOptions;
      const comparisonPortfolioDetailOptions = { portfolioId: 2 } as PortfolioDetailOptions;
      const portfolioMonthlyUtilizations = [[{ year: 2017, month: 1 } as MonthlyUtilization]];
      const comparisonPortfolioMonthlyUtilizations = [
        [{ year: 2017, month: 1 } as MonthlyUtilization, { year: 2017, month: 2 } as MonthlyUtilization]
      ];
      const metricOptions = { startYear: 2017, startMonthIndex: 0, endYear: 2021, endMonthIndex: 11 } as MetricOptions;
      const metric = [
        {
          name: 'Average Monthly Tracked Hours',
          numberOfAircraftPropertyName: 'numberOfAircraftWithHours',
          valuePropertyName: 'averageHours'
        }
      ];
      const isEmissions = false;
      const isHoursAndCycle = true;

      utilizationServiceSpy.getMonthlyUtilization.and.returnValues(
        of(portfolioMonthlyUtilizations),
        of(comparisonPortfolioMonthlyUtilizations)
      );
      utilizationServiceSpy.getMonthlyUtilizationPerAircraft.and.returnValues(of([]), of([]));

      // act
      service.export(portfolioDetailOptions, comparisonPortfolioDetailOptions, metricOptions, metric, isEmissions, isHoursAndCycle);

      // assert
      expect(trackedUtilizationExcelSheetServiceSpy.buildExcelSheet).toHaveBeenCalledTimes(1);
      expect(trackedUtilizationExcelSheetServiceSpy.buildExcelSheet).toHaveBeenCalledWith(
        portfolioDetailOptions,
        portfolioMonthlyUtilizations,
        comparisonPortfolioDetailOptions,
        comparisonPortfolioMonthlyUtilizations
      );
    });

    it('builds emissions excel sheet', () => {
      // arrange
      const portfolioDetailOptions = { portfolioId: 1 } as PortfolioDetailOptions;
      const comparisonPortfolioDetailOptions = { portfolioId: 2 } as PortfolioDetailOptions;
      const portfolioMonthlyUtilizations = [[{ year: 2017, month: 1 } as MonthlyUtilization]];
      const comparisonPortfolioMonthlyUtilizations = [
        [{ year: 2017, month: 1 } as MonthlyUtilization, { year: 2017, month: 2 } as MonthlyUtilization]
      ];
      const metricOptions = { startYear: 2017, startMonthIndex: 0, endYear: 2021, endMonthIndex: 11 } as MetricOptions;
      const metric = [
        {
          name: 'Average Monthly Tracked Hours',
          numberOfAircraftPropertyName: 'numberOfAircraftWithHours',
          valuePropertyName: 'averageHours'
        }
      ];
      const isEmissions = true;
      const isHoursAndCycle = false;

      utilizationServiceSpy.getMonthlyUtilization.and.returnValues(
        of(portfolioMonthlyUtilizations),
        of(comparisonPortfolioMonthlyUtilizations)
      );
      utilizationServiceSpy.getMonthlyUtilizationPerAircraft.and.returnValues(of([]), of([]));

      // act
      service.export(portfolioDetailOptions, comparisonPortfolioDetailOptions, metricOptions, metric, isEmissions, isHoursAndCycle);

      // assert
      expect(emissionsExcelSheetServiceSpy.buildExcelSheet).toHaveBeenCalledTimes(1);
      expect(emissionsExcelSheetServiceSpy.buildExcelSheet).toHaveBeenCalledWith(
        portfolioDetailOptions,
        portfolioMonthlyUtilizations,
        comparisonPortfolioDetailOptions,
        comparisonPortfolioMonthlyUtilizations
      );
    });

    it('builds msn excel sheet for both portfolios', () => {
      // arrange
      const portfolioDetailOptions = { portfolioId: 1 } as PortfolioDetailOptions;
      const comparisonPortfolioDetailOptions = { portfolioId: 2 } as PortfolioDetailOptions;
      const portfolioMonthlyUtilizations = [[{ year: 2017, month: 1 } as MonthlyUtilization]];
      const comparisonPortfolioMonthlyUtilizations = [
        [{ year: 2017, month: 1 } as MonthlyUtilization, { year: 2017, month: 2 } as MonthlyUtilization]
      ];
      const metricOptions = { startYear: 2017, startMonthIndex: 0, endYear: 2021, endMonthIndex: 11 } as MetricOptions;
      const metric = [
        {
          name: 'Average Monthly Tracked Hours',
          numberOfAircraftPropertyName: 'numberOfAircraftWithHours',
          valuePropertyName: 'averageHours'
        }
      ];
      const isEmissions = false;
      const isHoursAndCycle = true;

      utilizationServiceSpy.getMonthlyUtilization.and.returnValues(
        of(portfolioMonthlyUtilizations),
        of(comparisonPortfolioMonthlyUtilizations)
      );
      utilizationServiceSpy.getMonthlyUtilizationPerAircraft.and.returnValues(of([]), of([]));
      trackedUtilizationExcelSheetServiceSpy.buildExcelSheet.and.returnValue([{ headersInOrder: ['Filter Criteria'] }] as ExcelSheetData[]);
      trackedUtilizationExcelSheetServiceSpy.buildMSNExcelSheet.and.returnValue([
        { headersInOrder: ['Tracked Utilization'] }
      ] as ExcelSheetData[]);
      // act
      service.export(portfolioDetailOptions, comparisonPortfolioDetailOptions, metricOptions, metric, isEmissions, isHoursAndCycle);
      // assert
      expect(trackedUtilizationExcelSheetServiceSpy.buildMSNExcelSheet).toHaveBeenCalledTimes(2);
    });

    it('builds filter criteria sheet', () => {
      // arrange
      const portfolioDetailOptions = { portfolioId: 1 } as PortfolioDetailOptions;
      const comparisonPortfolioDetailOptions = { portfolioId: 2 } as PortfolioDetailOptions;
      const portfolioMonthlyUtilizations = [[{ year: 2017, month: 1 } as MonthlyUtilization]];
      const comparisonPortfolioMonthlyUtilizations = [
        [{ year: 2017, month: 1 } as MonthlyUtilization, { year: 2017, month: 2 } as MonthlyUtilization]
      ];
      const metricOptions = { startYear: 2017, startMonthIndex: 0, endYear: 2021, endMonthIndex: 11 } as MetricOptions;
      const metric = [
        {
          name: 'Average Monthly Tracked Hours',
          numberOfAircraftPropertyName: 'numberOfAircraftWithHours',
          valuePropertyName: 'averageHours'
        }
      ];
      const isEmissions = false;
      const isHoursAndCycle = true;

      utilizationServiceSpy.getMonthlyUtilization.and.returnValues(
        of(portfolioMonthlyUtilizations),
        of(comparisonPortfolioMonthlyUtilizations)
      );
      utilizationServiceSpy.getMonthlyUtilizationPerAircraft.and.returnValues(of([]), of([]));
      trackedUtilizationExcelSheetServiceSpy.buildExcelSheet.and.returnValue([{ headersInOrder: ['Filter Criteria'] }] as ExcelSheetData[]);
      trackedUtilizationExcelSheetServiceSpy.buildMSNExcelSheet.and.returnValue([
        { headersInOrder: ['Tracked Utilization'] }
      ] as ExcelSheetData[]);
      // act
      service.export(portfolioDetailOptions, comparisonPortfolioDetailOptions, metricOptions, metric, isEmissions, isHoursAndCycle);
      // assert
      expect(trackedUtilizationExcelSheetServiceSpy.buildExcelSheet).toHaveBeenCalledTimes(1);
    });

    it('If global fleet is selected in one portolio, MSN sheet is not created for it', () => {
      // arrange
      const portfolioDetailOptions = { portfolioId: 1 } as PortfolioDetailOptions;
      const comparisonPortfolioDetailOptions = { portfolioId: undefined } as PortfolioDetailOptions;
      const portfolioMonthlyUtilizations = [[{ year: 2017, month: 1 } as MonthlyUtilization]];
      const comparisonPortfolioMonthlyUtilizations = [
        [{ year: 2017, month: 1 } as MonthlyUtilization, { year: 2017, month: 2 } as MonthlyUtilization]
      ];
      const metricOptions = { startYear: 2017, startMonthIndex: 0, endYear: 2021, endMonthIndex: 11 } as MetricOptions;
      const metric = [
        {
          name: 'Average Monthly Tracked Hours',
          numberOfAircraftPropertyName: 'numberOfAircraftWithHours',
          valuePropertyName: 'averageHours'
        }
      ];
      const isEmissions = false;
      const isHoursAndCycle = true;

      utilizationServiceSpy.getMonthlyUtilization.and.returnValues(
        of(portfolioMonthlyUtilizations),
        of(comparisonPortfolioMonthlyUtilizations)
      );
      utilizationServiceSpy.getMonthlyUtilizationPerAircraft.and.returnValues(of([]), of([]));
      trackedUtilizationExcelSheetServiceSpy.buildExcelSheet.and.returnValue([{ headersInOrder: ['Filter Criteria'] }] as ExcelSheetData[]);
      trackedUtilizationExcelSheetServiceSpy.buildMSNExcelSheet.and.returnValue([
        { headersInOrder: ['Tracked Utilization'] }
      ] as ExcelSheetData[]);
      // act
      service.export(portfolioDetailOptions, comparisonPortfolioDetailOptions, metricOptions, metric, isEmissions, isHoursAndCycle);
      // assert
      expect(trackedUtilizationExcelSheetServiceSpy.buildMSNExcelSheet).toHaveBeenCalledTimes(1);
    });

    it('exports excel sheet data', () => {
      // arrange
      const portfolioDetailOptions = { portfolioId: 1, portfolioName: '1' } as PortfolioDetailOptions;
      const comparisonPortfolioDetailOptions = { portfolioId: 2, portfolioName: '2' } as PortfolioDetailOptions;
      const metricOptions = { startYear: 2017, startMonthIndex: 0, endYear: 2021, endMonthIndex: 11 } as MetricOptions;
      const metric = [
        {
          name: 'Average Monthly Tracked Hours',
          numberOfAircraftPropertyName: 'numberOfAircraftWithHours',
          valuePropertyName: 'averageHours'
        }
      ];
      const isEmissions = true;
      const isHoursAndCycle = false;

      utilizationServiceSpy.getMonthlyUtilization.and.returnValue(of([]));
      utilizationServiceSpy.getMonthlyUtilizationPerAircraft.and.returnValues(of([]), of([]));

      const trackedUtilizationExcelSheetData = [{ headersInOrder: ['tracked utilization'] }] as ExcelSheetData[];
      trackedUtilizationExcelSheetServiceSpy.buildExcelSheet.and.returnValue(trackedUtilizationExcelSheetData);

      const emissionsExcelSheetData = [{ headersInOrder: ['emissions'] }] as ExcelSheetData[];
      emissionsExcelSheetServiceSpy.buildExcelSheet.and.returnValue(emissionsExcelSheetData);

      const msnExcelSheetData = [{ headersInOrder: ['MSN'] }] as ExcelSheetData[];
      emissionsExcelSheetServiceSpy.buildMSNExcelSheet.and.returnValue(msnExcelSheetData);

      const comparisonMSNExcelSheetData = [{ headersInOrder: ['MSN'] }] as ExcelSheetData[];
      emissionsExcelSheetServiceSpy.buildMSNExcelSheet.and.returnValue(comparisonMSNExcelSheetData);

      const filterCriteriaSheetData = [{ headersInOrder: ['filter criteria'] }] as ExcelSheetData[];
      trackedUtilizationExcelSheetServiceSpy.buildFilterCriteriaSheet.and.returnValue(filterCriteriaSheetData);

      // act
      service.export(portfolioDetailOptions, comparisonPortfolioDetailOptions, metricOptions, metric, isEmissions, isHoursAndCycle);

      // assert
      expect(exportExcelServiceSpy.exportExcelSheetDataForMetricsPage).toHaveBeenCalledTimes(1);

      //const expectedExcelSheets = new Map<string, ExcelSheetData>([['1-Emissions', emissionsExcelSheetData]]);
      const expectedExcelSheets = new Map<string, ExcelSheetData[]>();
      expectedExcelSheets.set('Filter Criteria', filterCriteriaSheetData);
      expectedExcelSheets.set('Emissions', emissionsExcelSheetData);
      expectedExcelSheets.set('MSN - ' + '1', msnExcelSheetData);
      expectedExcelSheets.set('MSN - ' + '2', comparisonMSNExcelSheetData);
      expect(exportExcelServiceSpy.exportExcelSheetDataForMetricsPage).toHaveBeenCalledWith(
        expectedExcelSheets,
        'Emissions_Analysis',
        metricOptions,
        isEmissions,
        true,
        portfolioDetailOptions,
        comparisonPortfolioDetailOptions
      );
    });

    it('filters monthly utilization by selected date range', () => {
      // arrange
      const portfolioDetailOptions = { portfolioId: 1 } as PortfolioDetailOptions;
      const comparisonPortfolioDetailOptions = { portfolioId: 2 } as PortfolioDetailOptions;
      const metric = [
        {
          name: 'Average Monthly Tracked Hours',
          numberOfAircraftPropertyName: 'numberOfAircraftWithHours',
          valuePropertyName: 'averageHours'
        }
      ];
      const isEmissions = true;
      const isHoursAndCycle = false;

      const portfolioMonthlyUtilizations = [
        [
          { year: 2022, month: 11 },
          { year: 2022, month: 12 },
          { year: 2023, month: 1 },
          { year: 2023, month: 2 },
          { year: 2023, month: 3 },
          { year: 2023, month: 4 }
        ],
        [
          { year: 2022, month: 11 },
          { year: 2022, month: 12 },
          { year: 2023, month: 1 },
          { year: 2023, month: 2 },
          { year: 2023, month: 3 },
          { year: 2023, month: 4 }
        ]
      ] as MonthlyUtilization[][];

      const comparisonPortfolioMonthlyUtilizations = [
        [
          { year: 2022, month: 12 },
          { year: 2023, month: 1 },
          { year: 2023, month: 2 },
          { year: 2023, month: 3 }
        ],
        [
          { year: 2022, month: 12 },
          { year: 2023, month: 1 },
          { year: 2023, month: 2 },
          { year: 2023, month: 3 }
        ]
      ];
      const metricOptions = {
        startYear: 2022,
        startMonthIndex: 11,
        endYear: 2023,
        endMonthIndex: 1
      } as MetricOptions;

      utilizationServiceSpy.getMonthlyUtilization.and.returnValues(
        of(portfolioMonthlyUtilizations),
        of(comparisonPortfolioMonthlyUtilizations)
      );

      utilizationServiceSpy.getMonthlyUtilizationPerAircraft.and.returnValues(of([]), of([]));

      // act
      service.export(portfolioDetailOptions, comparisonPortfolioDetailOptions, metricOptions, metric, isEmissions, isHoursAndCycle);

      // assert
      expect(trackedUtilizationExcelSheetServiceSpy.buildExcelSheet).toHaveBeenCalledTimes(1);

      const expectedPortfolioMonthlyUtilizations = [
        [
          { year: 2022, month: 12 },
          { year: 2023, month: 1 },
          { year: 2023, month: 2 }
        ],
        [
          { year: 2022, month: 12 },
          { year: 2023, month: 1 },
          { year: 2023, month: 2 }
        ]
      ] as MonthlyUtilization[][];

      const expectedComparisonPortfolioMonthlyUtilizations = [
        [
          { year: 2022, month: 12 },
          { year: 2023, month: 1 },
          { year: 2023, month: 2 }
        ],
        [
          { year: 2022, month: 12 },
          { year: 2023, month: 1 },
          { year: 2023, month: 2 }
        ]
      ];

      expect(trackedUtilizationExcelSheetServiceSpy.buildExcelSheet).toHaveBeenCalledWith(
        portfolioDetailOptions,
        expectedPortfolioMonthlyUtilizations,
        comparisonPortfolioDetailOptions,
        expectedComparisonPortfolioMonthlyUtilizations
      );
    });

    describe('portfolioDetailOptions and comparisonDetailOptions are not null', () => {
      const isEmissions = true;
      const isHoursAndCycle = false;

      it('gets monthly utilization for both portfolios', () => {
        // arrange
        const portfolioDetailOptions = {
          portfolioId: 1,
          portfolioName: 'Portfolio 1',
          groupByOptions: {
            key: 'groupOptionsKey',
            filterIds: [1, 2, 3]
          },
          operatorId: 1,
          operatorName: 'Operator 1',
          lessorId: 1,
          lessorName: 'Lessor 1',
          includeBaseline: false
        };
        const metricOptions = { startYear: 2017, startMonthIndex: 0, endYear: 2021, endMonthIndex: 11 } as MetricOptions;
        const metric = [
          {
            name: 'Average Monthly Tracked Hours',
            numberOfAircraftPropertyName: 'numberOfAircraftWithHours',
            valuePropertyName: 'averageHours'
          }
        ];

        const comparisonPortfolioDetailOptions = {
          portfolioId: 2,
          portfolioName: 'Portfolio 2',
          groupByOptions: {
            key: 'groupOptionsKey2',
            filterIds: [1, 2, 3, 4]
          },
          operatorId: 2,
          operatorName: 'Operator 2',
          lessorId: 2,
          lessorName: 'Lessor 2',
          includeBaseline: false
        };

        utilizationServiceSpy.getMonthlyUtilization.and.returnValue(of([]), of([]));
        utilizationServiceSpy.getMonthlyUtilizationPerAircraft.and.returnValues(of([]), of([]));

        // act
        service.export(portfolioDetailOptions, comparisonPortfolioDetailOptions, metricOptions, metric, isEmissions, isHoursAndCycle);

        // assert
        expect(utilizationServiceSpy.getMonthlyUtilization).toHaveBeenCalledTimes(2);

        expect(utilizationServiceSpy.getMonthlyUtilization).toHaveBeenCalledWith(
          portfolioDetailOptions.portfolioId,
          true,
          isEmissions,
          isHoursAndCycle,
          portfolioDetailOptions.groupByOptions?.key,
          portfolioDetailOptions.groupByOptions?.filterIds,
          portfolioDetailOptions.operatorId,
          portfolioDetailOptions.lessorId
        );

        expect(utilizationServiceSpy.getMonthlyUtilization).toHaveBeenCalledWith(
          comparisonPortfolioDetailOptions.portfolioId,
          true,
          isEmissions,
          isHoursAndCycle,
          comparisonPortfolioDetailOptions.groupByOptions?.key,
          comparisonPortfolioDetailOptions.groupByOptions?.filterIds,
          comparisonPortfolioDetailOptions.operatorId,
          comparisonPortfolioDetailOptions.lessorId
        );
      });
    });

    describe('portfolioDetailOptions is not null and comparisonDetailOptions is null', () => {
      const isEmissions = true;
      const isHoursAndCycle = false;
      it('gets monthly utilization for portfolioDetailOptions portfolio and not comparisonDetailOptions portfolio', () => {
        // arrange
        const portfolioDetailOptions = {
          portfolioId: 1,
          portfolioName: 'Portfolio 1',
          groupByOptions: {
            key: 'groupOptionsKey',
            filterIds: [1, 2, 3]
          },
          operatorId: 1,
          operatorName: 'Operator 1',
          lessorId: 1,
          lessorName: 'Lessor 1',
          includeBaseline: false
        };
        const metricOptions = { startYear: 2017, startMonthIndex: 0, endYear: 2021, endMonthIndex: 11 } as MetricOptions;
        const metric = [
          {
            name: 'Average Monthly Tracked Hours',
            numberOfAircraftPropertyName: 'numberOfAircraftWithHours',
            valuePropertyName: 'averageHours'
          }
        ];

        utilizationServiceSpy.getMonthlyUtilization.and.returnValue(of([]), of([]));
        utilizationServiceSpy.getMonthlyUtilizationPerAircraft.and.returnValues(of([]), of([]));

        // act
        service.export(portfolioDetailOptions, undefined, metricOptions, metric, isEmissions, isHoursAndCycle);

        // assert
        expect(utilizationServiceSpy.getMonthlyUtilization).toHaveBeenCalledTimes(1);

        expect(utilizationServiceSpy.getMonthlyUtilization).toHaveBeenCalledWith(
          portfolioDetailOptions.portfolioId,
          true,
          isEmissions,
          isHoursAndCycle,
          portfolioDetailOptions.groupByOptions?.key,
          portfolioDetailOptions.groupByOptions?.filterIds,
          portfolioDetailOptions.operatorId,
          portfolioDetailOptions.lessorId
        );
      });
    });
  });
});
