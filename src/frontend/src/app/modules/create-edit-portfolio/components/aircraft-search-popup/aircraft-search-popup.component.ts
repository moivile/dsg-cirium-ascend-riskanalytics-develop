import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription, debounceTime, distinctUntilChanged, filter, map, pairwise, startWith, switchMap, take, tap } from 'rxjs';
import { Aircraft } from '../../../shared/models/aircraft';
import { SearchAircraftRequest } from '../../../create-edit-portfolio/models/search-aircraft-request';
import { AircraftService } from '../../../create-edit-portfolio/services/aircraft.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Table } from 'primeng/table';
import { AircraftSearchResult, AircraftSearchResultDropdowns } from '../../models/aircraft-search-result';
import { DropdownForm } from '../../models/dropdown-form';
import { GlobalConstants } from '../../../shared/models/global-constants';
import { tapResponse } from '@ngrx/operators';
import { ConfirmationDialogOptions } from '../../../shared/models/confirmation-dialog-options';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { IdNamePairModel } from '../../../shared/models/id-name-pair-model';
@Component({
    selector: 'ra-aircraft-search-popup',
    templateUrl: './aircraft-search-popup.component.html',
    styleUrls: ['./aircraft-search-popup.component.scss'],
    standalone: false
})
export class AircraftSearchPopupComponent implements OnInit, OnDestroy, AfterViewInit {
  aircraftList: Aircraft[] = [];
  allSelectedAircraft: Map<number, Aircraft> = new Map<number, Aircraft>();
  get checkedAircraftList(): Aircraft[] {
    return Array.from(this.allSelectedAircraft.values());
  }

  maxNumberOfSelectedAircraft = 2500;
  pageSize = 500;
  loading = false;
  textFilterControl = new FormControl('', { nonNullable: true });
  selectAllControl = new FormControl(false, { nonNullable: true });
  dropdownForm = new FormGroup<DropdownForm>(new DropdownForm());
  @ViewChild(Table) tableComponent!: Table;
  searchResultDropdownLists: AircraftSearchResultDropdowns | null = null;

  private textFilterValueChangesSubscription!: Subscription;
  private selectAllControlValueChangesSubscription!: Subscription;
  private dropdownFormValueChangesSubscription!: Subscription;
  private searchSubscription!: Subscription;

  public get numberOfSelectedAircraft(): number {
    return this.allSelectedAircraft.size;
  }

  constructor(
    private readonly dynamicDialogRef: DynamicDialogRef,
    public readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly aircraftService: AircraftService
  ) {}
  ngOnInit(): void {
    this.dropdownFormValueChangesSubscription = this.dropdownForm.valueChanges.pipe(tap(() => this.reset())).subscribe();

    this.textFilterValueChangesSubscription = this.textFilterControl.valueChanges
      .pipe(
        debounceTime(GlobalConstants.textFilterDebounceTime),
        filter((keyword) => keyword.length == 0 || keyword.length > 2),
        tap(() => {
          this.searchResultDropdownLists = null;
          this.dropdownForm.reset({}, { emitEvent: false });
          this.reset();
        })
      )
      .subscribe();

    this.selectAllControlValueChangesSubscription = this.selectAllControl.valueChanges
      .pipe(
        tap((checked) => {
          if (checked) {
            this.aircraftList
              .filter((aircraft) => !!aircraft)
              .forEach((aircraft) => {
                this.allSelectedAircraft.set(aircraft.aircraftId, aircraft);
              });
          } else {
            this.aircraftList
              .filter((aircraft) => !!aircraft)
              .forEach((aircraft) => {
                this.allSelectedAircraft.delete(aircraft.aircraftId);
              });
          }
        })
      )
      .subscribe();

    const closePopUp = this.dynamicDialogRef.close.bind(this.dynamicDialogRef);

    this.dynamicDialogRef.close = async () => {
      const numberOfSelectedAircraft = this.allSelectedAircraft.size;

      const confirmOptions: ConfirmationDialogOptions = {
        body: `<p>You have selected ${numberOfSelectedAircraft} aircraft but not added them to your portfolio.</p>
          <p>Are you sure you want to exit without adding?</p>`,
        okButtonText: 'Yes',
        header: `Unsaved Changes`
      };
      if (numberOfSelectedAircraft > 0) {
        this.confirmationDialogService
          .confirm(confirmOptions)
          .pipe(
            take(1),
            tap(() => {
              closePopUp();
            })
          )
          .subscribe();
      } else {
        closePopUp();
      }
    };
  }

