import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '@env/environment';

export const devBypassGuard: CanActivateFn = (
  _r: ActivatedRouteSnapshot,
  _s: RouterStateSnapshot
) => {
  return environment.dashboardDevBypass ? true : true; // always allow for now; flip later if you want stricter behavior
};
