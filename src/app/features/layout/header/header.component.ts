import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';

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
      '/transactions/in/new': 'New Transfer IN',
      '/transactions/out/new': 'New Transfer OUT',
      '/admin/items': 'Items Management',
      '/admin/prices': 'Price Management',
      '/admin/users': 'User Management'
    };

    // Match exact path first
    if (titleMap[url]) {
      return titleMap[url];
    }

    // Match patterns
    if (url.startsWith('/transactions/')) {
      if (url.includes('/in/new')) return 'New Transfer IN';
      if (url.includes('/out/new')) return 'New Transfer OUT';
      if (url.match(/\/transactions\/[^/]+$/)) return 'Transaction Details';
      return 'Transactions';
    }

    return 'Henry\'s Tires';
  }
}
