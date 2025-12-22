import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/api';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  iif,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap
} from 'rxjs';
import { FormControl } from '@angular/forms';
import { MonthlyUtilizationGroup } from '../../../shared/models/monthly-utilization-group';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { GroupByOptions } from '../../models/group-by-options';
import { Portfolio } from '../../../shared/models/portfolio';
import { UtilizationService } from '../../../shared/services/utilization.service';
import { IdNamePairModel } from '../../../shared/models/id-name-pair-model';
import { TreeSelect } from 'primeng/treeselect';
import { DomHandler } from 'primeng/dom';
import { AppStore } from '../../../../app-store';

export interface OperatorOption {
  id?: number;
  name: string;
}

export interface LessorOption {
  id?: number;
  name: string;
}

@Component({
  selector: 'ra-portfolio-detail-options[isComparisonPortfolio]',
  templateUrl: './portfolio-detail-options.component.html',
  styleUrls: ['./portfolio-detail-options.component.scss']
})
export class PortfolioDetailOptionsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isComparisonPortfolio!: boolean;
  @Input() isEmissions!: boolean;
  @Input() isHoursAndCycle!: boolean;

  @Output() portfolioDetailOptionsChange = new EventEmitter<PortfolioDetailOptions>();

  selectedPortfolioControl = new FormControl<Portfolio | null>(null);

  selectedGroupOptionsControl = new FormControl<TreeNode[]>([], { nonNullable: true });
  groupOptions$?: Observable<TreeNode[]>;

  operatorOptions$?: Observable<OperatorOption[]>;
  selectedOperatorControl = new FormControl<OperatorOption | null>(null);
  backupOperatorOptions!: OperatorOption[];

  lessorOptions$?: Observable<LessorOption[]>;
  backupLessorOptions!: LessorOption[];
  selectedLessorControl = new FormControl<LessorOption | null>(null);

  shouldCompareAgainstGlobalBenchmark = false;
  shoulDisableGroupTypeSelection = false;
  @ViewChild('groupOptionsTreeSelect')
  groupOptionsSelect!: TreeSelect;
  private destroy$ = new Subject<void>();

  private readonly groupOptionKeySeparator = '-|-';
  private readonly maximumNumberOfGroupOptions = 5;
  private readonly includeBaselineKey = 'All Aircraft';

  private readonly baseLineGroupOption: TreeNode = {
    key: this.includeBaselineKey,
    label: this.includeBaselineKey,
    children: [
      {
        key: this.includeBaselineKey,
        label: this.includeBaselineKey,
        parent: {
          key: this.includeBaselineKey
        }
      }
    ],
    selectable: false
  };

  constructor(public readonly appStore: AppStore, private readonly utilizationService: UtilizationService) {}
  ngAfterViewInit(): void {
    this.decorateGroupOptionsTreeSelectOnClick();
  }

  ngOnInit(): void {
    if (!this.isComparisonPortfolio) {
      this.syncSelectedPortfolioControlWithAppStore();
    }

    this.selectedGroupOptionsControl.valueChanges
    .pipe(
      tap(() => {
        this.shouldDisableNodeSelection(false);
      })
    )
    .subscribe();

    this.groupOptions$ = combineLatest([
      this.selectedPortfolioControl.valueChanges.pipe(startWith(this.selectedPortfolioControl.value)),
      this.selectedOperatorControl.valueChanges.pipe(startWith(null)),
      this.selectedLessorControl.valueChanges.pipe(startWith(null))
    ]).pipe(
      debounceTime(50),
      switchMap(([selectedPortfolio, selectedOperator, selectedLessor]: [Portfolio | null, OperatorOption | null, LessorOption | null]) =>
        iif(
          () => !this.shouldCompareAgainstGlobalBenchmark && !selectedPortfolio,
          of<null>(null),
          this.utilizationService.getGroupOptions(selectedOperator?.id, selectedPortfolio?.id, selectedLessor?.id)
        )
      ),
      map((groupOptions) => {
        if (!groupOptions) {
          return [];
        }

        const treeSelectGroupOptions = [
          this.baseLineGroupOption,
          this.createGroupOptions(groupOptions.aircraftMarketClasses, 'Market Class', MonthlyUtilizationGroup.marketClass),
          this.createGroupOptions(groupOptions.aircraftFamilies, 'Family', MonthlyUtilizationGroup.aircraftFamily),
          this.createGroupOptions(groupOptions.aircraftTypes, 'Type', MonthlyUtilizationGroup.aircraftType),
          this.createGroupOptions(groupOptions.aircraftSeries, 'Series', MonthlyUtilizationGroup.aircraftSeries)
        ];

        if (!this.shouldCompareAgainstGlobalBenchmark) {
          treeSelectGroupOptions.push(
            this.createGroupOptions(groupOptions.aircraftSerialNumbers, 'Serial Number', MonthlyUtilizationGroup.aircraftSerialNumber)
          );
        }

        this.filterSelectedGroupOptionsThatAreNoLongerValid(treeSelectGroupOptions);

        if (this.selectedGroupOptionsControl.value && this.selectedGroupOptionsControl.value.length === 0) {
          if (this.baseLineGroupOption.children) {
            this.selectedGroupOptionsControl.setValue([this.baseLineGroupOption.children[0]]);
          }
        }

        return treeSelectGroupOptions.filter((x) => x.children && x.children.length > 0);
      })
    );

    this.operatorOptions$ = combineLatest([
      this.selectedGroupOptionsControl.valueChanges.pipe(startWith([])),
      this.selectedLessorControl.valueChanges.pipe(startWith(this.selectedLessorControl.value))
    ]).pipe(
      debounceTime(100),
      distinctUntilChanged(),
      switchMap(([selectedGroupOptions, selectedLessor]) => {
        if (this.shoulDisableGroupTypeSelection) {
          return this.backupOperatorOptions !== undefined
            ? of<OperatorOption[]>(this.backupOperatorOptions).pipe(startWith(this.backupOperatorOptions))
            : of<OperatorOption[]>([]);
        }
        if (!selectedGroupOptions || selectedGroupOptions.length === 0) {
          return of<OperatorOption[]>([]);
        }
        const parentKey = selectedGroupOptions[0].parent?.key;
        const lessorId = selectedLessor?.id;
        let operator$: Observable<OperatorOption[]>;
        if (parentKey === this.includeBaselineKey && !selectedLessor) {
          operator$ = this.utilizationService.getOperators(this.selectedPortfolioControl.value?.id);
        } else if (parentKey === this.includeBaselineKey && selectedLessor) {
          operator$ = this.utilizationService.getOperators(this.selectedPortfolioControl.value?.id, undefined, lessorId);
        } else {
          const data = selectedGroupOptions.map((x) => x.data);
          operator$ = this.utilizationService.getOperators(this.selectedPortfolioControl.value?.id, parentKey, lessorId, data);
        }
        return operator$.pipe(tap((value) => (this.backupOperatorOptions = value)));
      })
    );

    this.lessorOptions$ = combineLatest([
      this.selectedGroupOptionsControl.valueChanges.pipe(startWith([])),
      this.selectedOperatorControl.valueChanges.pipe(startWith(this.selectedOperatorControl.value))
    ]).pipe(
      debounceTime(100),
      distinctUntilChanged(),
      switchMap(([selectedGroupOptions, selectedOperator]) => {
        if (this.shoulDisableGroupTypeSelection) {
          return this.backupLessorOptions !== undefined
            ? of<LessorOption[]>(this.backupLessorOptions).pipe(startWith(this.backupLessorOptions))
            : of<LessorOption[]>([]);
        }
        if (!selectedGroupOptions || selectedGroupOptions.length === 0) {
          return of<LessorOption[]>([]);
        }
        const includeBaseline = selectedGroupOptions[0].parent?.key === this.includeBaselineKey;
        const operatorId = selectedOperator?.id;
        let lessor$!: Observable<LessorOption[]>;
        if (includeBaseline && !selectedOperator) {
          lessor$ = this.utilizationService.getLessors(this.selectedPortfolioControl.value?.id);
        } else if (includeBaseline && selectedOperator) {
          lessor$ = this.utilizationService.getLessors(this.selectedPortfolioControl.value?.id, undefined, operatorId);
        } else {
          const data = selectedGroupOptions.map((x) => x.data);
          lessor$ = this.utilizationService.getLessors(
            this.selectedPortfolioControl.value?.id,
            selectedGroupOptions[0].parent?.key,
            operatorId,
            data
          );
        }
        return lessor$.pipe(tap((value) => (this.backupLessorOptions = value)));
      })
    );

    combineLatest([
      this.selectedPortfolioControl.valueChanges.pipe(startWith(this.selectedPortfolioControl.value)),
      this.selectedGroupOptionsControl.valueChanges.pipe(startWith([])),
      this.selectedOperatorControl.valueChanges.pipe(startWith(null)),
      this.selectedLessorControl.valueChanges.pipe(startWith(null))
    ])
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        tap(() => {
          if (!this.shoulDisableGroupTypeSelection) {
            let groupByOptions: GroupByOptions | undefined;
            let includeBaseline = false;

            if (
              this.selectedGroupOptionsControl.value &&
              this.selectedGroupOptionsControl.value.length > 0 &&
              this.selectedGroupOptionsControl.value[0].parent?.key
            ) {
              if (this.selectedGroupOptionsControl.value[0].parent.key === this.includeBaselineKey) {
                includeBaseline = true;
              } else {
                const idNameArray: IdNamePairModel[] = this.selectedGroupOptionsControl.value
                  .filter((element) => element.key && element.label)
                  .map((element) => ({
                    id: Number(element.data),
                    name: element.label || ''
                  }));
                groupByOptions = {
                  key: this.selectedGroupOptionsControl.value[0].parent.key,
                  value: idNameArray,
                  filterIds: this.selectedGroupOptionsControl.value.map((x) => x.data)
                };
              }
            }

            this.portfolioDetailOptionsChange.emit({
              portfolioId: this.selectedPortfolioControl.value?.id,
              portfolioName: this.selectedPortfolioControl.value?.name ?? 'Global Fleet',
              operatorId: this.selectedOperatorControl.value?.id,
              operatorName: this.selectedOperatorControl.value?.name,
              lessorId: this.selectedLessorControl.value?.id,
              lessorName: this.selectedLessorControl.value?.name,
              groupByOptions,
              includeBaseline
            });
          }
        })
      )
      .subscribe();
  }

  onGroupOptionSelect(lastSelectedGroupOption: TreeNode): void {
    const hasSameParent = lastSelectedGroupOption?.parent?.key === this.selectedGroupOptionsControl?.value[0]?.parent?.key;
    this.shouldDisableNodeSelection(hasSameParent);
    let selectedGroupOptions = this.selectedGroupOptionsControl.value;
    selectedGroupOptions = this.filterSelectedGroupOptionsNotInTheLastSelectedGroup(lastSelectedGroupOption, selectedGroupOptions);

    this.spliceLastSelectedGroupOptionIfMoreThanMaximumAllowed(lastSelectedGroupOption, selectedGroupOptions);

    if (selectedGroupOptions.length !== this.selectedGroupOptionsControl.value?.length) {
      const emitEventVal = this.shoulDisableGroupTypeSelection ? false : true;
      this.selectedGroupOptionsControl.setValue(selectedGroupOptions, { emitEvent: emitEventVal });
    }
  }

  shouldDisableNodeSelection(hasSameParent: boolean): void {
    if (this.selectedGroupOptionsControl.value?.length > 5 && hasSameParent) {
      this.shoulDisableGroupTypeSelection = true;
    } else {
      this.shoulDisableGroupTypeSelection = false;
    }
  }

  onPortfolioChange(): void {
    this.selectedGroupOptionsControl.reset();
    this.selectedOperatorControl.reset();
    this.selectedLessorControl.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  compareAgainstGlobalBenchmark(): void {
    this.shouldCompareAgainstGlobalBenchmark = true;
    this.selectedGroupOptionsControl.reset();
    this.selectedOperatorControl.reset();
    this.selectedLessorControl.reset();
    this.selectedPortfolioControl.reset();
    this.selectedPortfolioControl.disable();
  }

  compareAgainstPortfolio(): void {
    this.shouldCompareAgainstGlobalBenchmark = false;
    this.selectedGroupOptionsControl.reset();
    this.selectedOperatorControl.reset();
    this.selectedLessorControl.reset();
    this.selectedPortfolioControl.enable();

    if (!this.isComparisonPortfolio) {
      this.appStore.triggerSelectedPortfolioId$.next();
    }
  }

  // There is a bug in PrimeNG where unchecking a checkbox on p-treeSelect causes the overlay to hide.
  // This workaround fixes it (RA-580).
  decorateGroupOptionsTreeSelectOnClick(): void {
    const onClick = this.groupOptionsSelect.onClick.bind(this.groupOptionsSelect);

    this.groupOptionsSelect.onClick = (event: Event) => {
      if (DomHandler.hasClass(event.target, 'p-checkbox-icon')) {
        return;
      }
      onClick(event);
    };
  }

  private createGroupOptions(groupOptions: IdNamePairModel[], groupLabel: string, monthlyUtilizationGroup: string): TreeNode {
    const children: TreeNode[] = [];

    groupOptions.forEach((groupOption) => {
      if (groupOption.id && groupOption.name) {
        children.push({
          key: `${monthlyUtilizationGroup}${this.groupOptionKeySeparator}${groupOption.id}`,
          label: groupOption.name,
          data: groupOption.id
        });
      }
    });

    return {
      key: monthlyUtilizationGroup,
      label: groupLabel,
      data: groupLabel,
      children,
      selectable: false
    };
  }

  private filterSelectedGroupOptionsThatAreNoLongerValid(groupOptions: TreeNode[]): void {
    if (this.selectedGroupOptionsControl.value) {
      const availableGroupOptionKeys = groupOptions.flatMap((x) => x.children?.flatMap((y) => y.key));
      const selectedGroupOptions = this.selectedGroupOptionsControl.value;
      const filteredGroupOption = selectedGroupOptions.filter((x) => availableGroupOptionKeys.includes(x.key));

      if (selectedGroupOptions.length !== filteredGroupOption.length) {
        this.selectedGroupOptionsControl.setValue(filteredGroupOption);
      }
    }
  }

  private spliceLastSelectedGroupOptionIfMoreThanMaximumAllowed(lastSelectedGroupOption: TreeNode, selectedGroupOptions: TreeNode[]): void {
    if (selectedGroupOptions.length > this.maximumNumberOfGroupOptions) {
      const lastSelectedGroupOptionIndex = selectedGroupOptions.indexOf(lastSelectedGroupOption);
      selectedGroupOptions.splice(lastSelectedGroupOptionIndex, 1);
    }
  }

  private filterSelectedGroupOptionsNotInTheLastSelectedGroup(
    lastSelectedGroupOption: TreeNode,
    selectedGroupOptions: TreeNode[]
  ): TreeNode[] {
    return selectedGroupOptions.filter((selectedGroupOption: TreeNode) => {
      return lastSelectedGroupOption.parent?.label === selectedGroupOption.parent?.label;
    });
  }

  private syncSelectedPortfolioControlWithAppStore(): void {
    combineLatest([this.appStore.selectedPortfolioId$, this.appStore.portfolios$])
      .pipe(
        takeUntil(this.destroy$),
        filter(
          ([selectedPortfolioId, portfolios]) => !!selectedPortfolioId && portfolios.length > 0 && !this.shouldCompareAgainstGlobalBenchmark
        ),
        map(([selectedPortfolioId, portfolios]) => {
          const selectedPortfolio = portfolios.find((x) => x.id == selectedPortfolioId);
          return selectedPortfolio;
        }),
        filter((selectedPortfolio) => !!selectedPortfolio),
        tap((selectedPortfolio) => {
          this.selectedPortfolioControl.setValue(selectedPortfolio as Portfolio);
          this.onPortfolioChange();
        })
      )
      .subscribe();
  }
}
