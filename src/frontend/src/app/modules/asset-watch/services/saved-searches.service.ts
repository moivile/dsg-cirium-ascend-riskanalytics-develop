import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SavedSearchRequest } from '../models/saved-search-request';
import { EmailPreferences } from '../models/email-preferences';
import { SavedSearchModel } from '../models/saved-search-model';

@Injectable({
  providedIn: 'root'
})
export class SavedSearchesService {
  constructor(private readonly httpClient: HttpClient) {}

  getSavedSearchList(): Observable<SavedSearchModel[]> {
    return this.httpClient.get<SavedSearchModel[]>(`/api/searches`);
  }

  getSavedSearch(id: number): Observable<SavedSearchModel> {
    return this.httpClient.get<SavedSearchModel>(`/api/searches/${id}`);
  }

  createSavedSearch(request: SavedSearchRequest): Observable<number> {
    return this.httpClient.post<number>(`/api/searches`, request);
  }

  updateSavedSearch(id: number, request: SavedSearchRequest): Observable<void> {
    return this.httpClient.put<void>(`/api/searches/${id}`, request);
  }

  updateSavedSearchIsActive(id: number, isActive: boolean): Observable<void> {
    return this.httpClient.put<void>(`/api/searches/${id}/is-active`, isActive);
  }

  updateNameAndDescription(id: number, name: string, description?: string): Observable<void> {
    return this.httpClient.put<void>(`/api/searches/${id}/name-description`, { name, description });
  }

  deleteSavedSearch(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/searches/${id}`);
  }

  getEmailPreferences(): Observable<EmailPreferences> {
    return this.httpClient.get('/api/searches/frequency', { responseType: 'text' }).pipe(
      map((response) => {
        if (response === 'Daily' || response === 'AlertsOnly') {
          return response as EmailPreferences;
        } else {
          throw new Error(`Invalid email preference: ${response}`);
        }
      })
    );
  }

  updateEmailPreferences(frequency: EmailPreferences): Observable<void> {
    return this.httpClient.put<void>('/api/searches/frequency', { frequency });
  }

  isSavedSearchNameDuplicate(savedSearchName: string): Observable<boolean> {
    return this.httpClient.get<boolean>(`/api/searches/duplicate/${savedSearchName}`);
  }
}
