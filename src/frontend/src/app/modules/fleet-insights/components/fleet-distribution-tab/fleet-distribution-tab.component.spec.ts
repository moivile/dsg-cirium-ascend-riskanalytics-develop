import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FleetDistributionTabComponent } from './fleet-distribution-tab.component';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FleetInsightsStore } from '../../services/fleet-insights-store';
import { Observable, of } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { BrowserModule, By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FleetInsightsService } from '../../services/fleet-insights-service';
import { DistributionTabStore } from '../../services/distribution-tab-store';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ExportExcelService } from '../../../shared/services/export-excel-service';
import { FleetInsightsAircraftSummaryModel } from '../../models/fleet-insights-aircraft-summary-model';
import { MetricType } from '../../models/metric-type.enum';
import { AppStore } from '../../../../app-store';
import { AppUserService } from '../../../../app-user.service';

@Component({
  selector: 'ra-group-all-data-by-select',
  template: '',
  standalone: false
})
class MockGroupAllDataBySelectComponent {}

@Component({
  selector: 'ra-distribution-tab-summary-table',
  template: '',
  standalone: false
})
class MockDistributionTabSummaryTableComponent {}

@Component({
  selector: 'ra-distribution-tab-aircraft-table',
  template: '',
  standalone: false
})
class MockDistributionTabAircraftTableComponent {
  @Input() isActive = false;
  @Input() isAvailabilities = false;
  @Input() isAircraft = false;
}

@Component({
  selector: 'ra-fleet-insight-horizontal-bar-chart',
  template: '',
  standalone: false
})
class MockFleetInsightHorizontalBarChartComponent {
  @Input() inputData$?: Observable<FleetInsightsAircraftSummaryModel>;
  @Input() metricType$?: Observable<MetricType>;
  @Input() isModal = false;
}

@Component({
  selector: 'ra-fleet-insight-pie-chart',
  template: '',
  standalone: false
})
class MockFleetInsightPieChartComponent {
  @Input() inputData$?: Observable<any[]>;
  @Input() metricType$?: Observable<MetricType>;
  @Input() isModal = false;
  @Input() categoryKey = 'grouping';
  @Input() valueKey = 'numberOfAircraft';
  @Input() percentageKey = 'percentageOfTotal';
}