  public ngAfterViewInit(): void {
    this.searchSubscription = this.tableComponent.onLazyLoad
      .pipe(
        map((lazyLoadEvent) => {
          const searchRequest = this.toSearchAircraftRequest(this.dropdownForm);
          searchRequest.keyword = this.textFilterControl.value;
          searchRequest.skip = lazyLoadEvent.first ?? 0;
          searchRequest.take = searchRequest.skip === 0 ? this.maxNumberOfSelectedAircraft + this.pageSize : this.pageSize;
          return { lazyLoadEvent, searchRequest };
        }),
        startWith(null),
        pairwise(),
        map(([prev, curr]) => {
          if (curr === null) {
            throw new Error('searchRequest cannot be null');
          }

          const emittingDropdownKey = prev === null ? null : this.getEmittingDropdownKey(prev.searchRequest, curr.searchRequest);
          return { lazyLoadEvent: curr.lazyLoadEvent, searchRequest: curr.searchRequest, emittingDropdownKey };
        }),
        filter(
          ({ searchRequest }) =>
            searchRequest.skip === 0 || searchRequest.skip + searchRequest.take > this.maxNumberOfSelectedAircraft + this.pageSize
        ),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev.searchRequest) === JSON.stringify(curr.searchRequest)),
        tap(() => (this.loading = true)),
        switchMap(({ lazyLoadEvent, searchRequest, emittingDropdownKey }) =>
          this.aircraftService.search(searchRequest).pipe(
            tapResponse(
              (searchResult: AircraftSearchResult) => {
                this.loading = false;
                if (searchRequest.skip === 0) {
                  this.updateSearchResultDropdownLists(searchResult, emittingDropdownKey);
                  this.aircraftList = Array.from({ length: searchResult.totalCount });
                }

                this.populateAircraftList(searchRequest.skip, searchResult.aircraftList);

                if (searchRequest.skip === 0) {
                  const numberOfAllSelectedAircraftAfterSelectAll = new Set([
                    ...this.aircraftList.filter((aircraft) => !!aircraft).map((aircraft) => aircraft.aircraftId),
                    ...this.allSelectedAircraft.keys()
                  ]).size;

                  if (numberOfAllSelectedAircraftAfterSelectAll > this.maxNumberOfSelectedAircraft) {
                    this.selectAllControl.disable({ emitEvent: false });
                  } else {
                    this.selectAllControl.enable({ emitEvent: false });
                  }
                  this.selectAllControl.reset(false, { emitEvent: false });
                }

                if (lazyLoadEvent.forceUpdate) {
                  lazyLoadEvent.forceUpdate();
                }
              },
              () => {
                this.loading = false;
                console.log('error loading aircraft list');
              }
            )
          )
        )
      )
      .subscribe();
  }

  onRowSelect(selectedAircraft: Aircraft): void {
    if (selectedAircraft === undefined || this.allSelectedAircraft.size >= this.maxNumberOfSelectedAircraft) {
      return;
    }
    this.allSelectedAircraft.set(selectedAircraft.aircraftId, selectedAircraft);
  }
  onRowUnselect(unselectedAircraft: Aircraft): void {
    if (unselectedAircraft === undefined) {
      return;
    }
    this.allSelectedAircraft.delete(unselectedAircraft.aircraftId);
  }

  public closeDialog(): void {
    this.dynamicDialogRef.close();
  }

  addAircraft(): void {
    this.dynamicDialogConfig.data.onAddAircraft.emit(this.allSelectedAircraft);
    this.allSelectedAircraft.clear();
    this.dynamicDialogRef.close();
  }

  ngOnDestroy(): void {
    this.textFilterValueChangesSubscription.unsubscribe();
    this.dropdownFormValueChangesSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
    this.selectAllControlValueChangesSubscription.unsubscribe();
  }

  IsCheckboxDisabled(aircraftId: number): boolean {
    return this.allSelectedAircraft.size >= this.maxNumberOfSelectedAircraft && !this.allSelectedAircraft.has(aircraftId);
  }

  private populateAircraftList(first: number, loadedAircraftList: Aircraft[]): void {
    const params: [start: number, deleteCount: number, ...items: Aircraft[]] = [
      ...[first, loadedAircraftList.length],
      ...loadedAircraftList
    ] as [start: number, deleteCount: number, ...items: Aircraft[]];

    Array.prototype.splice.apply(this.aircraftList, params);
  }

  private reset(): void {
    this.tableComponent.scrollToVirtualIndex(0);
    this.tableComponent.reset();
  }

  private toSearchAircraftRequest(form: FormGroup<DropdownForm>): SearchAircraftRequest {
    return {
      manufacturerIds: form.value.manufacturers?.map((manufacturer) => manufacturer.id) || [],
      aircraftTypeIds: form.value.aircraftTypes?.map((aircraftType) => aircraftType.id) || [],
      aircraftMasterSeriesIds: form.value.aircraftMasterSeriesList?.map((aircraftMasterSeries) => aircraftMasterSeries.id) || [],
      aircraftOperatorIds: form.value.aircraftOperators?.map((aircraftOperator) => aircraftOperator.id) || [],
      operatorCountryIds: form.value.operatorCountries?.map((operatorCountry) => operatorCountry.id) || [],
      lessorIds: form.value.lessors?.map((lessor) => lessor.id) || [],
      companyTypeIds: form.value.companyTypes?.map((companyType) => companyType.id) || [],
      statusIds: form.value.statuses?.map((status) => status.id) || []
    } as SearchAircraftRequest;
  }

  private getEmittingDropdownKey(prev: SearchAircraftRequest, curr: SearchAircraftRequest): keyof AircraftSearchResultDropdowns | null {
    let result: keyof AircraftSearchResultDropdowns | null = null;

    if ((prev.keyword ?? '') !== (curr.keyword ?? '')) {
      return result;
    }

    if (this.areArraysDifferent(prev.manufacturerIds, curr.manufacturerIds)) {
      result = 'manufacturers';
    }
    if (this.areArraysDifferent(prev.aircraftTypeIds, curr.aircraftTypeIds)) {
      result = 'aircraftTypes';
    }
    if (this.areArraysDifferent(prev.aircraftMasterSeriesIds, curr.aircraftMasterSeriesIds)) {
      result = 'aircraftMasterSeries';
    }
    if (this.areArraysDifferent(prev.aircraftOperatorIds, curr.aircraftOperatorIds)) {
      result = 'aircraftOperators';
    }
    if (this.areArraysDifferent(prev.operatorCountryIds, curr.operatorCountryIds)) {
      result = 'operatorCountries';
    }
    if (this.areArraysDifferent(prev.lessorIds, curr.lessorIds)) {
      result = 'lessors';
    }
    if (this.areArraysDifferent(prev.companyTypeIds, curr.companyTypeIds)) {
      result = 'companyTypes';
    }
    if (this.areArraysDifferent(prev.statusIds, curr.statusIds)) {
      result = 'statuses';
    }
    return result;
  }

  private areArraysDifferent(arr1: number[] | undefined, arr2: number[] | undefined): boolean {
    arr1 = arr1 ?? [];
    arr2 = arr2 ?? [];

    if (arr1.length !== arr2.length) {
      return true;
    }
    arr1.sort();
    arr2.sort();
    return arr1.some((item, index) => item !== arr2?.[index]);
  }

  private updateSearchResultDropdownLists(
    searchResult: AircraftSearchResultDropdowns,
    emittingDropdownKey: keyof AircraftSearchResultDropdowns | null
  ): void {
    if (!this.searchResultDropdownLists || emittingDropdownKey === null) {
      this.searchResultDropdownLists = searchResult;
    } else {
      type IdNamePairDict = {
        [key: string]: IdNamePairModel[];
      };

      const currDropdownLists = this.searchResultDropdownLists as unknown as IdNamePairDict;
      const newDropdownLists = searchResult as unknown as IdNamePairDict;

      for (const key of Object.keys(new AircraftSearchResultDropdowns())) {
        if (key !== emittingDropdownKey || currDropdownLists[key].length <= newDropdownLists[key].length) {
          currDropdownLists[key] = newDropdownLists[key];
        }
      }
    }
  }
}
