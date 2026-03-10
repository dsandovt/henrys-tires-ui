import { Component, EventEmitter, Output, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { UsersService } from '../../../../core/services/users.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    InputComponent,
    ButtonComponent,
    AlertComponent
  ],
  template: `
    <app-modal #modal title="Reset Password" [subtitle]="'Reset password for ' + username()" (closeModal)="onCancel()">
      <form (ngSubmit)="onSubmit()">
        <app-alert
          *ngIf="error()"
          variant="danger"
          [dismissible]="true"
          (close)="error.set('')"
        >
          {{ error() }}
        </app-alert>

        <div class="form-group">
          <app-input
            [(ngModel)]="newPassword"
            name="newPassword"
            label="New Password"
            type="password"
            placeholder="Enter new password"
            [required]="true"
            [error]="newPasswordError()"
            hint="Minimum 6 characters"
          ></app-input>
        </div>

        <div class="form-group">
          <app-input
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            [required]="true"
            [error]="confirmPasswordError()"
          ></app-input>
        </div>

        <div class="form-actions">
          <app-button
            type="button"
            variant="secondary"
            (click)="onCancel()"
            [disabled]="loading()"
          >
            Cancel
          </app-button>
          <app-button
            type="submit"
            variant="primary"
            [loading]="loading()"
            [disabled]="!isFormValid()"
          >
            Reset Password
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .form-group {
      margin-bottom: var(--space-4);
    }

    .form-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--color-border);
    }
  `]
})
export class ResetPasswordModalComponent {
  @ViewChild('modal') modal!: ModalComponent;
  @Output() passwordReset = new EventEmitter<void>();

  private usersService = inject(UsersService);
  private toastService = inject(ToastService);

  userId = signal('');
  username = signal('');
  newPassword = '';
  confirmPassword = '';

  loading = signal(false);
  error = signal('');
  newPasswordError = signal('');
  confirmPasswordError = signal('');

  open(userId: string, username: string): void {
    this.userId.set(userId);
    this.username.set(username);
    this.newPassword = '';
    this.confirmPassword = '';
    this.clearErrors();
    this.modal.open();
  }

  close(): void {
    this.modal.close();
    this.newPassword = '';
    this.confirmPassword = '';
    this.clearErrors();
    this.loading.set(false);
  }

  isFormValid(): boolean {
    return this.newPassword.trim().length >= 6 && this.confirmPassword.trim().length >= 6;
  }

  validateForm(): boolean {
    this.clearErrors();

    if (!this.newPassword.trim()) {
      this.newPasswordError.set('New password is required');
      return false;
    }

    if (this.newPassword.trim().length < 6) {
      this.newPasswordError.set('Password must be at least 6 characters');
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.confirmPasswordError.set('Passwords do not match');
      return false;
    }

    return true;
  }

  clearErrors(): void {
    this.error.set('');
    this.newPasswordError.set('');
    this.confirmPasswordError.set('');
  }

  onSubmit(): void {
    if (!this.validateForm()) return;

    this.loading.set(true);
    this.error.set('');

    this.usersService.resetPassword(this.userId(), this.newPassword.trim()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastService.success('Password reset successfully');
        this.passwordReset.emit();
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.errorMessage || 'Failed to reset password. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.close();
  }
}
