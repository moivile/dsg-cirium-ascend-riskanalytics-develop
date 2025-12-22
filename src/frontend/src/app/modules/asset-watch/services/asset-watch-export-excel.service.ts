import { Injectable } from '@angular/core';
import { ExcelSheetData } from '../../shared/models/excel-sheet-data';
import { AssetWatchSummaryRequest } from '../models/asset-watch-summary-request';
import { IdNamePairModel } from '../../shared/models/id-name-pair-model';
import { StringIdNamePairModel } from '../../shared/models/string-id-name-pair-model';
import { TimePeriodOption } from '../models/time-period-option';
import { GroupingOption } from '../models/grouping-option';
import { ChartInputData } from '../models/chart-input-data';
import { ExportExcelService } from '../../shared/services/export-excel-service';
import { AssetWatchGridModel } from '../models/asset-watch-grid-model';
import { FlightDetailsTableModel } from '../models/flight-details-table-model';
import { AssetWatchStore } from './asset-watch-store';
import { Observable, combineLatest, map, take, withLatestFrom } from 'rxjs';
import { AssetWatchGridRequest } from '../models/asset-watch-grid-request';
import { AppStore } from '../../../app-store';
import * as dayjs from 'dayjs';

@Injectable()
export class AssetWatchExportExcelService {
  dateFormat = 'YYYY-MM-DD';
  constructor(
    private readonly exportExcelService: ExportExcelService,
    private readonly assetWatchStore: AssetWatchStore,
    private readonly appStore: AppStore
  ) {}

  public exportDetailsTableExcel(tableData: AssetWatchGridModel[], request: AssetWatchGridRequest): Observable<void> {
    const excelData: Map<string, ExcelSheetData> = new Map<string, ExcelSheetData>();

    const excelSheetData: ExcelSheetData = {
      excelData: [],
      headersInOrder: null,
      excelNumberFormat: '0',
      isPivot: false
    };

    excelSheetData.excelData = tableData.map((item) => {
      let row: any = {
        Serial: item.aircraftSerialNumber,
        Registration: item.aircraftRegistrationNumber,
        'Aircraft Series': item.aircraftSeries,
        Operator: item.operatorName,
        Manager: item.managerName
      };

      if (!request.showAircraftOnGround) {
        row = {
          ...row,
          'Total Flights': item.numberOfFlights,
          'Total Flight Time (Hours)': item.totalFlightHours,
          'Total Ground Stay (Hours)': item.totalGroundStayHours,
          'Times Between Min/Max Ind. Ground Stay': item.timesBetweenMinMaxIndGroundStay
        };
      }

      row = {
        ...row,
        'Last Flight Date': item.lastFlightDate ? dayjs(item.lastFlightDate).format(this.dateFormat) : '',
        'Maintenance Activity': item.maintenanceActivity,
        'Current Ground Stay Duration (Hours)': item.currentGroundEventDurationHours,
        'Current Ground Stay Location': item.currentGroundEventAirportName
      };

      return row;
    });

    return this.getLeftPanelFilterCriteriaExcelSheetData(request).pipe(
      withLatestFrom(this.assetWatchStore.maintenanceActivities$),
      map(([filterCriteriaExcelSheetData, maintenanceActivities]) => {
        this.addWatchlistToFilterCriteriaExcelSheetData(filterCriteriaExcelSheetData, request, maintenanceActivities);
        excelData.set('Filter Criteria', filterCriteriaExcelSheetData);

        excelData.set('Data', excelSheetData);

        const fileName = this.exportExcelService.buildFileName('AssetWatchListGrid');
        this.exportExcelService.exportExcelSheetData(excelData, fileName, false, true);

        return undefined;
      })
    );
  }

