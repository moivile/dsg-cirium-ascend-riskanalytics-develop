import { Component } from '@angular/core';

@Component({
    selector: 'ra-fleet-distribution-tab',
    templateUrl: './fleet-distribution-tab.component.html',
    styleUrl: './fleet-distribution-tab.component.scss',
    standalone: false
})
export class FleetDistributionTabComponent {
  tabs = [
    { title: 'TAB 1 (105)', active: true },
    { title: 'TAB 2 (87)', active: false }
  ];

  selectTab(tab: { title: string; active: boolean }): void {
    this.tabs.forEach((t) => (t.active = false));
    tab.active = true;
  }
}
