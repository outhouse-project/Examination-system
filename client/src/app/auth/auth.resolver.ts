import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs';

export const authResolver: ResolveFn<boolean> = (route, state) => {
  const authService = inject(AuthService);

  return authService.fetchUser().pipe(
    map((user) => {
      return !!user;
    })
  );
};