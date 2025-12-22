import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  constructor(private messageService: MessageService) {}

  success(message: string, title = 'Success'): void {
    this.messageService.add({ severity: 'success', summary: title, detail: message });
  }
  error(message: string, title = 'Error'): void {
    this.messageService.add({ severity: 'error', summary: title, detail: message });
  }
  info(message: string, title = 'Info'): void {
    this.messageService.add({ severity: 'info', summary: title, detail: message });
  }
  warning(message: string, title = 'Warning'): void {
    this.messageService.add({ severity: 'warn', summary: title, detail: message });
  }
}
