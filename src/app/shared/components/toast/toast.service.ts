import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'warning' | 'danger' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);

  readonly toasts = this.toastsSignal.asReadonly();

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToast(toast: Toast): void {
    this.toastsSignal.update(toasts => [...toasts, toast]);

    // Auto-dismiss after duration
    if (toast.duration) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }
  }

  success(message: string, duration = 3000): void {
    this.addToast({
      id: this.generateId(),
      message,
      variant: 'success',
      duration
    });
  }

  warning(message: string, duration = 4000): void {
    this.addToast({
      id: this.generateId(),
      message,
      variant: 'warning',
      duration
    });
  }

  danger(message: string, duration = 5000): void {
    this.addToast({
      id: this.generateId(),
      message,
      variant: 'danger',
      duration
    });
  }

  info(message: string, duration = 3000): void {
    this.addToast({
      id: this.generateId(),
      message,
      variant: 'info',
      duration
    });
  }

  dismiss(id: string): void {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this.toastsSignal.set([]);
  }
}
