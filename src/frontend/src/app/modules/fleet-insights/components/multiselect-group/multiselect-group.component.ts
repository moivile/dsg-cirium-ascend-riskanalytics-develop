import { Component, Input } from '@angular/core';
import { MultiselectConfig } from '../../models/multiselect-config';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'ra-multiselect-group',
    templateUrl: './multiselect-group.component.html',
    styleUrls: ['./multiselect-group.component.scss'],
    standalone: false
})
export class MultiselectGroupComponent {
  @Input()
  groupTitle!: string;
  @Input()
  multiselectConfigs!: MultiselectConfig[];
  @Input() initialVisibleCount = 1;
  @Input() multiselectFormGroup!: FormGroup;
  @Input() showToggleAll = false;

  showAll = false;

  get visibleMultiselects(): MultiselectConfig[] {
    return this.showAll ? this.multiselectConfigs : this.multiselectConfigs.slice(0, this.initialVisibleCount);
  }

  get hiddenCount(): number {
    return this.multiselectConfigs.length - this.initialVisibleCount;
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }
}
