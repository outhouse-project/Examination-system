import { Component } from '@angular/core';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';

@Component({
  selector: 'app-college-admin-dashboard',
  standalone: true,
  imports: [DashboardNavbarComponent],
  templateUrl: './college-admin-dashboard.component.html',
  styleUrl: './college-admin-dashboard.component.css'
})
export class CollegeAdminDashboardComponent {

}
