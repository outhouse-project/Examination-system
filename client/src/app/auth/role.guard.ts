import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = this.authService.user();

    if (!user) {
      return this.router.createUrlTree(['/login']);
    }

    const expectedRole = route.data['role'] as string;

    if (user.role === expectedRole) {
      return true;
    }
    return false;
  }
}