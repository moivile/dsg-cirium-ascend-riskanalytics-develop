import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SavedSearchesService } from '../../services/saved-searches.service';
import { duplicateSaveSearchValidator } from './save-search-validator';
import { AppStore } from '../../../../app-store';

@Component({
    selector: 'ra-saved-search-details',
    templateUrl: './asset-watch-saved-search-details.component.html',
    styleUrl: './asset-watch-saved-search-details.component.scss',
    standalone: false
})
export class AssetWatchSavedSearchDetailsComponent {
  form = this.formBuilder.group({
    name: [
      this.dynamicDialogConfig.data.updateNameAndDescription ? this.dynamicDialogConfig.data.savedSearch.name : '',
      {
        validators: [Validators.required, Validators.maxLength(100)],
        asyncValidators: [
          duplicateSaveSearchValidator(
            this.savedSearchesService,
            this.dynamicDialogConfig.data.updateNameAndDescription ? this.dynamicDialogConfig.data.savedSearch.name : undefined
          )
        ]
      }
    ],
    description: [
      this.dynamicDialogConfig.data.updateNameAndDescription ? this.dynamicDialogConfig.data.savedSearch.description : '',
      { validators: [Validators.maxLength(200)] }
    ],
    isActive: [false]
  });
  private isClosedByButton = false;
  constructor(
    private readonly dynamicDialogRef: DynamicDialogRef,
    public readonly dynamicDialogConfig: DynamicDialogConfig,
    private readonly savedSearchesService: SavedSearchesService,
    private readonly formBuilder: FormBuilder,
    public readonly appStore: AppStore
  ) {
    this.dynamicDialogRef.onClose.subscribe(() => {
      if (!this.isClosedByButton) {
        this.dynamicDialogConfig.data.onSaveClick.emit(null);
      }
    });
  }

  public onCancelClick(): void {
    this.isClosedByButton = true;
    this.dynamicDialogRef.close();
    this.dynamicDialogConfig.data.onSaveClick.emit(null);
  }

  public onSaveClick(): void {
    this.isClosedByButton = true;
    this.dynamicDialogRef.close();
    this.dynamicDialogConfig.data.onSaveClick.emit(this.form.value);
  }
}
