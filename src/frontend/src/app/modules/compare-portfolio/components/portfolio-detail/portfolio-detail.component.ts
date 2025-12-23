import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { MetricOptions } from '../../models/metric-options';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { Subscription, take, tap } from 'rxjs';
import dayjs from 'dayjs';
import { Claim } from '../../../shared/models/claim';
import { DateConstants } from '../../../shared/models/date-constants';
import { UtilizationService } from '../../../shared/services/utilization.service';
import { ActivatedRoute } from '@angular/router';
import { Metric } from '../../models/metric';

@Component({
    selector: 'ra-portfolio-detail[metricOptions][isComparisonPortfolio]',
    templateUrl: './portfolio-detail.component.html',
    styleUrls: ['./portfolio-detail.component.scss'],
    standalone: false
})
export class PortfolioDetailComponent implements OnInit, OnChanges {
  @Input() metricOptions!: MetricOptions;
  @Input() isComparisonPortfolio!: boolean;
  @Input() yMax!: any[];
  @Input() isEmissions!: boolean;
  @Input() isHoursAndCycle!: boolean;
  @Output() yAxisScaleChange = new EventEmitter<any>();
  @Output() portfolioDetailOptionsChange = new EventEmitter<PortfolioDetailOptions>();
  @Output() portfolioMetricTableChange = new EventEmitter<{ [key: string]: string | number }[]>();
  @Output() comparisonPortfolioMetricTableChange = new EventEmitter<{ [key: string]: string | number }[]>();

  monthlyUtilizationChartData: MonthlyUtilization[][] = [];
  chartLabels: string[] = [];
  metricEmpty: Metric = {
    name: '',
    valuePropertyName: '',
    numberOfAircraftPropertyName: ''
  };
  selectedPortfolioName = '';
  selectedOperatorName = '';
  selectedLessorName = '';
  chartXAxisTitle = '';
  graphNoticeMessage = '';
  hasEmissionsAddOn = false;
  showEmissionUpsell = false;
  datatable: any[] = [];
  readonly chartTitleToolTipMessage = 'Only aircraft with tracked metrics will be included in the calculation.';

  private monthlyUtilizationData: MonthlyUtilization[][] = [];

  private getMonthlyUtilizationSubscription!: Subscription;

  constructor(private readonly route: ActivatedRoute, private readonly utilizationService: UtilizationService) {}

  ngOnInit(): void {
    this.hasEmissionsAddOn = this.route.snapshot.data['appUser']?.claims.includes(Claim.emissionsAddOn) === true;
    if (!this.hasEmissionsAddOn && this.isEmissions) {
      this.showEmissionUpsell = true;
    }
  }

