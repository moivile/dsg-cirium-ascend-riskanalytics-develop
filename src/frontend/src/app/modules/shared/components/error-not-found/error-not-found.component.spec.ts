import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorNotFoundComponent } from './error-not-found.component';
import { AppConfigService } from '../../../../app-config.service';

describe('NotFoundComponent', () => {
  let component: ErrorNotFoundComponent;
  let fixture: ComponentFixture<ErrorNotFoundComponent>;
  let mockAppConfigService: any;

  beforeEach(async () => {
    mockAppConfigService = jasmine.createSpyObj('mockAppConfigService', ['configuration']);

    await TestBed.configureTestingModule({
      declarations: [ErrorNotFoundComponent],
      providers: [
        {provide: AppConfigService, useValue: mockAppConfigService},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    mockAppConfigService.configuration = {supportEmailAddress: 'test@email.com'};
    expect(component).toBeTruthy();
  });
});
