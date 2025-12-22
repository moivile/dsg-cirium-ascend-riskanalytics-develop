import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { SavedSearchModel } from '../../models/saved-search-model';
import { SavedSearchesService } from '../../services/saved-searches.service';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { NoticeService } from '../../../shared/services/notice.service';
import { EmailPreferences } from '../../models/email-preferences';

interface AssetWatchSaveSearchManagementState {
  savedSearches: SavedSearchModel[];
  emailPreferences: EmailPreferences;
}

export const initialState: AssetWatchSaveSearchManagementState = {
  savedSearches: [],
  emailPreferences: EmailPreferences.Daily
};

@Injectable()
export class AssetWatchSaveSearchManagementStore extends ComponentStore<AssetWatchSaveSearchManagementState> {
  constructor(private readonly savedSearchesService: SavedSearchesService, private readonly noticeService: NoticeService) {
    super(initialState);
  }

  readonly savedSearches$ = this.select((state) => state.savedSearches);
  readonly savedSearchCount$ = this.select(this.savedSearches$, (savedSearches) => savedSearches.length);
  readonly emailPreferences$ = this.select((state) => state.emailPreferences);

  readonly setSavedSearches = this.updater((state, savedSearches: SavedSearchModel[]) => ({
    ...state,
    savedSearches
  }));

  readonly setEmailPreferences = this.updater((state, emailPreferences: EmailPreferences) => ({
    ...state,
    emailPreferences
  }));

  readonly loadSavedSearches = this.effect((trigger$) => {
    return trigger$.pipe(
      switchMap(() =>
        this.savedSearchesService.getSavedSearchList().pipe(
          tapResponse(
            (savedSearches) => {
              this.setSavedSearches(savedSearches);
              if (savedSearches.length == 0) {
                this.setEmailPreferences(EmailPreferences.Daily);
              }
            },
            () => console.log('error loading saved searches')
          )
        )
      )
    );
  });

  readonly loadEmailPreferences = this.effect((trigger$) => {
    return trigger$.pipe(
      switchMap(() =>
        this.savedSearchesService.getEmailPreferences().pipe(
          tapResponse(
            (emailPreferences) => this.setEmailPreferences(emailPreferences),
            () => console.log('error loading email preferences')
          )
        )
      )
    );
  });

  readonly deleteSavedSearch = this.effect((savedSearch$: Observable<SavedSearchModel>) => {
    return savedSearch$.pipe(
      switchMap((savedSearch) =>
        this.savedSearchesService.deleteSavedSearch(savedSearch.id).pipe(
          tapResponse(
            () => {
              this.noticeService.success(`Your saved search '${savedSearch.name}' has been deleted.`);
              this.loadSavedSearches();
            },
            () => this.noticeService.error(`Your saved search '${savedSearch.name}' could not be deleted.`)
          )
        )
      )
    );
  });

  readonly updateSavedSearchIsActive = this.effect((isActiveUpdate$: Observable<{ savedSearch: SavedSearchModel; isActive: boolean }>) =>
    isActiveUpdate$.pipe(
      switchMap(({ savedSearch, isActive }) =>
        this.savedSearchesService.updateSavedSearchIsActive(savedSearch.id, isActive).pipe(
          tapResponse(
            () => {
              this.noticeService.success(`Your saved search '${savedSearch.name}' has been updated.`);
              this.loadSavedSearches();
            },
            () => this.noticeService.error(`Your saved search '${savedSearch.name}' could not be updated.`)
          )
        )
      )
    )
  );

  readonly updateNameAndDescription = this.effect(
    (update$: Observable<{ savedSearch: SavedSearchModel; name: string; description?: string }>) =>
      update$.pipe(
        switchMap(({ savedSearch, name, description }) =>
          this.savedSearchesService.updateNameAndDescription(savedSearch.id, name, description).pipe(
            tapResponse(
              () => {
                this.noticeService.success(`Saved search '${savedSearch.name}' has been updated.`);
                this.loadSavedSearches();
              },
              () => this.noticeService.error(`Saved search '${savedSearch.name}' could not be updated.`)
            )
          )
        )
      )
  );

  readonly updateEmailPreferences = this.effect((emailPreferences$: Observable<EmailPreferences>) => {
    return emailPreferences$.pipe(
      switchMap((emailPreferences) =>
        this.savedSearchesService.updateEmailPreferences(emailPreferences).pipe(
          tapResponse(
            () => {
              this.noticeService.success('Email preferences have been updated.');
              this.loadEmailPreferences();
            },
            () => this.noticeService.error('Email preferences could not be updated.')
          )
        )
      )
    );
  });
}