@Component({
  selector: 'ra-fleet-insight-accordion',
  template: '',
  standalone: false
})
class MockFleetInsightAccordionComponent {
  @Input() groupCount$?: Observable<number>;
}
describe('FleetDistributionTabComponent', () => {
  let component: FleetDistributionTabComponent;
  let fixture: ComponentFixture<FleetDistributionTabComponent>;
  let service: FleetInsightsService;
  let distributionTabStore: DistributionTabStore;
  let fleetInsightsStore: FleetInsightsStore;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DistributionTabStore', ['totalAircraftRecords$', 'totalSummaryRecords$']);

    await TestBed.configureTestingModule({
      declarations: [
        FleetDistributionTabComponent,
        MockGroupAllDataBySelectComponent,
        MockDistributionTabAircraftTableComponent,
        MockDistributionTabSummaryTableComponent,
        MockFleetInsightHorizontalBarChartComponent,
        MockFleetInsightPieChartComponent,
        MockFleetInsightAccordionComponent
      ],
      imports: [DropdownModule, TooltipModule, FormsModule, ReactiveFormsModule, DialogModule, BrowserAnimationsModule, BrowserModule],
      providers: [
        { provide: FleetInsightsStore, useValue: spy },
        DistributionTabStore,
        FleetInsightsStore,
        FleetInsightsService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ExportExcelService,
        AppStore,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FleetDistributionTabComponent);
    component = fixture.componentInstance;

    service = TestBed.inject(FleetInsightsService);
    distributionTabStore = TestBed.inject(DistributionTabStore);
    fleetInsightsStore = TestBed.inject(FleetInsightsStore);

    spyOn(service, 'getAircraftSummaryData').and.returnValue(
      of({
        aircraftSummaryList: [],
        skip: 0,
        take: 0,
        totalCount: 0
      })
    );

    spyOn(service, 'getAircraftData').and.returnValue(
      of({
        aircraftList: [],
        skip: 0,
        take: 0,
        totalCount: 0
      })
    );

    component.activeIndex = 0;
    component.isAvailabilities = false;
    component.isAircraft = false;
    component.aircraftRecordCount = 1000;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Tab Titles', () => {
    it('should set tab titles correctly when availability is false', () => {
      component.activeIndex = 1;
      component.isAvailabilities = false;
      component.showTabTitle();
      fixture.detectChanges();
      expect(component.tabs[1].title).toContain('Aircraft (');
      expect(component.tabs[2].title).toBe('Availability');
    });

    it('should set tab titles correctly when availability is true', () => {
      component.activeIndex = 2;
      component.isAvailabilities = true;
      component.showTabTitle();
      fixture.detectChanges();
      expect(component.tabs[1].title).toBe('Aircraft');
      expect(component.tabs[2].title).toContain('Availability (');
    });
  });

  describe('Modal Functionality', () => {
    it('should open modal and set title correctly for summary tab', () => {
      component.activeIndex = 0;
      component.setModalTitle(component.activeIndex);
      component.showModal();
      fixture.detectChanges();
      expect(component.displayModal).toBeTrue();
      expect(component.modalTitle).toBe(component.tabs[0].title);
    });

    it('should open modal and set title correctly for aircraft tab', () => {
      component.activeIndex = 1;
      component.setModalTitle(component.activeIndex);
      component.showModal();
      fixture.detectChanges();
      expect(component.displayModal).toBeTrue();
      expect(component.modalTitle).toBe(component.tabs[1].title);
    });

    it('should open modal and set title correctly for availability tab', () => {
      component.activeIndex = 2;
      component.isAvailabilities = true;
      component.setModalTitle(component.activeIndex);
      component.showModal();
      fixture.detectChanges();
      expect(component.displayModal).toBeTrue();
      expect(component.modalTitle).toBe(component.tabs[2].title);
    });

    it('should not open modal when conditions are not met', () => {
      component.activeIndex = 1;
      component.isAvailabilities = true;
      component.showModal();
      fixture.detectChanges();
      expect(component.displayModal).toBeFalse();
    });

    it('should display the modal when displayModalChart is true', () => {
      component.displayModalChart = true;
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.airframe-modal'));
      expect(modal).toBeTruthy();
      expect(modal.classes['dialog-open-modal']).toBeTrue();
    });

    it('should call maximizeModalChart when the modal is shown', () => {
      spyOn(component, 'maximizeModalChart');
      component.displayModalChart = true;
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('p-dialog'));
      modal.triggerEventHandler('onShow', {});
      expect(component.maximizeModalChart).toHaveBeenCalled();
    });

    it('should call closeModal when the modal is hidden', () => {
      spyOn(component, 'closeModal');
      component.displayModalChart = true;
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('p-dialog'));
      modal.triggerEventHandler('onHide', {});
      expect(component.closeModal).toHaveBeenCalled();
    });
  });

  describe('Metric Display', () => {
    it('should display the correct title based on metricControl.value', () => {
      component.metricControl.setValue(MetricType.Percentage);
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('.aircraft-header__title')).nativeElement;
      expect(titleElement.textContent).toContain('All Aircraft (%)');

      component.metricControl.setValue(MetricType.Number);
      fixture.detectChanges();

      expect(titleElement.textContent).toContain('All Aircraft');
    });
  });

  describe('Date Formatting', () => {
    it('should return empty string for null/undefined/empty input', () => {
      expect((component as any).formatDateForExport(null)).toBe('');
      expect((component as any).formatDateForExport(undefined)).toBe('');
      expect((component as any).formatDateForExport('')).toBe('');
      expect((component as any).formatDateForExport('   ')).toBe('');
    });

    it('should return empty string for invalid date string', () => {
      const result = (component as any).formatDateForExport('invalid-date');
      expect(result).toBe('');
    });

    it('should format valid date strings to DD-MMM-YYYY format', () => {
      expect((component as any).formatDateForExport('2023-06-15T10:30:00Z')).toBe('15-Jun-2023');
      expect((component as any).formatDateForExport('2023-12-25')).toBe('25-Dec-2023');
      expect((component as any).formatDateForExport('2023-01-05')).toBe('05-Jan-2023');
      expect((component as any).formatDateForExport('2024-02-29')).toBe('29-Feb-2024');
    });
  });

  describe('Export Functionality', () => {
    describe('Export Button Visibility', () => {
      beforeEach(() => {
        fixture.detectChanges();
      });

      it('should show export button for Summary tab (activeIndex = 0)', () => {
        component.activeIndex = 0;
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton).toBeTruthy();
        expect(exportButton.nativeElement.hidden).toBeFalse();
      });

      it('should hide export button for Aircraft tab (activeIndex = 1)', () => {
        component.activeIndex = 1;
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton).toBeTruthy();
        expect(exportButton.nativeElement.hidden).toBeTrue();
      });

      it('should show export button for Availability tab (activeIndex = 2)', () => {
        component.activeIndex = 2;
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton).toBeTruthy();
        expect(exportButton.nativeElement.hidden).toBeFalse();
      });

      it('should toggle export button visibility when switching between tabs', () => {
        // Summary tab
        component.activeIndex = 0;
        fixture.detectChanges();
        let exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.hidden).toBeFalse();

        // Aircraft tab
        component.activeIndex = 1;
        fixture.detectChanges();
        exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.hidden).toBeTrue();

        // Availability tab
        component.activeIndex = 2;
        fixture.detectChanges();
        exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.hidden).toBeFalse();
      });
    });

    describe('Export Button Functionality', () => {
      it('should have correct tooltip attributes', () => {
        component.activeIndex = 0;
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.getAttribute('pTooltip')).toBe('Download to Excel');
        expect(exportButton.nativeElement.getAttribute('tooltipPosition')).toBe('left');
        expect(exportButton.nativeElement.getAttribute('tooltipStyleClass')).toBe('airframe-tooltip');
      });

      it('should be enabled (not disabled)', () => {
        component.activeIndex = 0;
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.disabled).toBeFalse();
      });

      it('should call onDownloadToExcel when clicked on Summary tab', () => {
        component.activeIndex = 0;
        spyOn(component, 'onDownloadToExcel');
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        exportButton.nativeElement.click();

        expect(component.onDownloadToExcel).toHaveBeenCalled();
      });

      it('should call onDownloadToExcel when clicked on Availability tab', () => {
        component.activeIndex = 2;
        spyOn(component, 'onDownloadToExcel');
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        exportButton.nativeElement.click();

        expect(component.onDownloadToExcel).toHaveBeenCalled();
      });
    });

    describe('Export Method Calls', () => {
      it('should call exportSummaryToExcel for Summary tab', () => {
        component.activeIndex = 0;
        spyOn(component, 'exportSummaryToExcel');
        component.onDownloadToExcel();
        expect(component.exportSummaryToExcel).toHaveBeenCalled();
      });

      it('should call exportAircraftListToExcel for Aircraft tab', () => {
        component.activeIndex = 1;
        spyOn(component, 'exportAircraftListToExcel');
        component.onDownloadToExcel();
        expect(component.exportAircraftListToExcel).toHaveBeenCalled();
      });

      it('should maintain functionality after tab switches', () => {
        spyOn(component, 'onDownloadToExcel');

        // Test Summary tab
        component.activeIndex = 0;
        fixture.detectChanges();
        let exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        exportButton.nativeElement.click();
        expect(component.onDownloadToExcel).toHaveBeenCalledTimes(1);

        // Switch to Availability tab
        component.activeIndex = 2;
        fixture.detectChanges();
        exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        exportButton.nativeElement.click();
        expect(component.onDownloadToExcel).toHaveBeenCalledTimes(2);
      });
    });

    describe('Export Button Conditional Hiding', () => {
      beforeEach(() => {
        fixture.detectChanges();
      });

      it('should conditionally hide export button based on activeIndex', () => {
        // Test all three tabs
        const testCases = [
          { activeIndex: 0, shouldBeHidden: false, tabName: 'Summary' },
          { activeIndex: 1, shouldBeHidden: true, tabName: 'Aircraft' },
          { activeIndex: 2, shouldBeHidden: false, tabName: 'Availability' }
        ];

        testCases.forEach(({ activeIndex, shouldBeHidden, tabName }) => {
          component.activeIndex = activeIndex;
          fixture.detectChanges();

          const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
          expect(exportButton).toBeTruthy();
          expect(exportButton.nativeElement.hidden).toBe(shouldBeHidden);
        });
      });

      it('should use [hidden] attribute instead of [disabled] for Aircraft tab', () => {
        component.activeIndex = 1; // Aircraft tab
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.hidden).toBeTrue();
        expect(exportButton.nativeElement.disabled).toBeFalse(); // No longer disabled
      });

      it('should show export button and be enabled for Summary tab', () => {
        component.activeIndex = 0; // Summary tab
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        // Should be visible and enabled
        expect(exportButton.nativeElement.hidden).toBeFalse();
        expect(exportButton.nativeElement.disabled).toBeFalse();
      });

      it('should show export button and be enabled for Availability tab', () => {
        component.activeIndex = 2; // Availability tab
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        // Should be visible and enabled
        expect(exportButton.nativeElement.hidden).toBeFalse();
        expect(exportButton.nativeElement.disabled).toBeFalse();
      });

      it('should have click handler attached when button is visible', () => {
        component.activeIndex = 0; // Summary tab
        spyOn(component, 'onDownloadToExcel');
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        // Button should be visible and clickable
        expect(exportButton.nativeElement.hidden).toBeFalse();
        exportButton.nativeElement.click();
        expect(component.onDownloadToExcel).toHaveBeenCalledTimes(1);
      });

      it('should maintain all tooltip attributes when button is visible', () => {
        component.activeIndex = 0; // Summary tab
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));

        expect(exportButton.nativeElement.hidden).toBeFalse();
        expect(exportButton.nativeElement.getAttribute('pTooltip')).toBe('Download to Excel');
        expect(exportButton.nativeElement.getAttribute('tooltipPosition')).toBe('left');
        expect(exportButton.nativeElement.getAttribute('tooltipStyleClass')).toBe('airframe-tooltip');
      });

      it('should maintain CSS classes when button is hidden', () => {
        component.activeIndex = 1; // Aircraft tab
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));

        expect(exportButton.nativeElement.hidden).toBeTrue();
        expect(exportButton.nativeElement.classList.contains('airframe__icon-button')).toBeTrue();
        expect(exportButton.nativeElement.id).toBe('download-to-excel-btn');
      });
    });

    describe('Export Button State Transitions', () => {
      it('should properly transition button visibility when switching from Summary to Aircraft tab', () => {
        // Start with Summary tab (visible)
        component.activeIndex = 0;
        fixture.detectChanges();

        let exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.hidden).toBeFalse();

        // Switch to Aircraft tab (should hide)
        component.activeIndex = 1;
        fixture.detectChanges();

        exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.hidden).toBeTrue();
      });

      it('should properly transition button visibility when switching from Aircraft to Availability tab', () => {
        // Start with Aircraft tab (hidden)
        component.activeIndex = 1;
        fixture.detectChanges();

        let exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.hidden).toBeTrue();

        // Switch to Availability tab (should show)
        component.activeIndex = 2;
        fixture.detectChanges();

        exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.hidden).toBeFalse();
      });

      it('should maintain functionality across multiple tab switches', () => {
        spyOn(component, 'onDownloadToExcel');

        // Summary tab - should be clickable
        component.activeIndex = 0;
        fixture.detectChanges();
        let exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        exportButton.nativeElement.click();
        expect(component.onDownloadToExcel).toHaveBeenCalledTimes(1);
        expect(exportButton.nativeElement.hidden).toBeFalse();

        // Aircraft tab - should be hidden
        component.activeIndex = 1;
        fixture.detectChanges();
        exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        expect(exportButton.nativeElement.hidden).toBeTrue();

        // Availability tab - should be clickable again
        component.activeIndex = 2;
        fixture.detectChanges();
        exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        exportButton.nativeElement.click();
        expect(component.onDownloadToExcel).toHaveBeenCalledTimes(2);
        expect(exportButton.nativeElement.hidden).toBeFalse();
      });
    });

    describe('Export Button Accessibility', () => {
      it('should not be focusable when hidden on Aircraft tab', () => {
        component.activeIndex = 1; // Aircraft tab
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));

        expect(exportButton.nativeElement.hidden).toBeTrue();

        // Hidden elements should not be focusable
        exportButton.nativeElement.focus();
        expect(document.activeElement).not.toBe(exportButton.nativeElement);
      });

      it('should be focusable when visible on Summary tab', () => {
        component.activeIndex = 0; // Summary tab
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));

        expect(exportButton.nativeElement.hidden).toBeFalse();

        // Visible elements should be focusable
        exportButton.nativeElement.focus();
        expect(document.activeElement).toBe(exportButton.nativeElement);
      });
    });

    describe('Export Button DOM Attributes', () => {
      it('should have [hidden] attribute set to true for Aircraft tab', () => {
        component.activeIndex = 1;
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));
        const hiddenAttribute = exportButton.nativeElement.getAttribute('hidden');

        expect(exportButton.nativeElement.hidden).toBeTrue();
        expect(hiddenAttribute).not.toBeNull(); // Hidden attribute should be present
      });

      it('should not have [hidden] attribute for Summary tab', () => {
        component.activeIndex = 0;
        fixture.detectChanges();

        const exportButton = fixture.debugElement.query(By.css('#download-to-excel-btn'));

        expect(exportButton.nativeElement.hidden).toBeFalse();
      });
    });
  });
});
