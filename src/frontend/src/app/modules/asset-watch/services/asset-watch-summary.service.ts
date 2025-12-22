import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SummaryGroundEventsModel } from '../models/summary-ground-events-model';
import { AssetWatchSummaryRequest } from '../models/asset-watch-summary-request';
import { SummaryFlightsModel } from '../models/summary-flights-model';

@Injectable({
  providedIn: 'root'
})
export class AssetWatchSummaryService {
  constructor(private readonly httpClient: HttpClient) {}

  getSummaryGroundEvents(request: AssetWatchSummaryRequest): Observable<SummaryGroundEventsModel[]> {
    const params = this.getParams(request);

    return this.httpClient.get<SummaryGroundEventsModel[]>(`/api/portfolios/${request.portfolioId}/assetwatch/summary/groundevents`, {
      params
    });
  }

  getSummaryFlights(request: AssetWatchSummaryRequest): Observable<SummaryFlightsModel[]> {
    const params = this.getParams(request);

    return this.httpClient.get<SummaryFlightsModel[]>(`/api/portfolios/${request.portfolioId}/assetwatch/summary/flights`, {
      params
    });
  }

  private getParams(request: AssetWatchSummaryRequest): HttpParams {
    let params = new HttpParams();

    params = params.set('portfolioId', request.portfolioId.toString());
    params = params.set('dateFrom', request.dateFrom);
    params = params.set('dateTo', request.dateTo);
    params = params.set('period', request.period);
    params = params.set('assetWatchGroupingOption', request.assetWatchGroupingOption);
    if (request.routeCategory?.length) {
      params = params.set('RouteCategory', request.routeCategory);
    }

    if (request.airportCodes?.length) {
      request.airportCodes.forEach((airport) => {
        params = params.append('AirportCodes', airport.toString());
      });
    } else if (request.cities?.length) {
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
        params = params.append('regionCodes', region.toString());
      });
    }

    if (request.operatorIds?.length) {
      request.operatorIds.forEach((operatorId) => {
        params = params.append('operatorIds', operatorId.toString());
      });
    }

    if (request.lessorIds?.length) {
      request.lessorIds.forEach((lessorId) => {
        params = params.append('lessorIds', lessorId.toString());
      });
    }

    if (request.aircraftSeriesIds?.length) {
      request.aircraftSeriesIds.forEach((aircraftSeriesId) => {
        params = params.append('aircraftSeriesIds', aircraftSeriesId.toString());
      });
    }

    if (request.engineSerieIds?.length) {
      request.engineSerieIds.forEach((engineSeries) => {
        params = params.append('engineSerieIds', engineSeries.toString());
      });
    }

    if (request.aircraftIds?.length) {
      request.aircraftIds.forEach((aircraftId) => {
        params = params.append('aircraftIds', aircraftId.toString());
      });
    }

    return params;
  }
}
