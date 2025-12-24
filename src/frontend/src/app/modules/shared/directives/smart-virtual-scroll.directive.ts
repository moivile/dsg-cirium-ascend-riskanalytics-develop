import { Directive, Input, OnChanges, inject } from '@angular/core';
import { MultiSelect } from 'primeng/multiselect';

@Directive({
  selector: 'p-multiSelect[raSmartVirtualScroll]',
  standalone: true
})
export class SmartVirtualScrollDirective implements OnChanges {
  private static readonly THRESHOLD = 5;

  @Input({ required: true }) options: any[] | null | undefined;

  private readonly ms = inject(MultiSelect);

  ngOnChanges(): void {
    const len = this.options?.length ?? 0;
    const enable = len >= SmartVirtualScrollDirective.THRESHOLD;
    this.ms.virtualScroll = enable;
  }
}
