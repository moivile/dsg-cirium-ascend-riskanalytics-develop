import { EventEmitter, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogOptions } from '../models/confirmation-dialog-options';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService extends DialogService {
  public confirm(options: ConfirmationDialogOptions): EventEmitter<{}> {
    const onOk = new EventEmitter();
    this.open(ConfirmationDialogComponent, {
      header: options.header || 'Confirm',
      styleClass: options.styleClass,
      width: options.width || '740px',
      data: {
        body: options.body || 'Are you sure?',
        cancelButtonText: options.cancelButtonText,
        okButtonText: options.okButtonText,
        onOk
      }
    });
    return onOk;
  }
}
