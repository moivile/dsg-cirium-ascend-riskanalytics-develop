import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FleetInsightsAircraftFilterResponseModel } from '../models/fleet-insights-aircraft-filter-response.model';
import { Observable } from 'rxjs';
import { FleetInsightsFiltersRequest } from '../models/fleet-insights-filters-request';
import { FleetInsightsAircraftRequest } from '../models/fleet-insights-aircraft-request';
import { FleetInsightsAircraftResponseModel } from '../models/fleet-insights-aircraft-response-model';
import { FleetInsightsAircraftSummaryRequest } from '../models/fleet-insights-aircraft-summary-request';
import { FleetInsightsAircraftSummaryResponseModel } from '../models/fleet-insights-aircraft-summary-response-model';

@Injectable({
  providedIn: 'root'
})
export class FleetInsightsService {
  private readonly apiUrl = '/api';
  private readonly distributionBaseUrl = '/api/distribution';

  constructor(private http: HttpClient) {}

  getAircraftFilterData(request: FleetInsightsFiltersRequest): Observable<FleetInsightsAircraftFilterResponseModel> {
    const params = this.toHttpParams(request);
    return this.http.get<FleetInsightsAircraftFilterResponseModel>(`${this.apiUrl}/filters`, { params });
  }

  getAircraftData(request: FleetInsightsAircraftRequest): Observable<FleetInsightsAircraftResponseModel> {
    const params = this.toHttpParams(request);
    return this.http.get<FleetInsightsAircraftResponseModel>(`${this.distributionBaseUrl}/details`, { params });
  }

  getAircraftSummaryData(request: FleetInsightsAircraftSummaryRequest): Observable<FleetInsightsAircraftSummaryResponseModel> {
    const params = this.toHttpParams(request);
    return this.http.get<FleetInsightsAircraftSummaryResponseModel>(`${this.distributionBaseUrl}/summary`, { params });
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
