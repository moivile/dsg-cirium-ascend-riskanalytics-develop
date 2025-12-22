import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SummaryMetric } from './summaryMetrics';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { Subscription, tap } from 'rxjs';
import { Aircraft } from '../../../shared/models/aircraft';
import { PortfolioOverviewSummaryMetricsService } from './portfolio-overview-summary-metrics.service';
import { PortfolioOverviewSummaryMetricsAgeService } from './portfolio-overview-summary-metrics-age.service';

@Component({
  selector: 'ra-portfolio-overview-summary-metrics[countBy][summaryTitle]',
  templateUrl: './portfolio-overview-summary-metrics.component.html',
  styleUrls: ['./portfolio-overview-summary-metrics.component.scss'],
  providers: [PortfolioOverviewSummaryMetricsService, PortfolioOverviewSummaryMetricsAgeService]
})
export class PortoflioOverviewSummaryMetricsComponent implements OnInit, OnDestroy {
  @Input() countBy!: string;
  @Input() summaryTitle!: string;

  private portfolioAircraftSubscription!: Subscription;

  summaryMetrics!: SummaryMetric[];

  constructor(private readonly portfolioOverviewStore: PortfolioOverviewStore,
    private readonly portfolioOverviewSummaryMetricsService: PortfolioOverviewSummaryMetricsService,
    private readonly portfolioOverviewSummaryMetricsAgeService: PortfolioOverviewSummaryMetricsAgeService) {
  }

  ngOnInit(): void {

    this.portfolioAircraftSubscription = this.portfolioOverviewStore.filteredPortfolioAircraft$.pipe(
      tap((portfolioAircraft) => {
        if (portfolioAircraft.length) {
          this.updateSummaryMetricsData(portfolioAircraft);
        }
        else {
          this.summaryMetrics = [];
        }
      }
      )).subscribe();
  }

  ngOnDestroy(): void {
    this.portfolioAircraftSubscription?.unsubscribe();
  }

  private updateSummaryMetricsData(portfolioAircraft: Aircraft[]): any {
    if (this.countBy === 'aircraftAgeYears') {
      this.summaryMetrics = this.portfolioOverviewSummaryMetricsAgeService.buildAgeSummaryMetrics(portfolioAircraft);
    }
    else {
      this.summaryMetrics = this.portfolioOverviewSummaryMetricsService.buildSummaryMetrics(portfolioAircraft, this.countBy);
    }
  }
}
