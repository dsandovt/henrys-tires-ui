import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'circle' | 'rect';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="skeletonClasses"
      [style.width]="width"
      [style.height]="height"
    ></div>
  `,
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent {
  @Input() variant: SkeletonVariant = 'text';
  @Input() width = '100%';
  @Input() height = '1em';

  get skeletonClasses(): string {
    return `skeleton skeleton-${this.variant}`;
  }
}
