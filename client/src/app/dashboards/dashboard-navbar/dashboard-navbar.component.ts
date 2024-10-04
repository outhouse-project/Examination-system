import { Component, effect } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-navbar.component.html',
  styleUrl: './dashboard-navbar.component.css'
})
export class DashboardNavbarComponent {
  firstName: string = '';
  lastName: string = '';

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.firstName = user.first_name;
        this.lastName = user.last_name;
      }
    });
  }

  logout() {
    this.http.get(environment.baseURL + 'accounts/logout/').subscribe({
      next: (response: any) => {
        this.authService.user.set(null);
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        alert('Unable to logout!');
      }
    });
  }
}