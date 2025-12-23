import { Component, ChangeDetectorRef, OnInit, AfterViewChecked, Input } from '@angular/core';
import dayjs from 'dayjs';
import { MetricOptions } from '../../models/metric-options';
import { Router } from '@angular/router';
import { Metric } from '../../models/metric';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { ComparePortfolioExcelExportService } from '../../services/excel/compare-portfolio-excel-export.service';

@Component({
    selector: 'ra-compare',
    templateUrl: './compare-portfolio-tab.component.html',
    styleUrls: ['./compare-portfolio-tab.component.scss'],
    standalone: false
})
export class ComparePortfolioTabComponent implements OnInit, AfterViewChecked {
  constructor(
    private readonly router: Router,
    private cdr: ChangeDetectorRef,
    private readonly comparePortfolioExcelExportService: ComparePortfolioExcelExportService
  ) {
    this.backLink = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString();
  }

  @Input() isEmissions!: boolean;
  @Input() isHoursAndCycle!: boolean;

  private readonly defaultEndDate = dayjs().add(-1, 'month');
  private readonly defaultStartDate = this.defaultEndDate.add(-11, 'month');

  portfolioDetailOptions?: PortfolioDetailOptions;
  comparisonPortfolioDetailOptions?: PortfolioDetailOptions;
  selectedStartDate = this.defaultStartDate.toDate();
  selectedEndDate = this.defaultEndDate.toDate();
  yMax!: any[];
  backLink?: string;

  utilizationMetrics: Metric[] = [
    {
      name: 'Average Monthly Tracked Hours',
      valuePropertyName: 'averageHours',
      numberOfAircraftPropertyName: 'numberOfAircraftWithHours'
    },
    {
      name: 'Total Monthly Tracked Hours',
      valuePropertyName: 'totalHours',
      numberOfAircraftPropertyName: 'numberOfAircraftWithHours'
    },
    {
      name: 'Average Monthly Tracked Cycles',
      valuePropertyName: 'averageCycles',
      numberOfAircraftPropertyName: 'numberOfAircraftWithCycles'
    },
    {
      name: 'Total Monthly Tracked Cycles',
      valuePropertyName: 'totalCycles',
      numberOfAircraftPropertyName: 'numberOfAircraftWithCycles'
    },
    {
      name: 'Average Monthly H/C Ratio',
      valuePropertyName: 'averageHoursPerCycle',
      numberOfAircraftPropertyName: 'numberOfAircraftWithHoursPerCycle'
    }
  ];

  emissionsMetrics: Metric[] = [
    {
      name: 'Average Monthly CO2 per ASK (g)',
      valuePropertyName: 'averageCo2GPerAsk',
      numberOfAircraftPropertyName: 'numberOfAircraftWithCo2GPerAsk'
    },
    {
      name: 'Average Monthly CO2 per ASM (g)',
      valuePropertyName: 'averageCo2GPerAsm',
      numberOfAircraftPropertyName: 'numberOfAircraftWithCo2GPerAsm'
    },
    {
      name: 'Average Monthly CO2 per Seat (kg)',
      valuePropertyName: 'averageCo2KgPerSeat',
      numberOfAircraftPropertyName: 'numberOfAircraftWithCo2KgPerSeat'
    },
    {
      name: 'Total Monthly CO2 per Seat (kg)',
      valuePropertyName: 'totalCo2KgPerSeat',
      numberOfAircraftPropertyName: 'numberOfAircraftWithCo2KgPerSeat'
    }
  ];
  metricDetailsTable: { [key: string]: string | number }[] = [];
  portfolioMetricTable: { [key: string]: string | number }[] = [];
  comparisonPortfolioMetricTable: { [key: string]: string | number }[] = [];
  tableHeaders: string[] = [];
  showTable = false;

  minimumStartDate: Date = new Date(2017, 0, 1);
  maximumStartDate: Date = this.defaultEndDate.add(-1, 'month').toDate();

  minimumEndDate: Date = this.defaultStartDate.add(1, 'month').toDate();
  maximumEndDate: Date = this.defaultEndDate.toDate();

  metricOptions!: MetricOptions;

