import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'ra-back-link[backLink]',
    templateUrl: './back-link.component.html',
    styleUrls: ['./back-link.component.scss'],
    standalone: false
})
export class BackLinkComponent {
  @Input() backLink!: string;

  constructor(private readonly router: Router) {}

  onBackClick(): void {
    if (this.backLink !== null) {
      this.router.navigate([this.backLink]);
    }
  }
}
