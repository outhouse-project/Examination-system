import { Injectable, signal } from '@angular/core';
import { User } from './user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);

  constructor(private http: HttpClient) { }

  fetchUser(): Observable<User | null> {
    if (this.user()) {
      return of(this.user());
    } else {
      return this.http.get<User>(environment.baseURL + 'accounts/user/').pipe(
        map((response: any) => {
          this.user.set(response.user);
          return response.user;
        }),
        catchError((error) => {
          this.user.set(null);
          return of(null);
        })
      );
    }
  }
}