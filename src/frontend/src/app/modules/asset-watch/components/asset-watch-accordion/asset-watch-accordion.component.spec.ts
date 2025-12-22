import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetWatchAccordionComponent } from './asset-watch-accordion.component';
import { BehaviorSubject } from 'rxjs';

describe('AssetWatchAccordionComponent', () => {
  let component: AssetWatchAccordionComponent;
  let fixture: ComponentFixture<AssetWatchAccordionComponent>;
  let mockAccordionContent: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetWatchAccordionComponent]
    });
    fixture = TestBed.createComponent(AssetWatchAccordionComponent);
    component = fixture.componentInstance;
    component.groupCount$ = new BehaviorSubject<number>(12);

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

    it('when expanded is initially true should set expanded to true and update accordionLabel and height', () => {
      const defaultHeight = '100px';
      component.defaultHeight = defaultHeight;
      component.expanded = true;

      component.toggleAccordion(false);

      expect(component.expanded).toBeFalse();
      expect(component.accordionLabel).toBe(`SHOW ALL (${component['groupCount']})`);
      expect(mockAccordionContent.style.height).toBe(defaultHeight);
    });
  });
});
