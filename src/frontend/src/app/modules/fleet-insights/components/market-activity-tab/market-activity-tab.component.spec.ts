import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketActivityTabComponent } from './market-activity-tab.component';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';


describe('MarketActivityTabComponent', () => {
  let component: MarketActivityTabComponent;
  let fixture: ComponentFixture<MarketActivityTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MarketActivityTabComponent],
      imports: [SelectModule, TooltipModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketActivityTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
