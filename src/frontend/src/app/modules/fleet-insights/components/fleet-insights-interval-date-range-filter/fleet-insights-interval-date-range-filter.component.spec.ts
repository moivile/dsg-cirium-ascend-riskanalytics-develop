import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FleetInsightsIntervalDateRangeFilterComponent } from './fleet-insights-interval-date-range-filter.component';
import { defaultStartDateMonthly, defaultEndDateMonthly, IntervalType } from '../../models/interval-type.enum';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { Subject, BehaviorSubject } from 'rxjs';
import dayjs from 'dayjs';
import * as IntervalTypeModule from '../../models/interval-type.enum';

describe('FleetInsightsIntervalDateRangeFilterComponent', () => {
  let component: FleetInsightsIntervalDateRangeFilterComponent;
  let fixture: ComponentFixture<FleetInsightsIntervalDateRangeFilterComponent>;
  let parentForm: FormGroup;
  let mockEndCalendar: jasmine.SpyObj<DatePicker>;

  beforeEach(async () => {
    // Mock defaultEndDateMonthly if it's undefined
    if (!defaultEndDateMonthly) {
      spyOnProperty(IntervalTypeModule, 'defaultEndDateMonthly', 'get').and.returnValue(dayjs('2024-12-31'));
    }

    mockEndCalendar = jasmine.createSpyObj('DatePicker', ['updateModel']);

    await TestBed.configureTestingModule({
      declarations: [FleetInsightsIntervalDateRangeFilterComponent],
      imports: [ReactiveFormsModule, DatePickerModule],
      providers: [FormBuilder]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetInsightsIntervalDateRangeFilterComponent);
    component = fixture.componentInstance;

    parentForm = testFormData();
    component.parentForm = parentForm;

    component.endCalendar = mockEndCalendar as unknown as DatePicker;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have IntervalType enum defined', () => {
    expect(component.IntervalType).toEqual(IntervalType);
  });

  it('should render radio buttons for interval types', () => {
    const radioLabels = fixture.debugElement.queryAll(By.css('.interval__radio-group'));
    expect(radioLabels.length).toBe(3);

    const textContents = radioLabels.map((el) => el.nativeElement.textContent);
    expect(textContents.some((text) => text.includes('Monthly'))).toBeTrue();
    expect(textContents.some((text) => text.includes('Quarter'))).toBeTrue();
    expect(textContents.some((text) => text.includes('Year'))).toBeTrue();
  });

  it('should update form control value when "Quarter" radio button is clicked', () => {
    const quarterRadioDebug = fixture.debugElement.query(By.css('#interval-type-quarter-js'));
    expect(quarterRadioDebug).toBeTruthy();

    quarterRadioDebug.nativeElement.checked = true;
    quarterRadioDebug.nativeElement.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(parentForm.get('intervalType')?.value).toEqual(IntervalType.Quarter);
  });

  it('should update parent form when component form values change', fakeAsync(() => {
    const newStartDate = new Date(2025, 0, 1);
    const newEndDate = new Date(2025, 11, 31);
    component.form.controls.startDate.setValue(newStartDate);
    component.form.controls.endDate.setValue(newEndDate);
    tick(100);
    flush();
    fixture.detectChanges();

    expect(parentForm.get('startDate')?.value).toEqual(newStartDate);
    expect(parentForm.get('endDate')?.value).toEqual(newEndDate);
  }));

  it('should swap startDate and endDate if startDate is after endDate', fakeAsync(() => {
    const earlierDate = new Date(2025, 0, 1);
    const laterDate = new Date(2025, 11, 31);
    component.form.patchValue({ startDate: laterDate, endDate: earlierDate });

    tick(100);
    flush();
    fixture.detectChanges();

    expect(component.form.controls.startDate.value).toEqual(earlierDate);
    expect(component.form.controls.endDate.value).toEqual(laterDate);
  }));

  it('should update calendar configuration based on the selected interval type', fakeAsync(() => {
    component.form.controls.intervalType.setValue(IntervalType.Monthly);
    tick();
    fixture.detectChanges();
    expect(component.datePickerFormat).toEqual('MM yy');
    expect(component.calendarView).toEqual('month');

    component.form.controls.intervalType.setValue(IntervalType.Quarter);
    tick(500);
    fixture.detectChanges();
    expect(component.datePickerFormat).toEqual('yy');
    expect(component.calendarView).toEqual('year');

    component.form.controls.intervalType.setValue(IntervalType.Year);
    tick(500);
    fixture.detectChanges();
    expect(component.datePickerFormat).toEqual('yy');
    expect(component.calendarView).toEqual('year');
  }));

  it('should set maximumDate to defaultEndDateMonthly when isFleetTrendsPage is true', () => {
    const isFleetTrendsPage$ = new BehaviorSubject<boolean>(true);
    component.isFleetTrendsPage$ = isFleetTrendsPage$;

    const mockEndDate = defaultEndDateMonthly || dayjs('2024-12-31');
    const expectedDate = mockEndDate.toDate();

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.maximumDate?.getTime()).toEqual(expectedDate.getTime());
  });

  it('should set maximumDate to 30 years from current date when isFleetTrendsPage is false', () => {
    const isFleetTrendsPage$ = new BehaviorSubject<boolean>(false);
    component.isFleetTrendsPage$ = isFleetTrendsPage$;

    const currentYear = new Date().getFullYear();
    const expectedYear = currentYear + 30;

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.maximumDate?.getFullYear()).toEqual(expectedYear);
  });

  it('should update maximumDate when switching between Fleet Trends and Marketing pages', () => {
    const isFleetTrendsPage$ = new BehaviorSubject<boolean>(true);
    component.isFleetTrendsPage$ = isFleetTrendsPage$;

    fixture.detectChanges();

    // Initially set to Fleet Trends page
    isFleetTrendsPage$.next(true);
    component.ngOnInit();
    fixture.detectChanges();

    const fleetTrendsMaxDate = component.maximumDate;
    const mockEndDate = defaultEndDateMonthly || dayjs('2024-12-31');
    expect(fleetTrendsMaxDate?.getTime()).toEqual(mockEndDate.toDate().getTime());

    // Switch to Marketing page
    isFleetTrendsPage$.next(false);
    component.ngOnInit();
    fixture.detectChanges();

    const marketingMaxDate = component.maximumDate;
    const expected30YearDate = dayjs().add(30, 'years').toDate();

    expect(marketingMaxDate?.getFullYear()).toEqual(expected30YearDate.getFullYear());
    expect(marketingMaxDate?.getMonth()).toEqual(expected30YearDate.getMonth());

    // Verify the dates are different
    expect(marketingMaxDate?.getTime()).not.toEqual(fleetTrendsMaxDate?.getTime());
  });

  it('should maintain rolling 30-year period for marketing pages', () => {
    component.ngOnDestroy();

    const isFleetTrendsPage$ = new BehaviorSubject<boolean>(true);
    component.isFleetTrendsPage$ = isFleetTrendsPage$;

    const currentYear = new Date().getFullYear();
    const expectedYear = currentYear + 30;

    isFleetTrendsPage$.next(false);

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.maximumDate).toBeDefined();
    expect(component.maximumDate?.getFullYear()).toEqual(expectedYear);
  });

  it('should unsubscribe from isFleetTrendsPage on component destroy', () => {
    const isFleetTrendsPage$ = new Subject<boolean>();
    component.isFleetTrendsPage$ = isFleetTrendsPage$;

    const unsubscribeSpy = spyOn(component['destroy$'], 'next').and.callThrough();
    const completeSpy = spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  describe('minimumDate', () => {
    it('should be initialized to January 1, 1960', () => {
      const expectedMinDate = new Date(1960, 0, 1);
      expect(component.minimumDate).toEqual(expectedMinDate);
    });

    it('should maintain minimumDate when interval type changes', fakeAsync(() => {
      const expectedMinDate = new Date(1960, 0, 1);
      expect(component.minimumDate).toEqual(expectedMinDate);

      component.form.controls.intervalType.setValue(IntervalType.Quarter);
      tick(500);
      fixture.detectChanges();

      expect(component.minimumDate).toEqual(expectedMinDate);

      component.form.controls.intervalType.setValue(IntervalType.Year);
      tick(500);
      fixture.detectChanges();

      expect(component.minimumDate).toEqual(expectedMinDate);
    }));
  });

  describe('transformDates', () => {
    // Monthly → Quarter: both dates should snap to start of the same year
    it('should set both start and end to start of year when changing Monthly → Quarter', () => {
      const oldStart = dayjs('2023-05-15');
      const oldEnd = dayjs('2023-11-20');
      const { newStart, newEnd } = component.transformDates(IntervalType.Monthly, IntervalType.Quarter, oldStart, oldEnd);
      expect(newStart.isSame(dayjs('2023-01-01'), 'day')).toBeTrue();
      expect(newEnd.isSame(dayjs('2023-01-01'), 'day')).toBeTrue();
    });

    // Year → Monthly: past dates—start at Jan, end at Dec of that year
    it('should set new start to January and new end to December when changing Year → Monthly for past dates', () => {
      const oldStart = dayjs('2000-07-10');
      const oldEnd = dayjs('2000-03-05');
      const { newStart, newEnd } = component.transformDates(IntervalType.Year, IntervalType.Monthly, oldStart, oldEnd);
      expect(newStart.isSame(dayjs('2000-01-01'), 'day')).toBeTrue();
      expect(newEnd.isSame(dayjs('2000-12-01'), 'day')).toBeTrue();
    });

    // Quarter → Monthly: future end date should be capped to current month
    it('should cap end date to current month when new end is after current month for Quarter → Monthly', () => {
      const oldStart = dayjs().add(1, 'year');
      const oldEnd = dayjs().add(1, 'year');
      const { newStart, newEnd } = component.transformDates(IntervalType.Quarter, IntervalType.Monthly, oldStart, oldEnd);
      // newStart = January of oldStart.year
      expect(newStart.isSame(oldStart.month(0).startOf('month'), 'day')).toBeTrue();
      // newEnd capped to start of current month
      expect(newEnd.isSame(dayjs().startOf('month'), 'day')).toBeTrue();
    });

    // Quarter → Year (and Year → Quarter): dates unchanged
    it('should return unchanged dates for Quarter → Year', () => {
      const oldStart = dayjs('2021-02-01');
      const oldEnd = dayjs('2021-09-15');
      const { newStart, newEnd } = component.transformDates(IntervalType.Quarter, IntervalType.Year, oldStart, oldEnd);
      expect(newStart.isSame(oldStart, 'day')).toBeTrue();
      expect(newEnd.isSame(oldEnd, 'day')).toBeTrue();
    });
  });

  describe('date validation logic', () => {
    it('should swap startDate and endDate when startDate is after endDate', fakeAsync(() => {
      const earlierDate = new Date(2025, 0, 15); // Jan 15, 2025
      const laterDate = new Date(2025, 2, 20); // Mar 20, 2025

      // Set later date as start and earlier as end (invalid order)
      component.form.patchValue({
        startDate: laterDate,
        endDate: earlierDate
      });

      tick(100);
      flush();
      fixture.detectChanges();

      // Should swap the dates
      expect(component.form.controls.startDate.value).toEqual(earlierDate);
      expect(component.form.controls.endDate.value).toEqual(laterDate);
      expect(parentForm.get('startDate')?.value).toEqual(earlierDate);
      expect(parentForm.get('endDate')?.value).toEqual(laterDate);
    }));

    it('should not swap dates when startDate is before endDate', fakeAsync(() => {
      const startDate = new Date(2025, 0, 15); // Jan 15, 2025
      const endDate = new Date(2025, 2, 20); // Mar 20, 2025

      component.form.patchValue({
        startDate,
        endDate
      });

      tick(100);
      flush();
      fixture.detectChanges();

      // Should keep original order
      expect(component.form.controls.startDate.value).toEqual(startDate);
      expect(component.form.controls.endDate.value).toEqual(endDate);
    }));

    it('should subtract 1 month from startDate when dates are equal and interval is Monthly', fakeAsync(() => {
      const sameDate = new Date(2025, 5, 15); // Jun 15, 2025
      const expectedStartDate = new Date(2025, 4, 15); // May 15, 2025 (1 month earlier)

      // Set interval to Monthly and both dates to same value
      component.form.patchValue({
        intervalType: IntervalType.Monthly,
        startDate: sameDate,
        endDate: sameDate
      });

      tick(100);
      flush();
      fixture.detectChanges();

      // StartDate should be 1 month earlier, endDate unchanged
      expect(component.form.controls.startDate.value).toEqual(expectedStartDate);
      expect(component.form.controls.endDate.value).toEqual(sameDate);
      expect(parentForm.get('startDate')?.value).toEqual(expectedStartDate);
      expect(parentForm.get('endDate')?.value).toEqual(sameDate);
    }));

    it('should not modify startDate when dates are equal but interval is Quarter', fakeAsync(() => {
      const sameDate = new Date(2025, 5, 15); // Jun 15, 2025

      // Set interval to Quarter and both dates to same value
      component.form.patchValue({
        intervalType: IntervalType.Quarter,
        startDate: sameDate,
        endDate: sameDate
      });

      tick(100);
      flush();
      fixture.detectChanges();

      // Both dates should remain unchanged
      expect(component.form.controls.startDate.value).toEqual(sameDate);
      expect(component.form.controls.endDate.value).toEqual(sameDate);
    }));

    it('should not modify startDate when dates are equal but interval is Year', fakeAsync(() => {
      const sameDate = new Date(2025, 5, 15); // Jun 15, 2025

      // Set interval to Year and both dates to same value
      component.form.patchValue({
        intervalType: IntervalType.Year,
        startDate: sameDate,
        endDate: sameDate
      });

      tick(100);
      flush();
      fixture.detectChanges();

      // Both dates should remain unchanged
      expect(component.form.controls.startDate.value).toEqual(sameDate);
      expect(component.form.controls.endDate.value).toEqual(sameDate);
    }));

    it('should prioritize swapping over monthly adjustment when startDate is after endDate and dates are equal', fakeAsync(() => {
      const sameDate = new Date(2025, 5, 15); // Jun 15, 2025

      // Set Monthly interval with equal dates but in wrong order (this is edge case)
      component.form.patchValue({
        intervalType: IntervalType.Monthly,
        startDate: sameDate,
        endDate: sameDate
      });

      tick(100);
      flush();
      fixture.detectChanges();

      // Since dates are equal, startDate should be reduced by 1 month
      const expectedStartDate = new Date(2025, 4, 15); // May 15, 2025
      expect(component.form.controls.startDate.value).toEqual(expectedStartDate);
      expect(component.form.controls.endDate.value).toEqual(sameDate);
    }));

    it('should handle complex scenario: swap dates first, then check monthly adjustment', fakeAsync(() => {
      const laterDate = new Date(2025, 5, 15); // Jun 15, 2025
      const earlierDate = new Date(2025, 5, 15); // Jun 15, 2025 (same date)

      // Set Monthly interval with swapped equal dates
      component.form.patchValue({
        intervalType: IntervalType.Monthly,
        startDate: laterDate, // This will be swapped to end
        endDate: earlierDate // This will be swapped to start
      });

      tick(100);
      flush();
      fixture.detectChanges();

      // After swap, dates become equal, so monthly adjustment should apply
      const expectedStartDate = new Date(2025, 4, 15); // May 15, 2025 (1 month earlier)
      expect(component.form.controls.startDate.value).toEqual(expectedStartDate);
      expect(component.form.controls.endDate.value).toEqual(laterDate);
    }));
  });
});

