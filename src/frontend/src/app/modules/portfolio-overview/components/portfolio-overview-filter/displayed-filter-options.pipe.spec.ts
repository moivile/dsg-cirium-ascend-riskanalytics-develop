import { DisplayedFilterOptionsPipe } from './displayed-filter-options.pipe';
import { FilterOption } from './portfolio-overview-filter.service';

describe('transform', () => {
  const pipe = new DisplayedFilterOptionsPipe();

  it('when filterOptionsCount is more than numberOfFilterOptionsToShow and showMore is false, trim to the numberOfFilterOptionsToShow', () => {
    const filterOptions: FilterOption[] = [
      {
        name: 'Filter One',
        count: 4,
        displayName: 'filterOne'
      } as FilterOption,
      {
        name: 'Filter Two',
        count: 4,
        displayName: 'filterTwo'
      } as FilterOption,
      {
        name: 'Filter Three',
        count: 4,
        displayName: 'filterThree'
      } as FilterOption,
      {
        name: 'Filter Four',
        count: 4,
        displayName: 'filterFour'
      } as FilterOption,
      {
        name: 'Filter Five',
        count: 4,
        displayName: 'filterFive'
      } as FilterOption,
      {
        name: 'Filter Six',
        count: 4,
        displayName: 'filterSix'
      } as FilterOption,
      {
        name: 'Filter Seven',
        count: 4,
        displayName: 'filterSeven'
      } as FilterOption,
      {
        name: 'Filter Eight',
        count: 4,
        displayName: 'filterEight'
      } as FilterOption
    ];
    const showMore = false;
    const filterOptionsCount = 7;
    const numberOfFilterOptionsToShow = 7;

    const transformedFilterOptions = pipe.transform(filterOptions, showMore, filterOptionsCount);

    expect(transformedFilterOptions).toEqual(filterOptions.slice(0, numberOfFilterOptionsToShow));
  });

  it('when filterOptionsCount is less than numberOfFilterOptionsToShow and showMore is false, trim to the numberOfFilterOptionsToShow', () => {
    const filterOptions: FilterOption[] = [
      {
        name: 'Filter One',
        count: 4,
        displayName: 'filterOne'
      } as FilterOption,
      {
        name: 'Filter Two',
        count: 4,
        displayName: 'filterTwo'
      } as FilterOption,
      {
        name: 'Filter Three',
        count: 4,
        displayName: 'filterThree'
      } as FilterOption,
      {
        name: 'Filter Four',
        count: 4,
        displayName: 'filterFour'
      } as FilterOption,
      {
        name: 'Filter Five',
        count: 4,
        displayName: 'filterFive'
      } as FilterOption,
      {
        name: 'Filter Six',
        count: 4,
        displayName: 'filterSix'
      } as FilterOption,
      {
        name: 'Filter Seven',
        count: 4,
        displayName: 'filterSeven'
      } as FilterOption,
      {
        name: 'Filter Eight',
        count: 4,
        displayName: 'filterEight'
      } as FilterOption,
    ];
    const showMore = false;
    const filterOptionsCount = 6;
    const numberOfFilterOptionsToShow = 7;

    const transformedFilterOptions = pipe.transform(filterOptions, showMore, filterOptionsCount);

    expect(transformedFilterOptions).toEqual(filterOptions.slice(0, numberOfFilterOptionsToShow));
  });

  it('when filterOptionsCount is more than numberOfFilterOptionsToShow and showMore is false, trim to the maxNumberFilterOptionsToShow', () => {
    const filterOptions: FilterOption[] = [
      {
        name: 'Filter One',
        count: 4,
        displayName: 'filterOne'
      } as FilterOption,
      {
        name: 'Filter Two',
        count: 4,
        displayName: 'filterTwo'
      } as FilterOption,
      {
        name: 'Filter Three',
        count: 4,
        displayName: 'filterThree'
      } as FilterOption,
      {
        name: 'Filter Four',
        count: 4,
        displayName: 'filterFour'
      } as FilterOption,
      {
        name: 'Filter Five',
        count: 4,
        displayName: 'filterFive'
      } as FilterOption,
      {
        name: 'Filter Six',
        count: 4,
        displayName: 'filterSix'
      } as FilterOption,
      {
        name: 'Filter Seven',
        count: 4,
        displayName: 'filterSeven'
      } as FilterOption,
      {
        name: 'Filter Eight',
        count: 4,
        displayName: 'filterEight'
      } as FilterOption,
    ];
    const showMore = false;
    const filterOptionsCount = 8;
    const maxNumberFilterOptionsToShow = 5;

    const transformedFilterOptions = pipe.transform(filterOptions, showMore, filterOptionsCount);

    expect(transformedFilterOptions).toEqual(filterOptions.slice(0, maxNumberFilterOptionsToShow));
  });

  it('when filterOptionsCount is less than numberOfFilterOptionsToShow and showMore is true, trim to the numberOfFilterOptionsToShow', () => {
    const filterOptions: FilterOption[] = [
      {
        name: 'Filter One',
        count: 4,
        displayName: 'filterOne'
      } as FilterOption,
      {
        name: 'Filter Two',
        count: 4,
        displayName: 'filterTwo'
      } as FilterOption,
      {
        name: 'Filter Three',
        count: 4,
        displayName: 'filterThree'
      } as FilterOption,
      {
        name: 'Filter Four',
        count: 4,
        displayName: 'filterFour'
      } as FilterOption,
      {
        name: 'Filter Five',
        count: 4,
        displayName: 'filterFive'
      } as FilterOption,
      {
        name: 'Filter Six',
        count: 4,
        displayName: 'filterSix'
      } as FilterOption,
      {
        name: 'Filter Seven',
        count: 4,
        displayName: 'filterSeven'
      } as FilterOption,
      {
        name: 'Filter Eight',
        count: 4,
        displayName: 'filterEight'
      } as FilterOption
    ];
    const showMore = true;
    const filterOptionsCount = 6;
    const numberOfFilterOptionsToShow = 7;

    const transformedFilterOptions = pipe.transform(filterOptions, showMore, filterOptionsCount);

    expect(transformedFilterOptions).toEqual(filterOptions.slice(0, numberOfFilterOptionsToShow));
  });

  it('when filterOptionsCount is more than numberOfFilterOptionsToShow and showMore is true, show all filter options', () => {
    const filterOptions: FilterOption[] = [
      {
        name: 'Filter One',
        count: 4,
        displayName: 'filterOne'
      } as FilterOption,
      {
        name: 'Filter Two',
        count: 4,
        displayName: 'filterTwo'
      } as FilterOption,
      {
        name: 'Filter Three',
        count: 4,
        displayName: 'filterThree'
      } as FilterOption,
      {
        name: 'Filter Four',
        count: 4,
        displayName: 'filterFour'
      } as FilterOption,
      {
        name: 'Filter Five',
        count: 4,
        displayName: 'filterFive'
      } as FilterOption,
      {
        name: 'Filter Six',
        count: 4,
        displayName: 'filterSix'
      } as FilterOption,
      {
        name: 'Filter Seven',
        count: 4,
        displayName: 'filterSeven'
      } as FilterOption,
      {
        name: 'Filter Eight',
        count: 4,
        displayName: 'filterEight'
      } as FilterOption
    ];
    const showMore = true;
    const filterOptionsCount = 8;

    const transformedFilterOptions = pipe.transform(filterOptions, showMore, filterOptionsCount);

    expect(transformedFilterOptions).toEqual(filterOptions);
  });

});
