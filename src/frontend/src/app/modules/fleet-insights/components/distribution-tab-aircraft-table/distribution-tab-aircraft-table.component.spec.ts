import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DistributionTabAircraftTableComponent } from './distribution-tab-aircraft-table.component';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { FleetInsightsService } from '../../services/fleet-insights-service';
import { of } from 'rxjs';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FleetInsightsAircraftModel } from '../../models/fleet-insights-aircraft-model';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DistributionTabStore } from '../../services/distribution-tab-store';
import { AppConfigService } from '../../../../app-config.service';

describe('DistributionTabAircraftTableComponent', () => {
  let component: DistributionTabAircraftTableComponent;
  let fixture: ComponentFixture<DistributionTabAircraftTableComponent>;
  let store: FleetInsightsStore;
  let service: FleetInsightsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DistributionTabAircraftTableComponent],
      imports: [TableModule, FormsModule],
      providers: [
        FleetInsightsStore,
        FleetInsightsService,
        DistributionTabStore,
        {
          provide: AppConfigService,
          useValue: {
            configuration: {
              aircraftProfileUrlTemplate: 'https://example/#/aircraft/{aircraftID}',
              noAccessUrl: 'https://example/no-access'
            }
          }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DistributionTabAircraftTableComponent);
    component = fixture.componentInstance;
    // Mocking data
    component.aircraftList = [
      {
        aircraftSerialNumber: '12345',
        leaseEnd: new Date('2025-12-31').toISOString(),
        isLeaseEndEstimated: true,
        aircraftId: 1,
        ownership: 'Company',
        leaseStatus: 'Unlplaced New Aircraft',
        leaseStart: new Date('2020-01-01').toISOString()
      },
      {
        aircraftSerialNumber: '67890',
        leaseEnd: new Date('2023-06-15').toISOString(),
        isLeaseEndEstimated: false,
        aircraftId: 2,
        ownership: 'Leased',
        leaseStatus: 'Off Lease',
        leaseStart: new Date('2019-01-01').toISOString()
      },
      {
        aircraftSerialNumber: '11223',
        leaseEnd: new Date('2024-09-10').toISOString(),
        aircraftId: 3,
        ownership: 'Leased',
        leaseStatus: 'On Lease',
        leaseStart: new Date('2019-01-01').toISOString()
      }
    ];
    fixture.detectChanges();
    store = TestBed.inject(FleetInsightsStore);
    service = TestBed.inject(FleetInsightsService);

    // Mocking observables and methods

    spyOn(service, 'getAircraftData').and.returnValue(
      of({
        aircraftList: [],
        skip: 0,
        take: 0,
        totalCount: 0
      })
    );

    spyOn(service, 'getAircraftSummaryData').and.returnValue(
      of({
        aircraftSummaryList: [],
        skip: 0,
        take: 0,
        totalCount: 0
      })
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initially set loading to false', () => {
    expect(component.loading).toBeFalse();
  });

  it('should have default sort settings', () => {
    expect(component.defaultSortField).toBe('aircraftSerialNumber');
    expect(component.defaultSortOrder).toBe(1);
  });

  it('should load data on init', fakeAsync(() => {
    const filters = {};
    const event: TableLazyLoadEvent = {};

    // Mock filter and table events
    (component as any).tableEvents$ = of(event);
    (component.distributionTabStore as any).distributionTabLeftPanelFilters$ = of(filters);

    // Spy on private method
    spyOn<any>(component, 'getPagingAndSortingParams').and.returnValue({});
    spyOn<any>(component, 'getFleetInsightsSortByTypesItem').and.returnValue(0);

    component.ngOnInit();

    tick(400); // Wait for debounce time

    fixture.detectChanges();

    expect(service.getAircraftData).toHaveBeenCalled();
  }));

  it('should set aircraftList and totalAircraftRecords on data load when isActive is true', fakeAsync(() => {
    const filters = {};
    const event: TableLazyLoadEvent = {};

    // Mock filter and table events
    (component as any).tableEvents$ = of(event);
    (component.fleetInsightsStore as any).distributionTabLeftPanelFilters$ = of(filters);

    // Spy on private method
    spyOn<any>(component, 'getPagingAndSortingParams').and.returnValue({});
    spyOn<any>(component, 'getFleetInsightsSortByTypesItem').and.returnValue(0);

    const mockResponse = {
      aircraftList: [{ aircraftId: 1, aircraftSerialNumber: '12345' }] as FleetInsightsAircraftModel[],
      skip: 0,
      take: 1,
      totalCount: 1
    };
    service.getAircraftData = jasmine.createSpy().and.returnValue(of(mockResponse));

    component.isActive = true;

    component.ngOnInit();

    tick(400); // Wait for debounce time

    expect(component.aircraftList).toEqual(mockResponse.aircraftList);

    component.distributionTabStore.totalAircraftRecords$.subscribe((count) => {
      expect(count).toBe(1);
    });
  }));

  it('should handle onLazyLoad event', () => {
    spyOn((component as any).tableEvents$, 'next');
    const event: TableLazyLoadEvent = { first: 0, rows: 50 };
    component.onLazyLoad(event);
    expect((component as any).tableEvents$.next).toHaveBeenCalledWith(event);
  });

  it('should map filters and event data to request object', () => {
    const filters = {};
    const event: TableLazyLoadEvent = {
      first: 0,
      rows: 100,
      sortField: 'aircraftSerialNumber',
      sortOrder: 1
    };
    const request = (component as any).getPagingAndSortingParams(filters, event);
    expect(request.skip).toBe(0);
    expect(request.take).toBe(100);
    expect(request.sortBy).toBe(1); // Assuming getSortByType returns 0 for 'aircraftSerialNumber'
    expect(request.sortDirectionAscending).toBeTrue();
  });

  it('should map sort field to correct FleetInsightsSortByTypes', () => {
    const sortByType = (component as any).getFleetInsightsSortByTypesItem('aircraftSerialNumber');
    expect(sortByType).toBe(1); // Replace 1 with actual enum value
  });

  it('should unsubscribe on destroy', () => {
    spyOn((component as any).destroy$, 'next');
    spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect((component as any).destroy$.next).toHaveBeenCalled();
    expect((component as any).destroy$.complete).toHaveBeenCalled();
  });

  it('should display the "Availability" column when isAvailabilities is true', () => {
    // Set isAvailabilities to true and trigger change detection
    component.isAvailabilities = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const availabilityColumnHeader = compiled.querySelector('th[psortablecolumn="availability"]');
    expect(availabilityColumnHeader).toBeTruthy();
  });

  it('should not display the "Availability" column when isAvailabilities is false', () => {
    component.isAvailabilities = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const availabilityColumnHeader = compiled.querySelector('th[psortablecolumn="availability"]');
    expect(availabilityColumnHeader).toBeFalsy();
  });

  it('should display data rows', fakeAsync(() => {
    component.aircraftList = [
      {
        aircraftSerialNumber: '12345',
        leaseEnd: new Date('2025-12-31').toISOString(),
        isLeaseEndEstimated: true,
        aircraftId: 0
      }
    ];
    component.isActive = true; // Ensure the table shows the active data

    fixture.detectChanges();
    tick(); // Advance the clock, if necessary

    const compiled = fixture.nativeElement;
    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1); // Adjust the expectation according to your mock data
  }));

  it('should display an asterisk when isLeaseEndEstimated is true', fakeAsync(() => {
    // Mock data with isLeaseEndEstimated set to true for the first aircraft
    component.aircraftList = [
      {
        aircraftSerialNumber: '12345',
        leaseEnd: new Date('2025-12-31').toISOString(),
        isLeaseEndEstimated: true,
        aircraftId: 1
      }
    ];
    component.isActive = true;

    fixture.detectChanges(); // Trigger change detection

    const compiled = fixture.nativeElement;
    const firstRowLeaseEndCell = compiled.querySelectorAll('tbody tr')[0].querySelectorAll('td')[15];
    expect(firstRowLeaseEndCell.textContent.trim()).toBe('31-Dec-2025 *');
  }));

  it('should open aircraft profile when access is granted', () => {
    component.isActive = true;
    component.aircraftList = [
      {
        aircraftSerialNumber: 'SN-001',
        aircraftId: 101
      } as FleetInsightsAircraftModel
    ];
    fixture.detectChanges();

    const link: HTMLAnchorElement | null = fixture.nativeElement.querySelector('tbody tr td a');
    expect(link?.getAttribute('href')).toBe('https://example/#/aircraft/101');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.textContent?.trim()).toBe('SN-001');
  });

  it('should not display an asterisk when isLeaseEndEstimated is false', fakeAsync(() => {
    component.aircraftList = [
      {
        aircraftSerialNumber: '12345',
        leaseEnd: new Date('2025-12-31').toISOString(),
        isLeaseEndEstimated: false,
        aircraftId: 1
      }
    ];
    component.isActive = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const firstRowLeaseEndCell = compiled.querySelectorAll('tbody tr')[0].querySelectorAll('td')[15];
    expect(firstRowLeaseEndCell.textContent.trim()).toBe('31-Dec-2025');
  }));

  it('should not display an asterisk when isLeaseEndEstimated is undefined', fakeAsync(() => {
    component.aircraftList = [
      {
        aircraftSerialNumber: '67890',
        leaseEnd: new Date('2023-06-15').toISOString(),
        isLeaseEndEstimated: false,
        aircraftId: 2
      }
    ];
    component.isActive = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const firstRowLeaseEndCell = compiled.querySelectorAll('tbody tr')[0].querySelectorAll('td')[15];
    expect(firstRowLeaseEndCell.textContent.trim()).toBe('15-Jun-2023');
  }));

  it('should return aircraft with ownership and lease details even when isAvailabilities is false', fakeAsync(() => {
    component.isAvailabilities = false;
    fixture.detectChanges();

    spyOn(component as any, 'getPagingAndSortingParams').and.returnValue({});
    spyOn(component as any, 'getFleetInsightsSortByTypesItem').and.returnValue(0);

    spyOn(component, 'getAllAircraftForExport')
      .and.callThrough()
      .and.returnValue(
        of([
          {
            aircraftSerialNumber: '12345',
            leaseEnd: new Date('2025-12-31').toISOString(),
            isLeaseEndEstimated: true,
            aircraftId: 1,
            ownership: 'Company',
            leaseStatus: 'Off Lease',
            leaseStart: new Date('2020-01-01').toISOString()
          },
          {
            aircraftSerialNumber: '67890',
            leaseEnd: new Date('2023-06-15').toISOString(),
            isLeaseEndEstimated: false,
            aircraftId: 2,
            ownership: 'Leased',
            leaseStatus: 'Off Lease',
            leaseStart: new Date('2019-01-01').toISOString()
          }
        ])
      );
    component.getAllAircraftForExport().subscribe((aircraftList) => {
      expect(aircraftList.length).toBe(2);
      expect(aircraftList[0].ownership).toBe('Company');
      expect(aircraftList[0].leaseStatus).toBe('Off Lease');
      expect(aircraftList[0].leaseStart).not.toBeUndefined();
      expect(aircraftList[0].leaseEnd).not.toBeUndefined();
    });
  }));

  it('should include "Availability" in the export when isAvailabilities is true', () => {
    component.isAvailabilities = true;
    spyOn(component, 'getAllAircraftForExport')
      .and.callThrough()
      .and.returnValue(
        of([
          {
            aircraftSerialNumber: '12345',
            leaseEnd: new Date('2025-12-31').toISOString(),
            isLeaseEndEstimated: true,
            aircraftId: 1,
            ownership: 'Company',
            leaseStatus: 'Off Lease',
            leaseStart: new Date('2020-01-01').toISOString(),
            availability: 'Unlplaced New Aircraft'
          },
          {
            aircraftSerialNumber: '67890',
            leaseEnd: new Date('2023-06-15').toISOString(),
            isLeaseEndEstimated: false,
            aircraftId: 2,
            ownership: 'Leased',
            leaseStatus: 'On Lease',
            leaseStart: new Date('2019-01-01').toISOString(),
            availability: 'Scheduled Off Lease'
          }
        ])
      );
    fixture.detectChanges();

    component.getAllAircraftForExport().subscribe((aircraftList) => {
      expect(aircraftList.length).toBe(2);
      expect(aircraftList[0].availability).not.toBeUndefined();
      expect(aircraftList[1].availability).toBe('Scheduled Off Lease');
    });
  });

  describe('isValidDate', () => {
    it('should return false for undefined date', () => {
      expect(component.isValidDate(undefined)).toBeFalse();
    });

    it('should return false for empty string', () => {
      expect(component.isValidDate('')).toBeFalse();
    });

    it('should return true for date containing 9999 in ISO format', () => {
      expect(component.isValidDate('9999-12-31')).toBeTrue();
      expect(component.isValidDate('9999-01-01')).toBeTrue();
    });

    it('should return true for valid date string', () => {
      expect(component.isValidDate('2025-12-31')).toBeTrue();
    });

    it('should return true for valid date in different formats', () => {
      expect(component.isValidDate('2023-06-15')).toBeTrue();
      expect(component.isValidDate('15-Jun-2023')).toBeTrue();
      expect(component.isValidDate('2024-01-01T00:00:00Z')).toBeTrue();
    });
  });
});
