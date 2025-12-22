import { Component, OnInit } from '@angular/core';
import { AppConfigService } from '../../../../app-config.service';

@Component({
  selector: 'ra-error-not-found',
  templateUrl: './error-not-found.component.html',
  styleUrls: ['./error-not-found.component.scss']
})
export class ErrorNotFoundComponent implements OnInit {

  constructor(private readonly appConfigService: AppConfigService) {
  }

  supportEmailAddress = '';

  ngOnInit(): void {
    this.supportEmailAddress = this.appConfigService.configuration.supportEmailAddress;
  }
}
