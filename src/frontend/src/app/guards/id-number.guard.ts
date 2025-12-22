import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
@Injectable({
    providedIn: 'root'
})
export class IdNumberGuard  {
    constructor(private readonly router: Router){
    }
    canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot):boolean {
        if(isNaN(activatedRouteSnapshot.params['id'])){
            this.router.navigate(['/404']).then();
            return false;
         }
        return true;
    }
}
