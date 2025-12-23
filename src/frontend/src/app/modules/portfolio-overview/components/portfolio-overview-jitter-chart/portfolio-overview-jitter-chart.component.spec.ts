import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { PortfolioOverviewJitterChartComponent } from './portfolio-overview-jitter-chart.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { PortfolioAircraftService } from '../../../shared/services/portfolio-aircraft.service';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { DialogModule } from 'primeng/dialog';
import { Average } from './portfolio-overview-jitter-chart.service';

describe('PortfolioOverviewJitterChartComponent', () => {
  let component: PortfolioOverviewJitterChartComponent;
  let fixture: ComponentFixture<PortfolioOverviewJitterChartComponent>;

  beforeEach(async () => {
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfolioAircraftService', ['getPortfolioAircraft']);

    await TestBed.configureTestingModule({
      declarations: [PortfolioOverviewJitterChartComponent],
      imports: [BaseChartDirective, DialogModule],
      providers: [
        PortfolioOverviewStore,
        { provide: PortfolioAircraftService, useValue: portfoliosServiceSpy },
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PortfolioOverviewJitterChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('removeToolTip', () => {
    it('should remove tooltip if it exists', () => {
      const tooltip = document.createElement('div');
      tooltip.id = 'jitter-tooltip';
      document.body.appendChild(tooltip);
      component.removeTooltip();
      fixture.detectChanges();
      expect(document.getElementById(tooltip.id)).toBeNull();
    });
    it('should not throw an error if the tooltip does not exist', () => {
      spyOn<any>(PortfolioOverviewJitterChartComponent, 'getToolTip').and.returnValue(null);
      expect(() => {
        component.removeTooltip();
      }).not.toThrow();
    });
  });

  describe('showModal', () => {
    it('should set modalTitle and displayModal to true', () => {
      component.jitterBy = 'aircraftAgeYears';
      component.showModal();
      expect(component.modalTitle).toEqual('Age Chart');
      expect(component.displayModal).toBe(true);
    });
  });

  describe('toggleSelectedAverage', () => {
    it('should update the selectedAverage', () => {
      // Arrange
      const mockAverage: Average = Average.Mean;
      spyOn<any>(component, 'updateChartDetails');

      // Act
      component.toggleSelectedAverage(mockAverage);

      // Assert
      expect(component.selectedAverage).toEqual(mockAverage);
    });

  });

  describe('recheckSelectedAverageRadioButton', () => {
    it('should set the selectedAverage to undefined and then reset it', fakeAsync(() => {
      // Arrange
      component.selectedAverage = Average.Mean;

      // Act
      component.recheckSelectedAverageRadioButton();
      tick();

      // Assert
      expect(component.selectedAverage).toEqual(Average.Mean);
    }));
  });
});

