import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiselectGroupComponent } from './multiselect-group.component';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MultiselectConfig } from '../../models/multiselect-config';
import { MultiSelectModule } from 'primeng/multiselect';

describe('MultiselectGroupComponent', () => {
  let component: MultiselectGroupComponent;
  let fixture: ComponentFixture<MultiselectGroupComponent>;

  const mockMultiselectConfigs: MultiselectConfig[] = [
    {
      label: 'Test Label 1',
      controlName: 'testControl1',
      options$: of([])
    },
    {
      label: 'Test Label 2',
      controlName: 'testControl2',
      options$: of([])
    },
    {
      label: 'Test Label 3',
      controlName: 'testControl3',
      options$: of([])
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiselectGroupComponent],
      imports: [FormsModule, ReactiveFormsModule, MultiSelectModule],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements and attributes
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiselectGroupComponent);
    component = fixture.componentInstance;

    component.groupTitle = 'Test Group';
    component.multiselectConfigs = mockMultiselectConfigs;
    component.initialVisibleCount = 2;
    component.multiselectFormGroup = new FormGroup({
      testControl1: new FormControl([]),
      testControl2: new FormControl([]),
      testControl3: new FormControl([])
    });

    fixture.detectChanges();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct group title', () => {
    const titleElement = fixture.debugElement.query(By.css('.multiselect-group__title'));
    expect(titleElement.nativeElement.textContent).toContain('Test Group');
  });

  it('should show only the initial number of multiselects when showAll is false', () => {
    expect(component.visibleMultiselects.length).toBe(2);
  });

  it('should toggle to show all multiselects when toggleShowAll is called', () => {
    component.toggleShowAll();
    fixture.detectChanges();
    expect(component.visibleMultiselects.length).toBe(3);
    component.toggleShowAll();
    fixture.detectChanges();
    expect(component.visibleMultiselects.length).toBe(2);
  });

  it('should correctly compute the number of hidden multiselects', () => {
    expect(component.hiddenCount).toBe(1);
  });

  it('should bind form controls to each multiselect component', () => {
    const multiselectElements = fixture.debugElement.queryAll(By.css('p-multiSelect'));
    expect(multiselectElements.length).toBe(2); // initialVisibleCount is 2

    multiselectElements.forEach((el, index) => {
      const controlName = mockMultiselectConfigs[index].controlName;
      expect(el.attributes['ng-reflect-name']).toBe(controlName);
    });
  });
});
