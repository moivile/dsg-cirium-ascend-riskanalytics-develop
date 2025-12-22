import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Subscription, tap } from 'rxjs';
import { Aircraft } from '../../../shared/models/aircraft';
import { functionalHelpers } from '../../helpers/functional-helpers';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';

@Component({
  selector: 'ra-portfolio-overview-accordion[accordionContentId][defaultHeight]',
  templateUrl: './portfolio-overview-accordion.component.html',
  styleUrls: ['./portfolio-overview-accordion.component.scss']
})
export class PortfolioOverviewAccordionComponent implements OnInit, OnDestroy {

  @Input() accordionContentId!: string;
  @Input() defaultHeight!: string;
  @Input() countBy!: string;

  private sharedDataServiceSubscription!: Subscription;
  private groupCount!: number;

  expanded = false;
  accordionLabel!: string;
  displayAccordionBar!: boolean;

  constructor(private readonly portfolioOverviewStore: PortfolioOverviewStore) { }

  ngOnInit(): void {
    this.sharedDataServiceSubscription = combineLatest(
      [
        this.portfolioOverviewStore.filteredPortfolioAircraft$,
        this.portfolioOverviewStore.groupBy$
      ])
      .pipe(
        tap(([portfolioAircraft, groupBy]) => {
          this.setupAccordion(portfolioAircraft, groupBy.groupName);
        }
        )).subscribe();
  }

  ngOnDestroy(): void {
    this.sharedDataServiceSubscription?.unsubscribe();
  }

  toggleAccordion(expanded: boolean): void {
    this.expanded = expanded;

    if (this.expanded) {
      this.accordionLabel = 'SHOW LESS';
      this.setAccordionContentHeight('auto');
    } else {
      this.accordionLabel = `SHOW ALL (${this.groupCount})`;
      this.setAccordionContentHeight(this.defaultHeight);
    }
  }

  private setupAccordion(portfolioAircraft: Aircraft[], groupBy: string): void {
    if (this.accordionContentId === 'airlineAccordion' || this.accordionContentId === 'lessorsAccordion') {
      const distinctGroups = functionalHelpers.distinct(portfolioAircraft, this.countBy);
      this.groupCount = distinctGroups.includes(null) ? distinctGroups.length - 1 : distinctGroups.length;
    }
    else {
      const distinctGroups = functionalHelpers.distinct(portfolioAircraft, groupBy);
      this.groupCount = distinctGroups.length;
    }

    if (this.groupCount > 11) {
      this.displayAccordionBar = true;
      this.toggleAccordion(false);
    }
    else {
      this.displayAccordionBar = false;
      this.toggleAccordion(true);
    }
  }

  private setAccordionContentHeight(height: string): void {
    const accordionContent = document.getElementById(this.accordionContentId);
    if (accordionContent !== null) {
      accordionContent.style.height = height;
    }
  }
}
