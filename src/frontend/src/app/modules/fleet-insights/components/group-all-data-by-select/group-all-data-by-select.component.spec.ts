import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GroupAllDataBySelectComponent } from './group-all-data-by-select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { of, Subject } from 'rxjs';
import { TreeNode } from 'primeng/api';
import { GroupAllDataByOptions } from '../../models/group-all-data-by';
import { AppStore } from '../../../../app-store';
import { AppUserService } from '../../../../app-user.service';

describe('GroupAllDataBySelectComponent', () => {
  let component: GroupAllDataBySelectComponent;
  let fixture: ComponentFixture<GroupAllDataBySelectComponent>;
  let mockStore: jasmine.SpyObj<FleetInsightsStore>;
  let groupAllDataByValueSubject: Subject<GroupAllDataByOptions>;
  let appStore: AppStore;

  beforeEach(async () => {
    groupAllDataByValueSubject = new Subject<GroupAllDataByOptions>();
    mockStore = jasmine.createSpyObj('FleetInsightsStore', ['updateGroupingForTab'], {
      groupAllDataByValue$: groupAllDataByValueSubject.asObservable(),
      currentTab$: of('distribution')
    });

    await TestBed.configureTestingModule({
      declarations: [GroupAllDataBySelectComponent],
      imports: [ReactiveFormsModule, TreeSelectModule],
      providers: [
        { provide: FleetInsightsStore, useValue: mockStore },
        AppStore,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAllDataBySelectComponent);
    component = fixture.componentInstance;
    appStore = TestBed.inject(AppStore);
    appStore.setAppUser({ claims: [], userEmailAddress: 'fgpremiumtest@rbi.co.uk' });
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize groupAllDataByTreeData', () => {
    expect(component.getGroupAllDataByTreeData()).toBeDefined();
    expect(component.getGroupAllDataByTreeData().length).toBeGreaterThan(0);
  });

  it('should call store.updateGroupingForTab when control value changes', fakeAsync(() => {
    mockStore.updateGroupingForTab.calls.reset(); // Reset any previous calls
    const testNode: TreeNode = {
      label: 'Test Label',
      key: 'TestKey',
      data: GroupAllDataByOptions.Age,
      leaf: true
    };
    component.groupAllDataByControl.setValue(testNode);
    tick();
    expect(mockStore.updateGroupingForTab).toHaveBeenCalledWith(GroupAllDataByOptions.Age);
  }));

  it('should update control value when store.groupAllDataByValue$ emits', fakeAsync(() => {
    spyOn(component.groupAllDataByControl, 'setValue').and.callThrough();

    groupAllDataByValueSubject.next(GroupAllDataByOptions.Lessor);
    tick();

    expect(component.groupAllDataByControl.setValue).toHaveBeenCalledWith(
      jasmine.objectContaining({
        label: 'Lessor',
        data: GroupAllDataByOptions.Lessor,
        leaf: true
      })
    );
    expect(component.groupAllDataByControl.value).toEqual(
      jasmine.objectContaining({
        label: 'Lessor',
        data: GroupAllDataByOptions.Lessor,
        leaf: true
      })
    );
  }));

  it('should correctly find node by data', () => {
    const dataToFind = GroupAllDataByOptions.AircraftFamily;
    const foundNode = component.findNodeByData(component.getGroupAllDataByTreeData(), dataToFind);
    expect(foundNode).toBeDefined();
    expect(foundNode?.data).toEqual(dataToFind);
  });

  it('should display ownership when not including event options', () => {
    expect(component.getGroupAllDataByTreeData()).toContain(jasmine.objectContaining({ data: GroupAllDataByOptions.Ownership }));
  });

  describe('getGroupAllDataByTreeData conditional logic', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should include Ownership option when includeEventOptions is false', () => {
      const treeData = component.getGroupAllDataByTreeData(false);

      const ownershipOption = treeData.find((option) => option.data === GroupAllDataByOptions.Ownership);
      expect(ownershipOption).toBeDefined();
      expect(ownershipOption?.label).toBe('Ownership');
      expect(ownershipOption?.leaf).toBe(true);
    });

    it('should include Ownership option regardless of test feature state when includeEventOptions is false', () => {
      component['isTestFeatureEnabled'] = false;
      const treeData = component.getGroupAllDataByTreeData(false);

      const ownershipOption = treeData.find((option) => option.data === GroupAllDataByOptions.Ownership);
      expect(ownershipOption).toBeDefined();
    });

    it('should not include Ownership option when includeEventOptions is true', () => {
      const treeData = component.getGroupAllDataByTreeData(true);

      const ownershipOption = treeData.find((option) => option.data === GroupAllDataByOptions.Ownership);
      expect(ownershipOption).toBeUndefined();
    });

    it('should include EventTypes and EventDetails when includeEventOptions is true', () => {
      const treeData = component.getGroupAllDataByTreeData(true);

      const eventTypesOption = treeData.find((option) => option.data === GroupAllDataByOptions.EventTypes);
      const eventDetailsOption = treeData.find((option) => option.data === GroupAllDataByOptions.EventDetails);

      expect(eventTypesOption).toBeDefined();
      expect(eventTypesOption?.label).toBe('Event Types');
      expect(eventTypesOption?.leaf).toBe(true);

      expect(eventDetailsOption).toBeDefined();
      expect(eventDetailsOption?.label).toBe('Event Details');
      expect(eventDetailsOption?.leaf).toBe(true);
    });

    it('should not include EventTypes and EventDetails when includeEventOptions is false', () => {
      const treeData = component.getGroupAllDataByTreeData(false);

      const eventTypesOption = treeData.find((option) => option.data === GroupAllDataByOptions.EventTypes);
      const eventDetailsOption = treeData.find((option) => option.data === GroupAllDataByOptions.EventDetails);

      expect(eventTypesOption).toBeUndefined();
      expect(eventDetailsOption).toBeUndefined();
    });

    it('should include base options regardless of feature flags', () => {
      component['isTestFeatureEnabled'] = false;
      const treeDataWithoutEvents = component.getGroupAllDataByTreeData(false);
      const treeDataWithEvents = component.getGroupAllDataByTreeData(true);

      // Helper function to check if an option exists in tree data (including nested children)
      const hasOption = (treeData: TreeNode[], option: GroupAllDataByOptions): boolean => {
        return treeData.some((item) => {
          if (item.data === option) {
            return true;
          }
          if (item.children) {
            return item.children.some((child: TreeNode) => child.data === option);
          }
          return false;
        });
      };

      // Top-level options that should always be present
      const expectedTopLevelOptions = [
        GroupAllDataByOptions.Status,
        GroupAllDataByOptions.PrimaryUsage,
        GroupAllDataByOptions.MarketClass,
        GroupAllDataByOptions.Lessor,
        GroupAllDataByOptions.Age
      ];

      // Nested options that should be present in groups
      const expectedNestedOptions = [
        GroupAllDataByOptions.Operator,
        GroupAllDataByOptions.OperatorRegion,
        GroupAllDataByOptions.OperatorCountry,
        GroupAllDataByOptions.OperatorType,
        GroupAllDataByOptions.AircraftManufacturer,
        GroupAllDataByOptions.AircraftFamily,
        GroupAllDataByOptions.AircraftType,
        GroupAllDataByOptions.AircraftMasterSeries,
        GroupAllDataByOptions.AircraftSeries,
        GroupAllDataByOptions.AircraftSubSeries,
        GroupAllDataByOptions.EngineManufacturer,
        GroupAllDataByOptions.EngineFamily,
        GroupAllDataByOptions.EngineType,
        GroupAllDataByOptions.EngineMasterSeries,
        GroupAllDataByOptions.EngineSeries,
        GroupAllDataByOptions.EngineSubSeries
      ];

      [...expectedTopLevelOptions, ...expectedNestedOptions].forEach((option) => {
        expect(hasOption(treeDataWithoutEvents, option)).toBe(true);
        expect(hasOption(treeDataWithEvents, option)).toBe(true);
      });
    });

    it('should include grouped options (Operator, Aircraft, Engine) regardless of feature flags', () => {
      const treeData = component.getGroupAllDataByTreeData(false);

      const operatorGroup = treeData.find((item) => item.key === 'OperatorGroup');
      const aircraftGroup = treeData.find((item) => item.key === 'AircraftGroup');
      const engineGroup = treeData.find((item) => item.key === 'EngineGroup');

      expect(operatorGroup).toBeDefined();
      expect(operatorGroup?.children?.length).toBeGreaterThan(0);

      expect(aircraftGroup).toBeDefined();
      expect(aircraftGroup?.children?.length).toBeGreaterThan(0);

      expect(engineGroup).toBeDefined();
      expect(engineGroup?.children?.length).toBeGreaterThan(0);
    });

    it('should maintain correct order when adding conditional options', () => {
      component['isTestFeatureEnabled'] = true;
      const treeDataWithEvents = component.getGroupAllDataByTreeData(true);
      const treeDataWithOwnership = component.getGroupAllDataByTreeData(false);

      const lastTwoItemsWithEvents = treeDataWithEvents.slice(-2);
      expect(lastTwoItemsWithEvents[0].data).toBe(GroupAllDataByOptions.EventTypes);
      expect(lastTwoItemsWithEvents[1].data).toBe(GroupAllDataByOptions.EventDetails);

      const lastItemWithOwnership = treeDataWithOwnership[treeDataWithOwnership.length - 1];
      expect(lastItemWithOwnership.data).toBe(GroupAllDataByOptions.Ownership);
    });
  });
});
