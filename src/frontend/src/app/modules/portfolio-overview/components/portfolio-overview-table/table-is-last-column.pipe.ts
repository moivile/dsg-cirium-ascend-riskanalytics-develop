import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'isLastColumn'
})
export class IsLastColumnPipe implements PipeTransform {

  transform(columnIndex: any, columnLength: any): any {
    return (columnIndex === columnLength - 1);
  }
}
