import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { TableModule } from 'primeng/table';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AircraftSearchPopupComponent } from './aircraft-search-popup.component';
import { Aircraft } from '../../../shared/models/aircraft';
import { AircraftService } from '../../../create-edit-portfolio/services/aircraft.service';
import { of } from 'rxjs';
import { SearchAircraftRequest } from '../../../create-edit-portfolio/models/search-aircraft-request';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AircraftSearchResult, AircraftSearchResultDropdowns } from '../../models/aircraft-search-result';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';

describe('AircraftSearchPopupComponent', () => {
  let component: AircraftSearchPopupComponent;
  let fixture: ComponentFixture<AircraftSearchPopupComponent>;
  let debugElement: DebugElement;
  let dynamicDialogRef: any;
  let aircraftService: any;
  let confirmationDialogService: any;

  beforeEach(async () => {
    const dynamicDialogRefSpy = jasmine.createSpyObj('DynamicDialogRef', ['close']);
    const aircraftServiceSpy = jasmine.createSpyObj('AircraftService', ['search']);
    const confirmationDialogServiceSpy = jasmine.createSpyObj('ConfirmationDialogService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [TableModule, FormsModule, ReactiveFormsModule, SelectModule, CheckboxModule, TooltipModule, MultiSelectModule],
      declarations: [AircraftSearchPopupComponent],
      providers: [
        DynamicDialogConfig,
        { provide: DynamicDialogRef, useValue: dynamicDialogRefSpy },
        { provide: ConfirmationDialogService, useValue: confirmationDialogServiceSpy },
        { provide: AircraftService, useValue: aircraftServiceSpy }
      ]
    }).compileComponents();

    dynamicDialogRef = TestBed.inject(DynamicDialogRef);
    aircraftService = TestBed.inject(AircraftService);
    confirmationDialogService = TestBed.inject(ConfirmationDialogService);
    confirmationDialogService.confirm['and'].returnValue(of({}));

    const searchResult: AircraftSearchResult = {
      aircraftList: testAircraftList,
      totalCount: 3,
      manufacturers: [
        {
          id: 420113,
          name: 'Airbus'
        },
        {
          id: 3002,
          name: 'Antonov'
        },
        {
          id: 431734,
          name: 'ATR'
        }
      ],
      aircraftTypes: [],
      aircraftMasterSeries: [],
      aircraftOperators: [],
      operatorCountries: [],
      lessors: [],
      companyTypes: [],
      statuses: []
    };

    aircraftService.search['and'].returnValue(of(searchResult));

    fixture = TestBed.createComponent(AircraftSearchPopupComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a confirm pop-up on cancel click if one or more aircrafts are already selected', fakeAsync(() => {
    component.allSelectedAircraft.set(1, testAircraftList[0]);
    component.allSelectedAircraft.set(2, testAircraftList[1]);
    const cancelButton = fixture.debugElement.nativeElement.querySelector('#cancel-button-js');
    fixture.detectChanges();
    cancelButton.click();
    flush();
    expect(confirmationDialogService.confirm).toHaveBeenCalled();
  }));

  it('should close dialog after clicking cancel button if there are no aircrafts selected', () => {
    component.allSelectedAircraft.clear();
    spyOn(dynamicDialogRef, 'close');
    const cancelButton = debugElement.query(By.css('#cancel-button-js'));
    fixture.detectChanges();
    cancelButton.triggerEventHandler('click', null);
    expect(dynamicDialogRef.close).toHaveBeenCalled();
  });

  it('should disable add aircraft button if there no selected aircraft ', () => {
    component.allSelectedAircraft.clear();
    const addAircraftButton = debugElement.query(By.css('#add-aircraft-button-js'));
    expect(addAircraftButton.nativeElement.disabled).toBeTruthy();
  });

  it('should enable add aircraft button if there are selected aircraft ', () => {
    component.allSelectedAircraft.set(1, testAircraftList[0]);
    component.allSelectedAircraft.set(2, testAircraftList[1]);

    const addAircraftButton = debugElement.query(By.css('#add-aircraft-button-js'));
    fixture.detectChanges();
    expect(addAircraftButton.nativeElement.disabled).toBeFalsy();
  });

  it('should invoke aircraft search after opening popup', fakeAsync(() => {
    const searchRequest: SearchAircraftRequest = {
      skip: 0,
      take: component.maxNumberOfSelectedAircraft + component.pageSize,
      keyword: ''
    } as SearchAircraftRequest;

    component.tableComponent.reset();
    flush();

    expect(aircraftService.search).toHaveBeenCalledWith(jasmine.objectContaining(searchRequest));
  }));

  it('should invoke addAircraft after hitting add aircraft button', () => {
    spyOn(component, 'addAircraft');
    component.allSelectedAircraft.set(1, testAircraftList[0]);
    component.allSelectedAircraft.set(2, testAircraftList[1]);
    const addAircraftButton = debugElement.query(By.css('#add-aircraft-button-js'));

    addAircraftButton.triggerEventHandler('click', null);
    expect(component.addAircraft).toHaveBeenCalled();
  });

  it('should search by textFilter', fakeAsync(() => {
    component.textFilterControl.setValue('test');

    tick(1000);
    const searchRequest: SearchAircraftRequest = {
      skip: 0,
      take: component.maxNumberOfSelectedAircraft + component.pageSize,
      keyword: 'test'
    } as SearchAircraftRequest;

    expect(aircraftService.search).toHaveBeenCalledWith(jasmine.objectContaining(searchRequest));
  }));

  it('should search by multiselect filter', fakeAsync(() => {
    component.dropdownForm.controls.manufacturers.setValue([
      {
        id: 420113,
        name: 'Airbus'
      },
      {
        id: 3002,
        name: 'Antonov'
      }
    ]);
    flush();
    const searchRequest: SearchAircraftRequest = {
      skip: 0,
      take: component.maxNumberOfSelectedAircraft + component.pageSize,
      manufacturerIds: [420113, 3002]
    } as SearchAircraftRequest;

    expect(aircraftService.search).toHaveBeenCalledWith(jasmine.objectContaining(searchRequest));
  }));

  it('should search by Company Type multiselect filter', fakeAsync(() => {
    component.dropdownForm.controls.companyTypes.setValue([
      {
        id: 90,
        name: 'EETC'
      },
      {
        id: 91,
        name: 'AssetBackedSecurities'
      }
    ]);
    flush();
    const searchRequest: SearchAircraftRequest = {
      skip: 0,
      take: component.maxNumberOfSelectedAircraft + component.pageSize,
      companyTypeIds: [90, 91]
    } as SearchAircraftRequest;

    expect(aircraftService.search).toHaveBeenCalledWith(jasmine.objectContaining(searchRequest));
  }));

  it('should disable select all checkbox if search result and selected aircraft count is more than maxNumberOfSelectedAircraft', fakeAsync(() => {
    component.tableComponent.reset();
    flush();
    component.allSelectedAircraft.set(1, testAircraftList[0]);
    component.maxNumberOfSelectedAircraft = 2;
    fixture.detectChanges();
    flush();
    expect(component.selectAllControl.disabled).toBeTruthy();
  }));

  it('should enable select all checkbox if search result and selected aircraft count is equal to maxNumberOfSelectedAircraft', fakeAsync(() => {
    component.allSelectedAircraft.set(1, testAircraftList[1]);
    component.maxNumberOfSelectedAircraft = 4;
    fixture.detectChanges();
    flush();
    expect(component.selectAllControl.enable).toBeTruthy();
  }));

  it('should enable select all checkbox if search result and selected aircraft count is less than maxNumberOfSelectedAircraft', fakeAsync(() => {
    component.allSelectedAircraft.set(1, testAircraftList[1]);
    component.maxNumberOfSelectedAircraft = 5;
    fixture.detectChanges();
    flush();
    expect(component.selectAllControl.enable).toBeTruthy();
  }));

  it('should select all aircraft in search result after checking the select all checkbox', fakeAsync(() => {
    component.tableComponent.reset();
    flush();
    component.selectAllControl.setValue(true);
    fixture.detectChanges();
    flush();
    expect(component.allSelectedAircraft.size).toEqual(3);
  }));

  it('should disable all the other checkboxes if the limit of selected aircraft is reached', () => {
    component.allSelectedAircraft.set(1, testAircraftList[0]);
    component.allSelectedAircraft.set(2, testAircraftList[1]);
    component.maxNumberOfSelectedAircraft = 2;
    expect(component.IsCheckboxDisabled(3)).toEqual(true);
  });

  it('should always update dropdown options with search result from API after changing a dropdown filter', fakeAsync(() => {
    component.tableComponent.reset();
    flush();

    const newSearchResult: AircraftSearchResult = {
      aircraftList: [],
      totalCount: 0,
      ...testAircraftSearchResultDropdowns
    };

    aircraftService.search['and'].returnValue(of(newSearchResult));

    component.dropdownForm.controls.manufacturers.setValue([
      {
        id: 420113,
        name: 'Airbus'
      }
    ]);
    flush();

    const expectedAircraftSearchResult: AircraftSearchResult = {
      aircraftList: testAircraftList,
      totalCount: 3,
      ...testAircraftSearchResultDropdowns
    };

    expect(component.searchResultDropdownLists).toEqual(jasmine.objectContaining(expectedAircraftSearchResult));
  }));

  const testAircraftList: Aircraft[] = [
    {
      aircraftId: 1,
      aircraftSerialNumber: '912',
      aircraftRegistrationNumber: 'GBKOU',
      aircraftSeries: 'A330',
      engineSeries: ' CF6-80E1A4, CF6-80E1A4',
      aircraftAgeYears: 2000,
      operator: 'Air France',
      status: 'OnOption',
      manager: 'Montgomery Featherstonehaugh'
    },
    {
      aircraftId: 2,
      aircraftSerialNumber: '851',
      aircraftRegistrationNumber: '4K-AZ999',
      aircraftSeries: 'A320',
      engineSeries: ' CF6-80E1A4',
      aircraftAgeYears: 2005,
      operator: 'LetterOfIntentToOption',
      status: 'Retired',
      manager: 'Hubert Wolfeschlegelsteinhausenbergerdorff'
    },
    {
      aircraftId: 3,
      aircraftSerialNumber: '223',
      aircraftRegistrationNumber: 'S2-ZZZ',
      aircraftSeries: 'A380',
      engineSeries: 'CF6-80E1A4',
      aircraftAgeYears: 2005,
      operator: 'Scottish Bird',
      status: 'Storage',
      manager: 'Calvin Ceannaideach'
    }
  ] as Aircraft[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const testAircraftSearchResultDropdowns = {
    manufacturers: [
      {
        id: 420113,
        name: 'Airbus'
      },
      {
        id: 3002,
        name: 'Antonov'
      },
      {
        id: 431734,
        name: 'ATR'
      }
    ],
    aircraftTypes: [
      { id: 146, name: '707' },
      { id: 149, name: '727' }
    ],
    aircraftMasterSeries: [
      { id: 194, name: '707-100' },
      { id: 196, name: '707-300' }
    ],
    aircraftOperators: [
      { id: 432405, name: '814K LLC' },
      { id: 432399, name: '93SC LLC & 814K LLC' }
    ],
    operatorCountries: [
      { id: 10103, name: 'United Kingdom' },
      { id: 10090, name: 'Spain' }
    ],
    lessors: [
      { id: 566280, name: 'ABL Aviation' },
      { id: 420399, name: 'AerCap' }
    ],
    companyTypes: [{ id: 91, name: 'Asset Backed Securities (ABS)' }],
    statuses: [
      { id: 9, name: 'Cancelled' },
      { id: 5, name: 'In Service' }
    ]
  } as AircraftSearchResultDropdowns;
});
