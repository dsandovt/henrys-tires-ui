import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="alertClasses" *ngIf="visible">
      <div class="alert-content">
        <span class="alert-icon">{{ icon }}</span>
        <div class="alert-message">
          <ng-content></ng-content>
        </div>
      </div>
      <button
        *ngIf="dismissible"
        class="alert-close"
        (click)="onClose()"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  `,
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'info';
  @Input() dismissible = false;
  @Input() visible = true;

  @Output() close = new EventEmitter<void>();

  get alertClasses(): string {
    return `alert alert-${this.variant}`;
  }

  get icon(): string {
    const icons: Record<AlertVariant, string> = {
      success: '✓',
      warning: '⚠',
      danger: '✕',
      info: 'ℹ'
    };
    return icons[this.variant];
  }

  onClose(): void {
    this.visible = false;
    this.close.emit();
  }
}
