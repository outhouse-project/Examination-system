import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';
import { RouterOutlet } from '@angular/router';
import { SidebarOption } from '../sidebar/sidebar-option.interface';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [DashboardNavbarComponent, SidebarComponent, RouterOutlet],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css'
})
export class SuperAdminDashboardComponent {
  sidebarList: SidebarOption[] = [
    { label: 'Dashboard', path: './' },
    { label: 'College Admins', path: 'college-admins' },
  ];
}