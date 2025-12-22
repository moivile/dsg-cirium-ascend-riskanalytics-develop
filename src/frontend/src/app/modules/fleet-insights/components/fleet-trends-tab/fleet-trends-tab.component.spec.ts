import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetTrendsTabComponent } from './fleet-trends-tab.component';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

describe('FleetTrendsTabComponent', () => {
  let component: FleetTrendsTabComponent;
  let fixture: ComponentFixture<FleetTrendsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FleetTrendsTabComponent],
      imports: [DropdownModule, TooltipModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetTrendsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
