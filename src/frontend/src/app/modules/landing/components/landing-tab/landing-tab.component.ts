import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ProfileService } from '../../../shared/services/profile.service';
import { AppStore } from 'src/app/app-store';

@Component({
  templateUrl: './landing-tab.component.html',
  styleUrls: ['./landing-tab.component.scss']
})
export class LandingTabComponent implements OnInit {
  userFirstName$!: Observable<string>;
  constructor(public readonly appStore: AppStore, private readonly profileService: ProfileService) {}

  ngOnInit(): void {
    this.userFirstName$ = this.profileService.getProfile().pipe(map((x) => x.person?.name?.first ?? ''));
  }
}