  ngOnInit(): void {
    if (this.isHoursAndCycle) {
      this.metricOptions = {
        metric: this.utilizationMetrics[0],
        startYear: this.defaultStartDate.year(),
        startMonthIndex: this.defaultStartDate.month(),
        endYear: this.defaultEndDate.year(),
        endMonthIndex: this.defaultEndDate.month()
      };
    }
    if (this.isEmissions) {
      this.metricOptions = {
        metric: this.emissionsMetrics[0],
        startYear: this.defaultStartDate.year(),
        startMonthIndex: this.defaultStartDate.month(),
        endYear: this.defaultEndDate.year(),
        endMonthIndex: this.defaultEndDate.month()
      };
    }
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  onUtilizationMetricChange(metric: Metric): void {
    this.metricOptions = {
      ...this.metricOptions,
      metric
    };
  }

  onEmissionsMetricChange(metric: Metric): void {
    this.metricOptions = {
      ...this.metricOptions,
      metric
    };
  }

  onStartDateSelect(): void {
    const dayJsStartDate = dayjs(this.selectedStartDate);
    this.minimumEndDate = dayJsStartDate.add(1, 'month').toDate();

    this.metricOptions = {
      ...this.metricOptions,
      startYear: dayJsStartDate.year(),
      startMonthIndex: dayJsStartDate.month()
    };
  }

  disableHistoricalDates(): void {
    const datePickerDecade = document.getElementsByClassName('p-datepicker-decade')[0] as HTMLElement;
    const yearHeader = document.getElementsByClassName('p-datepicker-year p-link')[0] as HTMLElement;
    datePickerDecade ? this.disableCalendarPreviousButton(datePickerDecade) : this.disableCalendarPreviousButton(yearHeader);
    const datePickeryearList = document.getElementsByClassName('p-ripple p-element p-yearpicker-year');
    for (let index = 0; index < datePickeryearList.length; index++) {
      const element = datePickeryearList[index] as HTMLElement;
      if (parseFloat(element['outerText']) < this.minimumStartDate.getFullYear()) {
        element['style']['display'] = 'none';
      }
    }
  }

  disableCalendarPreviousButton(year: HTMLElement): void {
    const previousButton = document.getElementsByClassName('p-datepicker-prev')[0] as HTMLElement;
    if (parseFloat(year.innerHTML.trim().substring(0, 4)) <= this.minimumStartDate.getFullYear()) {
      previousButton.style.display = 'none';
    } else {
      previousButton.style.display = 'block';
    }
  }

  onMetricDataTableChange(): void {
    this.showTable = false;
    this.metricDetailsTable = [...this.comparisonPortfolioMetricTable, ...this.portfolioMetricTable];
    if (this.metricDetailsTable.length > 0) {
      this.tableHeaders = Object.keys(this.metricDetailsTable[0]);
      this.showTable = true;
    }
  }
  onPortfolioMetricTableChange(changedTableData: any): void {
    this.portfolioMetricTable = changedTableData;
    this.onMetricDataTableChange();
  }
  onComparisonPortfolioMetricTableChange(changedTableData: any): void {
    this.comparisonPortfolioMetricTable = changedTableData;
    this.onMetricDataTableChange();
  }
  onEndDateSelect(): void {
    const dayJsEndDate = dayjs(this.selectedEndDate);
    this.maximumStartDate = dayJsEndDate.add(-1, 'month').toDate();

    this.metricOptions = {
      ...this.metricOptions,
      endYear: dayJsEndDate.year(),
      endMonthIndex: dayJsEndDate.month()
    };
  }

  onPortfolioDetailOptionsChange(portfolioDetailOptions: PortfolioDetailOptions): void {
    this.portfolioDetailOptions = portfolioDetailOptions;
  }

  onComparisonPortfolioDetailOptionsChange(portfolioDetailOptions: PortfolioDetailOptions): void {
    this.comparisonPortfolioDetailOptions = portfolioDetailOptions;
  }

  exportExcel(): void {
    const metric = this.isEmissions ? this.emissionsMetrics : this.utilizationMetrics;
    if (this.portfolioDetailOptions) {
      this.comparePortfolioExcelExportService.export(
        this.portfolioDetailOptions,
        this.comparisonPortfolioDetailOptions,
        this.metricOptions,
        metric,
        this.isEmissions,
        this.isHoursAndCycle
      );
    } else if (this.comparisonPortfolioDetailOptions) {
      this.comparePortfolioExcelExportService.export(
        this.comparisonPortfolioDetailOptions,
        undefined,
        this.metricOptions,
        metric,
        this.isEmissions,
        this.isHoursAndCycle
      );
    }
  }

  yAxisScaleChange(yMax: any): void {
    this.yMax = yMax;
    if (this.isHoursAndCycle) {
      this.onUtilizationMetricChange(this.metricOptions.metric);
    }
    if (this.isEmissions) {
      this.onEmissionsMetricChange(this.metricOptions.metric);
    }
  }
}
