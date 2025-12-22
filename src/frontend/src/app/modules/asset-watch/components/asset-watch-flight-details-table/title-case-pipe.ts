
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titleCase'
})
export class TitleCasePipe implements PipeTransform {
  transform(input: string): string {
    if (!input) {return '';}
    const words = input.split(' ');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}
