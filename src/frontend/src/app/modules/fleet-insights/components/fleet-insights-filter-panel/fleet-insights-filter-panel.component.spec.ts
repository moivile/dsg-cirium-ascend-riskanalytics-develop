import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FleetInsightsFilterPanelComponent } from './fleet-insights-filter-panel.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { MultiselectGroupComponent } from '../multiselect-group/multiselect-group.component';
import { By } from '@angular/platform-browser';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { FleetInsightsStore, initialFilterPanelFormValue } from '../../services/fleet-insights-store';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { FilterPanelFormModel } from '../../models/filter-panel-form-model';
import dayjs from 'dayjs';
import { leaseStatusOptions } from '../../models/lease-status-options';

@Component({
    selector: 'ra-fleet-age-band-slider',
    template: '',
    standalone: false
})
class MockFleetAgeBandSliderComponent {
  @Input() parentForm!: FormGroup<FilterPanelFormModel>;
}

describe('FleetInsightsFilterPanelComponent', () => {
  let component: FleetInsightsFilterPanelComponent;
  let fixture: ComponentFixture<FleetInsightsFilterPanelComponent>;
  let storeSpy: jasmine.SpyObj<FleetInsightsStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetInsightsFilterPanelComponent, MultiselectGroupComponent, MockFleetAgeBandSliderComponent],
      imports: [FormsModule, ReactiveFormsModule, DatePickerModule, MultiSelectModule, TooltipModule],
      providers: [FormBuilder],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    storeSpy = jasmine.createSpyObj('FleetInsightsStore', ['updateFilterPanelFormValue', 'resetAllFiltersEffect'], {
      filterPanelFormValue$: of(initialFilterPanelFormValue),
      resetAllFiltersTriggered$: of(),
      filterPanelOptions: {
        aircraftManufacturers$: of([]),
        aircraftFamilies$: of([]),
        aircraftTypes$: of([]),
        aircraftMasterSeries$: of([]),
        aircraftSeries$: of([]),
        aircraftSubSeries$: of([]),
        engineTypes$: of([]),
        engineManufacturers$: of([]),
        engineFamilies$: of([]),
        engineMasterSeries$: of([]),
        engineSeries$: of([]),
        engineSubSeries$: of([]),
        operators$: of([]),
        operatorTypes$: of([]),
        operatorGroups$: of([]),
        operatorRegions$: of([]),
        operatorCountries$: of([]),
        statuses$: of([]),
        primaryUsages$: of([]),
        marketClasses$: of([]),
        lessors$: of([])
      }
    });

    TestBed.overrideProvider(FleetInsightsStore, { useValue: storeSpy });

    fixture = TestBed.createComponent(FleetInsightsFilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize multiselect configurations on initialization', () => {
    component.ngOnInit();
    expect(component.aircraftMultiselectConfigs.length).toBeGreaterThan(0);
    expect(component.engineMultiselectConfigs.length).toBeGreaterThan(0);
    expect(component.operatorMultiselectConfigs.length).toBeGreaterThan(0);
  });

  it('should synchronize form values with the stores filter panel form values', () => {
    const newFormValue = {
      ...initialFilterPanelFormValue,
      statuses: [1, 2, 3]
    };

    const spyWithNewValue = jasmine.createSpyObj('FleetInsightsStore', ['updateFilterPanelFormValue', 'resetAllFiltersEffect'], {
      filterPanelFormValue$: of(newFormValue),
      resetAllFiltersTriggered$: of(),
      filterPanelOptions: storeSpy.filterPanelOptions
    });

    component.store = spyWithNewValue;
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.filterPanelForm.value.statuses).toEqual([1, 2, 3]);
  });

  it('should update the store when the form values change', () => {
    component.ngOnInit();
    fixture.detectChanges();
    const formValue = component.filterPanelForm.value;
    formValue.statuses = [4, 5, 6];
    component.filterPanelForm.patchValue(formValue);
    fixture.detectChanges();
    expect(storeSpy.updateFilterPanelFormValue).toHaveBeenCalledWith(formValue);
  });

  it('should reset all filters when the reset button is clicked', () => {
    const resetButton = fixture.debugElement.query(By.css('.sidebar-filter-panel__reset-button'));
    resetButton.triggerEventHandler('click', null);
    expect(storeSpy.resetAllFiltersEffect).toHaveBeenCalled();
  });

  it('should unsubscribe from observables on component destruction', () => {
    const destroySpy = spyOn(component['destroy$'], 'next').and.callThrough();
    const completeSpy = spyOn(component['destroy$'], 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should update ownerships in the form when ownershipOptions change', () => {
    component.ngOnInit();
    fixture.detectChanges();

    // Simulate selecting ownerships
    const formValue = component.filterPanelForm.value;
    formValue.ownerships = [0, 2];
    component.filterPanelForm.patchValue(formValue);
    fixture.detectChanges();

    expect(component.filterPanelForm.value.ownerships).toEqual([0, 2]);
    expect(storeSpy.updateFilterPanelFormValue).toHaveBeenCalledWith(formValue);
  });

  it('should set the maximum date to the last day of the current month', () => {
    const currentDate = new Date();
    const expectedMaximumDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    expect(component.maximumDate).toEqual(expectedMaximumDate);
  });

  it('should update availabilities in the form when availabilityOptions change', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const formValue = component.filterPanelForm.value;
    formValue.availabilities = [0, 2];
    component.filterPanelForm.patchValue(formValue);
    fixture.detectChanges();

    expect(component.filterPanelForm.value.availabilities).toEqual([0, 2]);
    expect(storeSpy.updateFilterPanelFormValue).toHaveBeenCalledWith(formValue);
  });

  describe('FleetInsightsFilterPanelComponent - date → distributionOwnershipOptions$', () => {
    it('should not emit or clean when date is null or undefined', () => {
      spyOn(component, 'cleanOwnerships');
      const currentDate = new Date();

      // Act
      component.filterPanelForm.controls.date.setValue(currentDate);

      // Assert
      expect(component.cleanOwnerships).toHaveBeenCalled();
    });

    it('should ignore duplicate date values due to distinctUntilChanged', () => {
      // Arrange
      spyOn(component, 'cleanOwnerships');
      const lastMonthDate = dayjs().subtract(1, 'month').toDate();

      // Act
      component.filterPanelForm.controls.date.setValue(lastMonthDate);
      component.filterPanelForm.controls.date.setValue(dayjs(lastMonthDate).toDate());

      // Assert
      expect(component.cleanOwnerships).toHaveBeenCalledTimes(1);
    });
  });

  describe('FleetInsightsFilterPanelComponent - Lease Status Options', () => {
    it('should initialize leaseStatusOptions correctly', () => {
      expect(component.leaseStatusOptions).toEqual(leaseStatusOptions);
    });

    it('should update leaseStatus in the form when options are selected', () => {
      component.ngOnInit();
      fixture.detectChanges();

      const formValue = component.filterPanelForm.value;
      formValue.leaseStatuses = [1, 2]; // Simulate selecting "On Lease" and "Off Lease"
      component.filterPanelForm.patchValue(formValue);
      fixture.detectChanges();

      expect(component.filterPanelForm.value.leaseStatuses).toEqual([1, 2]);
      expect(storeSpy.updateFilterPanelFormValue).toHaveBeenCalledWith(formValue);
    });
  });

  describe('FleetInsightsFilterPanelComponent - Availability Tooltip', () => {
    beforeEach(() => {
      component.isFleetDistributionPage = true;
      fixture.detectChanges();
    });

    it('should display availability tooltip icon when on fleet distribution page', () => {
      const tooltipIcon = fixture.debugElement.query(By.css('.availability-tooltip-icon'));
      expect(tooltipIcon).toBeTruthy();
      expect(tooltipIcon.nativeElement).toHaveClass('fa-question-circle');
    });

    it('should not display availability tooltip icon when not on fleet distribution page', () => {
      component.isFleetDistributionPage = false;
      fixture.detectChanges();

      const tooltipIcon = fixture.debugElement.query(By.css('.availability-tooltip-icon'));
      expect(tooltipIcon).toBeFalsy();
    });

    it('should have correct tooltip configuration', () => {
      const tooltipIcon = fixture.debugElement.query(By.css('.availability-tooltip-icon'));

      expect(tooltipIcon.attributes['pTooltip']).toBe('Aircraft available for lease in the next 12 months from current date only.');
      expect(tooltipIcon.attributes['tooltipStyleClass']).toBe('helptip');
      expect(tooltipIcon.attributes['tooltipPosition']).toBe('right');
    });

    it('should have tooltip icon within label-with-tooltip container', () => {
      const labelContainer = fixture.debugElement.query(By.css('.sidebar-filter-panel__field-label-with-tooltip'));
      const tooltipIcon = labelContainer.query(By.css('.availability-tooltip-icon'));

      expect(labelContainer).toBeTruthy();
      expect(tooltipIcon).toBeTruthy();
    });

    it('should display availability label and tooltip icon side by side', () => {
      const labelContainer = fixture.debugElement.query(By.css('.sidebar-filter-panel__field-label-with-tooltip'));
      const label = labelContainer.query(By.css('.sidebar-filter-panel__field-label'));
      const tooltipIcon = labelContainer.query(By.css('.availability-tooltip-icon'));

      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Availability');
      expect(tooltipIcon).toBeTruthy();
    });

    it('should only show availability section when isFleetDistributionPage is true', () => {
      component.isFleetDistributionPage = true;
      fixture.detectChanges();

      let tooltipIcon = fixture.debugElement.query(By.css('.availability-tooltip-icon'));
      expect(tooltipIcon).toBeTruthy();

      component.isFleetDistributionPage = false;
      fixture.detectChanges();

      tooltipIcon = fixture.debugElement.query(By.css('.availability-tooltip-icon'));
      expect(tooltipIcon).toBeFalsy();
    });
  });

  describe('FleetInsightsFilterPanelComponent - Availability Past Month Selection', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should disable availability control when a past month date is selected', () => {
      // Arrange
      const pastMonthDate = dayjs().subtract(2, 'month').toDate();
      spyOn(component.filterPanelForm.controls.availabilities, 'disable');

      // Act
      component.filterPanelForm.controls.date.setValue(pastMonthDate);

      // Assert
      expect(component.isAvailabilityDisabledDueToPastDate).toBe(true);
      expect(component.filterPanelForm.controls.availabilities.disable).toHaveBeenCalledWith({ emitEvent: false });
    });

    it('should enable availability control when a current or future month date is selected', () => {
      // Arrange
      const currentMonthDate = dayjs().toDate();
      spyOn(component.filterPanelForm.controls.availabilities, 'enable');

      // Act
      component.filterPanelForm.controls.date.setValue(currentMonthDate);

      // Assert
      expect(component.isAvailabilityDisabledDueToPastDate).toBe(false);
      expect(component.filterPanelForm.controls.availabilities.enable).toHaveBeenCalledWith({ emitEvent: false });
    });

    it('should clear availability selections when past month is selected', () => {
      // Arrange
      const pastMonthDate = dayjs().subtract(1, 'month').toDate();
      const availabilityControl = component.filterPanelForm.controls.availabilities;

      availabilityControl.setValue([1, 2, 3]);
      expect(availabilityControl.value).toEqual([1, 2, 3]);

      spyOn(availabilityControl, 'setValue');
      spyOn(availabilityControl, 'markAsDirty');
      spyOn(availabilityControl, 'updateValueAndValidity');

      // Act
      component.filterPanelForm.controls.date.setValue(pastMonthDate);

      // Assert
      expect(availabilityControl.setValue).toHaveBeenCalledWith([], { emitEvent: false });
      expect(availabilityControl.markAsDirty).toHaveBeenCalled();
      expect(availabilityControl.updateValueAndValidity).toHaveBeenCalled();
    });

    it('should not clear availability selections when current month is selected', () => {
      // Arrange
      const currentMonthDate = dayjs().toDate();
      const availabilityControl = component.filterPanelForm.controls.availabilities;

      availabilityControl.setValue([1, 2, 3]);

      spyOn(availabilityControl, 'setValue');

      // Act
      component.filterPanelForm.controls.date.setValue(currentMonthDate);

      // Assert
      expect(availabilityControl.setValue).not.toHaveBeenCalled();
    });

    it('should update isAvailabilityDisabledDueToPastDate flag correctly for past dates', () => {
      // Arrange
      const pastMonthDate = dayjs().subtract(3, 'month').toDate();

      // Act
      component.filterPanelForm.controls.date.setValue(pastMonthDate);

      // Assert
      expect(component.isAvailabilityDisabledDueToPastDate).toBe(true);
    });

    it('should update isAvailabilityDisabledDueToPastDate flag correctly for current/future dates', () => {
      // Arrange
      const futureMonthDate = dayjs().add(1, 'month').toDate();

      // Act
      component.filterPanelForm.controls.date.setValue(futureMonthDate);

      // Assert
      expect(component.isAvailabilityDisabledDueToPastDate).toBe(false);
    });

    it('should handle edge case of last day of previous month', () => {
      // Arrange
      const lastDayOfPreviousMonth = dayjs().subtract(1, 'month').endOf('month').toDate();
      spyOn(component.filterPanelForm.controls.availabilities, 'disable');

      // Act
      component.filterPanelForm.controls.date.setValue(lastDayOfPreviousMonth);

      // Assert
      expect(component.isAvailabilityDisabledDueToPastDate).toBe(true);
      expect(component.filterPanelForm.controls.availabilities.disable).toHaveBeenCalledWith({ emitEvent: false });
    });

    it('should re-enable availability control when switching from past month to current month', () => {
      // Arrange
      const pastMonthDate = dayjs().subtract(1, 'month').toDate();
      const currentMonthDate = dayjs().toDate();

      spyOn(component.filterPanelForm.controls.availabilities, 'disable');
      spyOn(component.filterPanelForm.controls.availabilities, 'enable');

      // Act - first select past month
      component.filterPanelForm.controls.date.setValue(pastMonthDate);
      expect(component.isAvailabilityDisabledDueToPastDate).toBe(true);

      // Act - then select current month
      component.filterPanelForm.controls.date.setValue(currentMonthDate);

      // Assert
      expect(component.isAvailabilityDisabledDueToPastDate).toBe(false);
      expect(component.filterPanelForm.controls.availabilities.enable).toHaveBeenCalledWith({ emitEvent: false });
    });

    it('should not emit events when disabling/enabling availability control', () => {
      // Arrange
      const pastMonthDate = dayjs().subtract(1, 'month').toDate();
      const currentMonthDate = dayjs().toDate();

      spyOn(component.filterPanelForm.controls.availabilities, 'disable');
      spyOn(component.filterPanelForm.controls.availabilities, 'enable');
      spyOn(component.filterPanelForm.controls.availabilities, 'setValue');

      // Act
      component.filterPanelForm.controls.date.setValue(pastMonthDate);
      component.filterPanelForm.controls.date.setValue(currentMonthDate);

      // Assert
      expect(component.filterPanelForm.controls.availabilities.disable).toHaveBeenCalledWith({ emitEvent: false });
      expect(component.filterPanelForm.controls.availabilities.enable).toHaveBeenCalledWith({ emitEvent: false });
      expect(component.filterPanelForm.controls.availabilities.setValue).toHaveBeenCalledWith([], { emitEvent: false });
    });

    it('should reset availability disabled state on resetAllFilters', () => {
      // Arrange
      const pastMonthDate = dayjs().subtract(1, 'month').toDate();
      component.filterPanelForm.controls.date.setValue(pastMonthDate);
      expect(component.isAvailabilityDisabledDueToPastDate).toBe(true);

      spyOn(component.filterPanelForm.controls.availabilities, 'enable');

      const resetTriggeredSubject = new Subject<void>();
      const newStoreSpy = jasmine.createSpyObj('FleetInsightsStore', ['updateFilterPanelFormValue', 'resetAllFiltersEffect'], {
        filterPanelFormValue$: of(initialFilterPanelFormValue),
        resetAllFiltersTriggered$: resetTriggeredSubject.asObservable(),
        filterPanelOptions: storeSpy.filterPanelOptions
      });

      component.store = newStoreSpy;
      component.ngOnInit();

      // Act
      resetTriggeredSubject.next();

      // Assert
      expect(component.isAvailabilityDisabledDueToPastDate).toBe(false);
      expect(component.filterPanelForm.controls.availabilities.enable).toHaveBeenCalled();
    });
  });
});
