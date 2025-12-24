import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { PortfolioDetailOptionsComponent } from './portfolio-detail-options.component';
import { SelectModule } from 'primeng/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PortfoliosService } from '../../../shared/services/portfolios.service';
import { TreeSelectModule } from 'primeng/treeselect';
import { MessageService, TreeNode } from 'primeng/api';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Portfolio } from '../../../shared/models/portfolio';
import { PortfolioDetailOptions } from '../../models/portfolio-detail-options';
import { IdNamePairModel } from '../../../shared/models/id-name-pair-model';
import { UtilizationService } from '../../../shared/services/utilization.service';
import { GroupOptions } from '../../models/group-options';
import { AppStore } from 'src/app/app-store';
import { AppUserService } from '../../../../app-user.service';

describe('PortfolioDetailOptionsComponent', () => {
  let component: PortfolioDetailOptionsComponent;
  let fixture: ComponentFixture<PortfolioDetailOptionsComponent>;
  let utilizationServiceSpy: any;
  let portfoliosServiceSpy: any;
  let appStore: AppStore;

  beforeEach(() => {
    portfoliosServiceSpy = jasmine.createSpyObj('PortfoliosService', ['getPortfolios']);
    utilizationServiceSpy = jasmine.createSpyObj('UtilizationService', ['getGroupOptions', 'getOperators', 'getLessors']);

    TestBed.configureTestingModule({
      imports: [FormsModule, SelectModule, TreeSelectModule, ReactiveFormsModule],
      declarations: [PortfolioDetailOptionsComponent],
      providers: [
        { provide: PortfoliosService, useValue: portfoliosServiceSpy },
        { provide: UtilizationService, useValue: utilizationServiceSpy },
        AppStore,
        MessageService,
        { provide: AppUserService, useValue: { getAppUser: () => of({ claims: [] }) } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: '99' } }
          }
        }
      ]
    }).compileComponents();

    appStore = TestBed.inject(AppStore);
    appStore.setPortfolios([{ id: 99, name: 'portfolio 99' } as Portfolio]);
    fixture = TestBed.createComponent(PortfolioDetailOptionsComponent);
    component = fixture.componentInstance;
    spyOn(component.portfolioDetailOptionsChange, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('if not comparison portfolio set selected portfolio from the id in the current route', fakeAsync(() => {
      // arrange
      component.isComparisonPortfolio = false;
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [],
          aircraftFamilies: [],
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          aircraftTypes: []
        })
      );
      component.selectedPortfolioControl.setValue({ id: 1 } as Portfolio);
      appStore.setSelectedPortfolioId(99);
      tick(100);

      // act
      component.ngOnInit();

      tick(100);

      // assert
      expect(component.selectedPortfolioControl.value).toEqual({ id: 99, name: 'portfolio 99' } as Portfolio);
    }));

    it('if comparison portfolio do not set selected portfolio id from the id in the current route', fakeAsync(() => {
      // arrange
      component.isComparisonPortfolio = true;
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [],
          aircraftFamilies: [],
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          aircraftTypes: []
        })
      );
      component.selectedPortfolioControl.setValue({ id: 1 } as Portfolio);

      // act
      component.ngOnInit();

      tick(100);

      // assert
      expect(component.selectedPortfolioControl.value).toEqual({ id: 1 } as Portfolio);
    }));
  });

  // should load lessors
  describe('when the group options are changed', () => {
    xit('should load lessors', (done) => {
      // subscribe and assert
      component.lessorOptions$?.subscribe((lessorOptions) => {
        expect(lessorOptions.length).toBe(2);
        expect(lessorOptions[0]).toEqual({ id: 1, name: 'lessor 1' });
        expect(lessorOptions[1]).toEqual({ id: 2, name: 'lessor 2' });
        done();
      });

      // arrange
      utilizationServiceSpy.getLessors.and.returnValue(
        of([
          { id: 1, name: 'lessor 1' },
          { id: 2, name: 'lessor 2' }
        ])
      );

      // act
      component.selectedGroupOptionsControl.setValue([
        {
          data: 2,
          key: 'MarketClass-|-2',
          label: 'Business Jets'
        }
      ]);
    });
  });

  describe('when the group options are changed', () => {
    xit('should load operators', (done) => {
      // subscribe and assert
      component.operatorOptions$?.subscribe((operatorOptions) => {
        expect(operatorOptions.length).toBe(2);
        expect(operatorOptions[0]).toEqual({ id: 1, name: 'operator 1' });
        expect(operatorOptions[1]).toEqual({ id: 2, name: 'operator 2' });
        done();
      });

      // arrange
      utilizationServiceSpy.getOperators.and.returnValue(
        of([
          { id: 1, name: 'operator 1' },
          { id: 2, name: 'operator 2' }
        ])
      );

      // act
      component.selectedGroupOptionsControl.setValue([
        {
          data: 2,
          key: 'MarketClass-|-2',
          label: 'Business Jets'
        }
      ]);
    });

    it('should emit portfolioDetailOptions with the new groupByOptions', waitForAsync(() => {
      // arrange
      utilizationServiceSpy.getOperators.and.returnValue(of([]));
      utilizationServiceSpy.getLessors.and.returnValue(of([]));
      component.selectedPortfolioControl.setValue({ id: 99, name: 'portfolio 99' } as Portfolio, { emitEvent: false });
      component.selectedOperatorControl.setValue({ id: 1, name: 'operator 1' });
      component.selectedLessorControl.setValue({ id: 1, name: 'lessor 1' });

      // act
      component.selectedGroupOptionsControl.setValue([
        {
          data: 1,
          key: 'aircraftMarketClassId-|-1',
          label: 'Widebody Jets',
          parent: {
            key: 'AircraftFamily'
          }
        },
        {
          data: 2,
          key: 'aircraftMarketClassId-|-2',
          label: 'Business Jets',
          parent: {
            key: 'AircraftFamily'
          }
        }
      ]);

      fixture.whenStable().then(() => {
        // assert
        expect(component.portfolioDetailOptionsChange.emit).toHaveBeenCalledWith({
          portfolioId: 99,
          portfolioName: 'portfolio 99',
          operatorId: 1,
          operatorName: 'operator 1',
          lessorId: 1,
          lessorName: 'lessor 1',
          groupByOptions: {
            key: 'AircraftFamily',
            value: [
              {
                id: 1,
                name: 'Widebody Jets'
              },
              {
                id: 2,
                name: 'Business Jets'
              }
            ],
            filterIds: [1, 2]
          },
          includeBaseline: false
        });
      });
    }));

    describe('onGroupOptionSelect', () => {
      it('should unselect any selected options in other groups', () => {
        // arrange
        const lastSelectedGroupOption = { parent: { label: 'subject' } } as TreeNode;

        component.selectedGroupOptionsControl.setValue([
          { parent: { label: 'other' } } as TreeNode,
          lastSelectedGroupOption,
          { parent: { label: 'another' } } as TreeNode,
          { parent: { label: 'other' } } as TreeNode
        ]);

        // act
        component.onGroupOptionSelect(lastSelectedGroupOption);

        // assert
        expect(component.selectedGroupOptionsControl.value.length).toBe(1);
        expect(component.selectedGroupOptionsControl.value[0]).toBe(lastSelectedGroupOption);
      });

      it('when there are more than 5 selected options it should remove the last selected option', () => {
        // arrange
        const lastSelectedGroupOption = { label: 'last-selected' } as TreeNode;
        const preSelectedGroupOption = { label: 'other' } as TreeNode;

        component.selectedGroupOptionsControl.setValue([
          preSelectedGroupOption,
          lastSelectedGroupOption,
          preSelectedGroupOption,
          preSelectedGroupOption,
          preSelectedGroupOption,
          preSelectedGroupOption
        ]);

        // act
        component.onGroupOptionSelect(lastSelectedGroupOption);

        // assert
        expect(component.selectedGroupOptionsControl.value.length).toBe(5);
        expect(component.selectedGroupOptionsControl.value[0]).toBe(preSelectedGroupOption);
        expect(component.selectedGroupOptionsControl.value[1]).toBe(preSelectedGroupOption);
        expect(component.selectedGroupOptionsControl.value[2]).toBe(preSelectedGroupOption);
        expect(component.selectedGroupOptionsControl.value[3]).toBe(preSelectedGroupOption);
        expect(component.selectedGroupOptionsControl.value[4]).toBe(preSelectedGroupOption);
      });
    });
  });

  describe('when the group options are cleared', () => {
    it('the list of available operators should be cleared', waitForAsync(() => {
      // arrange
      utilizationServiceSpy.getOperators.and.returnValue(of([{ id: 1, name: 'operator 1' }]));
      utilizationServiceSpy.getLessors.and.returnValue(of([]));
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        })
      );

      component.selectedPortfolioControl.setValue({ id: 1 } as Portfolio);

      fixture.whenStable().then(() => {
        // subscribe and assert
        component.operatorOptions$?.subscribe((operatorOptions) => {
          expect(operatorOptions.length).toBe(0);
        });

        // act
        component.selectedGroupOptionsControl.reset();
      });
    }));
  });

  describe('when the portfolio is changed', () => {
    it('should emit portfolioDetailOptions with the new portfolioId', waitForAsync(() => {
      // arrange
      utilizationServiceSpy.getOperators.and.returnValue(of([]));
      utilizationServiceSpy.getLessors.and.returnValue(of([]));
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        })
      );

      // act
      component.selectedPortfolioControl.setValue({ id: 999, name: 'new portfolio' } as Portfolio);

      // assert
      fixture.whenStable().then(() =>
        expect(component.portfolioDetailOptionsChange.emit).toHaveBeenCalledWith({
          portfolioId: 999,
          portfolioName: 'new portfolio',
          operatorId: undefined,
          operatorName: undefined,
          lessorId: undefined,
          lessorName: undefined,
          groupByOptions: undefined,
          includeBaseline: true
        } as PortfolioDetailOptions)
      );
    }));

    it('should create the group options for the selected portfolio', (done) => {
      // subscribe and assert
      component.groupOptions$?.subscribe((groupOptions) => {
        expect(groupOptions.length).toBe(6);
        expect(groupOptions[0].key).toEqual('All Aircraft');

        expect(groupOptions[1]).toEqual({
          key: 'MarketClass',
          label: 'Market Class',
          data: 'Market Class',
          children: [{ key: 'MarketClass-|-1', label: 'market class 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[2]).toEqual({
          key: 'AircraftFamily',
          label: 'Family',
          data: 'Family',
          children: [{ key: 'AircraftFamily-|-1', label: 'family 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[3]).toEqual({
          key: 'AircraftType',
          label: 'Type',
          data: 'Type',
          children: [{ key: 'AircraftType-|-1', label: 'type 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[4]).toEqual({
          key: 'AircraftSeries',
          label: 'Series',
          data: 'Series',
          children: [{ key: 'AircraftSeries-|-1', label: 'series 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[5]).toEqual({
          key: 'AircraftSerialNumber',
          label: 'Serial Number',
          data: 'Serial Number',
          children: [{ key: 'AircraftSerialNumber-|-1', label: 'MSN 1 (type 1)', data: 1 }],
          selectable: false
        } as TreeNode);

        done();
      });

      // arrange
      utilizationServiceSpy.getOperators.and.returnValue(of([]));
      utilizationServiceSpy.getLessors.and.returnValue(of([]));
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1 (type 1)' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        })
      );

      // act
      component.selectedPortfolioControl.setValue({ id: 1 } as Portfolio);
    });

    it('when there are not any group options should not create a group', (done) => {
      // subscribe and assert
      component.groupOptions$?.subscribe((groupOptions) => {
        expect(groupOptions.length).toBe(2);
        expect(groupOptions[0].key).toEqual('All Aircraft');
        expect(groupOptions[1].key).toBe('MarketClass');

        done();
      });

      // arrange
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [],
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          aircraftTypes: []
        })
      );

      // act
      component.selectedPortfolioControl.setValue({ id: 1 } as Portfolio);
    });

    it('when the value property is null or undefined should not create a group option', (done) => {
      // subscribe and assert
      component.groupOptions$?.subscribe((groupOptions) => {
        expect(groupOptions.length).toBe(6);
        expect(groupOptions[0].key).toEqual('All Aircraft');

        expect(groupOptions[1]).toEqual({
          key: 'MarketClass',
          label: 'Market Class',
          data: 'Market Class',
          children: [{ key: 'MarketClass-|-1', label: 'market class 1', data: 1 }],
          selectable: false
        } as TreeNode);

        done();
      });

      // arrange
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [
            { id: 1, name: 'market class 1' },
            { id: null, name: 'market class 2' },
            { id: 1, undefined: 'market class 3' }
          ],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        })
      );

      // act
      component.selectedPortfolioControl.setValue({ id: 1 } as Portfolio);
    });

    it('when the label property is null or undefined should not create a group option', (done) => {
      // subscribe and assert
      component.groupOptions$?.subscribe((groupOptions) => {
        expect(groupOptions.length).toBe(6);
        expect(groupOptions[0].key).toEqual('All Aircraft');

        expect(groupOptions[1]).toEqual({
          key: 'MarketClass',
          label: 'Market Class',
          data: 'Market Class',
          children: [{ key: 'MarketClass-|-1', label: 'market class 1', data: 1 }],
          selectable: false
        } as TreeNode);

        done();
      });

      // arrange
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [
            { id: 1, name: 'market class 1' },
            { id: 1, name: null },
            { id: 1, name: undefined }
          ],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        })
      );

      // act
      component.selectedPortfolioControl.setValue({ id: 1 } as Portfolio);
    });

    it('parent groups should not be selectable', (done) => {
      // subscribe and assert
      component.groupOptions$?.subscribe((groupOptions) => {
        expect(groupOptions.length).toBe(6);
        expect(groupOptions[0].key).toEqual('All Aircraft');
        expect(groupOptions[0].selectable).toBe(false);
        expect(groupOptions[1].selectable).toBe(false);
        expect(groupOptions[2].selectable).toBe(false);
        expect(groupOptions[3].selectable).toBe(false);
        expect(groupOptions[4].selectable).toBe(false);
        expect(groupOptions[5].selectable).toBe(false);
        done();
      });

      // arrange
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        })
      );

      // act
      component.selectedPortfolioControl.setValue({ id: 1 } as Portfolio);
    });

    xit('should select the baseline group option', waitForAsync(() => {
      // arrange
      utilizationServiceSpy.getOperators.and.returnValue(of([]));
      utilizationServiceSpy.getLessors.and.returnValue(of([]));

      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        })
      );

      // act
      component.selectedPortfolioControl.setValue({ id: 999, name: 'new portfolio' } as Portfolio);

      // assert
      fixture
        .whenStable()
        .then(() =>
          expect(component.selectedGroupOptionsControl.value).toEqual([
            { key: 'All Aircraft', label: 'All Aircraft', parent: { key: 'All Aircraft' } }
          ])
        );
    }));

    describe('onPortfolioChange', () => {
      it('should clear selected group options', () => {
        // arrange
        component.selectedGroupOptionsControl.setValue([
          { label: '1' } as TreeNode,
          { label: '2' } as TreeNode,
          { label: '3' } as TreeNode
        ]);

        utilizationServiceSpy.getGroupOptions.and.returnValue(of({} as GroupOptions));

        // act
        component.onPortfolioChange();

        // assert
        expect(component.selectedGroupOptionsControl.value.length).toBe(0);
      });
    });
  });

  describe('when the operator is changed', () => {
    it('should load group options', (done) => {
      // subscribe and assert
      component.groupOptions$?.subscribe((groupOptions: TreeNode[]) => {
        expect(utilizationServiceSpy.getGroupOptions).toHaveBeenCalled();

        expect(groupOptions.length).toBe(6);

        expect(groupOptions[0].key).toEqual('All Aircraft');

        expect(groupOptions[1]).toEqual({
          key: 'MarketClass',
          label: 'Market Class',
          data: 'Market Class',
          children: [{ key: 'MarketClass-|-1', label: 'market class 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[2]).toEqual({
          key: 'AircraftFamily',
          label: 'Family',
          data: 'Family',
          children: [{ key: 'AircraftFamily-|-1', label: 'family 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[3]).toEqual({
          key: 'AircraftType',
          label: 'Type',
          data: 'Type',
          children: [{ key: 'AircraftType-|-1', label: 'type 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[4]).toEqual({
          key: 'AircraftSeries',
          label: 'Series',
          data: 'Series',
          children: [{ key: 'AircraftSeries-|-1', label: 'series 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[5]).toEqual({
          key: 'AircraftSerialNumber',
          label: 'Serial Number',
          data: 'Serial Number',
          children: [{ key: 'AircraftSerialNumber-|-1', label: 'MSN 1', data: 1 }],
          selectable: false
        } as TreeNode);

        done();
      });

      // arrange
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        } as GroupOptions)
      );

      component.selectedPortfolioControl.setValue({ id: 1 } as Portfolio);

      // act
      component.selectedOperatorControl.setValue({ id: 99 } as Portfolio);
    });

    it('should remove selected group options that are no longer available', (done) => {
      // subscribe and assert
      component.groupOptions$?.subscribe(() => {
        expect(component.selectedGroupOptionsControl.value.length).toBe(1);

        expect(component.selectedGroupOptionsControl.value[0]).toEqual({
          data: 1,
          key: 'MarketClass-|-1',
          label: 'Business Jets'
        });

        done();
      });

      // arrange
      const selectedOperatorId = 99;

      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          aircraftTypes: []
        } as GroupOptions)
      );

      component.selectedGroupOptionsControl.setValue([
        {
          data: 7,
          key: 'MarketClass-|-7',
          label: 'Widebody Jets'
        },
        {
          data: 1,
          key: 'MarketClass-|-1',
          label: 'Business Jets'
        }
      ]);

      component.selectedPortfolioControl.setValue({ id: 1, name: 'portfolio 1' } as Portfolio);

      // act
      component.selectedOperatorControl.setValue({ id: selectedOperatorId } as IdNamePairModel);
    });

    it('should emit portfolioDetailOptions with the new operatorId', waitForAsync(() => {
      // arrange
      const selectedOperatorId = 99;
      const selectedOperatorName = 'Operator 99';
      const selectedLessorId = 11;
      const selectedLessorName = 'Lessor 11';
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [],
          aircraftSeries: [],
          aircraftTypes: []
        } as GroupOptions)
      );

      utilizationServiceSpy.getOperators.and.returnValue(of([]));
      utilizationServiceSpy.getLessors.and.returnValue(of([]));

      component.selectedPortfolioControl.setValue({ id: 1, name: 'portfolio 1' } as Portfolio);
      component.selectedGroupOptionsControl.setValue([]);

      // act
      component.selectedOperatorControl.setValue({ id: selectedOperatorId, name: selectedOperatorName });
      component.selectedLessorControl.setValue({ id: selectedLessorId, name: selectedLessorName });

      fixture.whenStable().then(() => {
        // assert
        expect(component.portfolioDetailOptionsChange.emit).toHaveBeenCalledWith({
          portfolioId: 1,
          portfolioName: 'portfolio 1',
          operatorId: selectedOperatorId,
          operatorName: selectedOperatorName,
          lessorId: selectedLessorId,
          lessorName: selectedLessorName,
          groupByOptions: undefined,
          includeBaseline: true
        });
      });
    }));
  });

  describe('compareAgainstGlobalBenchmark', () => {
    it('set shouldCompareAgainstGlobalBenchmark to true', () => {
      // act
      component.compareAgainstGlobalBenchmark();

      // assert
      expect(component.shouldCompareAgainstGlobalBenchmark).toBeTrue();
    });

    it('should load group options without serial number options', (done) => {
      // subscribe and assert
      component.groupOptions$?.subscribe((groupOptions: TreeNode[]) => {
        expect(utilizationServiceSpy.getGroupOptions).toHaveBeenCalled();

        expect(groupOptions.length).toBe(5);

        expect(groupOptions[0].key).toEqual('All Aircraft');

        expect(groupOptions[1]).toEqual({
          key: 'MarketClass',
          label: 'Market Class',
          data: 'Market Class',
          children: [{ key: 'MarketClass-|-1', label: 'market class 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[2]).toEqual({
          key: 'AircraftFamily',
          label: 'Family',
          data: 'Family',
          children: [{ key: 'AircraftFamily-|-1', label: 'family 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[3]).toEqual({
          key: 'AircraftType',
          label: 'Type',
          data: 'Type',
          children: [{ key: 'AircraftType-|-1', label: 'type 1', data: 1 }],
          selectable: false
        } as TreeNode);

        expect(groupOptions[4]).toEqual({
          key: 'AircraftSeries',
          label: 'Series',
          data: 'Series',
          children: [{ key: 'AircraftSeries-|-1', label: 'series 1', data: 1 }],
          selectable: false
        } as TreeNode);

        done();
      });

      // arrange
      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        } as GroupOptions)
      );

      // act
      component.compareAgainstGlobalBenchmark();
    });
  });

  describe('compareAgainstPortfolio', () => {
    it('set shouldCompareAgainstGlobalBenchmark to false', () => {
      // act
      component.compareAgainstPortfolio();

      // assert
      expect(component.shouldCompareAgainstGlobalBenchmark).toBeFalse();
    });

    it('should clear the group options', waitForAsync(() => {
      // arrange
      utilizationServiceSpy.getOperators.and.returnValue(of([]));
      utilizationServiceSpy.getLessors.and.returnValue(of([]));

      utilizationServiceSpy.getGroupOptions.and.returnValue(
        of({
          aircraftMarketClasses: [{ id: 1, name: 'market class 1' }],
          aircraftFamilies: [{ id: 1, name: 'family 1' }],
          aircraftSerialNumbers: [{ id: 1, name: 'MSN 1' }],
          aircraftSeries: [{ id: 1, name: 'series 1' }],
          aircraftTypes: [{ id: 1, name: 'type 1' }]
        } as GroupOptions)
      );

      component.compareAgainstGlobalBenchmark();

      fixture.whenStable().then(() => {
        // subscribe and assert
        component.groupOptions$?.subscribe((groupOptions: TreeNode[]) => {
          expect(groupOptions.length).toBe(0);
        });

        // act
        component.compareAgainstPortfolio();
      });
    }));
  });

  it('should decorate groupOptionsTreeSelect onClick method', () => {
    const onClickSpy = spyOn(component.groupOptionsSelect, 'onClick').and.callThrough();

    component.decorateGroupOptionsTreeSelectOnClick();
    const event = new Event('click');
    component.groupOptionsSelect.onClick(event);

    expect(onClickSpy).toHaveBeenCalled();
  });
});
