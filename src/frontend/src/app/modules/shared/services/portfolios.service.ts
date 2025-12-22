import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UpsertPortfolioRequest } from '../models/upsert-portfolio-request';
import { Portfolio } from '../models/portfolio';

@Injectable({
  providedIn: 'root'
})
export class PortfoliosService {
  constructor(private readonly httpClient: HttpClient) {}

  deletePortfolio(id: number): Observable<object> {
    return this.httpClient.delete(`/api/portfolios/${id}`);
  }

  getPortfolios(): Observable<Portfolio[]> {
    return this.httpClient.get<Portfolio[]>(`/api/portfolios`);
  }

  getPortfolio(id: number): Observable<Portfolio> {
    return this.httpClient.get<Portfolio>(`/api/portfolios/${id}`);
  }

  upsertPortfolio(model: UpsertPortfolioRequest): Observable<number> {
    if (model.id) {
      return this.httpClient.put<number>(`/api/portfolios/${model.id}`, model);
    } else {
      return this.httpClient.post<number>('/api/portfolios', model);
    }
  }
}
