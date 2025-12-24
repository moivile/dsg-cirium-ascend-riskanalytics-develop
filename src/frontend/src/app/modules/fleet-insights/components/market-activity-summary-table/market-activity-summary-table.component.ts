import { Component } from '@angular/core';
import { MarketActivityTabStore } from '../../services/market-activity-tab-store';

@Component({
    selector: 'ra-market-activity-summary-table',
    templateUrl: './market-activity-summary-table.component.html',
    styleUrls: ['./market-activity-summary-table.component.scss'],
    standalone: false
})
export class MarketActivitySummaryTableComponent {
  // Default field to sort by and order for the table
  defaultSortField = 'numberOfEvents';
  defaultSortOrder = -1; // -1 for descending, 1 for ascending
  defaultRowCount = 100;

  constructor(public marketActivityTabStore: MarketActivityTabStore) {}
}
