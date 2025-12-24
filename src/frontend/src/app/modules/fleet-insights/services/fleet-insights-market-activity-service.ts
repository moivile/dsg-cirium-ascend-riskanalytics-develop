import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MarketActivitySummaryRequest } from '../models/market-activity-summary-request';
import { MarketActivitySummaryResponseModel } from '../models/market-activity-summary-response-model';
import { MarketActivityTrendsRequest } from '../models/market-activity-trends-request';
import { MarketActivityTrendsResponseModel } from '../models/market-activity-trends-response-model';

type HttpParamsValue = string | number | boolean | string[] | number[] | null | undefined;

@Injectable({
  providedIn: 'root'
})
export class FleetInsightsMarketActivityService {
  private readonly apiUrl = '/api';
  private readonly baseUrl = '/api/marketactivities';

  constructor(private http: HttpClient) {}

  getMarketActivitySummaryData(request: MarketActivitySummaryRequest): Observable<MarketActivitySummaryResponseModel> {
    const params = this.toHttpParams(request as Record<keyof MarketActivitySummaryRequest, HttpParamsValue>);
    return this.http.get<MarketActivitySummaryResponseModel>(`${this.baseUrl}/summary`, { params });
  }

  getMarketActivityTrendsData(request: MarketActivityTrendsRequest): Observable<MarketActivityTrendsResponseModel> {
    const params = this.toHttpParams(request as Record<keyof MarketActivityTrendsRequest, HttpParamsValue>);
    return this.http.get<MarketActivityTrendsResponseModel>(`${this.baseUrl}/trends`, { params });
  }

  private toHttpParams(obj: Record<string, HttpParamsValue>): HttpParams {
    let params = new HttpParams();

    Object.entries(obj).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          params = params.append(key, item.toString());
        });
      } else {
        params = params.set(key, value.toString());
      }
    });
    return params;
  }
}
