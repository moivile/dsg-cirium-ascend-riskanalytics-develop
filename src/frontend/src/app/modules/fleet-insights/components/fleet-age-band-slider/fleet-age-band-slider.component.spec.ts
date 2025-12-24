import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FleetAgeBandSliderComponent } from './fleet-age-band-slider.component';
import { By } from '@angular/platform-browser';
import { FilterPanelFormModel } from '../../models/filter-panel-form-model';
import { SliderModule } from 'primeng/slider';
import { Subject } from 'rxjs';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { IntervalType } from '../../models/interval-type.enum';

describe('FleetAgeBandSliderComponent', () => {
  let component: FleetAgeBandSliderComponent;
  let fixture: ComponentFixture<FleetAgeBandSliderComponent>;

  const fleetInsightsStoreStub = {
    resetAllFiltersTriggered$: new Subject<void>()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetAgeBandSliderComponent],
      imports: [SliderModule, ReactiveFormsModule],
      providers: [FormBuilder, { provide: FleetInsightsStore, useValue: fleetInsightsStoreStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetAgeBandSliderComponent);
    component = fixture.componentInstance;

    component.parentForm = new FormBuilder().group<FilterPanelFormModel>({
      intervalType: new FormBuilder().control<IntervalType>(IntervalType.Monthly) as FormControl<IntervalType>,

      startDate: new FormBuilder().control<Date>(new Date()) as FormControl<Date>,
      endDate: new FormBuilder().control<Date>(new Date()) as FormControl<Date>,

      rangeValues: new FormBuilder().control<number[]>({ value: [6, 18], disabled: false }) as FormControl<number[]>,
      IncludeYoungLifeAircraft: new FormBuilder().control<boolean>({ value: false, disabled: false }) as FormControl<boolean>,
      IncludeMidLifeAircraft: new FormBuilder().control<boolean>({ value: false, disabled: false }) as FormControl<boolean>,
      IncludeLateLifeAircraft: new FormBuilder().control<boolean>({ value: false, disabled: false }) as FormControl<boolean>,
      date: new FormBuilder().control<Date>(new Date()) as FormControl<Date>,
      statuses: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      primaryUsages: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      marketClasses: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      lessors: new FormBuilder().control<number[]>([]) as FormControl<number[]>,

      orders: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      deliveries: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      slb: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      entryToService: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      cancellations: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      purchasesSales: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      leaseStart: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      leaseEnd: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      parked: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      conversions: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      retirements: new FormBuilder().control<number[]>([]) as FormControl<number[]>,

      aircraftManufacturers: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      aircraftFamilies: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      aircraftTypes: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      aircraftMasterSeries: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      aircraftSeries: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      aircraftSubSeries: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      engineTypes: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      engineManufacturers: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      engineFamilies: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      engineMasterSeries: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      engineSeries: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      engineSubSeries: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      operators: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      operatorTypes: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      operatorGroups: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      operatorRegions: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      operatorCountries: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      ownerships: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      trendsOwnerships: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      leaseStatuses: new FormBuilder().control<number[]>([]) as FormControl<number[]>,
      availabilities: new FormBuilder().control<number[]>([]) as FormControl<number[]>
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize range slider with default values', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.parentForm.value.rangeValues).toEqual([6, 18]);
  });

  it('should handle state for the "Young" checkbox', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const checkboxElement = fixture.debugElement.query(By.css('.age-slider__checkbox--young'));
    checkboxElement.nativeElement.checked = true;
    checkboxElement.triggerEventHandler('change', { target: checkboxElement.nativeElement });
    fixture.detectChanges();
    expect(component.parentForm.controls['IncludeYoungLifeAircraft'].value).toBeTruthy();
  });

  it('should handle state for the "Midlife" checkbox', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const checkboxElement = fixture.debugElement.query(By.css('.age-slider__checkbox--midlife'));
    checkboxElement.nativeElement.checked = true;
    checkboxElement.triggerEventHandler('change', { target: checkboxElement.nativeElement });
    fixture.detectChanges();
    expect(component.parentForm.controls['IncludeMidLifeAircraft'].value).toBeTruthy();
  });

  it('should handle state for the "Late-life" checkbox', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const checkboxElement = fixture.debugElement.query(By.css('.age-slider__checkbox--late'));
    checkboxElement.nativeElement.checked = true;
    checkboxElement.triggerEventHandler('change', { target: checkboxElement.nativeElement });
    fixture.detectChanges();
    expect(component.parentForm.controls['IncludeLateLifeAircraft'].value).toBeTruthy();
  });
});