  public exportFlightDetailsTableExcel(
    flightDetails: FlightDetailsTableModel[],
    aircraftSerialNumber: string,
    request: AssetWatchGridRequest
  ): Observable<void> {
    const excelData: Map<string, ExcelSheetData> = new Map<string, ExcelSheetData>();

    const excelSheetData: ExcelSheetData = {
      excelData: [],
      headersInOrder: null,
      excelNumberFormat: '0',
      isPivot: false
    };

    excelSheetData.excelData = flightDetails.map((item) => {
      return {
        'Departure Date': this.getDateOnly(item.departureDate),
        'Last Origin Airport': this.transformToTitleCase(item.lastOriginAirport),
        'Date of Arrival': this.getDateOnly(item.arrivalDate),
        'Selected Airport': this.transformToTitleCase(item.selectedAirport),
        'Selected Country/Subregion': this.transformToTitleCase(item.selectedCountry),
        'Route Category': this.transformToTitleCase(item.routeCategory),
        'Operation Type': this.transformToTitleCase(item.operationType),
        'Flight Time (Hours)': item.flightHours,
        'Time on Ground (Hours)': item.groundEventTime,
        'Maintenance Activity': this.transformToTitleCase(item.maintenanceActivity),
        'Next Destination Airport': this.transformToTitleCase(item.nextDestinationAirport)
      };
    });

    return this.getLeftPanelFilterCriteriaExcelSheetData(request).pipe(
      withLatestFrom(this.assetWatchStore.maintenanceActivities$),
      map(([filterCriteriaExcelSheetData, maintenanceActivities]) => {
        this.addWatchlistToFilterCriteriaExcelSheetData(filterCriteriaExcelSheetData, request, maintenanceActivities);
        excelData.set('Filter Criteria', filterCriteriaExcelSheetData);

        excelData.set('Data', excelSheetData);

        const fileName = this.exportExcelService.buildFileName('FlightDetails For Serial (' + aircraftSerialNumber + ') ');
        this.exportExcelService.exportExcelSheetData(excelData, fileName, false, true);

        return undefined;
      })
    );
  }

  public exportSummaryExcel(
    flightsChartInputData: ChartInputData,
    groundStaysChartInputData: ChartInputData,
    request: AssetWatchSummaryRequest
  ): Observable<void> {
    const tableData: Map<string, ExcelSheetData> = new Map<string, ExcelSheetData>();
    tableData.set(
      'Flights',
      this.getSummaryExcelSheetData(
        flightsChartInputData,
        GroupingOption[request?.assetWatchGroupingOption as keyof typeof GroupingOption]?.toString()
      )
    );
    tableData.set(
      'Ground Stays',
      this.getSummaryExcelSheetData(
        groundStaysChartInputData,
        GroupingOption[request?.assetWatchGroupingOption as keyof typeof GroupingOption]?.toString()
      )
    );

    return this.getLeftPanelFilterCriteriaExcelSheetData(request).pipe(
      map((filterCriteriaExcelSheetData) => {
        filterCriteriaExcelSheetData.excelData.push({
          Criteria: 'Group by',
          Selection: GroupingOption[request.assetWatchGroupingOption as keyof typeof GroupingOption]?.toString()
        });
        tableData.set('Filter Criteria', filterCriteriaExcelSheetData);

        const fileName = this.exportExcelService.buildFileName('flights_ground_stays');

        this.exportExcelService.exportExcelSheetData(tableData, fileName);

        return undefined;
      })
    );
  }

  private addWatchlistToFilterCriteriaExcelSheetData(
    filterCriteriaExcelSheetData: ExcelSheetData,
    request: AssetWatchGridRequest,
    maintenanceActivities: IdNamePairModel[]
  ): void {

    filterCriteriaExcelSheetData.excelData.push({
      Criteria: 'Min. No. of Flights',
      Selection: request.minNoOfFlights?.toString()
    });
    filterCriteriaExcelSheetData.excelData.push({
      Criteria: 'Min. Total Ground Stay (Hours)',
      Selection: request.minTotalGroundStay?.toString()
    });
    filterCriteriaExcelSheetData.excelData.push({
      Criteria: 'Min. Individual Ground Stay (Hours)',
      Selection: request.minIndividualGroundStay?.toString()
    });
    filterCriteriaExcelSheetData.excelData.push({
      Criteria: 'Max. Individual Ground Stay (Hours)',
      Selection: request.maxIndividualGroundStay?.toString()
    });

    if (request.minCurrentGroundStay)
    {
      filterCriteriaExcelSheetData.excelData.push({
        Criteria: 'Min. Current Ground Stay (Hours)',
        Selection: request.minCurrentGroundStay?.toString()
      });
    }

    if (request.maxCurrentGroundStay)
    {
      filterCriteriaExcelSheetData.excelData.push({
        Criteria: 'Max. Current Ground Stay (Hours)',
        Selection: request.maxCurrentGroundStay?.toString()
      });
    }

    if (request.displayMaintenanceActivity) {
      filterCriteriaExcelSheetData.excelData.push(
        this.getNames('Maintenance Activity', request.maintenanceActivityIds, maintenanceActivities)
      );
    }
  }