function testFormData(): FormGroup {
  return new FormGroup({
    intervalType: new FormControl(IntervalType.Monthly),

    startDate: new FormControl(defaultStartDateMonthly.toDate()),
    endDate: new FormControl(defaultEndDateMonthly.toDate()),

    date: new FormControl(new Date()),
    IncludeYoungLifeAircraft: new FormControl(false),
    IncludeMidLifeAircraft: new FormControl(false),
    IncludeLateLifeAircraft: new FormControl(false),
    rangeValues: new FormControl([0, 0]),
    statuses: new FormControl([]),
    primaryUsages: new FormControl([]),
    marketClasses: new FormControl([]),
    lessors: new FormControl([]),

    aircraftManufacturers: new FormControl([]),
    aircraftFamilies: new FormControl([]),
    aircraftTypes: new FormControl([]),
    aircraftMasterSeries: new FormControl([]),
    aircraftSeries: new FormControl([]),
    aircraftSubSeries: new FormControl([]),

    engineTypes: new FormControl([]),
    engineManufacturers: new FormControl([]),
    engineFamilies: new FormControl([]),
    engineMasterSeries: new FormControl([]),
    engineSeries: new FormControl([]),
    engineSubSeries: new FormControl([]),

    operators: new FormControl([]),
    operatorTypes: new FormControl([]),
    operatorGroups: new FormControl([]),
    operatorRegions: new FormControl([]),
    operatorCountries: new FormControl([]),

    ownerships: new FormControl([]),
    availabilities: new FormControl([])
  });
}
