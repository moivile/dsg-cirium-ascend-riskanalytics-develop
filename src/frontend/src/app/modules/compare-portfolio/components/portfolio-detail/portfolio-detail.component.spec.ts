import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioDetailComponent } from './portfolio-detail.component';
import { Component, Input, SimpleChange } from '@angular/core';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { MetricOptions } from '../../models/metric-options';
import { of } from 'rxjs';
import { User } from '../../../../app-user.service';
import { Claim } from '../../../shared/models/claim';
import { TooltipModule } from 'primeng/tooltip';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { UtilizationService } from '../../../shared/services/utilization.service';
import { ActivatedRoute } from '@angular/router';

describe('PortfolioDetailComponent', () => {
  let component: PortfolioDetailComponent;
  let fixture: ComponentFixture<PortfolioDetailComponent>;
  let utilizationServiceSpy: any;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    utilizationServiceSpy = jasmine.createSpyObj('UtilizationService', ['getMonthlyUtilization']);
    activatedRoute = {
      snapshot: {
        data: {
          appUser: { claims: [], userEmailAddress: ''  } as User
        }
      }
    } as unknown as ActivatedRoute;

    await TestBed.configureTestingModule({
      imports: [TooltipModule],
      declarations: [PortfolioDetailComponent, MockPortfolioDetailOptionsComponent, MockMonthlyUtilizationChartComponent],
      providers: [
        { provide: UtilizationService, useValue: utilizationServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioDetailComponent);
    component = fixture.componentInstance;
    spyOn(component.portfolioDetailOptionsChange, 'emit');

    component.metricOptions = {} as MetricOptions;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('user does not have emissionsAddOn claim then set hasEmissionsAddOn to false', () => {
      // arrange
      activatedRoute.snapshot.data['appUser'].claims = [];

      // act
      component.ngOnInit();

      // assert
      expect(component.hasEmissionsAddOn).toBeFalse();
    });

    it('user has emissionsAddOn claim then set hasEmissionsAddOn to true', () => {
      // arrange
      activatedRoute.snapshot.data['appUser'].claims = [Claim.emissionsAddOn];

      // act
      component.ngOnInit();

      // assert
      expect(component.hasEmissionsAddOn).toBeTrue();
    });
  });

  describe('onPortfolioDetailOptionsChange', () => {

    describe('groupByOptions are undefined and includeBaseline is false', () => {
      it('does not call getMonthlyUtilization', () => {
        // arrange
        const portfolioDetailOptions: PortfolioDetailOptions = {
          portfolioId: 1,
          portfolioName: 'portfolioName',
          groupByOptions: undefined,
          operatorId: 2,
          operatorName: 'operatorName',
          includeBaseline: false
        };

        // act
        component.onPortfolioDetailOptionsChange(portfolioDetailOptions);

        // assert
        expect(utilizationServiceSpy.getMonthlyUtilization).toHaveBeenCalledTimes(0);
      });

      it('sets monthlyUtilizationChartData to empty', () => {
        // arrange
        const portfolioDetailOptions: PortfolioDetailOptions = {
          portfolioId: 1,
          portfolioName: 'portfolioName',
          groupByOptions: undefined,
          operatorId: 2,
          operatorName: 'operatorName',
          includeBaseline: false
        };

        // act
        component.onPortfolioDetailOptionsChange(portfolioDetailOptions);

        // assert
        expect(component.monthlyUtilizationChartData).toEqual([]);
      });

      it('emits portfolioDetailOptions as undefined', () => {
        // arrange
        const portfolioDetailOptions: PortfolioDetailOptions = {
          portfolioId: 1,
          portfolioName: 'portfolioName',
          groupByOptions: undefined,
          operatorId: 2,
          operatorName: 'operatorName',
          includeBaseline: false
        };

        // act
        component.onPortfolioDetailOptionsChange(portfolioDetailOptions);

        // assert
        expect(component.portfolioDetailOptionsChange.emit).toHaveBeenCalledWith(undefined);
      });
    });

    const groupByOptionsTestCases = [
      {groupByOptions: {key: 'aircraftFamily', filterIds: [1, 2, 3]}, includeBaseline: false},
      {groupByOptions: undefined, includeBaseline: true}
    ];

    groupByOptionsTestCases.forEach((testCase) => {
      describe(`groupByOptions are ${testCase.groupByOptions ? 'defined' : 'undefined'} and includeBaseline is ${testCase.includeBaseline ? 'true' : 'false'}`, () => {
        it('call getMonthlyUtilization', () => {

          // arrange
          const portfolioId = 1;
          const operatorId = 2;
          const lessorId = 3;

          utilizationServiceSpy.getMonthlyUtilization.and.returnValue(of([]));

          const portfolioDetailOptions: PortfolioDetailOptions = {
            portfolioId,
            portfolioName: 'portfolioName',
            groupByOptions: testCase.groupByOptions,
            operatorId,
            operatorName: 'operatorName',
            lessorId,
            lessorName: 'lessorName',
            includeBaseline: testCase.includeBaseline
          };

          component.metricOptions = {
            startYear: 2022,
            startMonthIndex: 0,
            endYear: 2022,
            endMonthIndex: 2
          } as MetricOptions;
          component.isEmissions=false;
          component.isHoursAndCycle = true;

          // act
          component.onPortfolioDetailOptionsChange(portfolioDetailOptions);

          // assert
          expect(utilizationServiceSpy.getMonthlyUtilization).toHaveBeenCalledWith(
            portfolioId,
            testCase.includeBaseline,
            component.isEmissions,
            component.isHoursAndCycle,
            testCase.groupByOptions?.key,
            testCase.groupByOptions?.filterIds,
            operatorId,
            lessorId);
        });

        it('set monthlyUtilizationChartData to monthly utilization data filtered by date', () => {

          // arrange
          const portfolioId = 1;
          const groupByOptions = {key: 'aircraftFamily', filterIds: [1, 2, 3]};

          utilizationServiceSpy.getMonthlyUtilization.and.returnValue(of([
            [
              {group: 'A320', year: 2022, month: 9},
              {group: 'A320', year: 2022, month: 10},
              {group: 'A320', year: 2022, month: 11},
              {group: 'A320', year: 2022, month: 12},
              {group: 'A320', year: 2023, month: 1},
              {group: 'A320', year: 2023, month: 2}
            ],
            [
              {group: 'A380', year: 2022, month: 9},
              {group: 'A380', year: 2022, month: 10},
              {group: 'A380', year: 2022, month: 11},
              {group: 'A380', year: 2022, month: 12},
              {group: 'A380', year: 2023, month: 1},
              {group: 'A380', year: 2023, month: 2}
            ]
          ]));

          const portfolioDetailOptions: PortfolioDetailOptions = {
            portfolioId,
            portfolioName: 'portfolioName',
            groupByOptions,
            includeBaseline: false
          };

          component.metricOptions = {
            startYear: 2022,
            startMonthIndex: 10,
            endYear: 2023,
            endMonthIndex: 0
          } as MetricOptions;

          // act
          component.onPortfolioDetailOptionsChange(portfolioDetailOptions);

          // assert
          expect(component.monthlyUtilizationChartData.length).toEqual(2);

          expect(component.monthlyUtilizationChartData[0]).toEqual([
            {group: 'A320', year: 2022, month: 11},
            {group: 'A320', year: 2022, month: 12},
            {group: 'A320', year: 2023, month: 1}
          ] as MonthlyUtilization[]);

          expect(component.monthlyUtilizationChartData[1]).toEqual([
            {group: 'A380', year: 2022, month: 11},
            {group: 'A380', year: 2022, month: 12},
            {group: 'A380', year: 2023, month: 1}
          ] as MonthlyUtilization[]);
        });

        it('update chartLabels', () => {

          // arrange
          component.metricOptions = {
            startYear: 2022,
            startMonthIndex: 0,
            endYear: 2022,
            endMonthIndex: 2
          } as MetricOptions;

          // act
          component.ngOnChanges({metricOptions: new SimpleChange('', '', true)});

          // assert
          expect(component.chartLabels).toEqual(['Jan 2022', 'Feb 2022', 'Mar 2022']);

        });

        it('update chartXAxisTitle', () => {

          // arrange
          component.metricOptions = {
            startYear: 2022,
            startMonthIndex: 0,
            endYear: 2022,
            endMonthIndex: 2
          } as MetricOptions;

          // act
          component.ngOnChanges({metricOptions: new SimpleChange('', '', true)});

          // assert
          expect(component.chartXAxisTitle).toEqual('Months (Jan 2022 to Mar 2022)');

        });

        it('emits portfolioDetailOptions', () => {

          // arrange
          const portfolioId = 1;
          const portfolioName = 'portfolioName';
          const operatorId = 2;
          const operatorName = 'operatorName';

          utilizationServiceSpy.getMonthlyUtilization.and.returnValue(of([]));

          const portfolioDetailOptions: PortfolioDetailOptions = {
            portfolioId,
            portfolioName,
            groupByOptions: testCase.groupByOptions,
            operatorId,
            operatorName,
            includeBaseline: testCase.includeBaseline
          };

          component.metricOptions = {
            startYear: 2022,
            startMonthIndex: 0,
            endYear: 2022,
            endMonthIndex: 2
          } as MetricOptions;

          // act
          component.onPortfolioDetailOptionsChange(portfolioDetailOptions);

          // assert
          expect(component.portfolioDetailOptionsChange.emit).toHaveBeenCalledWith({
            portfolioId,
            portfolioName,
            groupByOptions: testCase.groupByOptions,
            operatorId,
            operatorName,
            includeBaseline: testCase.includeBaseline
          });
        });
      });
    });
  });
});

@Component({
    selector: 'ra-portfolio-detail-options',
    template: '',
    standalone: false
})
class MockPortfolioDetailOptionsComponent {
  @Input() isComparisonPortfolio!: boolean;
  @Input() isEmissions!:boolean;
  @Input() isHoursAndCycle!:boolean;
}

@Component({
    selector: 'ra-monthly-utilization-chart',
    template: '',
    standalone: false
})
class MockMonthlyUtilizationChartComponent {
  @Input() metric!: string;
  @Input() monthlyUtilizationChartData?: MonthlyUtilization[][];
  @Input() chartLabels: string[] = [];
  @Input() chartXAxisTitle!: string;
  @Input() yScaleSuggestedMax?: number;
  @Input() upsell = false;
  @Input() yMax!:any[];
  @Input() isComparisonPortfolio!: boolean;
  @Input() portfolioName!: string;
  @Input() isEmissions!:boolean;
  @Input() isHoursAndCycle!:boolean;
  @Input() graphNoticeMessage!: string;
}