  private getSummaryExcelSheetData(inputData: ChartInputData, groupingOption: string | undefined): ExcelSheetData {
    const excelSheetData: ExcelSheetData = {
      excelData: [],
      headersInOrder: null,
      excelNumberFormat: '0',
      isPivot: false
    };

    groupingOption = groupingOption || 'Name';

    const transformedData = inputData.labels.map((label, index) => {
      const dataObject: { [key: string]: string | number } = { [groupingOption as string]: label };
      inputData.legendItemLabels.forEach((legend, i) => {
        dataObject[legend] = inputData.chartCounts[i][index];
      });
      return dataObject;
    });

    excelSheetData.excelData = transformedData;

    return excelSheetData;
  }

  private getLeftPanelFilterCriteriaExcelSheetData(request: AssetWatchSummaryRequest | AssetWatchGridRequest): Observable<ExcelSheetData> {
    const excelSheetData: ExcelSheetData = {
      excelData: [] as { Criteria: string; Selection: string }[],
      headersInOrder: ['Criteria', 'Selection'],
      excelNumberFormat: '0',
      isPivot: false
    };

    return combineLatest({
      filterOptions: this.assetWatchStore.filterOptions$,
      portfolios: this.appStore.portfolios$
    }).pipe(
      take(1),
      map(({ filterOptions, portfolios }) => {
        excelSheetData.excelData.push({
          Criteria: 'Portfolio',
          Selection: portfolios.find((portfolio) => portfolio.id === request.portfolioId)?.name || ''
        });

        if (request.regionCodes?.length > 0) {
          excelSheetData.excelData.push(this.getNames('Regions', request.regionCodes, filterOptions.regions));
        }
        if (request.countryCodes?.length > 0) {
          excelSheetData.excelData.push(this.getNames('Countries/Subregions', request.countryCodes, filterOptions.countries));
        }

        if (request.cities?.length > 0) {
          excelSheetData.excelData.push(this.getNames('Cities', request.cities, filterOptions.cities));
        }

        if (request.airportCodes?.length > 0) {
          excelSheetData.excelData.push(this.getNames('Airports', request.airportCodes, filterOptions.airports));
        }

        excelSheetData.excelData.push({
          Criteria: 'Date Range',
          Selection: TimePeriodOption[request.period as keyof typeof TimePeriodOption]?.toString()
        });
        excelSheetData.excelData.push({ Criteria: 'Start Date - End Date', Selection: `${request.dateFrom} - ${request.dateTo}` });

        if (request.operatorIds?.length > 0) {
          excelSheetData.excelData.push(this.getNames('Operator', request.operatorIds, filterOptions.operators));
        }

        if (request.lessorIds?.length > 0) {
          excelSheetData.excelData.push(this.getNames('Lessor', request.lessorIds, filterOptions.lessors));
        }

        if (request.aircraftSeriesIds?.length > 0) {
          excelSheetData.excelData.push(this.getNames('Aircraft Series', request.aircraftSeriesIds, filterOptions.aircraftSeries));
        }

        if (request.engineSerieIds?.length > 0) {
          excelSheetData.excelData.push(this.getNames('Engine Series', request.engineSerieIds, filterOptions.engineSeries));
        }

        if (request.aircraftIds?.length > 0) {
          excelSheetData.excelData.push(this.getNames('Serial', request.aircraftIds, filterOptions.aircraftSerialNumbers));
        }
        return excelSheetData;
      })
    );
  }

  private getNames<T extends IdNamePairModel | StringIdNamePairModel>(
    optionName: string,
    ids: (number | string)[],
    options: T[]
  ): { Criteria: string; Selection: string } {
    const names = ids
      .map((id) => {
        const option = options.find((option) => option.id === id);
        return option?.name;
      })
      .filter((name): name is string => !!name)
      .sort();
    return { Criteria: optionName, Selection: names.join(', ') };
  }

  private getDateOnly(dateTime?: Date): any {
    if (dateTime) {
      const dateTimeFinal = new Date(dateTime);
      return new Date(dateTimeFinal.getFullYear(), dateTimeFinal.getMonth(), dateTimeFinal.getDate());
    } else {
      return;
    }
  }

  private transformToTitleCase(input?: string): string {
    if (!input) {
      return '';
    }
    const words = input.split(' ');
    return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}
