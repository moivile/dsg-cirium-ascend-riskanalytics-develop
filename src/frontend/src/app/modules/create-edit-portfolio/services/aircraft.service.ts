import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AircraftSearchResult } from '../models/aircraft-search-result';
import { SearchAircraftRequest } from '../models/search-aircraft-request';

@Injectable({
  providedIn: 'root'
})
export class AircraftService {
  constructor(private readonly httpClient: HttpClient) {}

  search(searchRequest: SearchAircraftRequest): Observable<AircraftSearchResult> {
    let params = new HttpParams().set('skip', searchRequest.skip.toString()).set('take', searchRequest.take.toString());

    if (searchRequest.keyword) {
      params = params.set('keyword', searchRequest.keyword);
    }

    if (searchRequest.manufacturerIds?.length) {
      searchRequest.manufacturerIds.forEach((manufacturerId) => {
        params = params.append('manufacturerIds', manufacturerId.toString());
      });
    }
    if (searchRequest.aircraftTypeIds?.length) {
      searchRequest.aircraftTypeIds.forEach((aircraftTypeId) => {
        params = params.append('aircraftTypeIds', aircraftTypeId.toString());
      });
    }
    if (searchRequest.aircraftMasterSeriesIds?.length) {
      searchRequest.aircraftMasterSeriesIds.forEach((aircraftMasterSeriesId) => {
        params = params.append('aircraftMasterSeriesIds', aircraftMasterSeriesId.toString());
      });
    }

    if (searchRequest.aircraftOperatorIds?.length) {
      searchRequest.aircraftOperatorIds.forEach((aircraftOperatorId) => {
        params = params.append('aircraftOperatorIds', aircraftOperatorId.toString());
      });
    }
    if (searchRequest.operatorCountryIds?.length) {
      searchRequest.operatorCountryIds.forEach((operatorCountryId) => {
        params = params.append('operatorCountryIds', operatorCountryId.toString());
      });
    }
    if (searchRequest.lessorIds?.length) {
      searchRequest.lessorIds.forEach((lessorId) => {
        params = params.append('lessorIds', lessorId.toString());
      });
    }
    if (searchRequest.companyTypeIds?.length) {
      searchRequest.companyTypeIds.forEach((companyTypeId) => {
        params = params.append('companyTypeIds', companyTypeId.toString());
      });
    }
    if (searchRequest.statusIds?.length) {
      searchRequest.statusIds.forEach((statusId) => {
        params = params.append('statusIds', statusId.toString());
      });
    }

    return this.httpClient.get<AircraftSearchResult>('/api/aircraft', { params }).pipe(
      map((searchResult) => {
        searchResult.aircraftList = searchResult.aircraftList || [];
        searchResult.manufacturers = searchResult.manufacturers || [];
        searchResult.aircraftTypes = searchResult.aircraftTypes || [];
        searchResult.aircraftMasterSeries = searchResult.aircraftMasterSeries || [];
        searchResult.aircraftOperators = searchResult.aircraftOperators || [];
        searchResult.operatorCountries = searchResult.operatorCountries || [];
        searchResult.lessors = searchResult.lessors || [];
        searchResult.companyTypes = searchResult.companyTypes || [];
        searchResult.statuses = searchResult.statuses || [];
        return searchResult;
      })
    );
  }
}
