import { Component } from '@angular/core';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';
import { RouterOutlet } from '@angular/router';
import { SidebarOption } from '../sidebar/sidebar-option.interface';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [DashboardNavbarComponent, SidebarComponent, RouterOutlet],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent {
  sidebarList: SidebarOption[] = [
    { label: 'Dashboard', path: './' },
    { label: 'Exams', path: 'exams' },
    { label: 'Results', path: 'results' },
  ];
}