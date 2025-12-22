import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetWatchSavedSearchDetailsComponent } from './asset-watch-saved-search-details.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Profile } from '../../../shared/models/profile';
import { of, Subject } from 'rxjs';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SavedSearchesService } from '../../services/saved-searches.service';
import { AppUserService } from '../../../../app-user.service';
import { AppStore } from '../../../../app-store';
import { MessageService } from 'primeng/api';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AssetWatchSavedSearchDetailsComponent', () => {
  let component: AssetWatchSavedSearchDetailsComponent;
  let fixture: ComponentFixture<AssetWatchSavedSearchDetailsComponent>;
  let dynamicDialogRefSpy: any;
  let dynamicDialogConfigSpy: jasmine.SpyObj<DynamicDialogConfig>;
  let appStore: AppStore;

  const savedSearchesServiceSpy = jasmine.createSpyObj('SavedSearchesService', ['isSavedSearchNameDuplicate']);
  beforeEach(async () => {
    dynamicDialogRefSpy = jasmine.createSpyObj('DynamicDialogRef', ['close']);
    dynamicDialogRefSpy.onClose = new Subject<any>();

    const onSaveClickEmitter = new EventEmitter();
    spyOn(onSaveClickEmitter, 'emit');

    dynamicDialogConfigSpy = { data: { onSaveClick: onSaveClickEmitter } };

    await TestBed.configureTestingModule({
      declarations: [AssetWatchSavedSearchDetailsComponent],
      imports: [InputSwitchModule, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: DynamicDialogRef, useValue: dynamicDialogRefSpy },
        { provide: DynamicDialogConfig, useValue: dynamicDialogConfigSpy },
        { provide: SavedSearchesService, useValue: savedSearchesServiceSpy },
        AppStore,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [], userEmailAddress: 'test@example.com' }) } },
        MessageService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    appStore = TestBed.inject(AppStore);
    fixture = TestBed.createComponent(AssetWatchSavedSearchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    const formValues = component.form.value;
    expect(formValues.name).toBe('');
    expect(formValues.description).toBe('');
    expect(formValues.isActive).toBeFalse();
  });

  it('should populate userEmailAddress$ with email from AppUserService', (done: DoneFn) => {
    appStore.loadAppUser();
    appStore.userEmailAddress$.subscribe((email) => {
      expect(email).toBe('test@example.com');
      done();
    });
  });

  it('should close dialog on onCancelClick', () => {
    component.onCancelClick();
    expect(dynamicDialogRefSpy.close).toHaveBeenCalled();
  });

  const profile: Profile = {
    person: { country: 'GB', email: '', name: { first: 'John', last: '' } }
  };

  it('should close and emit form value on onSaveClick', () => {
    component.onSaveClick();

    expect(dynamicDialogRefSpy.close).toHaveBeenCalled();
    expect(dynamicDialogConfigSpy.data.onSaveClick.emit).toHaveBeenCalledWith(component.form.value);
  });

  it('should call isSavedSearchNameDuplicate on form name change', () => {
    // Arrange
    savedSearchesServiceSpy.isSavedSearchNameDuplicate.and.returnValue(of(false));
    const formName = component.form.get('name');

    // Act
    formName?.setValue('saved search 1');

    // Assert
    expect(savedSearchesServiceSpy.isSavedSearchNameDuplicate).toHaveBeenCalledWith('saved search 1');
  });

  it('should toggle email alert status between Active and Inactive', () => {
    // Arrange
    const isActiveControl = component.form.get('isActive');

    // Assert
    expect(isActiveControl?.value).toBeFalse();

    fixture.detectChanges();
    const statusElement = fixture.nativeElement.querySelector('.email-alert-status-value');
    expect(statusElement.textContent).toBe('Inactive');

    // Act
    isActiveControl?.setValue(true);
    fixture.detectChanges();

    // Assert
    expect(statusElement.textContent).toBe('Active');

    // Act
    isActiveControl?.setValue(false);
    fixture.detectChanges();

    // Assert
    expect(statusElement.textContent).toBe('Inactive');
  });
});
