import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MonthlyUtilization } from '../../compare-portfolio/models/monthly-utilization';
import {
  OperatorOption,
  LessorOption
} from '../../compare-portfolio/components/portfolio-detail-options/portfolio-detail-options.component';
import { GroupOptions } from '../../compare-portfolio/models/group-options';
import { MSNUtilizationPerAircraft } from '../../compare-portfolio/models/monthly-utilization-per-aircraft';

@Injectable({
  providedIn: 'root'
})
export class UtilizationService {
  constructor(private readonly httpClient: HttpClient) {}

  getMonthlyUtilization(
    portfolioId: number | undefined,
    includeBaseline: boolean,
    isEmissions: boolean,
    isHoursAndCycle: boolean,
    groupBy?: string,
    groupByFilterIds?: number[],
    operatorId?: number,
    lessorId?: number
  ): Observable<MonthlyUtilization[][]> {
    let params = new HttpParams();

    if (portfolioId) {
      params = params.append('portfolioId', portfolioId);
    }

    if (groupBy) {
      params = params.append('groupBy', groupBy);
    }

    groupByFilterIds?.forEach((groupByFilterId) => {
      params = params.append('groupByFilterIds', groupByFilterId);
    });

    if (operatorId) {
      params = params.append('operatorId', operatorId);
    }

    if (lessorId) {
      params = params.append('lessorId', lessorId);
    }

    params = params.append('includeBaseline', includeBaseline);
    params = params.append('isEmissions', isEmissions);
    params = params.append('isHoursAndCycle', isHoursAndCycle);

    return this.httpClient.get<MonthlyUtilization[][]>(`/api/utilization`, { params });
  }

  getMonthlyUtilizationPerAircraft(
    portfolioId: number | undefined,
    endMonthIndex: number,
    startMonthIndex: number,
    endYear: number,
    startYear: number,
    isEmissions: boolean,
    operatorId?: number,
    lessorId?: number,
    groupBy?: string,
    groupByFilterIds?: number[]
  ): Observable<MSNUtilizationPerAircraft[]> {
    let params = new HttpParams();
    endMonthIndex = endMonthIndex + 1;
    startMonthIndex = startMonthIndex + 1;

    const paramValues = {
      portfolioId,
      endMonthIndex,
      startMonthIndex,
      endYear,
      startYear,
      isEmissions,
      operatorId,
      lessorId,
      groupBy
    };

    params = this.appendParams(params, paramValues);

    groupByFilterIds?.forEach((groupByFilterId) => {
      params = params.append('groupByFilterIds', groupByFilterId);
    });

    return this.httpClient.get<MSNUtilizationPerAircraft[]>(`/api/utilization/aircraft/monthly`, { params });
  }

  appendParams(params: HttpParams, paramValues: { [key: string]: any }): HttpParams {
    Object.keys(paramValues).forEach((key) => {
      if (paramValues[key]) {
        params = params.append(key, paramValues[key]);
      }
    });
    return params;
  }

  getOperators(portfolioId?: number, groupBy?: string, lessorId?: number, groupByFilterIds?: number[]): Observable<OperatorOption[]> {
    let params = new HttpParams();

    if (groupBy) {
      params = params.append('groupBy', groupBy);
    }

    groupByFilterIds?.forEach((groupByFilterId) => {
      params = params.append('groupByFilterIds', groupByFilterId);
    });

    if (portfolioId) {
      params = params.append('portfolioId', portfolioId);
    }

    if (lessorId) {
      params = params.append('lessorId', lessorId);
    }

    return this.httpClient.get<OperatorOption[]>(`/api/utilization/operators`, { params });
  }

  getLessors(portfolioId?: number, groupBy?: string, operatorId?: number, groupByFilterIds?: number[]): Observable<LessorOption[]> {
    let params = new HttpParams();

    if (groupBy) {
      params = params.append('groupBy', groupBy);
    }

    groupByFilterIds?.forEach((groupByFilterId) => {
      params = params.append('groupByFilterIds', groupByFilterId);
    });

    if (portfolioId) {
      params = params.append('portfolioId', portfolioId);
    }

    if (operatorId) {
      params = params.append('operatorId', operatorId);
    }

    return this.httpClient.get<LessorOption[]>(`/api/utilization/lessors`, { params });
  }

  getGroupOptions(operatorId?: number, portfolioId?: number, lessorId?: number): Observable<GroupOptions> {
    let params = new HttpParams();

    if (operatorId) {
      params = params.append('operatorId', operatorId);
    }

    if (portfolioId) {
      params = params.append('portfolioId', portfolioId);
    }

    if (lessorId) {
      params = params.append('lessorId', lessorId);
    }

    return this.httpClient.get<GroupOptions>(`/api/utilization/groups`, { params });
  }
}
