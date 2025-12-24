import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import { LogoutComponent } from './modules/shared/components/logout.component';
import { ErrorNotFoundComponent } from './modules/shared/components/error-not-found/error-not-found.component';
import { AppUserResolver } from './app-user.resolver';
import { AppUserGuard } from './guards/app-user.guard';
import { fleetDistributionRoute } from './route.constants';

const routes: Routes = [
  {
    path: '',
    resolve: {
      appUser: AppUserResolver
    },
    canActivateChild: [AuthGuard, AppUserGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: fleetDistributionRoute },
      {
        path: 'logout',
        pathMatch: 'full',
        component: LogoutComponent
      },
      {
        path: '',
        loadChildren: () => import('./modules/fleet-insights/fleet-insights.module').then((m) => m.FleetInsightsModule)
      }
    ]
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
