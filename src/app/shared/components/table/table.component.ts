import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  template?: TemplateRef<any>;
  width?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-wrapper">
      <table class="table">
        <thead class="table-header">
          <tr>
            <th
              *ngFor="let column of columns"
              [style.width]="column.width"
              [class.sortable]="column.sortable"
              (click)="column.sortable && onSort(column.key)"
            >
              {{ column.label }}
              <span *ngIf="column.sortable && sortKey === column.key" class="sort-icon">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="table-body">
          <tr
            *ngFor="let row of data; trackBy: trackByFn"
            class="table-row"
            (click)="onRowClick(row)"
            [class.clickable]="clickable"
          >
            <td *ngFor="let column of columns" class="table-cell">
              <ng-container *ngIf="column.template; else defaultCell">
                <ng-container
                  *ngTemplateOutlet="column.template; context: { $implicit: row }"
                ></ng-container>
              </ng-container>
              <ng-template #defaultCell>
                {{ getCellValue(row, column.key) }}
              </ng-template>
            </td>
          </tr>

          <tr *ngIf="!data || data.length === 0" class="table-empty">
            <td [attr.colspan]="columns.length" class="table-empty-cell">
              <div class="empty-state">
                <p>{{ emptyMessage }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrls: ['./table.component.scss']
})
export class TableComponent<T = any> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() clickable = false;
  @Input() emptyMessage = 'No data available';
  @Input() sortKey = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  @Output() rowClick = new EventEmitter<T>();
  @Output() sort = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();

  getCellValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  onRowClick(row: T): void {
    if (this.clickable) {
      this.rowClick.emit(row);
    }
  }

  onSort(key: string): void {
    const direction = this.sortKey === key && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortKey = key;
    this.sortDirection = direction;
    this.sort.emit({ key, direction });
  }

  trackByFn(index: number): number {
    return index;
  }
}
