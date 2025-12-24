import { Component, Input, OnInit } from '@angular/core';
import { FilterPanelFormModel } from '../../models/filter-panel-form-model';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, tap } from 'rxjs';
import { FleetInsightsStore, initialFilterPanelFormValue } from '../../services/fleet-insights-store';

@Component({
    selector: 'ra-fleet-age-band-slider',
    templateUrl: './fleet-age-band-slider.component.html',
    styleUrl: './fleet-age-band-slider.component.scss',
    standalone: false
})
export class FleetAgeBandSliderComponent implements OnInit {
  @Input() parentForm!: FormGroup<FilterPanelFormModel>;
  sliderControl = new FormControl<number[]>([...initialFilterPanelFormValue.rangeValues], { nonNullable: true });

  constructor(private readonly fleetInsightsStore: FleetInsightsStore) {}

  ngOnInit(): void {
    this.sliderControl.valueChanges
      .pipe(
        debounceTime(100),
        tap((value: number[]) => {
          this.parentForm.controls.rangeValues.setValue(value);
        })
      )
      .subscribe();

    this.fleetInsightsStore.resetAllFiltersTriggered$.subscribe(() => {
      const parentFormRangeValues = this.parentForm.controls.rangeValues.value;

      if (
        parentFormRangeValues[0] == initialFilterPanelFormValue.rangeValues[0] &&
        parentFormRangeValues[1] == initialFilterPanelFormValue.rangeValues[1]
      ) {
        this.sliderControl.setValue([...initialFilterPanelFormValue.rangeValues], { emitEvent: false });
      } else {
        this.sliderControl.setValue(parentFormRangeValues, { emitEvent: true });
      }
    });
  }
}
