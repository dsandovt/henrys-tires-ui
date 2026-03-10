import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { PrivacyService } from '../../../core/services/privacy.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="header-title">
          <h2>{{ pageTitle() }}</h2>
        </div>

        <div class="header-actions">
          <button
            class="privacy-toggle"
            (click)="privacyService.toggle()"
            [title]="privacyService.isPrivate() ? 'Show sensitive data' : 'Hide sensitive data'"
          >
            <svg *ngIf="!privacyService.isPrivate()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg *ngIf="privacyService.isPrivate()" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>

          <div class="branch-indicator" *ngIf="authService.branchName()">
            <span class="branch-label">Branch:</span>
            <span class="branch-name">{{ authService.branchName() }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  authService = inject(AuthService);
  privacyService = inject(PrivacyService);
  private router = inject(Router);

  pageTitle = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getTitleFromUrl(this.router.url))
    ),
    { initialValue: this.getTitleFromUrl(this.router.url) }
  );

  private getTitleFromUrl(url: string): string {
    const titleMap: Record<string, string> = {
      '/stock': 'Stock',
      '/dashboard': 'Dashboard',
      '/transactions': 'Transactions',
      '/purchase-orders': 'Purchase Orders',
      '/sales': 'Sales',
      '/reports/stock': 'Stock Report',
      '/reports/inventory-movements': 'Inventory Movements',
      '/admin/items': 'Items Management',
      '/admin/prices': 'Price Management',
      '/admin/users': 'User Management',
      '/admin/roles': 'Roles Management',
      '/admin/groups': 'Groups Management'
    };

    const basePath = url.split('?')[0];

    // Match exact path first
    if (titleMap[basePath]) {
      return titleMap[basePath];
    }

    if (basePath === '/transaction-details') {
      return 'Transaction Details';
    }
    if (basePath === '/purchase-order-details') {
      return url.includes('new=') ? 'New Purchase Order' : 'Purchase Order Details';
    }
    if (basePath === '/sale-details') {
      return url.includes('new=') ? 'New Sale' : 'Sale Details';
    }
    if (url.startsWith('/reports/invoice/')) {
      return 'Invoice';
    }

    return 'Henry\'s Tires';
  }
}
