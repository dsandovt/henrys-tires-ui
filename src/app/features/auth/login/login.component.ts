import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { Role } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent, AlertComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">Henry's Tires</h1>
          <p class="login-subtitle">Inventory Management System</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <app-alert *ngIf="error()" variant="danger" [dismissible]="true" (close)="error.set('')">
            {{ error() }}
          </app-alert>

          <app-input
            [(ngModel)]="username"
            name="username"
            label="Username"
            type="text"
            placeholder="Enter your username"
            [required]="true"
            [error]="usernameError()"
          ></app-input>

          <app-input
            [(ngModel)]="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            [required]="true"
            [error]="passwordError()"
          ></app-input>

          <app-button
            type="submit"
            variant="primary"
            size="lg"
            [fullWidth]="true"
            [loading]="loading()"
            [disabled]="!isFormValid()"
          >
            Sign In
          </app-button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';

  loading = signal(false);
  error = signal('');
  usernameError = signal('');
  passwordError = signal('');

  isFormValid(): boolean {
    return this.username.trim().length > 0 && this.password.length > 0;
  }

  validateForm(): boolean {
    this.usernameError.set('');
    this.passwordError.set('');

    if (!this.username.trim()) {
      this.usernameError.set('Username is required');
      return false;
    }

    if (!this.password) {
      this.passwordError.set('Password is required');
      return false;
    }

    return true;
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService
      .login({
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);

          // Redirect based on role
          const userRole = this.authService.userRole();
          if (userRole === Role.Admin) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/stock']);
          }
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Login error:', err);

          if (err.status === 401) {
            this.error.set('Invalid username or password');
          } else if (err.status === 0) {
            this.error.set('Cannot connect to server. Please try again later.');
          } else {
            this.error.set(err.error?.message || 'Login failed. Please try again.');
          }
        },
      });
  }
}
