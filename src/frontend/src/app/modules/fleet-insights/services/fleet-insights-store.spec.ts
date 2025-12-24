import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FleetInsightsStore } from './fleet-insights-store';
import { FleetInsightsService } from './fleet-insights-service';
import { FleetInsightsAircraftFilterResponseModel } from '../models/fleet-insights-aircraft-filter-response.model';
import { FilterPanelFormValueModel } from '../models/filter-panel-form-model';
import { of } from 'rxjs';

describe('FleetInsightsStore', () => {
  let store: FleetInsightsStore;
  let fleetInsightsServiceMock: jasmine.SpyObj<FleetInsightsService>;

  beforeEach(() => {
    const serviceSpy = jasmine.createSpyObj('FleetInsightsService', ['getAircraftFilterData']);
    serviceSpy.getAircraftFilterData.and.returnValue(of({} as any));

    TestBed.configureTestingModule({
      providers: [FleetInsightsStore, { provide: FleetInsightsService, useValue: serviceSpy }]
    });

    store = TestBed.inject(FleetInsightsStore);
    fleetInsightsServiceMock = TestBed.inject(FleetInsightsService) as jasmine.SpyObj<FleetInsightsService>;
  });

  it('should sort primaryUsages with priority if typedKey equals primaryUsagesKey', (done) => {
    // Arrange
    const options: FleetInsightsAircraftFilterResponseModel = {
      primaryUsages: [
        { id: 3, name: 'Passenger' },
        { id: 2, name: 'Freight / Cargo' },
        { id: 4, name: 'Other' }
      ]
    };
    const excludeKeys: (keyof FilterPanelFormValueModel)[] = [];

    // Act
    store.updateFilterPanelOptionsWithFilterResponseModel({ options, excludeKeys });

    // Assert
    store.filterPanelOptions$.subscribe((filterPanelOptions) => {
      const updatedOptions = filterPanelOptions.primaryUsages;
      expect(updatedOptions).toEqual([
        { id: 2, name: 'Freight / Cargo' },
        { id: 3, name: 'Passenger' },
        { id: 4, name: 'Other' }
      ]);
      done();
    });
  });

  it('should sort statuses with priority if typedKey equals statusKey', (done) => {
    // Arrange
    const options: FleetInsightsAircraftFilterResponseModel = {
      statuses: [
        { id: 10, name: 'Retired' },
        { id: 5, name: 'In Service' },
        { id: 6, name: 'Storage' },
        { id: 15, name: 'On Order' }
      ]
    };
    const excludeKeys: (keyof FilterPanelFormValueModel)[] = [];

    // Act
    store.updateFilterPanelOptionsWithFilterResponseModel({ options, excludeKeys });

    // Assert
    store.filterPanelOptions$.subscribe((filterPanelOptions) => {
      const updatedOptions = filterPanelOptions.statuses;
      expect(updatedOptions).toEqual([
        { id: 5, name: 'In Service' },
        { id: 6, name: 'Storage' },
        { id: 15, name: 'On Order' },
        { id: 10, name: 'Retired' }
      ]);
      done();
    });
  });

  it('should sort options alphabetically if typedKey is neither primaryUsagesKey nor statusKey', (done) => {
    // Arrange
    const options: FleetInsightsAircraftFilterResponseModel = {
      marketClasses: [
        { id: 5, name: 'Narrowbody' },
        { id: 3, name: 'Widebody' },
        { id: 4, name: 'Regional' }
      ]
    };
    const excludeKeys: (keyof FilterPanelFormValueModel)[] = [];

    // Act
    store.updateFilterPanelOptionsWithFilterResponseModel({ options, excludeKeys });

    // Assert
    store.filterPanelOptions$.subscribe((filterPanelOptions) => {
      const updatedOptions = filterPanelOptions.marketClasses;
      expect(updatedOptions).toEqual([
        { id: 5, name: 'Narrowbody' },
        { id: 4, name: 'Regional' },
        { id: 3, name: 'Widebody' }
      ]);
      done();
    });
  });

  it('should map trendsOwnerships to names using trendsOwnershipOptions', fakeAsync(() => {
    const captured: string[][] = [];

    store.trendsTabLeftPanelFiltersWithNames$.subscribe((namedFilters) => {
      if (namedFilters) {
        captured.push(namedFilters.trendsOwnerships);
      }
    });

    tick(50);
    expect(captured[0]).toEqual([]);

    store.updateFilterPanelFormValue({ trendsOwnerships: [3, 1, 4] });

    tick(50);
    expect(captured[1]).toEqual(['Operating Lessor Managed Only', 'Owner Operator', 'Operating Lessor Owned and Managed']);
  }));
});
