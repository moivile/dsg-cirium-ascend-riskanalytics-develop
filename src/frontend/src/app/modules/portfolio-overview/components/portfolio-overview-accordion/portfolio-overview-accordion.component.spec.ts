import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioOverviewAccordionComponent } from './portfolio-overview-accordion.component';
import { PortfolioAircraftService } from '../../../shared/services/portfolio-aircraft.service';
import { PortfolioOverviewStore } from '../../services/portfolio-overview.store';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PortfolioOverviewAccordionComponent', () => {
  let component: PortfolioOverviewAccordionComponent;
  let fixture: ComponentFixture<PortfolioOverviewAccordionComponent>;
  let mockAccordionContent: any;

  beforeEach(async () => {
    const portfoliosServiceSpy = jasmine.createSpyObj('PortfolioAircraftService', ['getPortfolioAircraft']);
    await TestBed.configureTestingModule({
    declarations: [
        PortfolioOverviewAccordionComponent
    ],
    imports: [],
    providers: [
        PortfolioOverviewStore,
        { provide: PortfolioAircraftService, useValue: portfoliosServiceSpy },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
      .compileComponents();

    fixture = TestBed.createComponent(PortfolioOverviewAccordionComponent);
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
