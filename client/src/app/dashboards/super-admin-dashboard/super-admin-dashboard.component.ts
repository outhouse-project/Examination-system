import { Component } from '@angular/core';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardNavbarComponent, ReactiveFormsModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css'
})
export class SuperAdminDashboardComponent {
  showCollegeAdminForm: boolean = false;
  collegeAdminForm: FormGroup;
  createdUserDetails: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.collegeAdminForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  openCollegeAdminForm() {
    this.showCollegeAdminForm = true;
  }

  onCreateCollegeAdmin() {
    if (this.collegeAdminForm.valid) {
      this.http.post(environment.baseURL + 'accounts/create-college-admin', this.collegeAdminForm.value).subscribe({
        next: (response) => {
          alert('College admin created successfully!');
          this.showCollegeAdminForm = false;
          this.createdUserDetails = this.collegeAdminForm.value;
          this.collegeAdminForm.reset();
        },
        error: (err) => {
          alert('Error: ' + err.message);
          console.log(err);
        },
      });
    }
  }
}