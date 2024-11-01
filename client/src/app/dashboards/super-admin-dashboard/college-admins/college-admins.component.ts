import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-college-admins',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './college-admins.component.html',
  styleUrl: './college-admins.component.css'
})
export class CollegeAdminsComponent {
  showCollegeAdminForm: boolean = false;
  collegeAdminForm: FormGroup;
  createdUserDetails: any;
  collegeAdmins: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.collegeAdminForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
    this.showCollegeAdmins();
  }

  openCollegeAdminForm() {
    this.showCollegeAdminForm = true;
  }

  onCreateCollegeAdmin() {
    if (this.collegeAdminForm.valid) {
      this.http.post<any>(environment.baseURL + 'accounts/create-college-admin/', this.collegeAdminForm.value).subscribe({
        next: (response) => {
          this.showCollegeAdminForm = false;
          this.createdUserDetails = this.collegeAdminForm.value;
          this.createdUserDetails.username = response.username;
          this.collegeAdminForm.reset();
          this.showCollegeAdmins();
        },
        error: (err) => {
          alert('Error: ' + err.message);
        },
      });
    }
  }
  showCollegeAdmins() {
    this.http.get<any>(environment.baseURL + 'accounts/get-college-admins/').subscribe(data => {
      this.collegeAdmins = data.college_admins;
    });
  }
}