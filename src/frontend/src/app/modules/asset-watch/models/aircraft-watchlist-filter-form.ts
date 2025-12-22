import { FormControl } from '@angular/forms';
import { TreeNode } from 'primeng/api';

export class AircraftWatchlistFilterForm {
  minNoOfFlights = new FormControl<number>(0);
  minTotalGroundStay = new FormControl<number>(0);
  minIndividualGroundStay = new FormControl<number>(0);
  maxIndividualGroundStay = new FormControl<number>(0);
  maxCurrentGroundStay = new FormControl<number>(0);
  minCurrentGroundStay = new FormControl<number>(0);
  filterByOptions = new FormControl<TreeNode[]>([]);
}
