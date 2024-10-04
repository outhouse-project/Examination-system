import { Injectable, signal } from '@angular/core';
import { User } from './user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = signal<User | null>(null);
}