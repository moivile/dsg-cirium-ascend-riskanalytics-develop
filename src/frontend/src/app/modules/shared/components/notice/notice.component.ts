import { Component, Input } from '@angular/core';
import { ToastMessageOptions } from 'primeng/api';

@Component({
  selector: 'ra-notice',
  templateUrl: './notice.component.html',
  standalone: false
})
export class NoticeComponent {
  @Input()
  message!: ToastMessageOptions;
}
