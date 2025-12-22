import { Injectable } from '@angular/core';
import { Aircraft } from '../../../shared/models/aircraft';
import { functionalHelpers } from '../../helpers/functional-helpers';

export interface Filter {
  displayName: string;
  filterName: string;
  selectedFilters: string[] | number[];
  filterOptions: FilterOption[];
  showMore: boolean;
  defaultSelectedFilters: string[];
  filterOptionsCount: number;
  filterNames: string[];
}

export interface FilterOption {
  name: string | number;
  count: number;
  displayName?: string;
}

@Injectable()
export class PortfolioOverviewFilterService {
  static maxNumberOfFilterOptionsWhenShowMore = 5;
  static numberOfFilterOptionsToShow = 7;

  filterFleetData(fleet: any[], filters: Filter[]): any[] {
    const selectedFilters = filters.filter((filter) => filter.selectedFilters.length > 0);
    return fleet.filter((aircraft) => {
      return selectedFilters.every((filter) => {
        return filter.selectedFilters.toString().includes(aircraft[filter.filterName]);
      });
    });
  }

  calculateSelectedFilterCount(filters: Filter[]): number {
    return filters.filter((filter) => filter.selectedFilters.length > 0).length;
  }

  getFleetsFilterOptions(fleet: Aircraft[]): Filter[] {
    let filters: Filter[] = [];
    filters = this.buildDefaultFleetFilters(filters, fleet);
    return filters;
  }

  updateFilterOptions(filters: Filter[], fleet: Aircraft[]): void {
    filters.forEach((filter) => {
      const otherFilters = filters.filter((otherFilter) => {
        return otherFilter.filterName !== filter.filterName;
      });

      const filteredFleet: any[] = this.filterFleetData(fleet, otherFilters);

      const filteredFleetCounts = functionalHelpers.countByExcludingNulls(filteredFleet, filter.filterName);

      filter.filterOptions.forEach((filterOption) => {
        filterOption.count = 0;
      });

      filter.filterOptionsCount = 0;

      Object.keys(filteredFleetCounts).forEach((filteredFleetCount) => {
        const filterOption = filter.filterOptions.find((option) => {
          return option.name === filteredFleetCount;
        });

        if (filterOption != undefined) {
          filterOption.count = filteredFleetCounts[filteredFleetCount];
          if (filterOption.count !== 0) {
            filter.filterOptionsCount++;
          }
        }
      });

      functionalHelpers.sortByPropertyDescending(filter.filterOptions, 'count');
    });
  }

  getDefaultFilters(): Filter[] {
    const filters: Filter[] = [
      PortfolioOverviewFilterService.buildDefaultFilter('Operator', 'operator'),
      PortfolioOverviewFilterService.buildDefaultFilter('Lessor', 'lessorOrganization'),
      PortfolioOverviewFilterService.buildDefaultFilter('Status', 'status'),
      PortfolioOverviewFilterService.buildDefaultFilter('Aircraft Manufacturer', 'aircraftManufacturer'),
      PortfolioOverviewFilterService.buildDefaultFilter('Aircraft Market Class', 'aircraftMarketClass'),
      PortfolioOverviewFilterService.buildDefaultFilter('Aircraft Family', 'aircraftFamily'),
      PortfolioOverviewFilterService.buildDefaultFilter('Aircraft Type', 'aircraftType'),
      PortfolioOverviewFilterService.buildDefaultFilter('Engine Series', 'engineSeries')
    ];

    return filters;
  }

  filterNotNull(filterOptionName: string): boolean {
    return filterOptionName !== null;
  }

  private buildDefaultFleetFilters(filters: Filter[], fleet: Aircraft[]): Filter[] {
    filters = this.getDefaultFilters();
    filters.forEach((filter) => {
      const filterOptions = functionalHelpers.distinct(fleet, filter.filterName);
      filterOptions.forEach((filterOptionName: string) => {
        if (this.filterNotNull(filterOptionName)) {
          filter.filterOptions.push({
            name: filterOptionName,
            count: 0
          });
        }
      });
    });
    this.updateFilterOptions(filters, fleet);
    return filters;
  }

  private static buildDefaultFilter(
    displayName: string,
    filterName: string,
    selectedFilters?: string[],
    filterNames?: string[]
  ): Filter {
    return {
      displayName,
      filterName,
      selectedFilters: selectedFilters ?? [],
      defaultSelectedFilters: selectedFilters ? [...selectedFilters] : [],
      filterOptions: [],
      showMore: false,
      filterOptionsCount: 0,
      filterNames: filterNames ?? []
    };
  }
}
