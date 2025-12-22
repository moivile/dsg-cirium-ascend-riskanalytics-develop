import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  claims: string[];
  userEmailAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppUserService {
  private appUser$ = this.httpClient.get<User>('/api/portfolios/user/details').pipe(shareReplay(1));

  constructor(private httpClient: HttpClient) {}

  getAppUser(): Observable<User> {
    return this.appUser$;
  }
}
