import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { Injectable } from '@angular/core';
import { AppUserService, User } from './app-user.service';
import { SHA256 } from 'crypto-js';

export interface AppState {
  appUser: User | null;
  testFeatureAccessHashes: string[];
}

export const initialState: AppState = {
  appUser: null,
  testFeatureAccessHashes: [
    // precomputed SHA-256 hashes of allowed emails
    '8b9869e2176c8875cb8d53f808924405bcc752eca61c74717344d8680ccfeb50',
    'cdda318c735f9bc3c6d5e048e6d76739e7d57117593e0057470f968de166547a',
    'de307ff0d06949f4303ed13bfcfd9e6c81f26d8f77289acb30f977663b5f41ef',
    '243c4b9b9c87ccc7c675a5795a1daa49629436ff23aeb7fc67344105d14b5b2e',
    'c00d9ffbd79bec9ddab03fbb5c176ca452d300e6bd3e6a66e15642fb595b87fa',
    '3a0fc173dd93458d415415860a106d23225c711942e1c5bc873c2e96aa247d8f',
    'd6cae660d174bcc8411fe504741d419b2019d9c5e6ee35ae8378fa0acb8bc4c8',
    '810dcf6b58761fe2aa5a2e717585425638d1e28b7148d85c90a4899a48ffeaef',
    '9d94446cb638ca62e6235de573caf763ec66dba09d49687db92620a364e7fb32',
    'db6a01c3ea426e24c0e3c3744859b155f1c05e85c65b32d431e8fb5062d0d1ab'
  ]
};

@Injectable()
export class AppStore extends ComponentStore<AppState> {
  constructor(private userService: AppUserService) {
    super(initialState);
  }

  readonly appUser$ = this.select((state) => state.appUser);
  readonly testFeatureAccessHashes$ = this.select((state) => state.testFeatureAccessHashes);

  readonly userEmailAddress$ = this.select(this.appUser$, (appUser) => appUser?.userEmailAddress || '');

  readonly isTestFeatureEnabled$ = this.select(this.userEmailAddress$, this.testFeatureAccessHashes$, (email, hashes) => {
    const normalized = email.trim().toLowerCase();
    const emailHash = SHA256(normalized).toString();
    return hashes.includes(emailHash);
  });

  readonly setAppUser = this.updater((state, appUser: User) => ({
    ...state,
    appUser
  }));

  loadAppUser = this.effect<void>(() => {
    return this.userService.getAppUser().pipe(
      tapResponse(
        (appUser) => this.setAppUser(appUser),
        () => console.log('error loading app user')
      )
    );
  });
}
