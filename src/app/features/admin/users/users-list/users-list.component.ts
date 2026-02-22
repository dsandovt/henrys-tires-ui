import { Component, inject, signal, OnInit, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { BranchesService } from '../../../../core/services/branches.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { User, Branch } from '../../../../core/models/inventory.models';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { UserFormModalComponent } from '../user-form-modal/user-form-modal.component';
import { ResetPasswordModalComponent } from '../reset-password-modal/reset-password-modal.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent, UserFormModalComponent, ResetPasswordModalComponent],
  template: `
    <div class="users-list">
      <div class="page-header">
        <app-input [(ngModel)]="searchQuery" placeholder="Search users..." (ngModelChange)="onSearch()"></app-input>
        <app-button variant="primary" (click)="showCreateDialog()">+ Create User</app-button>
      </div>

      <app-card>
        <table class="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Active</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of displayUsers()">
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.branchId }}</td>
              <td>{{ user.isActive ? 'Yes' : 'No' }}</td>
              <td>{{ user.createdBy }}</td>
              <td class="actions-cell">
                <button class="action-btn edit-btn" (click)="showEditDialog(user)">Edit</button>
                <button class="action-btn reset-btn" (click)="showResetPasswordDialog(user)">Reset Password</button>
              </td>
            </tr>
            <tr *ngIf="displayUsers().length === 0">
              <td colspan="6" class="empty-message">No users found</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="totalCount() > 0" class="pagination">
          <p class="pagination-info">Showing {{ ((currentPage() - 1) * pageSize()) + 1 }} to {{ Math.min(currentPage() * pageSize(), totalCount()) }} of {{ totalCount() }} users</p>
          <div class="pagination-controls">
            <app-button size="sm" variant="secondary" [disabled]="currentPage() === 1" (click)="previousPage()">Previous</app-button>
            <span class="page-number">Page {{ currentPage() }}</span>
            <app-button size="sm" variant="secondary" [disabled]="currentPage() * pageSize() >= totalCount()" (click)="nextPage()">Next</app-button>
          </div>
        </div>
      </app-card>

      <app-user-form-modal [branches]="branches" (userSaved)="onUserSaved()"></app-user-form-modal>
      <app-reset-password-modal (passwordReset)="onUserSaved()"></app-reset-password-modal>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;
    .users-list { display: flex; flex-direction: column; gap: $spacing-6; }
    .page-header { display: flex; gap: $spacing-4; }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding-top: $spacing-4; margin-top: $spacing-4; border-top: 1px solid #e5e5e5; }
    .pagination-info { margin: 0; font-size: 0.875rem; color: #737373; }
    .pagination-controls { display: flex; gap: 0.75rem; align-items: center; }
    .page-number { font-size: 0.875rem; font-weight: 500; color: #404040; }
    .users-table { width: 100%; border-collapse: collapse; }
    .users-table th, .users-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 0.875rem; }
    .users-table th { font-weight: 600; color: #404040; background: #f9fafb; }
    .users-table td { color: #525252; }
    .actions-cell { display: flex; gap: 0.5rem; }
    .action-btn { padding: 0.25rem 0.625rem; font-size: 0.8125rem; border: 1px solid #d4d4d4; border-radius: 4px; cursor: pointer; background: #fff; color: #404040; transition: background 0.15s; }
    .action-btn:hover { background: #f3f4f6; }
    .reset-btn { color: #dc2626; border-color: #fca5a5; }
    .reset-btn:hover { background: #fef2f2; }
    .empty-message { text-align: center; color: #737373; padding: 2rem !important; }
  `]
})
export class UsersListComponent implements OnInit {
  @ViewChild(UserFormModalComponent) userFormModal!: UserFormModalComponent;
  @ViewChild(ResetPasswordModalComponent) resetPasswordModal!: ResetPasswordModalComponent;

  private usersService = inject(UsersService);
  private branchesService = inject(BranchesService);
  private toastService = inject(ToastService);
  Math = Math;
  searchQuery = '';
  currentPage = signal(1);
  pageSize = signal(20);
  totalCount = signal(0);
  users = signal<User[]>([]);
  branches = signal<Branch[]>([]);

  // Computed signal to transform user data with readable branch names
  displayUsers = computed(() => {
    const branchMap = new Map(this.branches().map(b => [b.id, `${b.name} (${b.code})`]));
    return this.users().map(user => ({
      ...user,
      branchId: user.branchId ? (branchMap.get(user.branchId) || user.branchId) : '-'
    }));
  });

  ngOnInit(): void {
    this.loadBranches();
    this.loadUsers();
  }

  loadBranches(): void {
    this.branchesService.getAllBranches().subscribe({
      next: (branches: Branch[]) => {
        this.branches.set(branches);
      },
      error: (err: any) => console.error('Failed to load branches:', err)
    });
  }

  loadUsers(): void {
    this.usersService.getUsers({ page: this.currentPage(), pageSize: this.pageSize(), search: this.searchQuery || undefined }).subscribe({
      next: (response) => { this.users.set(response.items); this.totalCount.set(response.totalCount); },
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  onSearch(): void { this.currentPage.set(1); this.loadUsers(); }
  previousPage(): void { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.loadUsers(); } }
  nextPage(): void { if (this.currentPage() * this.pageSize() < this.totalCount()) { this.currentPage.update(p => p + 1); this.loadUsers(); } }

  showCreateDialog(): void {
    this.userFormModal.open();
  }

  showEditDialog(user: any): void {
    const originalUser = this.users().find(u => u.id === user.id);
    if (originalUser) {
      this.userFormModal.open(originalUser);
    }
  }

  showResetPasswordDialog(user: any): void {
    this.resetPasswordModal.open(user.id, user.username);
  }

  onUserSaved(): void {
    this.loadUsers();
  }
}
