import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Dialog } from 'primeng/dialog';

import { AssetWatchDetailsTableService } from './asset-watch-details-table.service';
import { SortBy } from '../../../portfolio-overview/models/sortBy';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { PrimeNGTableService } from '../../../shared/services/primeng-table-service';
import { DetailsTableHeader } from '../../../shared/models/details-table-header';
import { FilterPanelForm } from '../../models/filter-panel-form';
import { FormControl, FormGroup } from '@angular/forms';
import { AircraftWatchlistFilterForm } from '../../models/aircraft-watchlist-filter-form';
import { combineLatest, of, switchMap, withLatestFrom } from 'rxjs';
import { AssetWatchGridModel } from '../../models/asset-watch-grid-model';
import { AssetWatchService } from '../../services/asset-watch.service';
import { Table } from 'primeng/table';
import { TimePeriodOption } from '../../models/time-period-option';
import { DialogService } from 'primeng/dynamicdialog';
import { AssetWatchFlightDetailsTableComponent } from '../asset-watch-flight-details-table/asset-watch-flight-details-table.component';
import { AssetWatchGridResponseModel } from '../../models/asset-watch-grid-response-model';
import { catchError, take, tap } from 'rxjs/operators';
import { AssetWatchGridRequest } from '../../models/asset-watch-grid-request';
import { AssetWatchExportExcelService } from '../../services/asset-watch-export-excel.service';
import { AppStore } from 'src/app/app-store';
import { SortEvent } from 'primeng/api';

type AssetWatchGridModelValue = string | number | boolean | Date | null | undefined;

@Component({
  selector: 'ra-asset-watch-details-table',
  templateUrl: './asset-watch-details-table.component.html',
  styleUrls: ['./asset-watch-details-table.component.scss'],
  providers: [AssetWatchDetailsTableService, PrimeNGTableService, ExportExcelService, DialogService]
})
export class AssetWatchDetailsTableComponent implements OnInit {
  @Input() isModal = false;
  @Input() filterPanelForm!: FormGroup<FilterPanelForm>;
  @Input() aircraftWatchlistFilterForm!: FormGroup<AircraftWatchlistFilterForm>;
  @Input() selectedTimePeriodControl!: FormControl<TimePeriodOption>;
  @ViewChild('assetWatchDetailsTableContainer')
  assetWatchDetailsTableContainer!: ElementRef;
  @ViewChild(Table) tableComponent!: Table;
  sortBy!: SortBy;
  tableHeaders!: DetailsTableHeader[];
  tableData: AssetWatchGridModel[] = [];
  currentAssetWatchGridRequest: AssetWatchGridRequest | undefined;
  tableWidth: string | undefined;
  tableHeight!: string;
  displayModal = false;
  loading = false;
  modalTitle!: string;
  gridCustomSort = true;
  private selectedSortIconIndex!: number;

  @HostListener('window:resize')
  onResize(): void {
    setTimeout(() => {
      if (this.isModal) {
        this.tableWidth = 'auto';
        this.tableHeight = `${window.innerHeight - 200}px`;
      } else {
        this.tableWidth = document.getElementById('detailsRow')?.offsetWidth.toString();
      }
    }, 0);
  }

  constructor(
    private readonly primeNGTableService: PrimeNGTableService,
    public readonly dialogService: DialogService,
    private readonly assetWatchDetailsTableService: AssetWatchDetailsTableService,
    private readonly assetWatchService: AssetWatchService,
    private readonly assetWatchExportExcelService: AssetWatchExportExcelService,
    private readonly appStore: AppStore
  ) {}

