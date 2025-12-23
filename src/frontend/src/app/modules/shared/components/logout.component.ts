import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';

@Component({
    template: '',
    standalone: false
})
export class LogoutComponent implements OnInit {
  constructor(private readonly authService: AuthService, private readonly router: Router) {
  }

  ngOnInit(): void {
    if (this.router.url === '/logout') {
        setTimeout(() =>
          this.authService
            .logout({logoutParams: {returnTo: document.location.origin}})
            .subscribe(),
        300);
    }
  }
}
