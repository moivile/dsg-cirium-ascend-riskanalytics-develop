import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FleetDistributionTabComponent } from './fleet-distribution-tab.component';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

describe('FleetDistributionTabComponent', () => {
  let component: FleetDistributionTabComponent;
  let fixture: ComponentFixture<FleetDistributionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetDistributionTabComponent],
      imports: [DropdownModule, TooltipModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetDistributionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