  ngOnInit(): void {
    combineLatest(
      this.isModal
        ? [of(this.filterPanelForm.value), of(this.aircraftWatchlistFilterForm.value)]
        : [this.filterPanelForm.valueChanges, this.aircraftWatchlistFilterForm.valueChanges]
    )
      .pipe(
        withLatestFrom(this.appStore.selectedPortfolioId$),
        switchMap(([, selectedPortfolioId]) => {
          this.currentAssetWatchGridRequest = new AssetWatchGridRequest(
            this.filterPanelForm,
            this.selectedTimePeriodControl,
            selectedPortfolioId,
            this.aircraftWatchlistFilterForm
          );
          this.tableHeaders = this.assetWatchDetailsTableService.setupTableHeaders(this.currentAssetWatchGridRequest);

          this.tableData = [];
          this.loading = true;
          return this.assetWatchService.getAssetWatchListGrid(this.currentAssetWatchGridRequest)?.pipe(
            catchError((error) => {
              console.error('Error asset watch grid api:', error);
              this.loading = false;
              return of();
            })
          );
        })
      )
      ?.subscribe({
        next: (tableData: AssetWatchGridResponseModel) => {
          this.tableComponent.reset();
          this.tableData = tableData.assetWatchListDataGrid;
          this.setTableHeight();
          this.loading = false;
          this.customSort({ data: this.tableData, field: 'aircraftSerialNumber', order: 1 });
          this.hoverSortIcon('aircraftSerialNumber', 0, true);
          this.showSortIcon('aircraftSerialNumber', 0);
        },
        error: () => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    this.tableHeaders = this.assetWatchDetailsTableService.setupTableHeaders();
    this.sortBy = {} as SortBy;
    const detailsRowElement = document.getElementById('detailsRow');
    if (detailsRowElement) {
      new (window as any).ResizeObserver(() => window.dispatchEvent(new Event('resize'))).observe(detailsRowElement);
    }
    this.onResize();
  }

  showModal(): void {
    this.displayModal = true;
  }

  closeModal(): void {
    this.displayModal = false;
  }

  maximizeModal(modal: Dialog): void {
    modal.maximize();
    this.setTableHeight();
    new (window as any).ResizeObserver(() => window.dispatchEvent(new Event('resize'))).observe(document.getElementById('detailsRow'));
  }

  exportExcel(): void {
    if (!this.currentAssetWatchGridRequest) {
      return;
    }
    this.assetWatchExportExcelService.exportDetailsTableExcel(this.tableData, this.currentAssetWatchGridRequest).subscribe();
  }

  getSortFieldData(event: SortEvent, data: AssetWatchGridModel): AssetWatchGridModelValue {
    if (event.field) {
      return data[event.field as keyof AssetWatchGridModel] as keyof AssetWatchGridModel;
    }
    return null;
  }

  sortComparisionWithOrder(event: SortEvent, data1: AssetWatchGridModelValue, data2: AssetWatchGridModelValue): number {
    const result = data1 && data2 ? (data1 < data2 ? -1 : data1 > data2 ? 1 : 0) : 0;
    return event.order ? event.order * result : 0;
  }

  convertToType(val: AssetWatchGridModelValue): AssetWatchGridModelValue {
    if (!isNaN(Number(val))) {
      return Number(val);
    }
    if (val === null || val === undefined) {
      return '';
    }
    return val.toString().trim();
  }

  customSortForAircraftSerialNumber(event: SortEvent, data1: AssetWatchGridModelValue, data2: AssetWatchGridModelValue): number {
    const val1 = this.convertToType(data1);
    const val2 = this.convertToType(data2);
    if (val1 === null) {
      return val2 === null ? 0 : 1;
    }
    if (val2 === null) {
      return -1;
    }

    if (typeof val1 !== typeof val2) {
      if (typeof val1 === 'number' && (typeof val2 === 'string' || isNaN(Number(val2)))) {
        // val1 is number and val2 is string, return based on desired order
        return event.order === 1 ? -1 : 1;
      }
      if (typeof val1 === 'string' && (typeof val2 === 'number' || !isNaN(Number(val2)))) {
        // val1 is string and val2 is number, return based on desired order
        return event.order === 1 ? 1 : -1;
      }
    }

    // For number values, regular comparison taking into account event.order
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      if (val1 === val2) {
        const data1Length = data1?.toString().length ?? 0;
        const data2Length = data2?.toString().length ?? 0;
        return event.order === -1 ? data2Length - data1Length : data1Length - data2Length;
      }
      return event.order === -1 ? val2 - val1 : val1 - val2;
    }

    // For string values, lexicographical comparison taking into account event.order
    if (typeof val1 === 'string' && typeof val2 === 'string') {
      if (val1.toLowerCase() === val2.toLowerCase()) {
        const val1Length = val1.length;
        const val2Length = val2.length;
        return event.order === -1 ? val2Length - val1Length : val1Length - val2Length;
      }
      return event.order === -1
        ? val2.toLowerCase().localeCompare(val1.toLowerCase(), 'en', { sensitivity: 'base' })
        : val1.toLowerCase().localeCompare(val2.toLowerCase(), 'en', { sensitivity: 'base' });
    }
    return 0;
  }

  customSort(event: SortEvent): void {
    if (event.data && event.field && event.field == 'aircraftSerialNumber') {
      this.gridCustomSort = true;
      event.data.sort((data1: AssetWatchGridModel, data2: AssetWatchGridModel) => {
        const sortFieldData1 = this.getSortFieldData(event, data1);
        const sortFieldData2 = this.getSortFieldData(event, data2);
        const specialConditionSortResult = this.customSortForAircraftSerialNumber(event, sortFieldData1, sortFieldData2);
        if (specialConditionSortResult !== 0) {
          return specialConditionSortResult;
        }
        return this.sortComparisionWithOrder(event, sortFieldData1, sortFieldData2);
      });
    } else {
      this.sortBy.name = event.field?.toString() ?? '';
      this.gridCustomSort = false;
    }
  }

  showSortIcon(sortColumn: string, indexNum: number): void {
    if (!this.assetWatchDetailsTableContainer) {
      return;
    }
    this.gridCustomSort = sortColumn === 'aircraftSerialNumber';
    const sortIcons = this.assetWatchDetailsTableContainer.nativeElement.querySelectorAll('.sort-icon');
    for (let index = 0; index < sortIcons.length; index++) {
      if (index !== indexNum) {
        sortIcons[index].style.display = 'none';
      }
    }
    this.selectedSortIconIndex = indexNum;
    const selectedSortIcon = sortIcons[this.selectedSortIconIndex];
    this.primeNGTableService.showSortIcon(selectedSortIcon);
  }

  hoverSortIcon(sortColumn: string, indexNum: number, mouseenter: boolean): void {
    if (!this.assetWatchDetailsTableContainer) {
      return;
    }
    this.gridCustomSort = sortColumn === 'aircraftSerialNumber';
    if (indexNum === this.selectedSortIconIndex) {
      return;
    }
    const sortIcons = this.assetWatchDetailsTableContainer.nativeElement.querySelectorAll('.sort-icon');
    const sortIcon = sortIcons[indexNum];
    const selectedSortIcon = sortIcons[this.selectedSortIconIndex];

    this.primeNGTableService.showHideHoverSortIcon(sortIcon, selectedSortIcon, mouseenter);
  }

  getClassOf(column: any): string {
    let className = '';
    if (column.type == 'number') {
      className = 'right-text';
    } else if (column.header == 'Serial') {
      className = className + ' ' + 'msn';
    }
    return className;
  }

  clickSerial(row: any): void {
    this.appStore.selectedPortfolioId$
      .pipe(
        take(1),
        tap((selectedPortfolioId) => {
          this.dialogService.open(AssetWatchFlightDetailsTableComponent, {
            width: '90%',
            height: '100%',
            data: {
              rowValue: row,
              aircraftWatchlistFilterForm: this.aircraftWatchlistFilterForm,
              filterPanelForm: this.filterPanelForm,
              selectedPortfolioId,
              selectedTimePeriodControl: this.selectedTimePeriodControl
            },
            styleClass: 'flight-details-popup'
          });
        })
      )
      .subscribe();
  }

  private setTableHeight(): void {
    setTimeout(() => {
      const rowHeight = 28;
      const hoverOverflowHeight = 100;
      const maxTableHeight = 600;
      const fullTableHeight = rowHeight * this.tableData.length + hoverOverflowHeight;
      this.tableHeight = fullTableHeight < maxTableHeight ? `${fullTableHeight}px` : `${maxTableHeight}px`;
    }, 0);
  }
}
