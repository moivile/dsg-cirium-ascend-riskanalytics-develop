import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SortBy } from '../../../portfolio-overview/models/sortBy';
import { PrimeNGTableService } from '../../../shared/services/primeng-table-service';
import { DetailsTableHeader } from '../../../shared/models/details-table-header';
import { AssetWatchFlightDetailsTableService } from '../asset-watch-flight-details-table/asset-watch-flight-details-table.service';
import { AssetWatchService } from '../../services/asset-watch.service';
import { LazyLoadMeta } from 'primeng/api';
import { FlightDetailsTableModel } from '../../models/flight-details-table-model';
import { FlightDetailsResponseModel } from '../../models/flight-details-response-model';
import { AssetWatchGridRequest } from '../../models/asset-watch-grid-request';
import { AssetWatchExportExcelService } from '../../services/asset-watch-export-excel.service';

@Component({
    selector: 'ra-asset-watch-flight-details-table',
    templateUrl: './asset-watch-flight-details-table.component.html',
    styleUrls: ['./asset-watch-flight-details-table.component.scss'],
    providers: [AssetWatchFlightDetailsTableService, PrimeNGTableService],
    standalone: false
})
export class AssetWatchFlightDetailsTableComponent implements OnInit, AfterViewInit {
  @ViewChild('flightDetailsTableContainer')
  flightDetailsTableContainer!: ElementRef;
  tableHeaders!: DetailsTableHeader[];
  tableData: FlightDetailsTableModel[] = [];
  recordCount = 0;
  sortBy!: SortBy;
  tableWidth = 'auto';
  loading = false;
  tableHeight!: string;
  columnName!: string;
  sortOrder!: string;
  pageNumber = 0;
  pageSize = 50;
  aircraftSerialNumber = '';
  aircraftRegistrationNumber = '';
  aircraftSeries = '';
  private selectedSortIconIndex!: number;

  @HostListener('window:resize')
  onResize(): void {
    setTimeout(() => {
      this.tableWidth = 'auto';
      this.tableHeight = `${window.innerHeight - 200}px`;
    }, 0);
  }

  constructor(
    private readonly primeNGTableService: PrimeNGTableService,
    public readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly assetWatchService: AssetWatchService,
    private readonly assetWatchFlightDetailsTableService: AssetWatchFlightDetailsTableService,
    private readonly assetWatchExportExcelService: AssetWatchExportExcelService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.tableHeaders = this.assetWatchFlightDetailsTableService.setupTableHeaders();
    this.aircraftSerialNumber = this.dynamicDialogConfig.data?.rowValue?.aircraftSerialNumber;
    this.aircraftRegistrationNumber = this.dynamicDialogConfig.data?.rowValue?.aircraftRegistrationNumber;
    this.aircraftSeries = this.dynamicDialogConfig.data?.rowValue?.aircraftSeries;
    this.sortBy = {} as SortBy;
    this.sortBy.name = 'departureDate';
    this.sortBy.sortDescending = true;
    this.onResize();
  }

  tableLazyLoad(event: LazyLoadMeta, sortField: string | string[] | null | undefined, sortDescending: boolean): void {
    const name: string = sortField ? sortField.toString() : '';
    if (name && name.trim().toString().length > 0) {
      let sortOrder = 'DESC';
      if (!sortDescending) {
        sortOrder = 'ASC';
      }
      if (this.pageNumber == event.first && this.columnName == name && this.sortOrder == sortOrder) {
        return;
      }
      if (this.columnName !== name) {
        this.pageNumber = 0;
      }
      this.columnName = name;
      this.sortOrder = sortOrder;
    }
    this.pageNumber = event.first ? event.first : 0;
    if (this.columnName) {
      this.getFlightDetailData(this.pageNumber, this.pageSize, false, this.columnName, this.sortOrder);
    } else {
      this.getFlightDetailData(this.pageNumber, this.pageSize, false);
    }
  }

  getFlightDetailData(pageNumber: number, pageSize: number, getExcelData: boolean, sortColumn?: string, sortOrder?: string): void {
    if (
      this.dynamicDialogConfig.data?.selectedPortfolioId &&
      this.dynamicDialogConfig.data?.rowValue.aircraftId &&
      this.dynamicDialogConfig.data?.selectedTimePeriodControl &&
      this.dynamicDialogConfig.data?.filterPanelForm &&
      this.dynamicDialogConfig.data?.aircraftWatchlistFilterForm
    ) {
      const request = new AssetWatchGridRequest(
        this.dynamicDialogConfig.data.filterPanelForm,
        this.dynamicDialogConfig.data.selectedTimePeriodControl,
        this.dynamicDialogConfig.data.selectedPortfolioId,
        this.dynamicDialogConfig.data.aircraftWatchlistFilterForm,
        pageNumber,
        pageSize
      );
      if (!getExcelData) {
        this.loading = true;
      } else {
        request.take = this.recordCount;
      }
      this.assetWatchService
        .getFlightDetailsData(
          request,
          this.dynamicDialogConfig.data.rowValue.aircraftId,
          sortColumn ? sortColumn : '',
          sortOrder ? sortOrder : ''
        )
        ?.subscribe({
          next: (data: FlightDetailsResponseModel) => {
            if (getExcelData) {
              this.assetWatchExportExcelService
                .exportFlightDetailsTableExcel(data.flightDetails, this.aircraftSerialNumber, request)
                .subscribe();
            } else {
              this.tableData = data.flightDetails;
            }
            this.recordCount = data.totalResultCount;
            this.loading = false;
            this.showSortIcon(sortColumn ? sortColumn : '', this.selectedSortIconIndex);
          },
          error: (error) => {
            console.error('Error loading flight details grid::', error);
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
    }
  }

  showSortIcon(sortColumn: string, indexNum: number): void {
    if (!this.flightDetailsTableContainer?.nativeElement) {
      return;
    }
    const sortIcons = this.flightDetailsTableContainer.nativeElement.querySelectorAll('.sort-icon');
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
    if (!this.flightDetailsTableContainer) {
      return;
    }
    if (indexNum === this.selectedSortIconIndex) {
      return;
    }
    const sortIcons = this.flightDetailsTableContainer.nativeElement.querySelectorAll('.sort-icon');
    const sortIcon = sortIcons[indexNum];
    const selectedSortIcon = sortIcons[this.selectedSortIconIndex];

    this.primeNGTableService.showHideHoverSortIcon(sortIcon, selectedSortIcon, mouseenter);
  }

  exportExcel(): void {
    this.getFlightDetailData(0, this.recordCount, true, this.columnName, this.sortOrder);
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }
}
