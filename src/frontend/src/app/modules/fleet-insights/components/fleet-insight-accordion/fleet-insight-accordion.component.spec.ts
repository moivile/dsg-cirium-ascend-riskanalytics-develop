import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FleetInsightAccordionComponent } from './fleet-insight-accordion.component';
import { BehaviorSubject } from 'rxjs';
import { DistributionTabStore } from '../../services/distribution-tab-store';

describe('AssetWatchAccordionComponent', () => {
  let component: FleetInsightAccordionComponent;
  let fixture: ComponentFixture<FleetInsightAccordionComponent>;
  let mockAccordionContent: any;
  let mockStore: jasmine.SpyObj<DistributionTabStore>;

  beforeEach(() => {
    mockStore = jasmine.createSpyObj('DistributionTabStore', [], {
      totalSummaryRecords$: new BehaviorSubject<number>(12)
    });

    TestBed.configureTestingModule({
      declarations: [FleetInsightAccordionComponent],
      providers: [{ provide: DistributionTabStore, useValue: mockStore }]
    });

    fixture = TestBed.createComponent(FleetInsightAccordionComponent);
    component = fixture.componentInstance;

    mockAccordionContent = {
      style: {
        height: ''
      }
    };
    spyOn(document, 'getElementById').and.returnValue(mockAccordionContent);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleAccordion', () => {
    it('when expanded is initially false should set expanded to true and update accordionLabel and height', () => {
      component.expanded = false;

      component.toggleAccordion(true);

      expect(component.expanded).toBeTrue();
      expect(component.accordionLabel).toBe('SHOW LESS');
      expect(mockAccordionContent.style.height).toBe('auto');
    });

    it('when expanded is initially true should set expanded to false and update accordionLabel and height', () => {
      const defaultHeight = '100px';
      component.defaultHeight = defaultHeight;
      component.expanded = true;

      component.toggleAccordion(false);

      expect(component.expanded).toBeFalse();
      expect(component.accordionLabel).toBe('SHOW ALL (12)');
      expect(mockAccordionContent.style.height).toBe(defaultHeight);
    });
  });

  describe('setupAccordion', () => {
    it('should set displayAccordionBar to true and call toggleAccordion with false when groupCount is between 12 and 500', () => {
      spyOn(component, 'toggleAccordion');
      component.setupAccordion(100);
      expect(component.displayAccordionBar).toBe(true);
      expect(component.toggleAccordion).toHaveBeenCalledWith(false);
    });

    it('should set displayAccordionBar to false and call toggleAccordion with true when groupCount is less than or equal to 11', () => {
      spyOn(component, 'toggleAccordion');
      component.setupAccordion(10);
      expect(component.displayAccordionBar).toBe(false);
      expect(component.toggleAccordion).toHaveBeenCalledWith(true);
    });

    it('should set displayAccordionBar to false and call toggleAccordion with true when groupCount is greater than 500', () => {
      spyOn(component, 'toggleAccordion');
      component.setupAccordion(600);
      expect(component.displayAccordionBar).toBe(false);
      expect(component.toggleAccordion).toHaveBeenCalledWith(true);
    });

    it('should set displayAccordionBar to true and call toggleAccordion with false when groupCount is exactly 12', () => {
      spyOn(component, 'toggleAccordion');
      component.setupAccordion(12);
      expect(component.displayAccordionBar).toBe(true);
      expect(component.toggleAccordion).toHaveBeenCalledWith(false);
    });

    it('should set displayAccordionBar to true and call toggleAccordion with false when groupCount is exactly 500', () => {
      spyOn(component, 'toggleAccordion');
      component.setupAccordion(500);
      expect(component.displayAccordionBar).toBe(true);
      expect(component.toggleAccordion).toHaveBeenCalledWith(false);
    });

    it('should call setupAccordion with the correct parameter', () => {
      const chartBarCount = 150;
      spyOn(component, 'setupAccordion').and.callThrough();

      component.setupAccordion(chartBarCount);

      expect(component.setupAccordion).toHaveBeenCalledWith(chartBarCount);
    });
  });
});
