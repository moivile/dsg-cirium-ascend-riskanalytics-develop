import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthlyUtilizationChartComponent } from './monthly-utilization-chart.component';
import { NgChartsModule } from 'ng2-charts';
import { MonthlyUtilization } from '../../models/monthly-utilization';
import { AppConfigService } from '../../../../app-config.service';
import { Component, ElementRef, Input } from '@angular/core';
import { Message } from 'primeng/api';
import * as dayjs from 'dayjs';
import { DateConstants } from '../../../shared/models/date-constants';
import { TooltipModule } from 'primeng/tooltip';
import { MonthlyUtilizationChartObject } from '../../models/monthly-utilization-chart-object';

describe('MonthlyUtilizationChartComponent', () => {
  let component: MonthlyUtilizationChartComponent;
  let fixture: ComponentFixture<MonthlyUtilizationChartComponent>;
  let appConfigServiceSpy: any;

  beforeEach(async () => {
    appConfigServiceSpy = jasmine.createSpyObj('AppConfigService', ['configuration']);

    await TestBed.configureTestingModule({
      imports: [NgChartsModule, TooltipModule],
      declarations: [MonthlyUtilizationChartComponent, MockNoticeComponent],
      providers: [{ provide: AppConfigService, useValue: appConfigServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyUtilizationChartComponent);
    component = fixture.componentInstance;
    component.metric = {
      name: 'any',
      valuePropertyName: 'any',
      numberOfAircraftPropertyName: 'any'
    };
    fixture.detectChanges();
    component.yMax = [
      {
        name: 'valuePropertyName',
        value: 10,
        ['comparisonPortfolio_chartDataSet']: [],
        ['referencePortFolio_chartDataset']: []
      }
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('sets the marketing url', () => {
      // arrange
      appConfigServiceSpy.configuration = { marketingUrl: 'www.blah.co.uk' };

      // act
      component.ngOnInit();

      // assert
      expect(component.marketingUrl).toEqual('www.blah.co.uk');
    });
  });

  describe('ngOnChanges', () => {
    it('when monthlyUtilizationChartData is empty then should reset chartDataSets', () => {
      // arrange
      component.chartDataSets = [];
      for (let i = 0; i < 3; i++) {
        component.chartDataSets.push({
          data: [1, 2, 3],
          label: 'A320',
          fill: false,
          tension: 0,
          borderColor: '#00C19F',
          pointBackgroundColor: '#00C19F',
          pointBorderColor: '#00C19F',
          pointHoverBorderColor: '#00C19F'
        });
      }

      component.monthlyUtilizationChartData = [];

      // act
      component.ngOnChanges();

      // assert
      expect(component.chartDataSets).toEqual([]);
    });

    it('when monthlyUtilizationChartData is empty then should reset legendItems', () => {
      // arrange
      component.legendItems = [
        { label: '1', colour: '1' },
        { label: '2', colour: '2' },
        { label: '3', colour: '3' }
      ];
      component.monthlyUtilizationChartData = [];

      // act
      component.ngOnChanges();

      // assert
      expect(component.legendItems).toEqual([]);
    });

    it('should create chartDataSets from monthlyUtilizationChartData', () => {
      // arrange
      component.metric = {
        name: 'Average Hours',
        valuePropertyName: 'averageHours',
        numberOfAircraftPropertyName: 'any'
      };

      component.monthlyUtilizationChartData = [
        [
          { year: 2022, month: 1, averageHours: 10, group: 'A320' },
          { year: 2022, month: 2, averageHours: 15 },
          { year: 2022, month: 3, averageHours: 20 }
        ],
        [
          { year: 2022, month: 1, averageHours: 25, group: 'A380' },
          { year: 2022, month: 2, averageHours: 30 },
          { year: 2022, month: 3, averageHours: 35 }
        ]
      ] as MonthlyUtilization[][];

      // act
      component.ngOnChanges();

      // assert
      expect(component.chartDataSets).toEqual([
        {
          data: [10, 15, 20],
          label: 'A320',
          fill: false,
          tension: 0,
          borderColor: '#00C19F',
          pointBackgroundColor: '#00C19F',
          pointBorderColor: '#00C19F',
          pointHoverBorderColor: '#00C19F'
        },
        {
          data: [25, 30, 35],
          label: 'A380',
          fill: false,
          tension: 0,
          borderColor: '#0084D4',
          pointBackgroundColor: '#0084D4',
          pointBorderColor: '#0084D4',
          pointHoverBorderColor: '#0084D4'
        }
      ]);
    });

    it('should create legendItems from monthlyUtilizationChartData', () => {
      // arrange
      component.metric = {
        name: 'Average Hours',
        valuePropertyName: 'averageHours',
        numberOfAircraftPropertyName: 'any'
      };

      component.monthlyUtilizationChartData = [
        [
          { year: 2022, month: 1, averageHours: 10, group: 'A320' },
          { year: 2022, month: 2, averageHours: 15 },
          { year: 2022, month: 3, averageHours: 20 }
        ],
        [
          { year: 2022, month: 1, averageHours: 25, group: 'A380', aircraftType: 'Airbus' },
          { year: 2022, month: 2, averageHours: 30 },
          { year: 2022, month: 3, averageHours: 35 }
        ]
      ] as MonthlyUtilization[][];

      // act
      component.ngOnChanges();

      // assert
      expect(component.legendItems).toEqual([
        { label: 'A320', colour: '#00C19F' },
        { label: 'A380 (Airbus)', colour: '#0084D4' }
      ]);
    });

    describe('buildChartLegendItem', () => {
      it('should return MSN + aircraft type when MSN is selected'),
        () => {
          // arrange
          component.monthlyUtilizationChartData = [
            [
              { year: 2022, month: 1, averageHours: 10, group: 'A320' },
              { year: 2022, month: 2, averageHours: 15 },
              { year: 2022, month: 3, averageHours: 20 }
            ],
            [
              { year: 2022, month: 1, averageHours: 25, group: 'A380', aircraftType: 'Airbus' },
              { year: 2022, month: 2, averageHours: 30 },
              { year: 2022, month: 3, averageHours: 35 }
            ]
          ] as MonthlyUtilization[][];

          // act
          const result = component.buildChartLegendItem(component.monthlyUtilizationChartData[1][0]);

          // assert
          expect(result).toEqual('A380 (Airbus)');
        };
    });
  });

  describe('upsell is true', () => {
    it('should display upsell message', () => {
      // arrange
      component.upsellOverlayPlugin = {
        id: '',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        beforeDraw: () => {}
      };
      component.upsell = true;

      // act
      fixture.detectChanges();

      // assert
      const upsellOverlay = fixture.nativeElement.querySelector('.upsell-overlay');
      expect(upsellOverlay.textContent).toContain('Interested in viewing the emissions data?');
    });
  });

  describe('upsell is false', () => {
    it('should not display upsell message', () => {
      // arrange
      component.upsellOverlayPlugin = {
        id: '',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        beforeDraw: () => {}
      };
      component.upsell = false;

      // act
      fixture.detectChanges();

      // assert
      const upsellOverlay = fixture.nativeElement.querySelector('.upsell-overlay');
      expect(upsellOverlay).toBeNull();
    });
  });

  describe('showNoticeMessage is false', () => {
    it('should not display ra-notice', () => {
      component.showNoticeMessage = false;
      component.message = {
        severity: 'error',
        detail: 'Dummy Message',
        summary: 'No results for:'
      };
      // act
      fixture.detectChanges();
      // assert
      const noticeElement = fixture.nativeElement.querySelector('ra-notice');
      expect(noticeElement).toBeNull();
    });
  });

  describe('showNoticeMessage is true', () => {
    it('should display ra-notice', () => {
      component.showNoticeMessage = true;
      component.message = {
        severity: 'error',
        detail: 'Dummy Message',
        summary: 'No results for:'
      };
      // act
      fixture.detectChanges();
      // assert
      const noticeElement = fixture.nativeElement.querySelector('ra-notice');
      expect(noticeElement).toBeDefined();
    });
  });

  describe('showDownloadChart is false button should be disabled', () => {
    it('should display disabled download icon', () => {
      component.showDownloadChart = false;
      // act
      fixture.detectChanges();
      // assert
      const downloadButton = fixture.nativeElement.querySelector('.airframe__icon-button.float_right.exclude-element');
      expect(downloadButton.disabled).toBe(true);
    });
  });

  describe('showDownloadChart is true button should be enabled', () => {
    it('should display disabled download icon', () => {
      component.showDownloadChart = true;
      // act
      fixture.detectChanges();
      // assert
      const downloadButton = fixture.nativeElement.querySelector('.airframe__icon-button.float_right.exclude-element');
      expect(downloadButton.disabled).toBe(false);
    });
  });

  describe('When no metrics data chart download button should be disabled', () => {
    it('should display disabled download icon', () => {
      component.showDownloadChart = false;
      component.monthlyUtilizationChartData = [];
      component.ngOnChanges();
      // act
      fixture.detectChanges();
      // assert
      const downloadButton = fixture.nativeElement.querySelector('.airframe__icon-button.float_right.exclude-element');
      expect(downloadButton.disabled).toBe(true);
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

  describe('updateYMax function', () => {
    beforeEach(() => {
      component.yMax = [
        {
          name: 'metric1',
          isComparisonPortfolio: true,
          comparisonPortfolio_chartDataSet: {},
          referencePortFolio_chartDataset: {}
        }
      ];
      component.comparisonPortfolio_chartDataSet = 'comparisonPortfolio_chartDataSet';
      component.referencePortFolio_chartDataset = 'referencePortFolio_chartDataset';
      component.metric = { valuePropertyName: 'metric1', name: 'metric1', numberOfAircraftPropertyName: 'metric1' };
      component.isComparisonPortfolio = true;
      component.yMaxVal = 10;
    });

    it('Should remove matching yMax item and update reference portfolio dataset', () => {
      const yTemp = 20;
      const chartDataSet = { data: [1, 2, 3] };
      const type = 'dummyType';
      component.isComparisonPortfolio = false;
      spyOn(component.yAxisScaleChange, 'emit');

      component.updateYMax('metric1', yTemp, chartDataSet, type);

      expect(component.yMax.length).toEqual(1);
      expect(component.yMax[0].referencePortFolio_chartDataset).toEqual(chartDataSet);
      expect(component.yAxisScaleChange.emit).toHaveBeenCalledWith(component.yMax);
    });

    it('Should skip removing if no matching yMax item found', () => {
      const yTemp = 20;
      const chartDataSet = { data: [4, 5, 6] };
      const type = 'dummyType';
      spyOn(component.yAxisScaleChange, 'emit');
      component.isComparisonPortfolio = false;

      component.updateYMax('metric2', yTemp, chartDataSet, type);

      expect(component.yMax.length).toEqual(1);
      expect(component.yMax[0].referencePortFolio_chartDataset).toEqual(chartDataSet);
      expect(component.yAxisScaleChange.emit).toHaveBeenCalledWith(component.yMax);
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
    it('should format chartImageName correctly for Emission Trend', () => {
      component.portfolioName = 'TestPortfolio';
      component.isEmissions = true;
      const formattedDate = dayjs().format(DateConstants.DDMMYYYY);
      const expectedChartImageName = `TestPortfolio_EmissionTrend_${formattedDate}`;

      component.getChartImageName();

      expect(component.chartImageName).toEqual(expectedChartImageName);
    });

    it('should format chartImageName correctly for Utilization Trend', () => {
      component.portfolioName = 'TestPortfolio';
      component.isEmissions = false;
      const formattedDate = dayjs().format(DateConstants.DDMMYYYY);
      const expectedChartImageName = `TestPortfolio_UtilizationTrend_${formattedDate}`;

      component.getChartImageName();

      expect(component.chartImageName).toEqual(expectedChartImageName);
    });
  });

  describe('resetChartDataIfEmpty', () => {
    it('should return true when monthlyUtilizationChartData is empty', () => {
      // arrange
      component.monthlyUtilizationChartData = [];

      // act
      const result = component.resetChartDataIfEmpty();

      // assert
      expect(result).toBeTruthy();
      expect(component.chartDataSets).toEqual([]);
      expect(component.legendItems).toEqual([]);
      expect(component.showDownloadChart).toBeFalsy();
    });

    it('should return false when monthlyUtilizationChartData is not empty', () => {
      // arrange
      component.monthlyUtilizationChartData = [
        [
          { year: 2022, month: 1, averageHours: 10, group: 'A320' },
          { year: 2022, month: 2, averageHours: 15 },
          { year: 2022, month: 3, averageHours: 20 }
        ],
        [
          { year: 2022, month: 1, averageHours: 25, group: 'A380', aircraftType: 'Airbus' },
          { year: 2022, month: 2, averageHours: 30 },
          { year: 2022, month: 3, averageHours: 35 }
        ]
      ] as MonthlyUtilization[][];

      // act
      const result = component.resetChartDataIfEmpty();

      // assert
      expect(result).toBeFalsy();
    });
  });

  describe('buildChartDataObject', () => {
    it('should return an object with correct properties when data is provided', () => {
      // arrange
      component.metric.valuePropertyName = 'averageHours';
      component.monthlyUtilizationChartData = [
        [
          {
            year: 2022,
            month: 1,
            averageHours: 10,
            group: 'A320',
            groupId: 0,
            aircraftType: '',
            numberOfAircraftInGroup: 0,
            totalHours: 0,
            numberOfAircraftWithHours: 0,
            averageCycles: 0,
            totalCycles: 0,
            numberOfAircraftWithCycles: 0,
            averageHoursPerCycle: 0,
            numberOfAircraftWithHoursPerCycle: 0,
            averageCo2KgPerSeat: 0,
            numberOfAircraftWithCo2KgPerSeat: 0,
            totalCo2KgPerSeat: 0,
            averageCo2GPerAsk: 0,
            averageCo2GPerAsm: 0,
            totalCo2GPerAsk: 0,
            totalCo2GPerAsm: 0,
            numberOfAircraftWithCo2GPerAsk: 0,
            numberOfAircraftWithCo2GPerAsm: 0
          },
          {
            year: 2022,
            month: 2,
            averageHours: 15,
            group: '',
            groupId: 0,
            aircraftType: '',
            numberOfAircraftInGroup: 0,
            totalHours: 0,
            numberOfAircraftWithHours: 0,
            averageCycles: 0,
            totalCycles: 0,
            numberOfAircraftWithCycles: 0,
            averageHoursPerCycle: 0,
            numberOfAircraftWithHoursPerCycle: 0,
            averageCo2KgPerSeat: 0,
            numberOfAircraftWithCo2KgPerSeat: 0,
            totalCo2KgPerSeat: 0,
            averageCo2GPerAsk: 0,
            averageCo2GPerAsm: 0,
            totalCo2GPerAsk: 0,
            totalCo2GPerAsm: 0,
            numberOfAircraftWithCo2GPerAsk: 0,
            numberOfAircraftWithCo2GPerAsm: 0
          },
          {
            year: 2022,
            month: 3,
            averageHours: 20,
            group: '',
            groupId: 0,
            aircraftType: '',
            numberOfAircraftInGroup: 0,
            totalHours: 0,
            numberOfAircraftWithHours: 0,
            averageCycles: 0,
            totalCycles: 0,
            numberOfAircraftWithCycles: 0,
            averageHoursPerCycle: 0,
            numberOfAircraftWithHoursPerCycle: 0,
            averageCo2KgPerSeat: 0,
            numberOfAircraftWithCo2KgPerSeat: 0,
            totalCo2KgPerSeat: 0,
            averageCo2GPerAsk: 0,
            averageCo2GPerAsm: 0,
            totalCo2GPerAsk: 0,
            totalCo2GPerAsm: 0,
            numberOfAircraftWithCo2GPerAsk: 0,
            numberOfAircraftWithCo2GPerAsm: 0
          }
        ]
      ];
      const color = '#123456';

      // act
      const result = component.buildChartDataObject(component.monthlyUtilizationChartData[0], color);

      // assert
      expect(result.data).toEqual([10, 15, 20]);
      expect(result.label).toBeDefined();
      expect(result.fill).toBeFalsy();
      expect(result.tension).toEqual(0);
      expect(result.borderColor).toEqual(color);
      expect(result.pointBackgroundColor).toEqual(color);
      expect(result.pointBorderColor).toEqual(color);
      expect(result.pointHoverBorderColor).toEqual(color);
    });
  });

  describe('checkNoticeMessage', () => {
    it('should not show notice message when graphNoticeMessage is an empty string', () => {
      // arrange
      component.graphNoticeMessage = '';

      // act
      component.checkNoticeMessage();

      // assert
      expect(component.showNoticeMessage).toBeFalsy();
      expect(component.message).toBeUndefined();
    });

    it('should not show notice message when graphNoticeMessage is a whitespace string', () => {
      // arrange
      component.graphNoticeMessage = ' ';

      // act
      component.checkNoticeMessage();

      // assert
      expect(component.showNoticeMessage).toBeFalsy();
      expect(component.message).toBeUndefined();
    });

    it('should show notice message when graphNoticeMessage is a non-empty string', () => {
      // arrange
      component.graphNoticeMessage = 'Error occurred';

      // act
      component.checkNoticeMessage();

      // assert
      expect(component.showNoticeMessage).toBeTruthy();
      expect(component.message.severity).toEqual('error');
      expect(component.message.detail).toEqual('Error occurred');
      expect(component.message.summary).toEqual('No results for:');
    });
  });

  describe('updateYmaxChartDataset', () => {
    it('should add new unique dataset to chartDataArray', () => {
      // arrange
      const dataset = {
        label: 'Dataset 1',
        data: [1, 2, 3],
        fill: false,
        tension: 0,
        borderColor: '#00C19F',
        pointBackgroundColor: '#00C19F',
        pointBorderColor: '#00C19F',
        pointHoverBorderColor: '#00C19F'
      };
      const chartDataArray: MonthlyUtilizationChartObject[] = [
        {
          label: 'Dataset 2',
          data: [1, 2, 3],
          fill: false,
          tension: 0,
          borderColor: '#00C19F',
          pointBackgroundColor: '#00C19F',
          pointBorderColor: '#00C19F',
          pointHoverBorderColor: '#00C19F'
        },
        {
          label: 'Dataset 3',
          data: [1, 2, 3],
          fill: false,
          tension: 0,
          borderColor: '#0084D4',
          pointBackgroundColor: '#0084D4',
          pointBorderColor: '#0084D4',
          pointHoverBorderColor: '#0084D4'
        }
      ];

      // act
      const result = component.updateYmaxChartDataset(chartDataArray, dataset);

      // assert
      expect(result.length).toEqual(3);
      expect(result.find((x) => x.label == dataset.label)).toBeTruthy();
    });

    it('should remove "All aircraft" dataset if chartDataArray includes more than one dataset', () => {
      // arrange
      const dataset: MonthlyUtilizationChartObject = {
        label: 'Dataset 1',
        data: [1, 2, 3],
        fill: false,
        tension: 0,
        borderColor: '#00C19F',
        pointBackgroundColor: '#00C19F',
        pointBorderColor: '#00C19F',
        pointHoverBorderColor: '#00C19F'
      };
      const chartDataArray: MonthlyUtilizationChartObject[] = [
        {
          label: 'Dataset 2',
          data: [1, 2, 3],
          fill: false,
          tension: 0,
          borderColor: '#FF6384',
          pointBackgroundColor: '#FF6384',
          pointBorderColor: '#FF6384',
          pointHoverBorderColor: '#FF6384'
        },
        {
          label: 'All aircraft',
          data: [1, 2, 3],
          fill: false,
          tension: 0,
          borderColor: '#0084D4',
          pointBackgroundColor: '#0084D4',
          pointBorderColor: '#0084D4',
          pointHoverBorderColor: '#0084D4'
        }
      ];

      // act
      const result = component.updateYmaxChartDataset(chartDataArray, dataset);

      // assert
      expect(result.length).toEqual(2);
      expect(result.some((x) => x.label == 'All aircraft')).toBeFalsy();
    });

    it('should replace the first dataset if its label matches the label of the new dataset', () => {
      // arrange
      const dataset: MonthlyUtilizationChartObject = {
        label: 'Dataset 1',
        data: [1, 2, 3],
        fill: false,
        tension: 0,
        borderColor: '#00C19F',
        pointBackgroundColor: '#00C19F',
        pointBorderColor: '#00C19F',
        pointHoverBorderColor: '#00C19F'
      };
      const chartDataArray: MonthlyUtilizationChartObject[] = [
        {
          label: 'Dataset 1',
          data: [4, 5, 6],
          fill: false,
          tension: 0,
          borderColor: '#00C19F',
          pointBackgroundColor: '#00C19F',
          pointBorderColor: '#00C19F',
          pointHoverBorderColor: '#00C19F'
        }
      ];

      // act
      const result = component.updateYmaxChartDataset(chartDataArray, dataset);

      // assert
      expect(result.length).toEqual(1);
      expect(result[0].data).toEqual(dataset.data);
    });
  });

  describe('getLegendItems', () => {
    it('should return an empty array when chartDataSets is empty', () => {
      // arrange
      const chartDataSets: MonthlyUtilizationChartObject[] = [];
      const propertyName = 'averageHours';

      // act
      const result = component.getLegendItems(chartDataSets, propertyName);

      // assert
      expect(result).toEqual([]);
    });

    it('should return an array with one element when chartDataSets contains one element', () => {
      // arrange
      const chartDataSets: MonthlyUtilizationChartObject[] = [
        {
          data: [10, 15, 20],
          label: 'A320',
          borderColor: '#123456',
          fill: false,
          tension: 0,
          pointBackgroundColor: '',
          pointBorderColor: '',
          pointHoverBorderColor: ''
        }
      ];
      const propertyName = 'averageHours';

      // act
      const result = component.getLegendItems(chartDataSets, propertyName);

      // assert
      expect(result).toEqual([{ label: 'A320', colour: '#123456' }]);
      expect(component.yMax[0].name).toEqual(propertyName);
    });

    it('should return an array with multiple elements when chartDataSets contains multiple elements', () => {
      // arrange
      const chartDataSets: MonthlyUtilizationChartObject[] = [
        {
          data: [10, 15, 20],
          label: 'A320',
          borderColor: '#123456',
          fill: false,
          tension: 0,
          pointBackgroundColor: '',
          pointBorderColor: '',
          pointHoverBorderColor: ''
        },
        {
          data: [25, 30, 35],
          label: 'A380',
          borderColor: '#654321',
          fill: false,
          tension: 0,
          pointBackgroundColor: '',
          pointBorderColor: '',
          pointHoverBorderColor: ''
        }
      ];
      const propertyName = 'averageHours';

      // act
      const result = component.getLegendItems(chartDataSets, propertyName);

      // assert
      expect(result).toEqual([
        { label: 'A320', colour: '#123456' },
        { label: 'A380', colour: '#654321' }
      ]);
      expect(component.yMax[0].name).toEqual(propertyName);
    });
  });
});
@Component({
  selector: 'ra-notice',
  template: ''
})
class MockNoticeComponent {
  @Input()
  message!: Message;
}
