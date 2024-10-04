import { Component } from '@angular/core';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [DashboardNavbarComponent, RouterLink],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent {

}
