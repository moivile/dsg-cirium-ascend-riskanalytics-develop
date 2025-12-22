import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Aircraft } from '../../../shared/models/aircraft';
import { CreateEditPortfolioTabComponent } from './create-edit-portfolio-tab.component';
import { DebugElement } from '@angular/core';
import { lastValueFrom, of, take } from 'rxjs';
import { By } from '@angular/platform-browser';
import { PortfoliosService } from '../../../shared/services/portfolios.service';
import { NoticeService } from '../../../shared/services/notice.service';
import { CreateEditPortfolioStore } from '../../services/create-edit-portfolio-store';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { BackLinkComponent } from '../../../shared/components/back-link/back-link.component';
import { PortfolioAircraftService } from '../../../shared/services/portfolio-aircraft.service';
import { Portfolio } from '../../../shared/models/portfolio';
import { CheckboxModule } from 'primeng/checkbox';
import { AppStore } from 'src/app/app-store';
import { AppUserService } from '../../../../app-user.service';

describe('CreateEditPortfolioTabComponent', () => {
  let component: CreateEditPortfolioTabComponent;
  let fixture: ComponentFixture<CreateEditPortfolioTabComponent>;
  let debugElement: DebugElement;
  let portfoliosService: any;
  let noticeService: any;
  let confirmationDialogService: any;
  let portfolioAircraftService: any;
  let routerSpy: any;

  beforeEach(async () => {
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfoliosService', ['upsertPortfolio', 'getPortfolio', 'getPortfolios']);
    const noticeServiceSpy = jasmine.createSpyObj('NoticeService', ['success', 'error']);
    const confirmationDialogServiceSpy = jasmine.createSpyObj('ConfirmationDialogService', ['confirm']);

    const portfolioAircraftServiceSpy = jasmine.createSpyObj('PortfolioAircraftService', ['getPortfolioAircraft']);

    await TestBed.configureTestingModule({
      declarations: [CreateEditPortfolioTabComponent, BackLinkComponent],
      imports: [TableModule, FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([]), CheckboxModule],
      providers: [
        { provide: PortfoliosService, useValue: portfoliosServiceSpy },
        { provide: NoticeService, useValue: noticeServiceSpy },
        { provide: ConfirmationDialogService, useValue: confirmationDialogServiceSpy },
        { provide: PortfolioAircraftService, useValue: portfolioAircraftServiceSpy },
        CreateEditPortfolioStore,
        AppStore,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } },
      ]
    }).compileComponents();

    routerSpy = spyOn(TestBed.inject(Router), 'navigate');

    portfoliosService = TestBed.inject(PortfoliosService);
    portfoliosService.upsertPortfolio['and'].returnValue(of(1));
    portfoliosService.getPortfolio['and'].returnValue(of(testPortfolio));
    portfoliosService.getPortfolios['and'].returnValue(of([]));

    noticeService = TestBed.inject(NoticeService);

    confirmationDialogService = TestBed.inject(ConfirmationDialogService);
    confirmationDialogService.confirm['and'].returnValue(of({}));

    portfolioAircraftService = TestBed.inject(PortfolioAircraftService);
    portfolioAircraftService.getPortfolioAircraft['and'].returnValue(of(testAircraftList));

    fixture = TestBed.createComponent(CreateEditPortfolioTabComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all aircraft', async () => {
    component.store.setAircraftList(testAircraftList);
    const displayedAircraftList = await lastValueFrom(component.filteredAircraftList$.pipe(take(1)));
    expect(displayedAircraftList.length).toBe(testAircraftList.length);
  });

  it('should filter aircraft', () => {
    component.store.setAircraftList(testAircraftList);
    component.textFilterControl.setValue('912');
    fixture.detectChanges();
    const aircraftList = debugElement.queryAll(By.css('tr'));
    expect(aircraftList.length).toBe(2);
  });

  it('should invoke onAddAircraftClick', () => {
    spyOn(component, 'onAddAircraftClick');
    const addAircraftButton = debugElement.query(By.css('.add_aircraft_button'));
    addAircraftButton.triggerEventHandler('click', null);
    expect(component.onAddAircraftClick).toHaveBeenCalled();
  });

  describe('onSavePortfolio', () => {
    it('should create portfolio if id is undefined', () => {
      component.formControlName.setValue('Test portfolio');
      component.store.setAircraftList(testAircraftList);

      component.onSavePortfolio();

      expect(portfoliosService.upsertPortfolio).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Test portfolio'
        })
      );
    });

    it('should update portfolio if id is defined', () => {
      component.formControlName.setValue('Test portfolio');
      component.store.setAircraftList(testAircraftList);
      component.store.setId(1);

      component.onSavePortfolio();

      expect(portfoliosService.upsertPortfolio).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Test portfolio',
          id: 1
        })
      );
    });

    it('should navigate to portfolio edit page after portfolio creation', () => {
      component.formControlName.setValue('Test portfolio');
      component.store.setAircraftList(testAircraftList);

      component.onSavePortfolio();

      expect(routerSpy).toHaveBeenCalledWith(['portfolios', 1]);
    });
  });

  it('should not navigate if there are unsaved changes on back button click', () => {
    component.formControlName.setValue('Test portfolio');
    component.store.removeAircraftList(testAircraftList.map((aircraft) => aircraft.aircraftId));
    component.backLinkComponent.onBackClick();
    expect(routerSpy).not.toHaveBeenCalledWith(['portfolios', 1]);
  });

  it('should navigate if there are no unsaved changes', () => {
    component.formControlName.setValue('Test portfolio');
    component.store.removeAircraftList(testAircraftList.map((aircraft) => aircraft.aircraftId));
    component.onSavePortfolio();
    expect(routerSpy).toHaveBeenCalledWith(['portfolios', 1]);
  });

  it('should disable remove aircraft button if there is no selected aircraft ', () => {
    component.checkedAircraftIds = [];
    const removeAircraftButton = debugElement.query(By.css('.remove_aircraft_button'));
    expect(removeAircraftButton.nativeElement.disabled).toBeTruthy();
  });

  it('should show success message after removing aircraft successfully', () => {
    component.checkedAircraftIds.push(1);
    component.onRemoveAircraftClick();
    fixture.detectChanges();
    expect(noticeService.success).toHaveBeenCalled();
  });

  const testPortfolio: Portfolio = {
    id: 1,
    name: 'Test portfolio'
  } as Portfolio;

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
      manager: 'Montgomery Featherstonehaugh',
      lessorOrganization: 'Rent a plane'
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
      manager: 'Hubert Wolfeschlegelsteinhausenbergerdorff',
      lessorOrganization: 'Rent a plane'
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
      manager: 'Calvin Ceannaideach',
      lessorOrganization: 'Rent a plane'
    }
  ] as Aircraft[];
});
