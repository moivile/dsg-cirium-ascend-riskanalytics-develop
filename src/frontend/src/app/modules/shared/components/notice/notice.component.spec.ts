import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoticeComponent } from './notice.component';
import { ToastMessageOptions } from 'primeng/api';

describe('NoticeComponent', () => {
  let component: NoticeComponent;
  let fixture: ComponentFixture<NoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoticeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NoticeComponent);
    component = fixture.componentInstance;
    component.message = testMessage;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const testMessage: ToastMessageOptions = {
    severity: 'success',
    summary: 'Summary',
    detail: 'Detail'
  };
});
