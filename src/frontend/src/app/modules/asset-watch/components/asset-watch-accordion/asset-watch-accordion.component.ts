import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Component({
    selector: 'ra-asset-watch-accordion[accordionContentId][defaultHeight]',
    templateUrl: './asset-watch-accordion.component.html',
    styleUrls: ['./asset-watch-accordion.component.scss'],
    standalone: false
})
export class AssetWatchAccordionComponent implements OnInit {
  @Input() accordionContentId!: string;
  @Input() defaultHeight!: string;
  @Input() groupCount$!: BehaviorSubject<number>;

  private groupCount!: number;

  expanded = false;
  accordionLabel!: string;
  displayAccordionBar!: boolean;

  ngOnInit(): void {
    this.groupCount$
      .pipe(
        tap((chartBarCount) => {
          this.setupAccordion(chartBarCount);
        })
      )
      .subscribe();
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

  private setupAccordion(chartBarCount: number): void {
    this.groupCount = chartBarCount;

    if (this.groupCount > 11) {
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
