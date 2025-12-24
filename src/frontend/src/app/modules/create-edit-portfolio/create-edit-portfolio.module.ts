import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateEditPortfolioRoutingModule } from './create-edit-portfolio-routing.modules';
import { CreateEditPortfolioTabComponent } from './components/create-edit-portfolio-tab/create-edit-portfolio-tab.component';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { AircraftSearchPopupComponent } from './components/aircraft-search-popup/aircraft-search-popup.component';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from '../shared/shared.module';
import { AircraftService } from './services/aircraft.service';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
  declarations: [CreateEditPortfolioTabComponent, AircraftSearchPopupComponent],
  imports: [
    CommonModule,
    CreateEditPortfolioRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    TableModule,
    DynamicDialogModule,
    InputTextModule,
    SharedModule,
    SelectModule,
    CheckboxModule,
    MultiSelectModule
  ],
  providers: [AircraftService]
})
export class CreateEditPortfolioModule { }
