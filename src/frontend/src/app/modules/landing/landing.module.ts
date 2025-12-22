import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LandingRoutingModule } from './landing-routing.module';

import { LandingTabComponent } from './components/landing-tab/landing-tab.component';
import { LandingPortfoliosComponent } from './components/landing-portfolios/landing-portfolios.component';

import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [LandingTabComponent, LandingPortfoliosComponent],
  imports: [
    CommonModule,
    LandingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    TableModule,
    TooltipModule,
    DialogModule,
    DynamicDialogModule,
    InputTextModule
  ],
})
export class LandingModule {}
