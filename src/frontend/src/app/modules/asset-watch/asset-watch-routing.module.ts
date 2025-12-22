import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivateFn, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { AssetWatchTabComponent } from './components/asset-watch-tab/asset-watch-tab.component';
import { Observable } from 'rxjs';

export const canDeactivateAssetWatchTab: CanDeactivateFn<AssetWatchTabComponent> = (
  component: AssetWatchTabComponent,
  _currentRoute: ActivatedRouteSnapshot,
  _currentState: RouterStateSnapshot,
  nextState?: RouterStateSnapshot
): boolean | Observable<boolean> | Promise<boolean> => {
  if (nextState?.url && (nextState.url.includes('/asset-watch') || nextState.url.includes('/404'))) {
    return true;
  }
  return component.canDeactivate();
};

const routes: Routes = [
  {
    path: '',
    component: AssetWatchTabComponent,
    canDeactivate: [canDeactivateAssetWatchTab]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetWatchRoutingModule {}
