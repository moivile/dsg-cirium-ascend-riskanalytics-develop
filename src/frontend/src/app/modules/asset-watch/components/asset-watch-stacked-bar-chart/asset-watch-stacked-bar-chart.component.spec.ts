import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';

import { AssetWatchStackedBarChartComponent } from './asset-watch-stacked-bar-chart.component';
import { BehaviorSubject } from 'rxjs';
import { ChartInputData } from '../../models/chart-input-data';
import { BaseChartDirective } from 'ng2-charts';
import { ElementRef } from '@angular/core';
import dayjs from 'dayjs';
import { DateConstants } from '../../../shared/models/date-constants';

describe('AssetWatchStackedBarChartComponent', () => {
  let component: AssetWatchStackedBarChartComponent;
  let fixture: ComponentFixture<AssetWatchStackedBarChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetWatchStackedBarChartComponent],
      imports: [BaseChartDirective]
    });
    fixture = TestBed.createComponent(AssetWatchStackedBarChartComponent);
    component = fixture.componentInstance;

    component.inputData$ = new BehaviorSubject<ChartInputData>({} as ChartInputData);
    component.downloadChart$ = new BehaviorSubject<Event>({} as Event);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update chart data when input data changes', fakeAsync(() => {
    const inputData: ChartInputData = {
      labels: ['Label 1', 'Label 2'],
      chartCounts: [
        [1, 4],
        [2, 5],
        [3, 6]
      ],
      legendItemLabels: ['Legend 1', 'Legend 2', 'Legend 3']
    };
    component.inputData$.next(inputData);

    flush();

    expect((component.barChartDataSets as unknown[])[0]).toEqual(jasmine.objectContaining({ data: [1, 4], label: 'Legend 1' }));
    expect((component.barChartDataSets as unknown[])[1]).toEqual(jasmine.objectContaining({ data: [2, 5], label: 'Legend 2' }));
    expect((component.barChartDataSets as unknown[])[2]).toEqual(jasmine.objectContaining({ data: [3, 6], label: 'Legend 3' }));
  }));

  describe('removeToolTip', () => {
    it('should remove tooltip if it exists', () => {
      const tooltip = document.createElement('div');
      tooltip.id = 'stacked-bar-tooltip';
      document.body.appendChild(tooltip);
      component.removeTooltip();
      fixture.detectChanges();
      expect(document.getElementById(tooltip.id)).toBeNull();
    });
    it('should not throw an error if the tooltip does not exist', () => {
      spyOn<any>(AssetWatchStackedBarChartComponent, 'getToolTip').and.returnValue(null);
      expect(() => {
        component.removeTooltip();
      }).not.toThrow();
    });
  });

  describe('downloadChart', () => {
    it('should successfully download the chart image', async () => {
      const canvas = document.createElement('canvas') as unknown as { tempContext: CanvasRenderingContext2D };
      spyOn(component, 'getChartImageName');
      spyOn(component, 'prepareCanvas').and.returnValue(canvas);
      spyOn(component, 'createChartCanvas').and.returnValue(Promise.resolve({} as HTMLCanvasElement)); // Change the return type to Promise<HTMLCanvasElement>
      spyOn(component, 'drawChartImage');
      spyOn(component, 'saveImage');

      await component.downloadChart();

      expect(component.getChartImageName).toHaveBeenCalled();
      expect(component.prepareCanvas).toHaveBeenCalled();
      expect(component.createChartCanvas).toHaveBeenCalled();
      expect(component.drawChartImage).toHaveBeenCalled();
      expect(component.saveImage).toHaveBeenCalled();
    });

    it('should handle errors during chart creation', async () => {
      component.chartContainer = new ElementRef(document.createElement('div'));
      spyOn(component, 'createChartCanvas').and.throwError('Error downloading chart');
      try {
        await component.downloadChart();
        fail('Expected "downloadChart()" to throw, but it did not.');
      } catch (error) {
        expect(error).toEqual(new Error('Error downloading chart'));
      }
    });

    it('should not proceed if chart container is not found', async () => {
      component.chartContainer = undefined;

      spyOn(component, 'getChartImageName');
      spyOn(component, 'prepareCanvas');
      spyOn(component, 'createChartCanvas').and.returnValue(Promise.resolve(document.createElement('canvas')));

      await component.downloadChart();

      expect(component.getChartImageName).toHaveBeenCalled();
      expect(component.prepareCanvas).not.toHaveBeenCalled();
      expect(component.createChartCanvas).not.toHaveBeenCalled();
    });
  });

  describe('prepareCanvas', () => {
    const tempCanvas = document.createElement('canvas');

    it('should return an object with the tempContext', () => {
      const result = component.prepareCanvas(10, 10, 5, 1, tempCanvas);
      expect(result).toEqual(jasmine.any(Object));
      expect(result.tempContext).toEqual(jasmine.any(CanvasRenderingContext2D));
    });

    it('should set the correct size of the canvas', () => {
      const contentWidth = 10;
      const contentHeight = 10;
      const padding = 5;
      const scaleFactor = 1;

      component.prepareCanvas(contentWidth, contentHeight, padding, scaleFactor, tempCanvas);

      expect(tempCanvas.width).toEqual((contentWidth + 2 * padding) * scaleFactor);
      expect(tempCanvas.height).toEqual((contentHeight + 2 * padding) * scaleFactor);
    });

    it('should throw an error if canvas context not supported', () => {
      spyOn(tempCanvas, 'getContext').and.returnValue(null);
      expect(() => component.prepareCanvas(10, 10, 5, 1, tempCanvas)).toThrowError('Canvas context not supported.');
      const ctx = tempCanvas.getContext('2d');
      expect(ctx).toBe(null);
    });
  });

  describe('saveImage', () => {
    const tempCanvas = document.createElement('canvas');
    it('should create a data URL from the canvas', () => {
      const dataURLSpy = spyOn(tempCanvas, 'toDataURL');
      component.saveImage(tempCanvas);
      expect(dataURLSpy).toHaveBeenCalledWith('image/jpeg', 1.0);
    });

    it('should create a temporary canvas and convert to data URL', () => {
      // Create a mock canvas object with toDataURL function
      const mockCanvas = {
        toDataURL: () => 'data:image/png;base64,iVBORw0KG…'
      } as unknown as HTMLCanvasElement;
      spyOn(document, 'createElement').and.returnValue(mockCanvas);
      const tempCanvas = document.createElement('canvas');
      // Assert the toDataURL function exists and works
      expect(typeof tempCanvas.toDataURL).toBe('function');
      expect(tempCanvas.toDataURL()).toBeDefined();
    });
  });

  describe('getChartImageName', () => {
    it('should format chartImageName correctly', () => {
      component.portfolioName = 'TestPortfolio';
      component.chartname = 'TestChart';
      const formattedDate = dayjs().format(DateConstants.DDMMYYYY);
      const expectedChartImageName = `TestPortfolio_TestChart_${formattedDate}`;

      component.getChartImageName();

      expect(component.chartImageName).toEqual(expectedChartImageName);
    });
  });

  describe('Chart image subscription', () => {
    it('should subscribe to downloadChart$ when component is initialized and call downloadChart', () => {
      const mockEvent = new Event('mock');
      const downloadChartSpy = spyOn(component, 'downloadChart').and.callThrough();
      spyOn(component, 'ngOnInit').and.callThrough();
      component.ngOnInit();

      component.downloadChart$.next(mockEvent);

      expect(component.chartImageSubscription).toBeTruthy();
      expect(downloadChartSpy).toHaveBeenCalledWith();
    });
  });

  describe('getTooltipBodyContent', () => {
    const tooltipBody = JSON.parse(
      '[["Short Stay (12-48 hrs): 1,218,55"],["Medium Stay (48 hrs - 7 Days): 284"],["Long Stay (>7 Days): 57"]]'
    );
    const tooltipBodyContentsExpected = JSON.parse(
      '[{"text":"Short Stay (12-48 hrs)","value":121855},{"text":"Medium Stay (48 hrs - 7 Days)","value":284},{"text":"Long Stay (>7 Days)","value":57},{"text":"Total","value":122196}]'
    );
    it('should remove all comma from tooltip values', () => {
      const tooltipBodyContents = AssetWatchStackedBarChartComponent.getTooltipBodyContentItems(tooltipBody);
      expect(tooltipBodyContents).toEqual(tooltipBodyContentsExpected);
    });
  });

  describe('showModal', () => {
    it('should set modalTitle and displayModal to true', () => {
      component.showModal();

      expect(component.displayModal).toBe(true);
    });
  });
});
