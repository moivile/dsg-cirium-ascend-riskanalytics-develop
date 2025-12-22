import { TestBed } from '@angular/core/testing';
import { AssetWatchStore, initialState } from './asset-watch-store';
import { FilterPanelFormOptions } from '../models/filter-panel-form-options';

describe('AssetWatchStore', () => {
  let store: AssetWatchStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssetWatchStore]
    });

    store = TestBed.inject(AssetWatchStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('Selectors', () => {
    it('filterOptions$', (done) => {
      store.filterOptions$.subscribe((value) => {
        expect(value).toEqual(initialState.filterOptions);
        done();
      });
    });

    it('savedSearch$', (done) => {
      store.savedSearch$.subscribe((value) => {
        expect(value).toEqual(initialState.savedSearch);
        done();
      });
    });

    it('searchIsDirty$', (done) => {
      store.searchIsDirty$.subscribe((value) => {
        expect(value).toEqual(initialState.searchIsDirty);
        done();
      });
    });

    it('isActive$', (done) => {
      store.isActive$.subscribe((value) => {
        expect(value).toBeUndefined();
        done();
      });
    });

    it('savedSearchName$', (done) => {
      store.savedSearchName$.subscribe((value) => {
        expect(value).toBeUndefined();
        done();
      });
    });

    it('savedSearchId$', (done) => {
      store.savedSearchId$.subscribe((value) => {
        expect(value).toBeUndefined();
        done();
      });
    });

    it('savedSearchIsNull$', (done) => {
      store.savedSearchIsNull$.subscribe((value) => {
        expect(value).toBeTruthy();
        done();
      });
    });
  });

  describe('Updaters', () => {
    it('setFilterOptions', () => {
      const newFilterOptions = { ...initialState.filterOptions, regions: ['Region1' as unknown] } as FilterPanelFormOptions;
      store.setFilterOptions(newFilterOptions);

      store.filterOptions$.subscribe((value) => {
        expect(value).toEqual(newFilterOptions);
      });
    });

    it('setCitiesFilterOptions', () => {
      const cities = [{ id: '1', name: 'City1' }];
      store.setCitiesFilterOptions(cities);

      store.filterOptions$.subscribe((value) => {
        expect(value.cities).toEqual(cities);
      });
    });

    it('setAirportsFilterOptions', () => {
      const airports = [{ id: '1', name: 'Airport1' }];
      store.setAirportsFilterOptions(airports);

      store.filterOptions$.subscribe((value) => {
        expect(value.airports).toEqual(airports);
      });
    });

    it('setSearchIsDirty', () => {
      store.setSearchIsDirty(true);

      store.searchIsDirty$.subscribe((value) => {
        expect(value).toBeTruthy();
      });
    });

    it('setSavedSearch', () => {
      const savedSearch = { id: 1, name: 'Test Search', isActive: true };
      store.setSavedSearch(savedSearch);

      store.savedSearch$.subscribe((value) => {
        expect(value).toEqual(savedSearch);
      });
    });

    it('should set savedSearchId and savedSearchPortfolioId in localStorage when available', () => {
      const savedSearchId = 1;
      const savedSearchPortfolioId = 2;
      const savedSearch = { id: savedSearchId, name: 'Test Search',portfolioId:savedSearchPortfolioId, isActive: true };
      store.setSavedSearch(savedSearch);

      expect(localStorage.getItem('savedSearchId')).toEqual(savedSearchId.toString());
      expect(localStorage.getItem('savedSearchPortfolioId')).toEqual(savedSearchPortfolioId.toString());
    });

    it('should set savedSearchId and savedSearchPortfolioId as empty in localStorage when not available in savedSearch object', () => {
      const savedSearch = null;

      store.setSavedSearch(savedSearch);

      expect(localStorage.getItem('savedSearchId')).toEqual('');
      expect(localStorage.getItem('savedSearchPortfolioId')).toEqual('');
    });
  });
});
