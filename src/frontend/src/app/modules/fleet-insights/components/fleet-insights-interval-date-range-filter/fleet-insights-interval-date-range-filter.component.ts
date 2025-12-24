import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FilterPanelFormModel } from '../../models/filter-panel-form-model';
import { defaultEndDateMonthly, IntervalType } from '../../models/interval-type.enum';
import { combineLatest, debounceTime, distinctUntilChanged, merge, Observable, of, pairwise, Subject, takeUntil, tap } from 'rxjs';
import { DatePicker } from 'primeng/datepicker';
import { IntervalDateRangeFormModel } from './interval-date-range-form-model';
import { isEqual } from 'lodash';
import dayjs from 'dayjs';
import { minimumDate } from '../../services/fleet-insights-store';

@Component({
  selector: 'ra-fleet-insights-interval-date-range-filter',
  templateUrl: './fleet-insights-interval-date-range-filter.component.html',
  styleUrl: './fleet-insights-interval-date-range-filter.component.scss',
  standalone: false
})
export class FleetInsightsIntervalDateRangeFilterComponent implements OnInit, OnDestroy {
  @Input() parentForm!: FormGroup<FilterPanelFormModel>;

  @Input() form!: FormGroup<IntervalDateRangeFormModel>;
  @Input() isFleetTrendsPage$: Observable<boolean> | undefined;
  IntervalType = IntervalType;
  maximumDate: Date | null = defaultEndDateMonthly.toDate();
  minimumDate: Date = minimumDate;
  public datePickerFormat: 'MM yy' | 'yy' = 'MM yy';
  public calendarView: 'month' | 'year' = 'month';
  private destroy$ = new Subject<void>();
  @ViewChild('startCalendar') startCalendar!: DatePicker;
  @ViewChild('endCalendar') endCalendar!: DatePicker;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isFleetTrendsPage$?.pipe(takeUntil(this.destroy$)).subscribe((isFleetTrendsPage) => {
      this.maximumDate = isFleetTrendsPage ? defaultEndDateMonthly.toDate() : dayjs().add(30, 'years').toDate();

      if (!isFleetTrendsPage) {
        return;
      }

      if (this.startCalendar?.value && dayjs(this.startCalendar.value).isAfter(dayjs())) {
        this.setCurrentMonthOrYear(this.startCalendar);
      }

      if (this.endCalendar?.value && dayjs(this.endCalendar.value).isAfter(dayjs())) {
        this.setCurrentMonthOrYear(this.endCalendar);
      }
    });
    this.form = this.fb.group<IntervalDateRangeFormModel>({
      intervalType: this.fb.control(this.parentForm.controls.intervalType.value, { nonNullable: true }),
      startDate: this.fb.control(this.parentForm.controls.startDate.value, { nonNullable: true }),
      endDate: this.fb.control(this.parentForm.controls.endDate.value, { nonNullable: true })
    });

    merge(this.form.controls.intervalType.valueChanges, of(IntervalType.Monthly))
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        pairwise(),
        tap(([prev, curr]) => {
          const oldStart = dayjs(this.form.controls.startDate.value);
          const oldEnd = dayjs(this.form.controls.endDate.value);
          const { newStart, newEnd } = this.transformDates(prev, curr, oldStart, oldEnd);

          this.form.patchValue(
            {
              startDate: newStart.toDate(),
              endDate: newEnd.toDate()
            },
            { emitEvent: false }
          );

          this.updateCalendarConfiguration(curr);
        })
      )
      .subscribe();

    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        tap(() => {
          if (dayjs(this.form.value.startDate).isAfter(dayjs(this.form.value.endDate))) {
            this.form.patchValue({
              startDate: this.form.value.endDate,
              endDate: this.form.value.startDate
            });
          } else if (
            this.form.controls.intervalType.value === IntervalType.Monthly &&
            dayjs(this.form.controls.startDate.value).isSame(dayjs(this.form.controls.endDate.value))
          ) {
            this.form.patchValue({
              startDate: dayjs(this.form.value.startDate).subtract(1, 'month').toDate()
            });
          }

          this.parentForm.patchValue(this.form.value);
        })
      )
      .subscribe();

    combineLatest([
      this.parentForm.controls.intervalType.valueChanges,
      this.parentForm.controls.startDate.valueChanges,
      this.parentForm.controls.endDate.valueChanges
    ])
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        debounceTime(50),
        tap(([intervalType, startDate, endDate]) => {
          this.form.patchValue(
            {
              intervalType,
              startDate,
              endDate
            },
            { emitEvent: false }
          );
          this.updateCalendarConfiguration(intervalType);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  transformDates(
    prev: IntervalType,
    curr: IntervalType,
    oldStart: dayjs.Dayjs,
    oldEnd: dayjs.Dayjs
  ): { newStart: dayjs.Dayjs; newEnd: dayjs.Dayjs } {
    // Monthly → Quarter OR Monthly → Year
    if (prev === IntervalType.Monthly && (curr === IntervalType.Quarter || curr === IntervalType.Year)) {
      return { newStart: oldStart.startOf('year'), newEnd: oldEnd.startOf('year') };
    }
    // Quarter → Monthly OR Year → Monthly
    if ((prev === IntervalType.Quarter || prev === IntervalType.Year) && curr === IntervalType.Monthly) {
      const newEnd = oldEnd.month(11).startOf('month');
      const currentMonth = dayjs().startOf('month');

      return { newStart: oldStart.month(0).startOf('month'), newEnd: newEnd.isAfter(currentMonth) ? currentMonth : newEnd };
    }

    // Quarter → Year
    // Year → Quarter
    return {
      newStart: oldStart,
      newEnd: oldEnd
    };
  }

  private setCurrentMonthOrYear(calendar: DatePicker): void {
    if (!calendar) {
      return;
    }

    if (this.form.controls.intervalType.value === IntervalType.Monthly) {
      const currentMonth = dayjs().startOf('month');
      calendar.updateModel(currentMonth.toDate());
    } else if (
      this.form.controls.intervalType.value === IntervalType.Quarter ||
      this.form.controls.intervalType.value === IntervalType.Year
    ) {
      const currentYear = dayjs().startOf('year');
      calendar.updateModel(currentYear.toDate());
    }
  }

  private updateCalendarConfiguration(interval: IntervalType): void {
    if (interval === IntervalType.Monthly) {
      this.datePickerFormat = 'MM yy';
      this.calendarView = 'month';
    } else if (interval === IntervalType.Quarter) {
      this.datePickerFormat = 'yy';
      this.calendarView = 'year';
    } else if (interval === IntervalType.Year) {
      this.datePickerFormat = 'yy';
      this.calendarView = 'year';
    }

    setTimeout(() => {
      if (this.startCalendar) {
        this.startCalendar.updateInputfield();
      }
      if (this.endCalendar) {
        this.endCalendar.updateInputfield();
      }
    });
  }
}
