import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { Profile } from '../models/profile';
import { GlobalConstants } from '../models/global-constants';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private readonly httpClient: HttpClient, private readonly appConfigService: AppConfigService) {}

  getProfile(): Observable<Profile> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      context: new HttpContext().set(GlobalConstants.skipFailedRequestInterceptor, true)
    };

    return this.httpClient.get<Profile>(this.appConfigService.configuration.myCiriumApiUrl + '/profile', httpOptions);
  }
}
