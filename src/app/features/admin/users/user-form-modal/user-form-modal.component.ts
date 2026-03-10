import { Component, EventEmitter, Output, ViewChild, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { UsersService } from '../../../../core/services/users.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { User, Branch, Group } from '../../../../core/models/inventory.models';

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

        <div class="form-row">
          <div class="form-group">
            <app-input
              [(ngModel)]="firstName"
              name="firstName"
              label="First Name *"
              type="text"
              placeholder="Enter first name"
              [required]="true"
            ></app-input>
          </div>
          <div class="form-group">
            <app-input
              [(ngModel)]="middleName"
              name="middleName"
              label="Middle Name"
              type="text"
              placeholder="Enter middle name"
            ></app-input>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <app-input
              [(ngModel)]="lastName"
              name="lastName"
              label="Last Name *"
              type="text"
              placeholder="Enter last name"
              [required]="true"
            ></app-input>
          </div>
          <div class="form-group">
            <app-input
              [(ngModel)]="secondLastName"
              name="secondLastName"
              label="Second Last Name"
              type="text"
              placeholder="Enter second last name"
            ></app-input>
          </div>
        </div>

        <div class="form-group">
          <app-input
            [(ngModel)]="email"
            name="email"
            label="Email"
            type="email"
            placeholder="Enter email"
          ></app-input>
        </div>

        <div class="form-group">
          <label class="form-label">Groups *</label>
          <div class="multi-select-list">
            <label *ngFor="let group of groups()" class="checkbox-label">
              <input
                type="checkbox"
                [checked]="selectedGroupReferences.includes(group.id)"
                (change)="toggleGroup(group.id)"
                class="checkbox"
              />
              <span>{{ group.name }} ({{ group.code }})</span>
            </label>
          </div>
          <span *ngIf="groupError()" class="error-text">{{ groupError() }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Branches</label>
          <div class="multi-select-list">
            <label *ngFor="let branch of branches()" class="checkbox-label">
              <input
                type="checkbox"
                [checked]="selectedBranchReferences.includes(branch.id)"
                (change)="toggleBranch(branch.id)"
                class="checkbox"
              />
              <span>{{ branch.name }} ({{ branch.code }})</span>
            </label>
          </div>
          <p class="hint-text">Assign branches for non-admin users</p>
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .form-label {
      display: block;
      margin-bottom: var(--space-2);
      font-size: 0.875rem;
      font-weight: 500;
      color: #404040;
    }

    .multi-select-list {
      max-height: 160px;
      overflow-y: auto;
      border: 1px solid #d4d4d4;
      border-radius: 0.375rem;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      cursor: pointer;
      font-size: 0.875rem;
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
  @Input() groups = signal<Group[]>([]);

  private usersService = inject(UsersService);
  private toastService = inject(ToastService);

  // Form fields
  username = '';
  password = '';
  firstName = '';
  middleName = '';
  lastName = '';
  secondLastName = '';
  email = '';
  selectedGroupReferences: string[] = [];
  selectedBranchReferences: string[] = [];
  isActive = true;

  // State
  loading = signal(false);
  error = signal('');
  usernameError = signal('');
  passwordError = signal('');
  groupError = signal('');
  isEditMode = signal(false);
  currentUser = signal<User | null>(null);

  // Computed
  modalTitle = signal('Create New User');
  modalSubtitle = signal('Add a new user to the system');
  submitButtonText = signal('Create User');

  open(user?: User): void {
    if (user) {
      this.isEditMode.set(true);
      this.currentUser.set(user);
      this.username = user.username;
      this.password = '';
      this.firstName = user.firstName || '';
      this.middleName = user.middleName || '';
      this.lastName = user.lastName || '';
      this.secondLastName = user.secondLastName || '';
      this.email = user.email || '';
      this.selectedGroupReferences = [...(user.groupReferences || [])];
      this.selectedBranchReferences = [...(user.branchReferences || [])];
      this.isActive = user.isActive;
      this.modalTitle.set('Edit User');
      this.modalSubtitle.set('Update user information');
      this.submitButtonText.set('Save Changes');
    } else {
      this.isEditMode.set(false);
      this.currentUser.set(null);
      this.username = '';
      this.password = '';
      this.firstName = '';
      this.middleName = '';
      this.lastName = '';
      this.secondLastName = '';
      this.email = '';
      this.selectedGroupReferences = [];
      this.selectedBranchReferences = [];
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

  toggleGroup(groupId: string): void {
    const idx = this.selectedGroupReferences.indexOf(groupId);
    if (idx >= 0) {
      this.selectedGroupReferences = this.selectedGroupReferences.filter(id => id !== groupId);
    } else {
      this.selectedGroupReferences = [...this.selectedGroupReferences, groupId];
    }
  }

  toggleBranch(branchId: string): void {
    const idx = this.selectedBranchReferences.indexOf(branchId);
    if (idx >= 0) {
      this.selectedBranchReferences = this.selectedBranchReferences.filter(id => id !== branchId);
    } else {
      this.selectedBranchReferences = [...this.selectedBranchReferences, branchId];
    }
  }

  isFormValid(): boolean {
    const hasUsername = this.username.trim().length > 0;
    const hasPassword = this.isEditMode() || this.password.trim().length >= 6;
    const hasFirstName = this.firstName.trim().length > 0;
    const hasLastName = this.lastName.trim().length > 0;
    const hasGroups = this.selectedGroupReferences.length > 0;
    return hasUsername && hasPassword && hasFirstName && hasLastName && hasGroups;
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

    if (this.selectedGroupReferences.length === 0) {
      this.groupError.set('At least one group is required');
      return false;
    }

    return true;
  }

  clearErrors(): void {
    this.error.set('');
    this.usernameError.set('');
    this.passwordError.set('');
    this.groupError.set('');
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
      firstName: this.firstName.trim(),
      middleName: this.middleName.trim() || undefined,
      lastName: this.lastName.trim(),
      secondLastName: this.secondLastName.trim() || undefined,
      email: this.email.trim() || undefined,
      groupReferences: this.selectedGroupReferences,
      branchReferences: this.selectedBranchReferences,
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
      firstName: this.firstName.trim(),
      middleName: this.middleName.trim() || undefined,
      lastName: this.lastName.trim(),
      secondLastName: this.secondLastName.trim() || undefined,
      email: this.email.trim() || undefined,
      groupReferences: this.selectedGroupReferences,
      branchReferences: this.selectedBranchReferences,
      isActive: this.isActive
    };

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
    this.firstName = '';
    this.middleName = '';
    this.lastName = '';
    this.secondLastName = '';
    this.email = '';
    this.selectedGroupReferences = [];
    this.selectedBranchReferences = [];
    this.isActive = true;
    this.clearErrors();
    this.loading.set(false);
    this.isEditMode.set(false);
    this.currentUser.set(null);
  }
}
