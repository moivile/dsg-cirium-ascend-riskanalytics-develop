import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Aircraft } from '../models/aircraft';

@Injectable({
  providedIn: 'root'
})
export class PortfolioAircraftService {
  constructor(private readonly httpClient: HttpClient) {
  }

  getPortfolioAircraft(portfolioId: number): Observable<Aircraft[]> {
    return this.httpClient.get<Aircraft[]>(`/api/portfolios/${portfolioId}/aircraft`);
  }
}
