import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioOverviewFilterComponent } from './portfolio-overview-filter.component';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PortfolioAircraftService } from '../../../shared/services/portfolio-aircraft.service';
import { Filter } from './portfolio-overview-filter.service';

describe('PortfolioOverviewFilterComponent', () => {
  let component: PortfolioOverviewFilterComponent;
  let fixture: ComponentFixture<PortfolioOverviewFilterComponent>;

  beforeEach(async () => {

    const portfoliosServiceSpy = jasmine.createSpyObj('PortfolioAircraftService', ['getPortfolioAircraft']);
    await TestBed.configureTestingModule({
    declarations: [PortfolioOverviewFilterComponent],
    imports: [],
    providers: [
        PortfolioOverviewStore,
        { provide: PortfolioAircraftService, useValue: portfoliosServiceSpy },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
      .compileComponents();

    fixture = TestBed.createComponent(PortfolioOverviewFilterComponent);
    component = fixture.componentInstance;
    component.filtersOverlayContainer = {
      nativeElement: document.createElement('div'),
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('canResetFilter', () => {
    it('should return false when selected and default filters are the same', () => {

      // arrange
      const filter: Filter =
        {
          selectedFilters: ['In Service', 'Storage', 'On Order'],
          defaultSelectedFilters: ['In Service', 'Storage', 'On Order']
        } as Filter;

      // act
      const selectedFiltersAreNotDefault = component.canResetFilter(filter);

      // assert
      expect(selectedFiltersAreNotDefault).toBeFalse();
    });
    it('should return true when selected filters is different to default filters', () => {

      // arrange
      const filter: Filter =
        {
          selectedFilters: ['In Service'],
          defaultSelectedFilters: ['In Service', 'Storage', 'On Order'],
        } as Filter;

      // act
      const selectedFiltersAreNotDefault = component.canResetFilter(filter);

      // assert
      expect(selectedFiltersAreNotDefault).toBeTrue();
    });
  });

  describe('showNoResults', () => {
    it('should return false when filter options count total is greater than 0', () => {

      // arrange
      const filter: Filter =
        {
          filterOptions: [
            { name: 'Boeing', count: 45 },
            { name: 'Airbus', count: 0 }
          ]
        } as Filter;

      // act
      const showNoResults = component.showNoResults(filter);

      // assert
      expect(showNoResults).toBeFalse();
    });

    it('should return false when filter options count total is 0 but has selected filters', () => {

      // arrange
      const filter: Filter =
        {
          selectedFilters: ['Boeing', 'Airbus'],
          filterOptions: [
            { name: 'Boeing', count: 0 },
            { name: 'Airbus', count: 0 }
          ]
        } as Filter;

      // act
      const showNoResults = component.showNoResults(filter);

      // assert
      expect(showNoResults).toBeFalse();
    });
  });

  describe('showHoverText', () => {
    let filterOptionDiv: HTMLElement;
    const title = 'This is a long text that overflows the container';

    beforeEach(() => {
      filterOptionDiv = document.createElement('div');
      filterOptionDiv.style.width = '100px';
      filterOptionDiv.style.overflow = 'hidden';
      filterOptionDiv.textContent = 'Short text';
    });

    it('should set title to empty string if text does not overflow', () => {
      component.showHoverText(filterOptionDiv, title);
      expect(filterOptionDiv.title).toBe('');
    });
  });

  describe('openFiltersOverlay', () => {
    it('should set properties correctly', () => {
      component.openFiltersOverlay();

      expect(component.filtersOverlayContainer.nativeElement.hidden).toBe(false);
      expect(component.filtersOverlay).toBe(true);
      expect(component.filterOptionsOverlay).toBe(false);
      expect(component.closeOverlay).toBe(true);
    });
  });

  describe('closeFiltersOverlay', () => {
    it('should set properties correctly', () => {
      component.closeFiltersOverlay();

      expect(component.filtersOverlayContainer.nativeElement.hidden).toBe(true);
      expect(component.filtersOverlay).toBe(false);
      expect(component.filterOptionsOverlay).toBe(false);
      expect(component.closeOverlay).toBe(false);
    });
  });

  describe('openFilterOptionsOverlay', () => {
    const filterDisplayName = 'Test Filter';

    it('should set properties correctly', () => {
      component.openFilterOptionsOverlay(filterDisplayName);

      expect(component.filterDisplayName).toBe(filterDisplayName);
      expect(component.filtersOverlay).toBe(false);
      expect(component.filterOptionsOverlay).toBe(true);
    });
  });
});
