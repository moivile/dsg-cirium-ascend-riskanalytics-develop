import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';
import { MarketActivityTabStore } from '../../services/market-activity-tab-store';

@Component({
    selector: 'ra-market-activity-accordion[accordionContentId][defaultHeight]',
    templateUrl: './market-activity-accordion.component.html',
    styleUrls: ['./market-activity-accordion.component.scss'],
    standalone: false
})
export class MarketActivityAccordionComponent implements OnInit, OnDestroy {
  @Input() accordionContentId!: string;
  @Input() defaultHeight!: string;

  private destroy$ = new Subject<void>();
  private groupCount!: number;

  expanded = false;
  accordionLabel!: string;
  displayAccordionBar!: boolean;

  constructor(private marketActivityTabStore: MarketActivityTabStore) {}

  ngOnInit(): void {
    this.marketActivityTabStore.totalSummaryRecords$
      .pipe(
        takeUntil(this.destroy$),
        tap((totalRecords) => {
          this.setupAccordion(totalRecords);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  setupAccordion(chartBarCount: number): void {
    this.groupCount = chartBarCount;
    const minGroupCount = 11;
    const maxGroupCount = 500;

    if (this.groupCount > minGroupCount && this.groupCount <= maxGroupCount) {
      this.displayAccordionBar = true;
      this.toggleAccordion(false);
    } else {
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
