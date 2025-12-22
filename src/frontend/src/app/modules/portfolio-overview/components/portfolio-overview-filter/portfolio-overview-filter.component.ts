import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { Filter, PortfolioOverviewFilterService } from './portfolio-overview-filter.service';
import { Aircraft } from '../../../shared/models/aircraft';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { PortfolioOverviewFilterExcelService } from './portfolio-overview-filter-excel-service';

@Component({
  selector: 'ra-portfolio-overview-filter',
  templateUrl: './portfolio-overview-filter.component.html',
  styleUrls: ['./portfolio-overview-filter.component.scss'],
  providers: [
    PortfolioOverviewFilterService,
    PortfolioOverviewFilterExcelService
  ]
})
export class PortfolioOverviewFilterComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('filtersOverlayContainer') filtersOverlayContainer!: ElementRef;
  @ViewChild('viewDataButton') viewDataButton!: ElementRef;

  private portfolioAircraft!: Aircraft[];
  private portfolioAircraftSubscription!: Subscription;
  private filteredPortfolioAircraft!: Aircraft[];

  filters!: Filter[];
  filtersOverlay = false;
  filterOptionsOverlay = false;
  filterDisplayName!: string;
  selectedFilterCount!: number;
  closeOverlay!: boolean;


  readonly numberOfFilterOptionsToShow = PortfolioOverviewFilterService.numberOfFilterOptionsToShow;

  @HostListener('document:click', ['$event'])
  clickout(event: any): void {
    if (event.clientX > 585 || event.clientY > 565 &&
      !this.viewDataButton.nativeElement.contains(event.target)) {
      this.closeFiltersOverlay();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.filters) {
      this.selectedFilterCount = this.portfolioOverviewFilterService.calculateSelectedFilterCount(this.filters);
    }
  }

  constructor(
    private readonly portfolioOverviewFilterService: PortfolioOverviewFilterService,
    private readonly portfolioOverviewStore: PortfolioOverviewStore,
    private readonly portfolioOverviewFilterExcelService: PortfolioOverviewFilterExcelService) {
  }

  ngOnInit(): void {
    this.portfolioAircraftSubscription = this.portfolioOverviewStore.portfolioAircraft$.pipe(
      tap((portfolioAircraft) => {
        if (portfolioAircraft.length) {
          this.buildFleetData(portfolioAircraft);
        }
      }
      )).subscribe();

  }

  ngAfterViewInit(): void {
    this.filtersOverlayContainer.nativeElement.hidden = true;
    this.closeOverlay = false;
  }

  ngOnDestroy(): void {
    this.portfolioAircraftSubscription?.unsubscribe();
  }

  showNoResults(filter: Filter): boolean {
    return filter.filterOptions.every(option => option.count === 0) && filter.selectedFilters.length < 1;
  }

  canResetFilter(filter: any): boolean {
    const selectedFiltersAreNotDefault = filter.selectedFilters.length === filter.defaultSelectedFilters.length &&
      filter.selectedFilters.every((selected: any, index: any) => {
        return selected == filter.defaultSelectedFilters[index];
      });
    return !selectedFiltersAreNotDefault;
  }

  showHoverText(filterOptionDiv: any, title: string): void {
    const overflowed = filterOptionDiv.scrollWidth > filterOptionDiv.clientWidth;
    filterOptionDiv.title = overflowed ? title : '';
  }

  operatorAndAirline(filterName: string): boolean {
    return filterName === 'operator';
  }

  updateSelectedFilters(filterCheckbox: any, filterOptionName: string, selectedFilters: any[]): void {
    if (filterCheckbox.checked) {
      selectedFilters.push(filterOptionName);
    } else {
      const index = selectedFilters.indexOf(filterOptionName);
      selectedFilters.splice(index, 1);
    }
    this.setFilteredFleet();
    this.buildFilterExcelData();
  }

  resetFiltersOverlay(filterDisplayName: string): void {
    this.filters.forEach(filter => {
      if (filter.displayName === filterDisplayName) {
        this.resetFilter(filter);
      }
    });
  }

  resetFilter(filter: Filter): void {
    const defaultFilters = this.portfolioOverviewFilterService.getDefaultFilters();
    const defaultFilter = defaultFilters.find(x => x.filterName === filter.filterName);
    if (defaultFilter) {
      filter.selectedFilters = defaultFilter.selectedFilters;
      this.setFilteredFleet();
    }
    this.buildFilterExcelData();
  }

  resetFilters(): void {
    this.filters = this.portfolioOverviewFilterService.getFleetsFilterOptions(this.portfolioAircraft);
    this.setFilteredFleet();
    this.buildFilterExcelData();
  }

  openFiltersOverlay(): void {
    this.filtersOverlayContainer.nativeElement.hidden = false;
    this.filtersOverlay = true;
    this.filterOptionsOverlay = false;
    this.closeOverlay = true;
  }

  closeFiltersOverlay(): void {
    this.filtersOverlayContainer.nativeElement.hidden = true;
    this.filtersOverlay = false;
    this.filterOptionsOverlay = false;
    this.closeOverlay = false;
  }

  openFilterOptionsOverlay(filterDisplayName: string): void {
    this.filterDisplayName = filterDisplayName;
    this.filtersOverlay = false;
    this.filterOptionsOverlay = true;
  }

  private buildFleetData(fleet: Aircraft[]): void {
    this.portfolioAircraft = fleet;
    this.filters = this.portfolioOverviewFilterService.getFleetsFilterOptions(this.portfolioAircraft);
    this.buildFilterExcelData();
    this.filteredPortfolioAircraft = this.portfolioOverviewFilterService.filterFleetData(this.portfolioAircraft, this.filters);
    this.portfolioOverviewStore.setFilteredPortfolioAircraft(this.filteredPortfolioAircraft);
    this.selectedFilterCount = this.portfolioOverviewFilterService.calculateSelectedFilterCount(this.filters);
  }

  private setFilteredFleet(): void {
    this.filteredPortfolioAircraft = this.portfolioOverviewFilterService.filterFleetData(this.portfolioAircraft, this.filters);
    this.portfolioOverviewStore.setFilteredPortfolioAircraft(this.filteredPortfolioAircraft);
    this.portfolioOverviewFilterService.updateFilterOptions(this.filters, this.portfolioAircraft);
    this.selectedFilterCount = this.portfolioOverviewFilterService.calculateSelectedFilterCount(this.filters);
  }

  private buildFilterExcelData(): void {
    if (this.filters) {
      const excelData = this.portfolioOverviewFilterExcelService.buildFiltersExcelSheetData(this.filters);
      const sheetName = '1-filtered';
      this.portfolioOverviewStore.setExcelSheetData({ sheetName, excelData });
    }
  }
}
