import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { SavedSearchesService } from '../../services/saved-searches.service';

export function duplicateSaveSearchValidator(
  savedSearchesService: SavedSearchesService,
  nameToExclude?: string
): (control: AbstractControl) => Observable<ValidationErrors | null> {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (nameToExclude?.trim() === control.value?.trim()) {
      return of(null);
    }

    return savedSearchesService.isSavedSearchNameDuplicate(control.value).pipe(
      map((isDuplicate) => {
        return isDuplicate ? { duplicateSaveSearch: true } : null;
      })
    );
  };
}
