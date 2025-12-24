import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FleetInsightsTrendsSummaryRequest } from '../models/fleet-insights-trends-summary-request';
import { SummaryResponseModel } from '../models/summary-response-model';

@Injectable({
  providedIn: 'root'
})
export class FleetInsightsTrendsService {
  private readonly apiUrl = '/api';
  private readonly baseUrl = '/api/trends';

  constructor(private http: HttpClient) {}

  getTrendsSummaryData(request: FleetInsightsTrendsSummaryRequest): Observable<SummaryResponseModel> {
    const params = this.toHttpParams(request);
    return this.http.get<SummaryResponseModel>(`${this.baseUrl}/summary`, { params });
  }

  private toHttpParams(obj: Record<string, any>): HttpParams {
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
