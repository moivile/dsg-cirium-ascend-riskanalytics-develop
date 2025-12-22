import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { EmailPreferences } from '../../models/email-preferences';
import { SavedSearchesService } from '../../services/saved-searches.service';
import { AssetWatchSaveSearchManagementComponent } from './asset-watch-save-search-management.component';
import { BackLinkComponent } from '../../../shared/components/back-link/back-link.component';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { AssetWatchSaveSearchManagementStore } from './asset-watch-save-search-management-store';
import { NoticeService } from '../../../shared/services/notice.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { SavedSearchModel } from '../../models/saved-search-model';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetWatchStore } from '../../services/asset-watch-store';
import { AssetWatchService } from '../../services/asset-watch.service';
import { RouterModule } from '@angular/router';
import { AssetWatchTabComponent } from '../asset-watch-tab/asset-watch-tab.component';
import { assetWatchRoute } from '../../../../route.constants';

describe('AssetWatchSaveSearchManagementComponent', () => {
  let component: AssetWatchSaveSearchManagementComponent;
  let fixture: ComponentFixture<AssetWatchSaveSearchManagementComponent>;
  let savedSearchesService: jasmine.SpyObj<SavedSearchesService>;
  let noticeService: any;
  let confirmationDialogService: any;

  beforeEach(async () => {
    const savedSearchesServiceSpy = jasmine.createSpyObj('SavedSearchesService', [
      'getEmailPreferences',
      'updateEmailPreferences',
      'getSavedSearchList',
      'deleteSavedSearch'
    ]);

    const assetWatchServiceSpy = jasmine.createSpyObj('AssetWatchService', ['getMaintenanceActivityData']);

    const noticeServiceSpy = jasmine.createSpyObj('NoticeService', ['success', 'error']);

    const confirmationDialogServiceSpy = jasmine.createSpyObj('ConfirmationDialogService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TooltipModule,
        TableModule,
        RouterModule.forRoot([{ path: assetWatchRoute, component: AssetWatchTabComponent }])
      ],
      declarations: [AssetWatchSaveSearchManagementComponent, BackLinkComponent],
      providers: [
        { provide: SavedSearchesService, useValue: savedSearchesServiceSpy },
        AssetWatchSaveSearchManagementStore,
        { provide: NoticeService, useValue: noticeServiceSpy },
        { provide: ConfirmationDialogService, useValue: confirmationDialogServiceSpy },
        DialogService,
        AssetWatchStore,
        { provide: AssetWatchService, useValue: assetWatchServiceSpy }
      ]
    }).compileComponents();

    savedSearchesService = TestBed.inject(SavedSearchesService) as jasmine.SpyObj<SavedSearchesService>;
    savedSearchesService.getEmailPreferences.and.returnValue(of(EmailPreferences.Daily));
    savedSearchesService.updateEmailPreferences.and.returnValue(of());
    savedSearchesService.getSavedSearchList.and.returnValue(of(testSavedSearches));
    noticeService = TestBed.inject(NoticeService);
    confirmationDialogService = TestBed.inject(ConfirmationDialogService);

    fixture = TestBed.createComponent(AssetWatchSaveSearchManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get email preferences on init', () => {
    expect(savedSearchesService.getEmailPreferences).toHaveBeenCalled();
  });

  it('should update email preferences when control value changes', () => {
    component.selectedEmailPreferencesControl.setValue(EmailPreferences.AlertsOnly);
    expect(savedSearchesService.updateEmailPreferences).toHaveBeenCalledWith(EmailPreferences.AlertsOnly);
  });

  it('should load saved searches on init', () => {
    expect(savedSearchesService.getSavedSearchList).toHaveBeenCalled();
  });

  it('should show success message after deleting saved search successfully', () => {
    savedSearchesService.deleteSavedSearch['and'].returnValue(of(undefined));
    confirmationDialogService.confirm['and'].returnValue(of({}));
    component.openDeleteSavedSearchDialog(testSavedSearches[0]);
    fixture.detectChanges();
    expect(noticeService.success).toHaveBeenCalled();
  });

  it('should show error message after deleting saved search unsuccessfully', () => {
    savedSearchesService.deleteSavedSearch['and'].returnValue(throwError(() => new Error('Error')));
    confirmationDialogService.confirm['and'].returnValue(of({}));
    component.openDeleteSavedSearchDialog(testSavedSearches[0]);
    fixture.detectChanges();
    expect(noticeService.error).toHaveBeenCalled();
  });

  const testSavedSearches: SavedSearchModel[] = [
    {
      id: 1,
      name: 'Test Saved Search 1',
      portfolioName: 'Test Portfolio 1',
      description: 'Test Description 1',
      isActive: true,
      userId: 'test-user-id',
      dateCreated: new Date(),
      dateModified: new Date()
    },
    {
      id: 2,
      name: 'Test Saved Search 2',
      portfolioName: 'Test Portfolio 2',
      description: 'Test Description 2',
      isActive: true,
      userId: 'test-user-id',
      dateCreated: new Date(),
      dateModified: new Date()
    }
  ] as SavedSearchModel[];
});
