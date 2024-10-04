import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // this.http.get(environment.baseURL + 'accounts/user/').subscribe({
    //   next: (response: any) => {
    //     const user = response.user;
    //     this.authService.user.set(user);
    //     this.authService.routeToDashboard(user.role);
    //   },
    //   error: (error: any) => {
    //     this.authService.user.set(null);
    //     this.router.navigate(['/login']);
    //   }
    // });
  }
}