import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'booleanToWord',
    standalone: false
})
export class BooleanToWordPipe implements PipeTransform {
  transform(value: boolean): string {
    return value === true ? 'Yes' : value === false ? 'No' : '';
  }
}
