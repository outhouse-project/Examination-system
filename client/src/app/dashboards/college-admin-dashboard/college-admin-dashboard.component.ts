import { Component } from '@angular/core';
import { DashboardNavbarComponent } from '../dashboard-navbar/dashboard-navbar.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-college-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardNavbarComponent, ReactiveFormsModule],
  templateUrl: './college-admin-dashboard.component.html',
  styleUrl: './college-admin-dashboard.component.css'
})
export class CollegeAdminDashboardComponent {
  showStudentForm: boolean = false;
  studentForm: FormGroup;
  createdUserDetails: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.studentForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  openStudentForm() {
    this.showStudentForm = true;
  }

  onCreateStudent() {
    if (this.studentForm.valid) {
      this.http.post<any>(environment.baseURL + 'accounts/create-student/', this.studentForm.value).subscribe({
        next: (response) => {
          this.showStudentForm = false;
          this.createdUserDetails = this.studentForm.value;
          this.createdUserDetails.username = response.username;
          this.studentForm.reset();
        },
        error: (err) => {
          alert('Error: ' + err.message);
        },
      });
    }
  }

  onCreateExam() { }
}