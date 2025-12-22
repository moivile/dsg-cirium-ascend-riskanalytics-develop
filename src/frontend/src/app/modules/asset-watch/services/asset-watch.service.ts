import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterPanelFormOptions } from '../models/filter-panel-form-options';
import { AssetWatchGridResponseModel } from '../models/asset-watch-grid-response-model';
import { FlightDetailsResponseModel } from '../models/flight-details-response-model';
import { AssetWatchGridRequest } from '../models/asset-watch-grid-request';
import { IdNamePairModel } from '../../shared/models/id-name-pair-model';
import { StringIdNamePairModel } from '../../shared/models/string-id-name-pair-model';

@Injectable({
  providedIn: 'root'
})
export class AssetWatchService {
  constructor(private readonly httpClient: HttpClient) {}

  getMaintenanceActivityData(): Observable<IdNamePairModel[]> {
    return this.httpClient.get<IdNamePairModel[]>(`/api/assetwatch/maintenanceactivities`);
  }
  getCitiesData(countries: string[]): Observable<StringIdNamePairModel[]> {
    let params = new HttpParams();
    if (countries?.length) {
      countries.forEach((country) => {
        params = params.append('countryIds', country.toString());
      });
    }
    return this.httpClient.get<StringIdNamePairModel[]>(`/api/assetwatch/filterdata/cities`, { params });
  }
  getAirportsData(countryIds: string[]): Observable<StringIdNamePairModel[]> {
    let params = new HttpParams();
    if (countryIds?.length) {
      countryIds.forEach((city) => {
        params = params.append('countryIds', city.toString());
      });
    }
    return this.httpClient.get<StringIdNamePairModel[]>(`/api/assetwatch/filterdata/airports`, { params });
  }

  getAssetWatchFilterData(portfolioId: number): Observable<FilterPanelFormOptions> {
    let params = new HttpParams();
    params = params.set('portfolioId', portfolioId);
    return this.httpClient.get<FilterPanelFormOptions>(`/api/portfolios/${portfolioId}/assetwatch/filterdata`, { params });
  }

  getAssetWatchListGrid(request: AssetWatchGridRequest): Observable<AssetWatchGridResponseModel> {
    const params = this.getParams(request);
    return this.httpClient.get<AssetWatchGridResponseModel>(`/api/portfolios/${request.portfolioId}/assetwatch/flights`, { params });
  }

  getFlightDetailsData(
    request: AssetWatchGridRequest,
    aircraftId: number,
    sortColumn?: string,
    sortOrder?: string
  ): Observable<FlightDetailsResponseModel> {
    let params = this.getParams(request, sortColumn, sortOrder);
    params = params.set('aircraftId', aircraftId);
    return this.httpClient.get<FlightDetailsResponseModel>(`/api/portfolios/${request.portfolioId}/assetwatch/flightdetails`, { params });
  }

  getParams(request: AssetWatchGridRequest, sortColumn?: string, sortOrder?: string): HttpParams {
    let params = new HttpParams();
    params = params.set('PortfolioId', request.portfolioId.toString());
    params = params.set('DateFrom', request.dateFrom);
    params = params.set('DateTo', request.dateTo);
    if (request.skip) {
      params = params.set('Skip', request.skip);
    }
    if (request.take) {
      params = params.set('Take', request.take);
    }
    params = params.set('Period', request.period);
    if (request.routeCategory?.length) {
      params = params.set('RouteCategory', request.routeCategory);
    }
    if (sortColumn && sortOrder && sortColumn.trim().length > 0) {
      params = params.set('SortColumn', sortColumn);
      params = params.set('SortOrder', sortOrder);
    }
    params = params.set('MinNoOfFlights', request.minNoOfFlights);
    params = params.set('MinTotalGroundStay', request.minTotalGroundStay);
    params = params.set('MinIndividualGroundStay', request.minIndividualGroundStay);
    params = params.set('minCurrentGroundStay', request.minCurrentGroundStay);
    params = params.set('MaxIndividualGroundStay', request.maxIndividualGroundStay);
    params = params.set('maxCurrentGroundStay', request.maxCurrentGroundStay);
    params = params.set('ShowAircraftOnGround', request.showAircraftOnGround);
    if (request.maintenanceActivityIds?.length) {
      request.maintenanceActivityIds.forEach((maintenanceActivityId) => {
        params = params.append('MaintenanceActivityIds', maintenanceActivityId.toString());
      });
    }
    if (request.airportCodes?.length) {
      request.airportCodes.forEach((airport) => {
        params = params.append('AirportCodes', airport.toString());
      });
    }
    if (request.cities?.length) {
      request.cities.forEach((city) => {
        params = params.append('Cities', city.toString());
      });
    }
    if (request.countryCodes?.length) {
      request.countryCodes.forEach((country) => {
        params = params.append('CountryCodes', country.toString());
      });
    }
    if (request.regionCodes?.length) {
      request.regionCodes.forEach((region) => {
        params = params.append('RegionCodes', region.toString());
      });
    }
    if (request.operatorIds?.length) {
      request.operatorIds.forEach((operatorId) => {
        params = params.append('OperatorIds', operatorId.toString());
      });
    }
    if (request.lessorIds?.length) {
      request.lessorIds.forEach((lessorId) => {
        params = params.append('LessorIds', lessorId.toString());
      });
    }
    if (request.aircraftSeriesIds?.length) {
      request.aircraftSeriesIds.forEach((aircraftSeriesId) => {
        params = params.append('AircraftSeriesIds', aircraftSeriesId.toString());
      });
    }
    if (request.engineSerieIds?.length) {
      request.engineSerieIds.forEach((engineSeries) => {
        params = params.append('EngineSerieIds', engineSeries.toString());
      });
    }
    if (request.aircraftIds?.length) {
      request.aircraftIds.forEach((aircraftId) => {
        params = params.append('AircraftIds', aircraftId.toString());
      });
    }
    return params;
  }
}
