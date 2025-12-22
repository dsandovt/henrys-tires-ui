import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div *ngIf="title || hasHeaderSlot" class="card-header">
        <h3 *ngIf="title" class="card-title">{{ title }}</h3>
        <ng-content select="[header]"></ng-content>
      </div>

      <div class="card-body">
        <ng-content></ng-content>
      </div>

      <div *ngIf="hasFooterSlot" class="card-footer">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() title = '';
  @Input() hasHeaderSlot = false;
  @Input() hasFooterSlot = false;
}
