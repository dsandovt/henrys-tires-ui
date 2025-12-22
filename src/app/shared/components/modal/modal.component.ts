import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen()" (click)="onOverlayClick($event)" [@fadeIn]>
      <div class="modal-container" [class.modal-sm]="size === 'sm'" [class.modal-lg]="size === 'lg'" [@slideUp]>
        <div class="modal-header">
          <div class="header-content">
            <h2 class="modal-title">{{ title }}</h2>
            <p class="modal-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
          </div>
          <button type="button" class="modal-close" (click)="close()" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-container {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 560px;
      width: 100%;
      max-height: 85vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .modal-container.modal-sm {
      max-width: 400px;
    }

    .modal-container.modal-lg {
      max-width: 720px;
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 2rem 2rem 1.5rem 2rem;
      border-bottom: 1px solid #f3f4f6;
      background: #fafbfc;
    }

    .header-content {
      flex: 1;
      padding-right: 1rem;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
      line-height: 1.4;
      letter-spacing: -0.01em;
    }

    .modal-subtitle {
      margin: 0.375rem 0 0;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
    }

    .modal-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: #9ca3af;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .modal-close:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .modal-close:active {
      transform: scale(0.95);
    }

    .modal-body {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
    }

    /* Custom scrollbar */
    .modal-body::-webkit-scrollbar {
      width: 8px;
    }

    .modal-body::-webkit-scrollbar-track {
      background: #f9fafb;
      border-radius: 4px;
    }

    .modal-body::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 4px;
    }

    .modal-body::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px) scale(0.95)', opacity: 0 }),
        animate('250ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 1, 1)', style({ transform: 'translateY(10px) scale(0.95)', opacity: 0 }))
      ])
    ])
  ]
})
export class ModalComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() closeModal = new EventEmitter<void>();

  isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}
