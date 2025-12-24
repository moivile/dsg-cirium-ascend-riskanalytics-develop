import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { PortfoliosService } from '../../../shared/services/portfolios.service';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';

import { PortfolioOverviewGroupingComponent } from './portfolio-overview-grouping.component';

describe('PortfolioOverviewGroupingComponent', () => {
  let component: PortfolioOverviewGroupingComponent;
  let fixture: ComponentFixture<PortfolioOverviewGroupingComponent>;
  let portfolioOverviewStoreSpy: PortfolioOverviewStore;

  beforeEach(async () => {
    portfolioOverviewStoreSpy = jasmine.createSpyObj('PortfolioOverviewStore', ['setGroupBy']);

    await TestBed.configureTestingModule({
      declarations: [PortfolioOverviewGroupingComponent],
      imports: [SelectModule, FormsModule],
      providers: [
        { provide: PortfolioOverviewStore, useValue: portfolioOverviewStoreSpy },
        PortfoliosService,
        provideHttpClient(withInterceptorsFromDi())
      ]
    })
      .compileComponents();
    fixture = TestBed.createComponent(PortfolioOverviewGroupingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.selectedGroupName).toEqual('aircraftManufacturer');
  });

  describe('ngOnInit', () => {
    it('setGroupBy has been set', () => {
      fixture.detectChanges();
      expect(portfolioOverviewStoreSpy.setGroupBy).toHaveBeenCalledWith(component.groups[0]);
    });
  });

  describe('changeGroupBy', () => {
    it('when aircraftFamily then selectedGroupName is set to aircraftFamily', () => {
      const group = { displayName: 'Family', groupName: 'aircraftFamily' };
      component.changeGroupBy(group.groupName);
      fixture.detectChanges();
      expect(portfolioOverviewStoreSpy.setGroupBy).toHaveBeenCalledWith(group);
    });
  });
});
