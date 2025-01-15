import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarOption } from '../sidebar/sidebar-option.interface';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-college-admin-dashboard',
  standalone: true,
  imports: [DashboardNavbarComponent, SidebarComponent, RouterOutlet],
  templateUrl: './college-admin-dashboard.component.html',
  styleUrl: './college-admin-dashboard.component.css'
})
export class CollegeAdminDashboardComponent {
  sidebarList: SidebarOption[] = [
    { label: 'Dashboard', path: './' },
    { label: 'Students', path: 'students' },
    { label: 'Exams', path: 'exams' },
    { label: 'Results', path: 'results' }
  ];
}