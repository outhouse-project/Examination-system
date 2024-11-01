import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent {
  showStudentForm: boolean = false;
  studentForm: FormGroup;
  createdUserDetails: any;
  students: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.studentForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
    this.showStudents();
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
          this.showStudents();
        },
        error: (err) => {
          alert('Error: ' + err.message);
        },
      });
    }
  }

  showStudents() {
    this.http.get<any>(environment.baseURL + 'accounts/get-students/').subscribe(data => {
      this.students = data.students;
    });
  }
}