  onPortfolioDetailOptionsChange(portfolioDetailOptions: PortfolioDetailOptions): void {
    this.selectedPortfolioName = portfolioDetailOptions.portfolioName;
    this.selectedOperatorName = portfolioDetailOptions.operatorName ? portfolioDetailOptions.operatorName : '';
    this.selectedLessorName = portfolioDetailOptions.lessorName ? portfolioDetailOptions.lessorName : '';
    if (!portfolioDetailOptions.includeBaseline && !portfolioDetailOptions.groupByOptions) {
      this.monthlyUtilizationData = [];
      this.graphNoticeMessage = '';
      this.chartOptionsChanged();
      this.portfolioDetailOptionsChange.emit(undefined);
      return;
    }

    this.getMonthlyUtilizationSubscription?.unsubscribe();

    this.getMonthlyUtilizationSubscription = this.utilizationService
      .getMonthlyUtilization(
        portfolioDetailOptions.portfolioId,
        portfolioDetailOptions.includeBaseline,
        this.isEmissions,
        this.isHoursAndCycle,
        portfolioDetailOptions.groupByOptions?.key,
        portfolioDetailOptions.groupByOptions?.filterIds,
        portfolioDetailOptions.operatorId,
        portfolioDetailOptions.lessorId
      )
      .pipe(
        take(1),
        tap((monthlyUtilization) => {
          this.graphNoticeMessage = '';
          const graphNoticeArray = portfolioDetailOptions.groupByOptions?.value;
          const groupIdToRemove = monthlyUtilization.map(element => Number(element[0].groupId)).filter(groupId => typeof groupId === 'number');
          const filteredGraphNoticeArray = graphNoticeArray?.filter(x => {
            if (typeof x?.id === 'number') {
              return !groupIdToRemove.includes(x.id);
            }
            return false;
          });
          const graphNoticeMessage = filteredGraphNoticeArray?.map(obj => obj?.name).join(', ');
          if(graphNoticeMessage){
            this.graphNoticeMessage += graphNoticeMessage;
          }
          this.monthlyUtilizationData = monthlyUtilization;
          this.portfolioDetailOptionsChange.emit(portfolioDetailOptions);
          this.chartOptionsChanged();
        })
      )
      .subscribe();
  }

  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (simpleChanges['metricOptions']) {
      this.chartOptionsChanged();
    }
  }

  yMaxChange(yMax: any): void {
    this.yAxisScaleChange.emit(yMax);
  }

  private chartOptionsChanged(): void {
    this.updateChartLabelsAndTitles();

    this.monthlyUtilizationChartData = this.getMonthlyUtilizationDataByDate(
      this.metricOptions.startYear,
      this.metricOptions.startMonthIndex + 1,
      this.metricOptions.endYear,
      this.metricOptions.endMonthIndex + 1
    );
    this.updateMetricDetailsTable();
  }

  private updateMetricDetailsTable(): void {
    const headers = this.createMetricTableHeaders();
    const rawData: { [key: string]: string | number }[] = [];

    this.monthlyUtilizationChartData.forEach((group) => {
      const metricDetails: { [key: string]: string | number } = {};
      metricDetails['Portfolio'] = this.selectedPortfolioName;
      metricDetails['Grouping'] = group[0].group;
      metricDetails['Operator'] = this.selectedOperatorName;
      metricDetails['Lessor'] = this.selectedLessorName;
      metricDetails['Avg. of Selected Period'] = 0;

      let totalMetricValue = 0;
      let totalTrackedAircraftsHours = 0;
      let totalTrackedAircraftCycle = 0;
      let totalTrackedHours = 0;
      let totalTrackedCycles = 0;
      let averageValue = 0;
      let averageCo2GPerAsk = 0;
      let averageCo2GPerAsm = 0;
      let averageCo2KgPerSeat = 0;
      let totalCo2KgPerSeat = 0;
      const numberOfAircraftWithCo2GPerAsk = 0;
      const numberOfAircraftWithCo2GPerAsm = 0;
      const numberOfAircraftWithCo2KgPerSeat = 0;
      const numberOfMonths = this.chartLabels.length;
      const metricName = this.metricOptions.metric?.valuePropertyName as keyof MonthlyUtilization;
      for (let index = 0; index < group.length; index++) {
        const propName = headers[index + 5];
        const propValue = group[index][metricName] || 0;
        metricDetails[propName] = propValue;
        totalMetricValue += parseFloat(propValue.toString());
        totalTrackedHours += parseFloat((group[index].totalHours || 0).toString());
        totalTrackedCycles += parseFloat((group[index].totalCycles || 0).toString());
        totalCo2KgPerSeat  += parseFloat((group[index].totalCo2KgPerSeat || 0).toString());
        averageCo2GPerAsk  += parseFloat((group[index].averageCo2GPerAsk || 0).toString());
        averageCo2GPerAsm  += parseFloat((group[index].averageCo2GPerAsm || 0).toString());
        averageCo2KgPerSeat  += parseFloat((group[index].averageCo2KgPerSeat || 0).toString());
        totalTrackedAircraftsHours += group[index].numberOfAircraftWithHours;
        totalTrackedAircraftCycle += group[index].numberOfAircraftWithHoursPerCycle;
      }
      if (metricName === 'totalCycles') {
        averageValue = this.calculateAverage(totalTrackedCycles, numberOfMonths);
      } else if (metricName === 'totalHours') {
        averageValue = this.calculateAverage(totalTrackedHours, numberOfMonths);
      } else if (metricName === 'averageCycles') {
        averageValue = this.calculateAverage(totalTrackedCycles, totalTrackedAircraftCycle);
      } else if (metricName === 'averageHours') {
        averageValue = this.calculateAverage(totalTrackedHours, totalTrackedAircraftsHours);
      } else if (metricName === 'averageHoursPerCycle') {
        averageValue = this.calculateAverage(totalTrackedHours, totalTrackedCycles);
      } else if (metricName === 'averageCo2GPerAsk') {
        averageValue = this.calculateAverage(averageCo2GPerAsk, numberOfMonths);
      } else if (metricName === 'averageCo2GPerAsm') {
        averageValue = this.calculateAverage(averageCo2GPerAsm, numberOfMonths);
      } else if (metricName === 'averageCo2KgPerSeat') {
        averageValue = this.calculateAverage(averageCo2KgPerSeat, numberOfMonths);
      } else if (metricName === 'totalCo2KgPerSeat') {
        averageValue = this.calculateAverage(totalCo2KgPerSeat, numberOfMonths);
      }
      else {
        averageValue = this.calculateAverage(totalMetricValue, totalTrackedAircraftsHours);
      }

      if (!isNaN(averageValue)) {
        metricDetails['Avg. of Selected Period'] = averageValue.toFixed(2);
      } else {
        metricDetails['Avg. of Selected Period'] = 0;
      }

      rawData.push(metricDetails);
    });

    this.emitMetricsData(rawData, this.isComparisonPortfolio ? 'comparisonPortfolioMetricTableChange' : 'portfolioMetricDetailTableChange');
  }

  private createMetricTableHeaders(): string[] {
    const headersInOrder: string[] = ['Portfolio', 'Grouping', 'Operator', 'Lessor', 'Avg. of Selected Period', ...this.chartLabels];

    return headersInOrder;
  }

  private calculateAverage(totalMetricValue: number, totalTrackedAircrafts: number): number {
    return totalTrackedAircrafts !== 0 ? totalMetricValue / totalTrackedAircrafts : NaN;
  }

  private emitMetricsData(data: any[], eventName: string): void {
    if (eventName === 'comparisonPortfolioMetricTableChange') {
      this.comparisonPortfolioMetricTableChange.emit(data);
    } else {
      this.portfolioMetricTableChange.emit(data);
    }
  }

  private updateChartLabelsAndTitles(): void {
    const selectedYearsAndMonthsRange = this.getYearsAndMonthsRange(
      this.metricOptions.startYear,
      this.metricOptions.startMonthIndex + 1,
      this.metricOptions.endYear,
      this.metricOptions.endMonthIndex + 1
    );

    this.chartLabels = [];
    selectedYearsAndMonthsRange.forEach((yearAndMonth) => {
      this.chartLabels.push(dayjs(`${yearAndMonth.year}-${yearAndMonth.month}-01`).format(DateConstants.MMMYYYY));
    });

    this.chartXAxisTitle = `Months (${this.chartLabels[0]} to ${this.chartLabels[this.chartLabels.length - 1]})`;
  }

  private getMonthlyUtilizationDataByDate(
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ): MonthlyUtilization[][] {
    return this.monthlyUtilizationData.map((monthlyUtilization: MonthlyUtilization[]) => {
      return monthlyUtilization.filter(
        (x) =>
          ((x.year === startYear && x.month >= startMonth) || x.year > startYear) &&
          ((x.year === endYear && x.month <= endMonth) || x.year < endYear)
      );
    });
  }

  private getYearsAndMonthsRange(
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
  ): { year: number; month: number }[] {
    const yearMonths: { year: number; month: number }[] = [];

    let currentYear = startYear;
    let currentMonth = startMonth;

    while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
      yearMonths.push({ year: currentYear, month: currentMonth });

      if (currentMonth === 12) {
        currentYear++;
        currentMonth = 1;
      } else {
        currentMonth++;
      }
    }

    return yearMonths;
  }
}
