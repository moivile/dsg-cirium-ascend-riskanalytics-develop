import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetWatchRoutingModule } from './asset-watch-routing.module';
import { AssetWatchTabComponent } from './components/asset-watch-tab/asset-watch-tab.component';
import { SharedModule } from '../shared/shared.module';
import { TooltipModule } from 'primeng/tooltip';
import { TreeSelectModule } from 'primeng/treeselect';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { AssetWatchDetailsTableComponent } from './components/asset-watch-details-table/asset-watch-details-table.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { BaseChartDirective } from 'ng2-charts';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { AssetWatchFilterComponent } from './components/asset-watch-filter/asset-watch-filter.component';
import { AssetWatchService } from './services/asset-watch.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { AssetWatchSummaryService } from './services/asset-watch-summary.service';
import { AssetWatchStackedBarChartComponent } from './components/asset-watch-stacked-bar-chart/asset-watch-stacked-bar-chart.component';
import { AssetWatchAccordionComponent } from './components/asset-watch-accordion/asset-watch-accordion.component';
import { AssetWatchFlightDetailsTableComponent } from './components/asset-watch-flight-details-table/asset-watch-flight-details-table.component';
import { AssetWatchUpsellComponent } from './components/asset-watch-upsell/asset-watch-upsell.component';
import { BaseUpsellPageComponent } from '../shared/components/base-upsell-page/base-upsell-page.component';
import { MenuModule } from 'primeng/menu';
import { AssetWatchSavedSearchDetailsComponent } from './components/asset-watch-saved-search-details/asset-watch-saved-search-details.component';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SavedSearchesService } from './services/saved-searches.service';
import { AssetWatchSaveSearchManagementComponent } from './components/asset-watch-save-search-management/asset-watch-save-search-management.component';
import { AssetWatchSavedSearchFiltersViewComponent } from './components/asset-watch-saved-search-filters-view/asset-watch-saved-search-filters-view.component';

@NgModule({
  declarations: [
    AssetWatchTabComponent,
    AssetWatchDetailsTableComponent,
    AssetWatchFilterComponent,
    AssetWatchStackedBarChartComponent,
    AssetWatchAccordionComponent,
    AssetWatchFlightDetailsTableComponent,
    AssetWatchUpsellComponent,
    AssetWatchSavedSearchDetailsComponent,
    AssetWatchSaveSearchManagementComponent,
    AssetWatchSavedSearchFiltersViewComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    AssetWatchRoutingModule,
    SharedModule,
    TooltipModule,
    TreeSelectModule,
    DropdownModule,
    DynamicDialogModule,
    InputNumberModule,
    TableModule,
    DialogModule,
    CalendarModule,
    BaseChartDirective,
    ReactiveFormsModule,
    MultiSelectModule,
    BaseUpsellPageComponent,
    MenuModule,
    InputTextModule,
    TextareaModule,
    InputSwitchModule
  ],
  providers: [AssetWatchService, AssetWatchSummaryService, SavedSearchesService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AssetWatchModule { }
