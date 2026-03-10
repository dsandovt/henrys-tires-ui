import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolesService } from '../../../../core/services/roles.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../../../../core/models/inventory.models';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent, ModalComponent],
  template: `
    <div class="roles-list">
      <div class="page-header">
        <app-input [(ngModel)]="searchQuery" placeholder="Search roles..." (ngModelChange)="onSearch()"></app-input>
        <app-button variant="primary" (click)="showCreateDialog()">+ Create Role</app-button>
      </div>

      <app-card>
        <table class="roles-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let role of roles()">
              <td>{{ role.code }}</td>
              <td>{{ role.name }}</td>
              <td>{{ role.description || '-' }}</td>
              <td>{{ role.isActive ? 'Yes' : 'No' }}</td>
              <td class="actions-cell">
                <button class="action-btn edit-btn" (click)="showEditDialog(role)">Edit</button>
              </td>
            </tr>
            <tr *ngIf="roles().length === 0">
              <td colspan="5" class="empty-message">No roles found</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="totalCount() > 0" class="pagination">
          <p class="pagination-info">Showing {{ ((currentPage() - 1) * pageSize()) + 1 }} to {{ Math.min(currentPage() * pageSize(), totalCount()) }} of {{ totalCount() }} roles</p>
          <div class="pagination-controls">
            <app-button size="sm" variant="secondary" [disabled]="currentPage() === 1" (click)="previousPage()">Previous</app-button>
            <span class="page-number">Page {{ currentPage() }}</span>
            <app-button size="sm" variant="secondary" [disabled]="currentPage() * pageSize() >= totalCount()" (click)="nextPage()">Next</app-button>
          </div>
        </div>
      </app-card>

      <app-modal #roleModal [title]="isEditing() ? 'Edit Role' : 'Create Role'" (closeModal)="onModalClose()">
        <form class="role-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="code">Code</label>
            <input id="code" type="text" [(ngModel)]="formCode" name="code" [disabled]="isEditing()" required />
          </div>
          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" type="text" [(ngModel)]="formName" name="name" required />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <input id="description" type="text" [(ngModel)]="formDescription" name="description" />
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="formIsActive" name="isActive" />
              Active
            </label>
          </div>
          <div class="form-actions">
            <app-button type="button" variant="secondary" (click)="roleModal.close()">Cancel</app-button>
            <app-button type="submit" variant="primary">{{ isEditing() ? 'Update' : 'Create' }}</app-button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;
    .roles-list { display: flex; flex-direction: column; gap: $spacing-6; }
    .page-header { display: flex; gap: $spacing-4; }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding-top: $spacing-4; margin-top: $spacing-4; border-top: 1px solid #e5e5e5; }
    .pagination-info { margin: 0; font-size: 0.875rem; color: #737373; }
    .pagination-controls { display: flex; gap: 0.75rem; align-items: center; }
    .page-number { font-size: 0.875rem; font-weight: 500; color: #404040; }
    .roles-table { width: 100%; border-collapse: collapse; }
    .roles-table th, .roles-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 0.875rem; }
    .roles-table th { font-weight: 600; color: #404040; background: #f9fafb; }
    .roles-table td { color: #525252; }
    .actions-cell { display: flex; gap: 0.5rem; }
    .action-btn { padding: 0.25rem 0.625rem; font-size: 0.8125rem; border: 1px solid #d4d4d4; border-radius: 4px; cursor: pointer; background: #fff; color: #404040; transition: background 0.15s; }
    .action-btn:hover { background: #f3f4f6; }
    .empty-message { text-align: center; color: #737373; padding: 2rem !important; }
    .role-form { display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: #404040; }
    .form-group input[type="text"] { padding: 0.5rem 0.75rem; border: 1px solid #d4d4d4; border-radius: 6px; font-size: 0.875rem; color: #404040; outline: none; transition: border-color 0.15s; }
    .form-group input[type="text"]:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15); }
    .form-group input[type="text"]:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
    .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .checkbox-group input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
  `]
})
export class RolesListComponent implements OnInit {
  @ViewChild('roleModal') roleModal!: ModalComponent;

  private rolesService = inject(RolesService);
  private toastService = inject(ToastService);
  Math = Math;
  searchQuery = '';
  currentPage = signal(1);
  pageSize = signal(20);
  totalCount = signal(0);
  roles = signal<Role[]>([]);

  isEditing = signal(false);
  editingRoleId = signal<string | null>(null);
  formCode = '';
  formName = '';
  formDescription = '';
  formIsActive = true;

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.rolesService.getRoles({ page: this.currentPage(), pageSize: this.pageSize(), search: this.searchQuery || undefined }).subscribe({
      next: (response) => { this.roles.set(response.items); this.totalCount.set(response.totalCount); },
      error: (err) => console.error('Failed to load roles:', err)
    });
  }

  onSearch(): void { this.currentPage.set(1); this.loadRoles(); }
  previousPage(): void { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.loadRoles(); } }
  nextPage(): void { if (this.currentPage() * this.pageSize() < this.totalCount()) { this.currentPage.update(p => p + 1); this.loadRoles(); } }

  showCreateDialog(): void {
    this.isEditing.set(false);
    this.editingRoleId.set(null);
    this.formCode = '';
    this.formName = '';
    this.formDescription = '';
    this.formIsActive = true;
    this.roleModal.open();
  }

  showEditDialog(role: Role): void {
    this.isEditing.set(true);
    this.editingRoleId.set(role.id);
    this.formCode = role.code;
    this.formName = role.name;
    this.formDescription = role.description || '';
    this.formIsActive = role.isActive;
    this.roleModal.open();
  }

  onModalClose(): void {
    this.isEditing.set(false);
    this.editingRoleId.set(null);
  }

  onSubmit(): void {
    if (this.isEditing()) {
      const request: UpdateRoleRequest = {
        name: this.formName,
        description: this.formDescription || undefined,
        isActive: this.formIsActive
      };
      this.rolesService.updateRole(this.editingRoleId()!, request).subscribe({
        next: () => {
          this.toastService.success('Role updated successfully');
          this.roleModal.close();
          this.loadRoles();
        },
        error: (err) => {
          console.error('Failed to update role:', err);
          this.toastService.danger('Failed to update role');
        }
      });
    } else {
      const request: CreateRoleRequest = {
        code: this.formCode,
        name: this.formName,
        description: this.formDescription || undefined,
        isActive: this.formIsActive
      };
      this.rolesService.createRole(request).subscribe({
        next: () => {
          this.toastService.success('Role created successfully');
          this.roleModal.close();
          this.loadRoles();
        },
        error: (err) => {
          console.error('Failed to create role:', err);
          this.toastService.danger('Failed to create role');
        }
      });
    }
  }
}
