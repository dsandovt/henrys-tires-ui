import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts()"
        [class]="'toast toast-' + toast.variant"
        [@slideIn]
      >
        <div class="toast-content">
          <span class="toast-icon">{{ getIcon(toast.variant) }}</span>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
        <button class="toast-close" (click)="toastService.dismiss(toast.id)">
          ×
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIcon(variant: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      warning: '⚠',
      danger: '✕',
      info: 'ℹ'
    };
    return icons[variant] || 'ℹ';
  }
}
