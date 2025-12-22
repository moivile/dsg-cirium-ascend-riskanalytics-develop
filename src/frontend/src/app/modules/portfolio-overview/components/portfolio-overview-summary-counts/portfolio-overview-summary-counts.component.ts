import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, of, tap } from 'rxjs';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { Aircraft } from '../../../shared/models/aircraft';
import { functionalHelpers } from '../../helpers/functional-helpers';

@Component({
  selector: 'ra-portfolio-overview-summary-counts',
  templateUrl: './portfolio-overview-summary-counts.component.html',
  styleUrls: ['./portfolio-overview-summary-counts.component.scss']
})
export class PortfolioOverviewSummaryCountsComponent implements OnInit, OnDestroy {

  private portfolioAircraftSubscription!: Subscription;

  aircraftCount$!: Observable<number>;
  meanFleetAge$!: Observable<number>;

  constructor(private readonly portfolioOverviewStore: PortfolioOverviewStore) {
  }
  ngOnInit(): void {

    this.portfolioAircraftSubscription = this.portfolioOverviewStore.filteredPortfolioAircraft$.pipe(
      tap((portfolioAircraft) => {
        if (portfolioAircraft.length) {
          this.calculateSummaryTotals(portfolioAircraft);
        }
      }
      )).subscribe();
  }

  ngOnDestroy(): void {
    this.portfolioAircraftSubscription?.unsubscribe();
  }

  private calculateSummaryTotals(portfolioAircraft: Aircraft[]): void {
    this.aircraftCount$ = of(portfolioAircraft.length);
    this.calculateMeanAge(portfolioAircraft);
  }

  private calculateMeanAge(portfolioAircraft: Aircraft[]): void {
    const ages = portfolioAircraft
      .filter(aircraft => aircraft.aircraftAgeYears !== undefined && aircraft.aircraftAgeYears !== null)
      .map(aircraft => aircraft.aircraftAgeYears) as number[];

    this.meanFleetAge$ = of(functionalHelpers.computeMean(ages, 1));
  }
}
