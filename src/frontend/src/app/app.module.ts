import { CUSTOM_ELEMENTS_SCHEMA, NgModule, APP_INITIALIZER, Injector, DoBootstrap } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthModule, AuthHttpInterceptor } from '@auth0/auth0-angular';
import { AppConfigService } from './app-config.service';
import { SharedModule } from './modules/shared/shared.module';
import { NgProgressModule } from 'ngx-progressbar';
import { NgProgressHttpModule } from 'ngx-progressbar/http';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { AppStore } from './app-store';
import { TooltipModule } from 'primeng/tooltip';
import { createCustomElement } from '@angular/elements';
import { EvBadge } from '@flightstats/evolve-components/dist/ev-badge';
import { AssetWatchStore } from './modules/asset-watch/services/asset-watch-store';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

function initializeApp(appConfigService: AppConfigService): () => Promise<void> {
  return (): Promise<void> => {
    return appConfigService.load();
  };
}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], imports: [BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AuthModule.forRoot(),
    SharedModule,
    NgProgressModule,
    NgProgressHttpModule,
    ToastModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    TooltipModule], providers: [
      { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
      {
        provide: APP_INITIALIZER,
        useFactory: initializeApp,
        deps: [AppConfigService],
        multi: true
      },
      MessageService,
      { provide: 'WINDOW', useValue: window },
      AppStore,
      AssetWatchStore,
      provideHttpClient(withInterceptorsFromDi()),
      provideCharts(withDefaultRegisterables()),
      providePrimeNG({
        theme: {
          preset: Aura,
          options: { darkModeSelector: '.my-app-dark' }
        }
      })
    ]
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) { }

  ngDoBootstrap(): void {
    const EvBadgeElement = createCustomElement(EvBadge, {
      injector: this.injector
    });
    customElements.define('ev-badge', EvBadgeElement);
  }
}
