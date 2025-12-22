import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';

  get badgeClasses(): string {
    return `badge badge-${this.variant}`;
  }
}
