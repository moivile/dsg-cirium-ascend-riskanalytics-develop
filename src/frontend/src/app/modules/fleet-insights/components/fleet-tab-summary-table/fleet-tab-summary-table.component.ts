import { Component, Input } from '@angular/core';
import { TableDataGroup, TableValue } from '../../models/trends-table-data.model';

@Component({
    selector: 'ra-fleet-tab-summary-table',
    templateUrl: './fleet-tab-summary-table.component.html',
    styleUrls: ['./fleet-tab-summary-table.component.scss'],
    standalone: false
})
export class FleetTabSummaryTableComponent {
  @Input() tableData: TableDataGroup[] = [];
  @Input() columnNames!: string[];
  @Input() defaultSortField = 'numberOfAircraft';
  @Input() defaultSortOrder = -1;
  @Input() summaryTableLoading = false;
  @Input() numberOfAircraftSelected!: { value: boolean };
  @Input() onSort!: (event: { field: string; order: number }) => void;
  @Input() footerTotals: { [key: string]: number } = {};
  defaultRowCount = 100;
  frozenColumns = [{ field: 'grouping', header: 'Grouping' }];

  formatPercentage(value: number): string {
    return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  formatRowValue(value: TableValue): string {
    if (this.numberOfAircraftSelected.value) {
      return value.numberOfAircraft.toString();
    }
    return `${this.formatPercentage(value.percentageOfTotal)}%`;
  }
}
