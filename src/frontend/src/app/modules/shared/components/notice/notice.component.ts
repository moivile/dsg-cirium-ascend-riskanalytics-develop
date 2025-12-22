import { Component, Input } from '@angular/core';
import { Message } from 'primeng/api';

@Component({
  selector: 'ra-notice',
  templateUrl: './notice.component.html'
})
export class NoticeComponent {
  @Input()
  message!: Message;
}
