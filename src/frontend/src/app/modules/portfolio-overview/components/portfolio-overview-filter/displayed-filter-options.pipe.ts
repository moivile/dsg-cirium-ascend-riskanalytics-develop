import { Pipe, PipeTransform } from '@angular/core';
import { FilterOption, PortfolioOverviewFilterService } from './portfolio-overview-filter.service';

@Pipe({
    name: 'displayedFilterOptions',
    standalone: false
})
export class DisplayedFilterOptionsPipe implements PipeTransform {

  transform(filterOptions: FilterOption[], showMore: boolean, filterOptionsCount: number): FilterOption[] {
    const maxNumberFilterOptionsToShow = filterOptionsCount > PortfolioOverviewFilterService.numberOfFilterOptionsToShow
      ? PortfolioOverviewFilterService.maxNumberOfFilterOptionsWhenShowMore
      : PortfolioOverviewFilterService.numberOfFilterOptionsToShow;
    return showMore && filterOptionsCount > PortfolioOverviewFilterService.numberOfFilterOptionsToShow
      ? filterOptions
      : filterOptions.slice(0, maxNumberFilterOptionsToShow);
  }
}
