import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { Subject, takeUntil, tap, map, shareReplay, combineLatest, filter } from 'rxjs';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { GroupAllDataByLabels, GroupAllDataByOptions } from '../../models/group-all-data-by';
import { AppStore } from '../../../../app-store';

@Component({
    selector: 'ra-group-all-data-by-select',
    templateUrl: './group-all-data-by-select.component.html',
    styleUrl: './group-all-data-by-select.component.scss',
    standalone: false
})
export class GroupAllDataBySelectComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  groupAllDataByControl: FormControl = new FormControl({ nonNullable: true });
  private isTestFeatureEnabled = true;

  groupAllDataByTreeData$ = this.fleetInsightsStore.currentTab$.pipe(
    map((currentTab) => this.getGroupAllDataByTreeData(currentTab === 'marketActivity')),
    shareReplay(1)
  );

  constructor(public fleetInsightsStore: FleetInsightsStore, public readonly appStore: AppStore) {}
  ngOnInit(): void {
    if (this.appStore.isTestFeatureEnabled$) {
      this.appStore.isTestFeatureEnabled$.pipe(takeUntil(this.destroy$)).subscribe((enabled) => {
        this.isTestFeatureEnabled = enabled;
      });
    }

    this.groupAllDataByControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((controlValue) => {
          if (controlValue && controlValue.data !== undefined) {
            this.fleetInsightsStore.updateGroupingForTab(controlValue.data);
          }
        })
      )
      .subscribe();

    combineLatest([this.fleetInsightsStore.groupAllDataByValue$, this.groupAllDataByTreeData$])
      .pipe(
        takeUntil(this.destroy$),
        map(([value, treeData]) => this.findNodeByData(treeData, value)),
        filter((newControlValue) => newControlValue?.data !== this.groupAllDataByControl.value?.data),
        tap((newControlValue) => this.groupAllDataByControl.setValue(newControlValue))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getGroupAllDataByTreeData(includeEventOptions = false): TreeNode[] {
    const baseOptions = [
      {
        label: GroupAllDataByLabels[GroupAllDataByOptions.Status],
        data: GroupAllDataByOptions.Status,
        leaf: true
      },
      {
        label: GroupAllDataByLabels[GroupAllDataByOptions.PrimaryUsage],
        data: GroupAllDataByOptions.PrimaryUsage,
        leaf: true
      },
      {
        label: GroupAllDataByLabels[GroupAllDataByOptions.MarketClass],
        data: GroupAllDataByOptions.MarketClass,
        leaf: true
      },
      {
        label: 'Operator',
        key: 'OperatorGroup',
        selectable: false,
        children: [
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.Operator],
            data: GroupAllDataByOptions.Operator,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.OperatorRegion],
            data: GroupAllDataByOptions.OperatorRegion,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.OperatorCountry],
            data: GroupAllDataByOptions.OperatorCountry,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.OperatorType],
            data: GroupAllDataByOptions.OperatorType,
            leaf: true
          }
        ]
      },
      {
        label: GroupAllDataByLabels[GroupAllDataByOptions.Lessor],
        data: GroupAllDataByOptions.Lessor,
        leaf: true
      },
      {
        label: 'Aircraft',
        key: 'AircraftGroup',
        selectable: false,
        children: [
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.AircraftManufacturer],
            data: GroupAllDataByOptions.AircraftManufacturer,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.AircraftFamily],
            data: GroupAllDataByOptions.AircraftFamily,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.AircraftType],
            data: GroupAllDataByOptions.AircraftType,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.AircraftMasterSeries],
            data: GroupAllDataByOptions.AircraftMasterSeries,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.AircraftSeries],
            data: GroupAllDataByOptions.AircraftSeries,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.AircraftSubSeries],
            data: GroupAllDataByOptions.AircraftSubSeries,
            leaf: true
          }
        ]
      },
      {
        label: 'Engine',
        key: 'EngineGroup',
        selectable: false,
        children: [
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.EngineManufacturer],
            data: GroupAllDataByOptions.EngineManufacturer,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.EngineFamily],
            data: GroupAllDataByOptions.EngineFamily,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.EngineType],
            data: GroupAllDataByOptions.EngineType,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.EngineMasterSeries],
            data: GroupAllDataByOptions.EngineMasterSeries,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.EngineSeries],
            data: GroupAllDataByOptions.EngineSeries,
            leaf: true
          },
          {
            label: GroupAllDataByLabels[GroupAllDataByOptions.EngineSubSeries],
            data: GroupAllDataByOptions.EngineSubSeries,
            leaf: true
          }
        ]
      },
      {
        label: GroupAllDataByLabels[GroupAllDataByOptions.Age],
        data: GroupAllDataByOptions.Age,
        leaf: true
      }
    ];

    if (!includeEventOptions) {
      baseOptions.push({
        label: GroupAllDataByLabels[GroupAllDataByOptions.Ownership],
        data: GroupAllDataByOptions.Ownership,
        leaf: true
      });
    }

    if (includeEventOptions) {
      baseOptions.push(
        {
          label: GroupAllDataByLabels[GroupAllDataByOptions.EventTypes],
          data: GroupAllDataByOptions.EventTypes,
          leaf: true
        },
        {
          label: GroupAllDataByLabels[GroupAllDataByOptions.EventDetails],
          data: GroupAllDataByOptions.EventDetails,
          leaf: true
        }
      );
    }

    return baseOptions;
  }

  findNodeByData(nodes: TreeNode[], data: GroupAllDataByOptions): TreeNode | null {
    for (const node of nodes) {
      if (node.data === data) {
        return node;
      }
      const found = node.children && this.findNodeByData(node.children, data);
      if (found) {
        return found;
      }
    }
    return null;
  }
}
