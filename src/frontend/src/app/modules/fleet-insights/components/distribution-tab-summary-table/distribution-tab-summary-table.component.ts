import { Component } from '@angular/core';
import { DistributionTabStore } from '../../services/distribution-tab-store';

@Component({
    selector: 'ra-distribution-tab-summary-table',
    templateUrl: './distribution-tab-summary-table.component.html',
    styleUrls: ['./distribution-tab-summary-table.component.scss'],
    standalone: false
})
export class DistributionTabSummaryTableComponent {
  defaultSortField = 'numberOfAircraft';
  defaultSortOrder = -1; // 1 for ascending, -1 for descending
  defaultRowCount = 100;

  constructor(public distributionTabStore: DistributionTabStore) {}
}
