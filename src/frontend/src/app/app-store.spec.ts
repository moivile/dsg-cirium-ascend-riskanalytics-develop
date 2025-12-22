import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppUserService, User } from './app-user.service';
import { AppStore } from './app-store';
import { PortfoliosService } from './modules/shared/services/portfolios.service';
import { NoticeService } from './modules/shared/services/notice.service';
import { Portfolio } from './modules/shared/models/portfolio';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MessageService } from 'primeng/api';

describe('AppStore', () => {
  let appStore: AppStore;
  let portfolioService: PortfoliosService;
  let appUserService: AppUserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [AppStore, PortfoliosService, AppUserService, MessageService, NoticeService, provideHttpClient(), withInterceptorsFromDi()]
    }).compileComponents();

    appStore = TestBed.inject(AppStore);
    portfolioService = TestBed.inject(PortfoliosService);
    appUserService = TestBed.inject(AppUserService);
  });

  it('should be defined', () => {
    expect(appStore).toBeDefined();
  });

  it('should load portfolios', () => {
    const portfolios: Portfolio[] = [];
    spyOn(portfolioService, 'getPortfolios').and.returnValue(of(portfolios));
    appStore.loadPortfolios();
    appStore.portfolios$.subscribe((p: Portfolio[]) => {
      expect(p).toEqual(portfolios);
    });
  });

  it('should load app user', () => {
    const user: User = {
      claims: [],
      userEmailAddress: 'test@test.com'
    };
    appStore.setAppUser(user);
    spyOn(appUserService, 'getAppUser').and.returnValue(of(user));
    appStore.loadAppUser();
    appStore.appUser$.subscribe((u: User | null) => {
      expect(u).toEqual(user);
    });
  });

  it('should set portfolio', () => {
    const portfolios: Portfolio[] = [{ id: 1, name: 'TestPortfolio', dateModified: '', dateCreated: '', numberOfAircraft: 0 }];
    appStore.setPortfolios(portfolios);
    appStore.portfolios$.subscribe((p: Portfolio[]) => {
      expect(p).toEqual(portfolios);
    });
  });

  it('should set selected portfolio id', () => {
    const selectedPortfolioId = 1;
    appStore.setSelectedPortfolioId(selectedPortfolioId);
    appStore.selectedPortfolioId$.subscribe((id: number | null) => {
      expect(id).toEqual(selectedPortfolioId);
    });
  });

  it('should remove savedSearchPortfolioId and savedSearchId from localStorage if they do not match selectedPortfolioId', () => {
    const selectedPortfolioId = 2;
    localStorage.setItem('savedSearchPortfolioId', '1');
    localStorage.setItem('savedSearchId', '1');

    appStore.setSelectedPortfolioId(selectedPortfolioId);

    expect(localStorage.getItem('savedSearchPortfolioId')).toBeNull();
    expect(localStorage.getItem('savedSearchId')).toBeNull();
  });

  it('should not remove savedSearchPortfolioId and savedSearchId from localStorage if they match selectedPortfolioId', () => {
    const selectedPortfolioId = 1;
    localStorage.setItem('savedSearchPortfolioId', '1');
    localStorage.setItem('savedSearchId', '1');

    appStore.setSelectedPortfolioId(selectedPortfolioId);

    expect(localStorage.getItem('savedSearchPortfolioId')).toEqual(selectedPortfolioId.toString());
    expect(localStorage.getItem('savedSearchId')).toEqual('1');
  });

  it('should set selectedPortfolioId to localStorage regardless of the values of savedSearchPortfolioId and savedSearchId', () => {
    const selectedPortfolioId = 3;

    appStore.setSelectedPortfolioId(selectedPortfolioId);

    expect(localStorage.getItem('selectedPortfolioId')).toEqual(selectedPortfolioId.toString());
  });

  it('should set app user', () => {
    const user: User = {
      claims: [],
      userEmailAddress: 'test@test.com'
    };
    appStore.setAppUser(user);
    appStore.appUser$.subscribe((u: User | null) => {
      expect(u).toEqual(user);
    });
  });

  it('should load and delete portfolio', () => {
    const portfolio: Portfolio[] = [{ id: 1, name: 'TestPortfolio', dateModified: '', dateCreated: '', numberOfAircraft: 0 }];
    spyOn(portfolioService, 'getPortfolios').and.returnValue(of(portfolio));
    spyOn(portfolioService, 'deletePortfolio').and.returnValue(of({}));
    appStore.loadPortfolios();
    appStore.portfolios$.subscribe((p: Portfolio[] | null) => {
      expect(p).toEqual(portfolio);
    });
    appStore.deletePortfolio(portfolio[0]);
    appStore.portfolios$.subscribe((p: Portfolio[] | null) => {
      expect(p).toEqual(portfolio);
    });
  });
});
