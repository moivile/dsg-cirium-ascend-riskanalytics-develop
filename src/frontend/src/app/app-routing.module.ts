import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import { LogoutComponent } from './modules/shared/components/logout.component';
import { ErrorNotFoundComponent } from './modules/shared/components/error-not-found/error-not-found.component';
import { IdNumberGuard } from './guards/id-number.guard';
import { AppUserResolver } from './app-user.resolver';
import { AppUserGuard } from './guards/app-user.guard';
import { AssetWatchGuard } from './guards/asset-watch.guard';
import { EmissionsGuard } from './guards/emissions.guard';
import { EmissionsUpsellComponent } from './modules/emissions/components/emissions-upsell/emissions-upsell.component';
import { AssetWatchUpsellComponent } from './modules/asset-watch/components/asset-watch-upsell/asset-watch-upsell.component';
import {
  assetWatchRoute,
  assetWatchSavedSearchesRoute,
  assetWatchUpsellRoute,
  emissionsUpsellRoute,
  fleetInsightsRoute
} from './route.constants';
import { PortfoliosLoadedGuard } from './guards/portfolios-loaded.guard';

const routes: Routes = [
  {
    path: '',
    resolve: {
      appUser: AppUserResolver
    },
    canActivateChild: [AuthGuard, AppUserGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'portfolios' },
      {
        path: 'portfolios/create',
        loadChildren: () =>
          import('./modules/create-edit-portfolio/create-edit-portfolio.module').then((mod) => mod.CreateEditPortfolioModule),
        pathMatch: 'full'
      },
      {
        path: 'portfolios/hours-and-cycles',
        canActivate: [PortfoliosLoadedGuard],
        loadChildren: () => import('./modules/hours-and-cycles/hours-and-cycles.module').then((mod) => mod.HoursAndCyclesModule),
        pathMatch: 'full'
      },
      {
        path: 'portfolios/:id/hours-and-cycles',
        canActivate: [IdNumberGuard],
        loadChildren: () => import('./modules/hours-and-cycles/hours-and-cycles.module').then((mod) => mod.HoursAndCyclesModule),
        pathMatch: 'full'
      },
      {
        path: 'portfolios/emissions',
        canActivate: [EmissionsGuard, PortfoliosLoadedGuard],
        loadChildren: () => import('./modules/emissions/emissions.module').then((mod) => mod.EmissionsModule),
        pathMatch: 'full'
      },
      {
        path: 'portfolios/:id/emissions',
        canActivate: [IdNumberGuard, EmissionsGuard],
        loadChildren: () => import('./modules/emissions/emissions.module').then((mod) => mod.EmissionsModule),
        pathMatch: 'full'
      },
      {
        path: 'portfolios/:id/asset-watch',
        canActivate: [AssetWatchGuard],
        loadChildren: () => import('./modules/asset-watch/asset-watch.module').then((mod) => mod.AssetWatchModule),
        pathMatch: 'full'
      },
      {
        path: assetWatchSavedSearchesRoute,
        canActivate: [AssetWatchGuard],
        loadChildren: () => import('./modules/asset-watch/asset-watch.module').then((mod) => mod.AssetWatchModule),
        pathMatch: 'full'
      },
      {
        path: assetWatchRoute,
        canActivate: [AssetWatchGuard, PortfoliosLoadedGuard],
        loadChildren: () => import('./modules/asset-watch/asset-watch.module').then((mod) => mod.AssetWatchModule),
        pathMatch: 'full'
      },
      {
        path: `${assetWatchSavedSearchesRoute}/:savedSearchId`,
        canActivate: [AssetWatchGuard, PortfoliosLoadedGuard],
        loadChildren: () => import('./modules/asset-watch/asset-watch.module').then((mod) => mod.AssetWatchModule),
        pathMatch: 'full'
      },
      {
        path: 'portfolios/:id/edit',
        canActivate: [IdNumberGuard],
        loadChildren: () =>
          import('./modules/create-edit-portfolio/create-edit-portfolio.module').then((mod) => mod.CreateEditPortfolioModule),
        pathMatch: 'full'
      },
      {
        path: 'portfolios/:id',
        canActivate: [IdNumberGuard, PortfoliosLoadedGuard],
        loadChildren: () => import('./modules/portfolio-overview/portfolio-overview.module').then((mod) => mod.PortfolioOverviewModule),
        pathMatch: 'full'
      },
      {
        path: 'portfolios',
        loadChildren: () => import('./modules/landing/landing.module').then((mod) => mod.LandingModule),
        pathMatch: 'full'
      },
      {
        path: 'logout',
        pathMatch: 'full',
        component: LogoutComponent
      },
      {
        path: fleetInsightsRoute,
        loadChildren: () => import('./modules/fleet-insights/fleet-insights.module').then((m) => m.FleetInsightsModule)
      }
    ]
  },
  {
    path: emissionsUpsellRoute,
    component: EmissionsUpsellComponent,
    pathMatch: 'full'
  },
  {
    path: assetWatchUpsellRoute,
    component: AssetWatchUpsellComponent,
    pathMatch: 'full'
  },
  {
    path: '404',
    component: ErrorNotFoundComponent,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
