import { Component, effect } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-navbar.component.html',
  styleUrl: './dashboard-navbar.component.css'
})
export class DashboardNavbarComponent {
  firstName = '';
  lastName = '';
  showChangePasswordModal: boolean = false;
  changePasswordForm: FormGroup;

  constructor(private http: HttpClient, private authService: AuthService,
    private router: Router, private fb: FormBuilder) {
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.firstName = user.first_name;
        this.lastName = user.last_name;
      }
    });
    this.changePasswordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required,
         Validators.minLength(6)
      ]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  // Custom validator to check if the new password and confirm password match
  passwordsMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('new_password')?.value;
    const confirmPassword = group.get('confirm_password')?.value;

    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  openChangePasswordModal() {
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
  }

  onChangePasswordSubmit() {
    if (this.changePasswordForm.valid) {
      this.http.post(environment.baseURL + 'accounts/change-password/', {
        old_password: this.changePasswordForm.value.old_password,
        new_password: this.changePasswordForm.value.new_password
      }).subscribe({
        next: (response: any) => {
          alert('Password changed successfully!');
          this.closeChangePasswordModal();
          this.changePasswordForm.reset();
          window.location.reload();
        },
        error: (err) => {
          alert('Error: ' + err.error.error || err.message);
        }
      });
    } else {
      alert('Please make sure the form is valid and passwords match.');
    }
  }

  logout() {
    this.http.get(environment.baseURL + 'accounts/logout/').subscribe({
      next: (response: any) => {
        this.authService.user.set(null);
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        alert('Unable to logout!');
      }
    });
  }
}