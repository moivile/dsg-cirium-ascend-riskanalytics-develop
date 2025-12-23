import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EmailPreferences } from '../../models/email-preferences';
import { Subscription, filter, forkJoin, iif, map, of, tap, withLatestFrom } from 'rxjs';
import { AssetWatchSaveSearchManagementStore } from './asset-watch-save-search-management-store';
import { SavedSearchModel } from '../../models/saved-search-model';
import { ConfirmationDialogOptions } from '../../../shared/models/confirmation-dialog-options';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { AssetWatchSavedSearchDetailsComponent } from '../asset-watch-saved-search-details/asset-watch-saved-search-details.component';
import { SavedSearchRequest } from '../../models/saved-search-request';
import { AssetWatchSavedSearchFiltersViewComponent } from '../asset-watch-saved-search-filters-view/asset-watch-saved-search-filters-view.component';
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { AssetWatchStore } from '../../services/asset-watch-store';
import { AssetWatchService } from '../../services/asset-watch.service';
import { assetWatchSavedSearchesRoute } from '../../../../route.constants';

@Component({
    selector: 'ra-asset-watch-save-search-management',
    templateUrl: './asset-watch-save-search-management.component.html',
    styleUrl: './asset-watch-save-search-management.component.scss',
    providers: [AssetWatchSaveSearchManagementStore],
    standalone: false
})
export class AssetWatchSaveSearchManagementComponent implements OnInit, OnDestroy {
  @Output() backClicked = new EventEmitter<void>();
  @Output() openSavedSearchClicked = new EventEmitter<number>();
  selectedEmailPreferencesControl = new FormControl<EmailPreferences | null>(null, Validators.required);
  assetWatchSavedSearchesRoute = `/${assetWatchSavedSearchesRoute}`;
  private confirmDeleteSavedSearchSubscription: Subscription | undefined;

  constructor(
    public readonly saveSearchManagementStore: AssetWatchSaveSearchManagementStore,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly dialogService: DialogService,
    private readonly assetWatchStore: AssetWatchStore,
    private readonly assetWatchService: AssetWatchService
  ) {}

  ngOnInit(): void {
    this.saveSearchManagementStore.loadSavedSearches();
    this.saveSearchManagementStore.loadEmailPreferences();

    this.saveSearchManagementStore.savedSearchCount$.subscribe((count) => {
      if (count > 0) {
        this.selectedEmailPreferencesControl.enable({ emitEvent: false });
      } else {
        this.selectedEmailPreferencesControl.disable({ emitEvent: false });
      }
    });

    this.saveSearchManagementStore.emailPreferences$.subscribe((emailPreferences) => {
      this.selectedEmailPreferencesControl.setValue(emailPreferences, { emitEvent: false });
    });
    this.selectedEmailPreferencesControl.valueChanges
      .pipe(
        filter((newEmailPreferences: EmailPreferences | null) => !!newEmailPreferences),
        map((newEmailPreferences) => newEmailPreferences as EmailPreferences),
        tap((newEmailPreferences) => this.saveSearchManagementStore.updateEmailPreferences(newEmailPreferences))
      )
      .subscribe();
  }

  onBackClick(): void {
    this.backClicked.emit();
  }

  onOpenSavedSearchClick(savedSearchId: number): void {
    this.openSavedSearchClicked.emit(savedSearchId);
  }

  openDeleteSavedSearchDialog(savedSearch: SavedSearchModel): void {
    const confirmOptions: ConfirmationDialogOptions = {
      body: `<p>You are about to delete <span class="delete-saved-search-name">${savedSearch.name}</span>. Deleting this saved search is permanent and you will not be able to recover this search once deleted.
      The alert associated with this saved search will be deleted.</p>
        <p>Are you sure?</p>`,
      okButtonText: 'Yes, delete',
      header: `Delete saved search`,
      styleClass: 'delete-saved-search-dialog'
    };

    this.confirmDeleteSavedSearchSubscription = this.confirmationDialogService
      .confirm(confirmOptions)
      .pipe(tap(() => this.saveSearchManagementStore.deleteSavedSearch(savedSearch)))
      .subscribe();
  }

  openUpdateSavedSearchDialog(savedSearch: SavedSearchModel): void {
    const onSaveClick = new EventEmitter<SavedSearchRequest>();
    this.confirmationDialogService.open(AssetWatchSavedSearchDetailsComponent, {
      header: 'Saved Search Details',
      width: '740px',
      data: {
        onSaveClick,
        updateNameAndDescription: true,
        savedSearch
      }
    });

    onSaveClick.subscribe((formValue) => {
      this.saveSearchManagementStore.updateNameAndDescription({ savedSearch, name: formValue.name, description: formValue.description });
    });
  }

  viewDetails(savedSearch: SavedSearchModel): void {
    forkJoin({
      filterOptions: this.assetWatchService.getAssetWatchFilterData(savedSearch.portfolioId),
      cities: iif(
        () => savedSearch.cities && savedSearch.cities.length > 0,
        this.assetWatchService.getCitiesData(savedSearch.countryCodes),
        of([])
      ),
      airports: iif(
        () => savedSearch.airportCodes && savedSearch.airportCodes.length > 0,
        this.assetWatchService.getAirportsData(savedSearch.countryCodes),
        of([])
      )
    })
      .pipe(withLatestFrom(this.assetWatchStore.maintenanceActivities$))
      .subscribe(([{ filterOptions, cities, airports }, maintenanceActivities]) => {
        filterOptions.maintenanceActivities = maintenanceActivities;
        filterOptions.cities = cities;
        filterOptions.airports = airports;

        this.dialogService.open(AssetWatchSavedSearchFiltersViewComponent, {
          header: savedSearch.name,
          dismissableMask: true,
          width: '740px',
          contentStyle: { overflow: 'hidden' },
          data: { savedSearch, filterOptions }
        } as DynamicDialogConfig);
      });
  }

  ngOnDestroy(): void {
    this.confirmDeleteSavedSearchSubscription?.unsubscribe();
  }

  onIsActiveChange(savedSearch: SavedSearchModel, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.saveSearchManagementStore.updateSavedSearchIsActive({ savedSearch, isActive: target.checked });
  }
}
