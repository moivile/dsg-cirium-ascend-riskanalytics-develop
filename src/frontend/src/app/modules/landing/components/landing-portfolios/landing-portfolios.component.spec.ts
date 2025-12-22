import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPortfoliosComponent } from './landing-portfolios.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { PortfoliosService } from '../../../shared/services/portfolios.service';
import { lastValueFrom, of, take, throwError } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Portfolio } from '../../../shared/models/portfolio';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { NoticeService } from '../../../shared/services/notice.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { AppStore } from '../../../../app-store';
import { AppUserService } from '../../../../app-user.service';

describe('LandingPortfoliosComponent', () => {
  let component: LandingPortfoliosComponent;
  let fixture: ComponentFixture<LandingPortfoliosComponent>;
  let debugElement: DebugElement;
  let portfoliosService: any;
  let noticeService: any;
  let confirmationDialogService: any;
  let appStore: AppStore;

  beforeEach(async () => {
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfoliosService', ['getPortfolios', 'deletePortfolio']);

    const noticeServiceSpy = jasmine.createSpyObj('NoticeService', ['success', 'error']);

    const confirmationDialogServiceSpy = jasmine.createSpyObj('ConfirmationDialogService', ['confirm']);

    await TestBed.configureTestingModule({
      declarations: [LandingPortfoliosComponent],
      imports: [TableModule, DialogModule, FormsModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: PortfoliosService, useValue: portfoliosServiceSpy },
        AppStore,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } },
        { provide: NoticeService, useValue: noticeServiceSpy },
        { provide: ConfirmationDialogService, useValue: confirmationDialogServiceSpy }
      ]
    }).compileComponents();

    appStore = TestBed.inject(AppStore);
    portfoliosService = TestBed.inject(PortfoliosService);
    portfoliosService.getPortfolios['and'].returnValue(of(testPortfolios));
    noticeService = TestBed.inject(NoticeService);
    confirmationDialogService = TestBed.inject(ConfirmationDialogService);

    fixture = TestBed.createComponent(LandingPortfoliosComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    appStore.loadPortfolios();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all portfolios', async () => {
    const displayedPortfolios = await lastValueFrom(component.filteredPortfolios$.pipe(take(1)));
    expect(displayedPortfolios.length).toBe(testPortfolios.length);
  });

  it('should filter portfolios', () => {
    component.textFilterControl.setValue('1');
    fixture.detectChanges();
    const portfolios = debugElement.queryAll(By.css('.portfolio-name'));
    expect(portfolios.length).toBe(1);
    expect(portfolios[0].nativeElement.textContent).toContain('Portfolio 1');
  });

  it('should show success message after deleting portfolio successfully', () => {
    portfoliosService.deletePortfolio['and'].returnValue(of({}));
    confirmationDialogService.confirm['and'].returnValue(of({}));
    component.openDeletePortfolioDialog(testPortfolios[0]);
    fixture.detectChanges();
    expect(noticeService.success).toHaveBeenCalled();
  });

  it('should show error message after deleting portfolio unsuccessfully', () => {
    portfoliosService.deletePortfolio['and'].returnValue(throwError(() => new Error('Error')));
    confirmationDialogService.confirm['and'].returnValue(of({}));
    component.openDeletePortfolioDialog(testPortfolios[0]);
    fixture.detectChanges();
    expect(noticeService.error).toHaveBeenCalled();
  });

  const testPortfolios: Portfolio[] = [
    {
      id: 1,
      name: 'Portfolio 1',
      dateModified: '2023-02-07T08:51:10.619238',
      dateCreated: '2023-02-07T08:51:10.619238',
      numberOfAircraft: 10
    },
    {
      id: 2,
      name: 'Portfolio 2',
      dateModified: '2023-02-07T08:51:10.619238',
      dateCreated: '2023-02-07T08:51:10.619238',
      numberOfAircraft: 12
    },
    {
      id: 3,
      name: 'Portfolio 3',
      dateModified: '2023-02-07T08:51:10.619238',
      dateCreated: '2023-02-07T08:51:10.619238',
      numberOfAircraft: 100
    }
  ];
});
