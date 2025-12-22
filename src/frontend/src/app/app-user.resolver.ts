import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User, AppUserService } from './app-user.service';

@Injectable({
  providedIn: 'root'
})
export class AppUserResolver {
  constructor(private userService: AppUserService) {}

  resolve(): Observable<User> {
    return this.userService.getAppUser();
  }
}
