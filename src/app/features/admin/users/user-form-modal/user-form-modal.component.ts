import { Component, EventEmitter, Output, ViewChild, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { UsersService } from '../../../../core/services/users.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { User, Branch } from '../../../../core/models/inventory.models';

@Component({
  selector: 'app-user-form-modal',
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
    <app-modal #modal [title]="modalTitle()" [subtitle]="modalSubtitle()" (closeModal)="onCancel()">
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
            [(ngModel)]="username"
            name="username"
            label="Username"
            type="text"
            placeholder="Enter username"
            [required]="true"
            [disabled]="isEditMode()"
            [error]="usernameError()"
            hint="Unique username for login"
          ></app-input>
        </div>

        <div class="form-group">
          <app-input
            [(ngModel)]="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter password"
            [required]="!isEditMode()"
            [error]="passwordError()"
            [hint]="isEditMode() ? 'Leave blank to keep current password' : 'Minimum 6 characters'"
          ></app-input>
        </div>

        <div class="form-group">
          <label class="form-label">Role *</label>
          <select
            [(ngModel)]="role"
            name="role"
            class="form-select"
            [class.error]="roleError()"
            required
          >
            <option value="">Select a role</option>
            <option value="Admin">Admin</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Seller">Seller</option>
            <option value="StoreSeller">StoreSeller</option>
          </select>
          <span *ngIf="roleError()" class="error-text">{{ roleError() }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Branch</label>
          <select
            [(ngModel)]="branchId"
            name="branchId"
            class="form-select"
          >
            <option value="">No branch assigned</option>
            <option *ngFor="let branch of branches()" [value]="branch.id">
              {{ branch.name }} ({{ branch.code }})
            </option>
          </select>
          <p class="hint-text">Required for StoreSeller users</p>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              [(ngModel)]="isActive"
              name="isActive"
              class="checkbox"
            />
            <span>Active User</span>
          </label>
          <p class="hint-text">Inactive users cannot log in</p>
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
            {{ submitButtonText() }}
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .form-group {
      margin-bottom: var(--space-4);
    }

    .form-label {
      display: block;
      margin-bottom: var(--space-2);
      font-size: 0.875rem;
      font-weight: 500;
      color: #404040;
    }

    .form-select {
      width: 100%;
      padding: 0.625rem 0.75rem;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: #404040;
      background-color: #ffffff;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-select.error {
      border-color: #dc2626;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      font-size: 0.9375rem;
      color: #404040;
    }

    .checkbox {
      width: 1.125rem;
      height: 1.125rem;
      cursor: pointer;
    }

    .hint-text {
      margin: var(--space-1) 0 0;
      font-size: 0.8125rem;
      color: #737373;
    }

    .error-text {
      display: block;
      margin-top: var(--space-1);
      font-size: 0.8125rem;
      color: #dc2626;
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
export class UserFormModalComponent {
  @ViewChild('modal') modal!: ModalComponent;
  @Output() userSaved = new EventEmitter<User>();
  @Input() branches = signal<Branch[]>([]);

  private usersService = inject(UsersService);
  private toastService = inject(ToastService);

  // Form fields
  username = '';
  password = '';
  role = '';
  branchId = '';
  isActive = true;

  // State
  loading = signal(false);
  error = signal('');
  usernameError = signal('');
  passwordError = signal('');
  roleError = signal('');
  isEditMode = signal(false);
  currentUser = signal<User | null>(null);

  // Computed
  modalTitle = signal('Create New User');
  modalSubtitle = signal('Add a new user to the system');
  submitButtonText = signal('Create User');

  open(user?: User): void {
    if (user) {
      // Edit mode
      this.isEditMode.set(true);
      this.currentUser.set(user);
      this.username = user.username;
      this.password = '';
      this.role = user.role;
      this.branchId = user.branchId || '';
      this.isActive = user.isActive;
      this.modalTitle.set('Edit User');
      this.modalSubtitle.set('Update user information');
      this.submitButtonText.set('Save Changes');
    } else {
      // Create mode
      this.isEditMode.set(false);
      this.currentUser.set(null);
      this.username = '';
      this.password = '';
      this.role = '';
      this.branchId = '';
      this.isActive = true;
      this.modalTitle.set('Create New User');
      this.modalSubtitle.set('Add a new user to the system');
      this.submitButtonText.set('Create User');
    }

    this.clearErrors();
    this.modal.open();
  }

  close(): void {
    this.modal.close();
    this.resetForm();
  }

  isFormValid(): boolean {
    const hasUsername = this.username.trim().length > 0;
    const hasPassword = this.isEditMode() || this.password.trim().length >= 6;
    const hasRole = this.role.trim().length > 0;
    return hasUsername && hasPassword && hasRole;
  }

  validateForm(): boolean {
    this.clearErrors();

    if (!this.username.trim()) {
      this.usernameError.set('Username is required');
      return false;
    }

    if (!this.isEditMode() && !this.password.trim()) {
      this.passwordError.set('Password is required');
      return false;
    }

    if (this.password.trim() && this.password.trim().length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      return false;
    }

    if (!this.role.trim()) {
      this.roleError.set('Role is required');
      return false;
    }

    return true;
  }

  clearErrors(): void {
    this.error.set('');
    this.usernameError.set('');
    this.passwordError.set('');
    this.roleError.set('');
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    if (this.isEditMode()) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private createUser(): void {
    this.usersService.createUser({
      username: this.username.trim(),
      password: this.password.trim(),
      role: this.role,
      branchId: this.branchId.trim() || undefined,
      isActive: this.isActive
    }).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.toastService.success('User created successfully');
        this.userSaved.emit(user);
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Create user error:', err);

        if (err.status === 400) {
          this.error.set(err.error?.errorMessage || 'Invalid user data');
        } else if (err.status === 409) {
          this.error.set('A user with this username already exists');
        } else {
          this.error.set(err.error?.errorMessage || 'Failed to create user. Please try again.');
        }
      }
    });
  }

  private updateUser(): void {
    const userId = this.currentUser()?.id;
    if (!userId) return;

    const updateData: any = {
      role: this.role,
      isActive: this.isActive
    };

    if (this.branchId.trim()) {
      updateData.branchId = this.branchId.trim();
    }

    if (this.password.trim()) {
      updateData.password = this.password.trim();
    }

    this.usersService.updateUser(userId, updateData).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.toastService.success('User updated successfully');
        this.userSaved.emit(user);
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Update user error:', err);
        this.error.set(err.error?.errorMessage || 'Failed to update user. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.close();
  }

  private resetForm(): void {
    this.username = '';
    this.password = '';
    this.role = '';
    this.branchId = '';
    this.isActive = true;
    this.clearErrors();
    this.loading.set(false);
    this.isEditMode.set(false);
    this.currentUser.set(null);
  }
}
