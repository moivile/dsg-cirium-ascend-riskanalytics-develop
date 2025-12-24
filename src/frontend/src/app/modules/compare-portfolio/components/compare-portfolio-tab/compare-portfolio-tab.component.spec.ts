import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComparePortfolioTabComponent } from './compare-portfolio-tab.component';
import { Component, Input } from '@angular/core';
import { BackLinkComponent } from '../../../shared/components/back-link/back-link.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MetricOptions } from '../../models/metric-options';
import { FormsModule } from '@angular/forms';
import { ComparePortfolioExcelExportService } from '../../services/excel/compare-portfolio-excel-export.service';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { TagModule } from 'primeng/tag';
import { Metric } from '../../models/metric';

describe('ComparePortfolioTabComponent', () => {
  let component: ComparePortfolioTabComponent;
  let fixture: ComponentFixture<ComparePortfolioTabComponent>;
  let comparePortfolioExcelExportServiceSpy: any;

  beforeEach(async () => {
    comparePortfolioExcelExportServiceSpy = jasmine.createSpyObj('ComparePortfolioExcelExportService', ['export']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SelectModule, DatePickerModule, FormsModule],
      declarations: [ComparePortfolioTabComponent, MockPortfolioDetailComponent, MockPortfolioTableComponent, BackLinkComponent],
      providers: [{ provide: ComparePortfolioExcelExportService, useValue: comparePortfolioExcelExportServiceSpy }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComparePortfolioTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onUtilizationMetricChange', () => {
    it('should update metric options with selected utilization metric', () => {
      // arrange
      const initialMetricOptions = {
        metric: {
          name: 'Average Monthly Tracked Cycles',
          valuePropertyName: 'averageCycles',
          numberOfAircraftPropertyName: 'numberOfAircraftWithCycles'
        }
      } as MetricOptions;

      component.metricOptions = initialMetricOptions;

      // act
      component.onUtilizationMetricChange({
        name: 'Average Monthly HC Ratio',
        valuePropertyName: 'averageHoursPerCycle',
        numberOfAircraftPropertyName: 'numberOfAircraftWithHoursPerCycle'
      });

      // assert
      expect(component.metricOptions).toEqual({
        ...initialMetricOptions,
        metric: {
          name: 'Average Monthly HC Ratio',
          valuePropertyName: 'averageHoursPerCycle',
          numberOfAircraftPropertyName: 'numberOfAircraftWithHoursPerCycle'
        }
      });
    });
  });

  describe('onEmissionsMetricChange', () => {
    it('should update metric options with selected emissions metric', () => {
      // arrange
      const initialMetricOptions = {
        metric: {
          name: 'Monthly CO2 per ASK',
          valuePropertyName: 'averageCo2GPerAsk',
          numberOfAircraftPropertyName: 'numberOfAircraftWithCo2GPerAsk'
        }
      } as MetricOptions;

      component.metricOptions = initialMetricOptions;

      // act
      component.onEmissionsMetricChange({
        name: 'Monthly CO2 per Seat',
        valuePropertyName: 'averageCo2KgPerSeat',
        numberOfAircraftPropertyName: 'numberOfAircraftWithCo2KgPerSeat'
      });

      // assert
      expect(component.metricOptions).toEqual({
        ...initialMetricOptions,
        metric: {
          name: 'Monthly CO2 per Seat',
          valuePropertyName: 'averageCo2KgPerSeat',
          numberOfAircraftPropertyName: 'numberOfAircraftWithCo2KgPerSeat'
        }
      });
    });
  });

  describe('onStartDateSelect', () => {
    it('should update metric options with selected startMonth and startYear', () => {
      // arrange
      const initialMetricOptions = {
        startMonthIndex: 0,
        startYear: 2017
      } as MetricOptions;

      component.selectedStartDate = new Date(2022, 11, 31);

      component.metricOptions = initialMetricOptions;

      // act
      component.onStartDateSelect();

      // assert
      expect(component.metricOptions).toEqual({
        ...initialMetricOptions,
        startYear: 2022,
        startMonthIndex: 11
      });
    });

    it('should set the minimum end date to the selected start date plus one month', () => {
      // arrange
      component.selectedStartDate = new Date(2022, 11, 31);

      // act
      component.onStartDateSelect();

      // assert
      expect(component.minimumEndDate).toEqual(new Date(2023, 0, 31));
    });
  });

  describe('onEndDateSelect', () => {
    it('should update metric options with selected endMonth and endYear', () => {
      // arrange
      const initialMetricOptions = {
        endMonthIndex: 3,
        endYear: 2019
      } as MetricOptions;

      component.metricOptions = initialMetricOptions;

      component.selectedEndDate = new Date(2022, 11, 31);

      // act
      component.onEndDateSelect();

      // assert
      expect(component.metricOptions).toEqual({
        ...initialMetricOptions,
        endYear: 2022,
        endMonthIndex: 11
      });
    });

    it('should set the maximum start date to the selected end date minus one month', () => {
      // arrange
      component.selectedEndDate = new Date(2022, 11, 31);

      // act
      component.onEndDateSelect();

      // assert
      expect(component.maximumStartDate).toEqual(new Date(2022, 10, 30));
    });
  });

  describe('exportExcel', () => {
    it('when portfolio is selected and comparison portfolio is selected should call the comparePortfolioExcelExportService with both portfolio detail options', () => {
      // arrange
      const portfolioDetailOptions = { portfolioId: 1 } as PortfolioDetailOptions;
      const comparisonPortfolioDetailOptions = { portfolioId: 2 } as PortfolioDetailOptions;
      const metricOptions = {} as MetricOptions;

      component.onPortfolioDetailOptionsChange(portfolioDetailOptions);
      component.onComparisonPortfolioDetailOptionsChange(comparisonPortfolioDetailOptions);
      component.metricOptions = metricOptions;
      component.isEmissions = false;
      component.isHoursAndCycle = true;
      const metrics = component.isEmissions ? component.emissionsMetrics : component.utilizationMetrics;

      // act
      component.exportExcel();

      // assert
      expect(comparePortfolioExcelExportServiceSpy.export).toHaveBeenCalledWith(
        portfolioDetailOptions,
        comparisonPortfolioDetailOptions,
        metricOptions,
        metrics,
        component.isEmissions,
        component.isHoursAndCycle
      );
    });

    it('when portfolio is selected and comparison portfolio is not selected should call the comparePortfolioExcelExportService with portfolio detail options', () => {
      // arrange
      const portfolioDetailOptions = { portfolioId: 1 } as PortfolioDetailOptions;
      const metricOptions = {} as MetricOptions;

      component.onPortfolioDetailOptionsChange(portfolioDetailOptions);
      component.metricOptions = metricOptions;
      component.isEmissions = true;
      component.isHoursAndCycle = false;
      const metrics = component.isEmissions ? component.emissionsMetrics : component.utilizationMetrics;

      // act
      component.exportExcel();

      // assert
      expect(comparePortfolioExcelExportServiceSpy.export).toHaveBeenCalledWith(
        portfolioDetailOptions,
        undefined,
        metricOptions,
        metrics,
        component.isEmissions,
        component.isHoursAndCycle
      );
    });

    it('when portfolio is not selected and comparison portfolio is selected should call the comparePortfolioExcelExportService with comparison portfolio detail options', () => {
      // arrange
      const comparisonPortfolioDetailOptions = { portfolioId: 1 } as PortfolioDetailOptions;
      const metricOptions = {} as MetricOptions;

      component.onComparisonPortfolioDetailOptionsChange(comparisonPortfolioDetailOptions);
      component.metricOptions = metricOptions;
      component.isEmissions = false;
      component.isHoursAndCycle = true;
      const metrics = component.isEmissions ? component.emissionsMetrics : component.utilizationMetrics;

      // act
      component.exportExcel();

      // assert
      expect(comparePortfolioExcelExportServiceSpy.export).toHaveBeenCalledWith(
        comparisonPortfolioDetailOptions,
        undefined,
        metricOptions,
        metrics,
        component.isEmissions,
        component.isHoursAndCycle
      );
    });
  });
});

@Component({
  selector: 'ra-portfolio-detail',
  template: '',
  standalone: false
})
class MockPortfolioDetailComponent {
  @Input() metricOptions?: MetricOptions;
  @Input() isComparisonPortfolio!: boolean;
  @Input() yMax!: any[];
  @Input() isEmissions!: boolean;
  @Input() isHoursAndCycle!: boolean;
}

@Component({
  selector: 'ra-compare-portfolio-table',
  template: '',
  standalone: false
})
class MockPortfolioTableComponent {
  @Input() isModal = false;
  @Input() metricDetailsTable!: { [key: string]: string | number }[];
  @Input() tableHeaders!: string[];
}
