import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingTabComponent } from './landing-tab.component';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../shared/services/profile.service';
import { Profile } from '../../../shared/models/profile';
import { of } from 'rxjs';
import { PortfoliosService } from '../../../shared/services/portfolios.service';
import { Component } from '@angular/core';
import { NoticeService } from '../../../shared/services/notice.service';
import { MessageService } from 'primeng/api';
import { AppStore } from '../../../../app-store';
import { AppUserService } from '../../../../app-user.service';

describe('LandingTabComponent', () => {
  let component: LandingTabComponent;
  let fixture: ComponentFixture<LandingTabComponent>;
  let profileServiceSpy: any;
  let portfolioServiceSpy: any;

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getProfile']);

    portfolioServiceSpy = jasmine.createSpyObj('PortfoliosService', ['getPortfolios']);

    await TestBed.configureTestingModule({
      imports: [DialogModule, SelectModule, TableModule, FormsModule],
      declarations: [LandingTabComponent, MockLandingPortfoliosComponent],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: PortfoliosService, useValue: portfolioServiceSpy },
        NoticeService,
        MessageService,
        AppStore,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    profileServiceSpy.getProfile.and.returnValue(of(profile));
    portfolioServiceSpy.getPortfolios.and.returnValue(of([]));

    fixture = TestBed.createComponent(LandingTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain welcome message', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.welcome-message').textContent).toContain('Welcome to your Asset Watch Homepage, John');
  });

  const profile: Profile = {
    person: { country: 'GB', email: '', name: { first: 'John', last: '' } }
  };
});

@Component({
  selector: 'ra-landing-portfolios',
  template: '',
  standalone: false
})
class MockLandingPortfoliosComponent { }
