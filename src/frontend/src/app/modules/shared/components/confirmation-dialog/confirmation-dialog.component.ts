import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'ra-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    standalone: false
})
export class ConfirmationDialogComponent {
  private isClosedByButton = false;
  constructor(private readonly dynamicDialogRef: DynamicDialogRef, public readonly dynamicDialogConfig: DynamicDialogConfig) {
    this.dynamicDialogRef.onClose.subscribe(() => {
      if (this.dynamicDialogConfig.data?.onClose && !this.isClosedByButton) {
        this.dynamicDialogConfig.data.onClose.emit(false);
      }
    });
  }

  public onCancelClick(): void {
    this.isClosedByButton = true;
    this.dynamicDialogRef.close();
    if (this.dynamicDialogConfig.data?.onClose) {
      this.dynamicDialogConfig.data.onClose.emit(false);
    }
  }

  public onOkClick(): void {
    this.isClosedByButton = true;
    this.dynamicDialogRef.close();
    if (this.dynamicDialogConfig.data?.onOk) {
      this.dynamicDialogConfig.data.onOk.emit();
    }

    if (this.dynamicDialogConfig.data?.onClose) {
      this.dynamicDialogConfig.data.onClose.emit(true);
    }
  }
}
