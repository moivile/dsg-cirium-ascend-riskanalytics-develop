import { Component, OnInit } from '@angular/core';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { Group } from './group';

@Component({
  selector: 'ra-portfolio-overview-grouping',
  templateUrl: './portfolio-overview-grouping.component.html',
  styleUrls: ['./portfolio-overview-grouping.component.scss']
})
export class PortfolioOverviewGroupingComponent implements OnInit {

  constructor(private readonly portfolioOverviewStore: PortfolioOverviewStore) {

  }
  groups: Group[] = [
    { displayName: 'Manufacturer', groupName: 'aircraftManufacturer' },
    { displayName: 'Family', groupName: 'aircraftFamily' },
    { displayName: 'Type', groupName: 'aircraftType' },
    { displayName: 'Series', groupName: 'aircraftSeries' },
    { displayName: 'Master Series', groupName: 'aircraftMasterSeries' }
  ];
  selectedGroupName: string = this.groups[0].groupName;

  ngOnInit(): void {
    this.portfolioOverviewStore.setGroupBy(this.groups[0]);
  }

  changeGroupBy(groupName: string): void {
    const groupBy = this.groups.find(group => group.groupName === groupName);
    if (groupBy) {
      this.portfolioOverviewStore.setGroupBy(groupBy);
    }
  }
}
