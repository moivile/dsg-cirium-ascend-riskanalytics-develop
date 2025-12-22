import { AfterViewChecked, Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import {
  combineLatest,
  filter,
  firstValueFrom,
  map,
  Observable,
  skip,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs';
import { ConfirmationDialogOptions } from '../../../shared/models/confirmation-dialog-options';
import { Aircraft } from '../../../shared/models/aircraft';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { NoticeService } from '../../../shared/services/notice.service';
import { CreateEditPortfolioStore } from '../../services/create-edit-portfolio-store';
import { AircraftSearchPopupComponent } from '../aircraft-search-popup/aircraft-search-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfoliosService } from '../../../shared/services/portfolios.service';
import { BackLinkComponent } from '../../../shared/components/back-link/back-link.component';
import { AppStore } from 'src/app/app-store';

@Component({
  templateUrl: './create-edit-portfolio-tab.component.html',
  styleUrls: ['./create-edit-portfolio-tab.component.scss'],
  providers: [CreateEditPortfolioStore, DialogService]
})
export class CreateEditPortfolioTabComponent implements OnInit, OnDestroy, AfterViewChecked {
  filteredAircraftList$!: Observable<Aircraft[]>;
  textFilterControl = new FormControl('', { nonNullable: true });
  formControlName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(1)]
  });
  @ViewChild(BackLinkComponent) backLinkComponent!: BackLinkComponent;
  redirectLink: any[] = ['/portfolios'];
  removedAircraft = 0;
  addedAircraft = 0;

  checkedAircraftIds: number[] = [];
  private destroy$ = new Subject<void>();
  constructor(
    public readonly store: CreateEditPortfolioStore,
    public readonly dialogService: DialogService,
    private readonly noticeService: NoticeService,
    private readonly confirmationDialogService: ConfirmationDialogService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly portfoliosService: PortfoliosService,
    private readonly router: Router,
    private readonly appStore: AppStore
  ) {}
  ngOnInit(): void {
    this.appStore.selectedPortfolioId$
      .pipe(
        takeUntil(this.destroy$),
        skip(1),
        filter((id) => !!id),
        tap((id) => {
          if (this.router.url.includes('/portfolios/create')) {
            return;
          }

          this.router.navigate(['/portfolios', id, 'edit']);
        })
      )
      .subscribe();

    this.activatedRoute.paramMap
      .pipe(
        takeUntil(this.destroy$),
        map((paramMap) => paramMap.get('id')),
        map((id) => (id ? Number(id) : undefined)),
        tap((id) => this.store.setId(id)),
        filter((id) => !!id),
        switchMap((id) => this.portfoliosService.getPortfolio(id as number)),
        tap((portfolio) => this.formControlName.setValue(portfolio.name)),
        tap((portfolio) => this.store.loadAircraftList(portfolio.id))
      )
      .subscribe();

    this.filteredAircraftList$ = combineLatest([this.store.aircraftList$, this.textFilterControl.valueChanges.pipe(startWith(''))]).pipe(
      map(
        ([aircraftList, textFilterValue]: [Aircraft[], string]) =>
          [aircraftList, textFilterValue.trim().toLowerCase()] as [Aircraft[], string]
      ),
      map(([aircraftList, textFilterValue]: [Aircraft[], string]) =>
        aircraftList.filter((aircraft) => {
          const textAircraft = (
            (aircraft.aircraftSerialNumber || '') +
            (aircraft.aircraftRegistrationNumber || '') +
            (aircraft.aircraftSeries || '') +
            (aircraft.engineSeries || '') +
            (aircraft.aircraftAgeYears || '') +
            (aircraft.status || '') +
            (aircraft.operator || '') +
            (aircraft.manager || '') +
            (aircraft.lessorOrganization || '')
          ).toLowerCase();
          return textAircraft.includes(textFilterValue);
        })
      )
    );
  }

  ngAfterViewChecked(): void {
    if (this.backLinkComponent) {
      this.backLinkComponent.onBackClick = () => {
        this.onBackButtonClick();
      };
    }
  }

  public onAddAircraftClick(): void {
    const onAddAircraft = new EventEmitter();
    this.dialogService.open(AircraftSearchPopupComponent, {
      width: '90%',
      header: 'Search for Aircraft',
      data: {
        onAddAircraft
      },
      styleClass: 'aircraft-search-popup'
    });

    onAddAircraft
      .pipe(
        withLatestFrom(this.store.numberOfAircraft$),
        map(([addedAircraftList, previousNumberOfAircraft]) => {
          this.store.addAircraftList([...addedAircraftList.values()]);
          return previousNumberOfAircraft;
        }),
        withLatestFrom(this.store.numberOfAircraft$),
        tap(([previousNumberOfAircraft, currentNumberOfAircraft]) => {
          this.noticeService.success(`${currentNumberOfAircraft - previousNumberOfAircraft} aircraft added.`);
          this.addedAircraft = this.addedAircraft + currentNumberOfAircraft - previousNumberOfAircraft;
          this.formControlName.markAsDirty();
        })
      )
      .subscribe();
  }

  onRemoveAircraftClick(): void {
    const numberOfCheckedAircraftIds = this.checkedAircraftIds.length;

    const confirmOptions: ConfirmationDialogOptions = {
      body: `<p>You are about to remove ${numberOfCheckedAircraftIds} aircraft.</p>
      <p>Are you sure?</p>`,
      okButtonText: 'Yes, remove',
      header: `Remove aircraft`
    };

    this.confirmationDialogService
      .confirm(confirmOptions)
      .pipe(
        tap(() => {
          this.store.removeAircraftList(this.checkedAircraftIds);
          this.noticeService.success(`${this.checkedAircraftIds.length} aircraft removed.`);
          this.removedAircraft = this.removedAircraft + this.checkedAircraftIds.length;
          this.checkedAircraftIds = [];
        })
      )
      .subscribe();
  }

  public onSavePortfolio(): void {
    this.store.upsertPortfolio(this.formControlName.value);
  }

  async onHeaderCheckboxClick(checked: boolean): Promise<void> {
    const filteredAircraftList = await firstValueFrom(this.filteredAircraftList$);
    this.checkedAircraftIds = checked ? filteredAircraftList.map((aircraft) => aircraft.aircraftId) : [];
  }

  onRowSelect(unselectedAircraftId: number): void {
    this.checkedAircraftIds.push(unselectedAircraftId);
  }

  onRowUnselect(unselectedAircraftId: number): void {
    this.checkedAircraftIds = this.checkedAircraftIds.filter((aircraftId) => aircraftId !== unselectedAircraftId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBackButtonClick(): void {
    let msgBody = '<p>You have the following unsaved changes:</p>';
    if (this.removedAircraft > 0) {
      msgBody = msgBody + '<p>Number of aircraft removed : ' + this.removedAircraft.toString();
    }
    if (this.addedAircraft > 0) {
      msgBody = msgBody + '<p>Number of aircraft added : ' + this.addedAircraft.toString();
    }
    msgBody = msgBody + '<p>Are you sure you want to leave??</p>';

    const confirmOptions: ConfirmationDialogOptions = {
      body: msgBody,
      okButtonText: 'Yes, go back',
      header: `Unsaved  Changes`
    };

    if (this.removedAircraft < 1 && this.addedAircraft < 1) {
      this.router.navigate(this.redirectLink);
    } else {
      this.confirmationDialogService
        .confirm(confirmOptions)
        .pipe(
          tap(() => {
            this.router.navigate(this.redirectLink);
          })
        )
        .subscribe();
    }
  }
}
