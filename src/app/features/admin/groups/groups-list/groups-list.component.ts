import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupsService } from '../../../../core/services/groups.service';
import { RolesService } from '../../../../core/services/roles.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { Group, Role, CreateGroupRequest, UpdateGroupRequest } from '../../../../core/models/inventory.models';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, InputComponent, ButtonComponent, ModalComponent, AlertComponent],
  template: `
    <div class="groups-list">
      <div class="page-header">
        <app-input [(ngModel)]="searchQuery" placeholder="Search groups..." (ngModelChange)="onSearch()"></app-input>
        <app-button variant="primary" (click)="showCreateDialog()">+ Create Group</app-button>
      </div>

      <app-card>
        <table class="groups-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Roles</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let group of groups()">
              <td>{{ group.code }}</td>
              <td>{{ group.name }}</td>
              <td>{{ group.description || '-' }}</td>
              <td>{{ group.roleReferences.join(', ') || '-' }}</td>
              <td>{{ group.isActive ? 'Yes' : 'No' }}</td>
              <td class="actions-cell">
                <button class="action-btn edit-btn" (click)="showEditDialog(group)">Edit</button>
              </td>
            </tr>
            <tr *ngIf="groups().length === 0">
              <td colspan="6" class="empty-message">No groups found</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="totalCount() > 0" class="pagination">
          <p class="pagination-info">Showing {{ ((currentPage() - 1) * pageSize()) + 1 }} to {{ Math.min(currentPage() * pageSize(), totalCount()) }} of {{ totalCount() }} groups</p>
          <div class="pagination-controls">
            <app-button size="sm" variant="secondary" [disabled]="currentPage() === 1" (click)="previousPage()">Previous</app-button>
            <span class="page-number">Page {{ currentPage() }}</span>
            <app-button size="sm" variant="secondary" [disabled]="currentPage() * pageSize() >= totalCount()" (click)="nextPage()">Next</app-button>
          </div>
        </div>
      </app-card>

      <app-modal #formModal [title]="isEditing ? 'Edit Group' : 'Create Group'" size="md" (closeModal)="resetForm()">
        <app-alert *ngIf="formError()" variant="danger" [dismissible]="true" (close)="formError.set('')">{{ formError() }}</app-alert>

        <form class="group-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="code">Code</label>
            <app-input id="code" [(ngModel)]="formData.code" name="code" placeholder="Group code" [disabled]="isEditing"></app-input>
          </div>

          <div class="form-group">
            <label for="name">Name</label>
            <app-input id="name" [(ngModel)]="formData.name" name="name" placeholder="Group name"></app-input>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <app-input id="description" [(ngModel)]="formData.description" name="description" placeholder="Group description"></app-input>
          </div>

          <div class="form-group">
            <label>Roles</label>
            <div class="roles-checkbox-list">
              <label *ngFor="let role of availableRoles()" class="checkbox-item">
                <input type="checkbox" [checked]="formData.roleReferences.includes(role.code)" (change)="toggleRole(role.code)" />
                <span>{{ role.name }} ({{ role.code }})</span>
              </label>
              <p *ngIf="availableRoles().length === 0" class="no-roles-msg">No roles available</p>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-item">
              <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive" />
              <span>Active</span>
            </label>
          </div>

          <div class="form-actions">
            <app-button type="button" variant="secondary" (click)="formModal.close()">Cancel</app-button>
            <app-button type="submit" variant="primary" [disabled]="saving()">{{ saving() ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}</app-button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [`
    @use 'assets/styles/variables' as *;
    .groups-list { display: flex; flex-direction: column; gap: $spacing-6; }
    .page-header { display: flex; gap: $spacing-4; }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding-top: $spacing-4; margin-top: $spacing-4; border-top: 1px solid #e5e5e5; }
    .pagination-info { margin: 0; font-size: 0.875rem; color: #737373; }
    .pagination-controls { display: flex; gap: 0.75rem; align-items: center; }
    .page-number { font-size: 0.875rem; font-weight: 500; color: #404040; }
    .groups-table { width: 100%; border-collapse: collapse; }
    .groups-table th, .groups-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 0.875rem; }
    .groups-table th { font-weight: 600; color: #404040; background: #f9fafb; }
    .groups-table td { color: #525252; }
    .actions-cell { display: flex; gap: 0.5rem; }
    .action-btn { padding: 0.25rem 0.625rem; font-size: 0.8125rem; border: 1px solid #d4d4d4; border-radius: 4px; cursor: pointer; background: #fff; color: #404040; transition: background 0.15s; }
    .action-btn:hover { background: #f3f4f6; }
    .empty-message { text-align: center; color: #737373; padding: 2rem !important; }
    .group-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-group label { font-size: 0.875rem; font-weight: 500; color: #404040; }
    .roles-checkbox-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 200px; overflow-y: auto; border: 1px solid #e5e5e5; border-radius: 6px; padding: 0.75rem; }
    .checkbox-item { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.875rem; color: #525252; }
    .checkbox-item input[type="checkbox"] { width: 1rem; height: 1rem; cursor: pointer; }
    .no-roles-msg { margin: 0; font-size: 0.8125rem; color: #737373; }
    .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e5e5; }
  `]
})
export class GroupsListComponent implements OnInit {
  @ViewChild('formModal') formModal!: ModalComponent;

  private groupsService = inject(GroupsService);
  private rolesService = inject(RolesService);
  private toastService = inject(ToastService);
  Math = Math;

  searchQuery = '';
  currentPage = signal(1);
  pageSize = signal(20);
  totalCount = signal(0);
  groups = signal<Group[]>([]);
  availableRoles = signal<Role[]>([]);

  isEditing = false;
  editingGroupId = '';
  saving = signal(false);
  formError = signal('');

  formData: { code: string; name: string; description: string; roleReferences: string[]; isActive: boolean } = {
    code: '',
    name: '',
    description: '',
    roleReferences: [],
    isActive: true
  };

  ngOnInit(): void {
    this.loadRoles();
    this.loadGroups();
  }

  loadRoles(): void {
    this.rolesService.getAllRoles().subscribe({
      next: (roles) => this.availableRoles.set(roles),
      error: (err: any) => console.error('Failed to load roles:', err)
    });
  }

  loadGroups(): void {
    this.groupsService.getGroups({ page: this.currentPage(), pageSize: this.pageSize(), search: this.searchQuery || undefined }).subscribe({
      next: (response) => { this.groups.set(response.items); this.totalCount.set(response.totalCount); },
      error: (err) => console.error('Failed to load groups:', err)
    });
  }

  onSearch(): void { this.currentPage.set(1); this.loadGroups(); }
  previousPage(): void { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.loadGroups(); } }
  nextPage(): void { if (this.currentPage() * this.pageSize() < this.totalCount()) { this.currentPage.update(p => p + 1); this.loadGroups(); } }

  showCreateDialog(): void {
    this.isEditing = false;
    this.editingGroupId = '';
    this.resetForm();
    this.formModal.open();
  }

  showEditDialog(group: Group): void {
    this.isEditing = true;
    this.editingGroupId = group.id;
    this.formData = {
      code: group.code,
      name: group.name,
      description: group.description || '',
      roleReferences: [...(group.roleReferences || [])],
      isActive: group.isActive
    };
    this.formError.set('');
    this.formModal.open();
  }

  toggleRole(roleCode: string): void {
    const index = this.formData.roleReferences.indexOf(roleCode);
    if (index === -1) {
      this.formData.roleReferences.push(roleCode);
    } else {
      this.formData.roleReferences.splice(index, 1);
    }
  }

  resetForm(): void {
    this.formData = { code: '', name: '', description: '', roleReferences: [], isActive: true };
    this.formError.set('');
    this.saving.set(false);
  }

  onSubmit(): void {
    if (!this.formData.code.trim() || !this.formData.name.trim()) {
      this.formError.set('Code and Name are required.');
      return;
    }

    this.saving.set(true);
    this.formError.set('');

    if (this.isEditing) {
      const request: UpdateGroupRequest = {
        name: this.formData.name,
        description: this.formData.description || undefined,
        roleReferences: this.formData.roleReferences,
        isActive: this.formData.isActive
      };
      this.groupsService.updateGroup(this.editingGroupId, request).subscribe({
        next: () => {
          this.toastService.success('Group updated successfully');
          this.formModal.close();
          this.loadGroups();
        },
        error: (err) => {
          this.formError.set(err.error?.message || 'Failed to update group.');
          this.saving.set(false);
        }
      });
    } else {
      const request: CreateGroupRequest = {
        code: this.formData.code,
        name: this.formData.name,
        description: this.formData.description || undefined,
        roleReferences: this.formData.roleReferences,
        isActive: this.formData.isActive
      };
      this.groupsService.createGroup(request).subscribe({
        next: () => {
          this.toastService.success('Group created successfully');
          this.formModal.close();
          this.loadGroups();
        },
        error: (err) => {
          this.formError.set(err.error?.message || 'Failed to create group.');
          this.saving.set(false);
        }
      });
    }
  }
}
