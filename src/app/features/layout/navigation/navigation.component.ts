import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  Package,
  Banknote,
  ArrowDown,
  ClipboardList,
  BarChart3,
  Tag,
  DollarSign,
  Users,
  LogOut,
  FileText,
  Activity,
  Shield,
  Layers,
  ArrowLeftRight,
} from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roleCodes?: string[];
  queryParams?: Record<string, any>;
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Package,
        Banknote,
        ArrowDown,
        ClipboardList,
        BarChart3,
        Tag,
        DollarSign,
        Users,
        LogOut,
        FileText,
        Activity,
        Shield,
        Layers,
        ArrowLeftRight,
      }),
    },
  ],
  template: `
    <nav class="navigation">
      <div class="nav-header">
        <h1 class="nav-title">Henry's Tires Inc.</h1>
        <p class="nav-subtitle">Inventory Management</p>
      </div>

      <div class="nav-user">
        <div class="user-avatar">{{ userInitials() }}</div>
        <div class="user-info">
          <p class="user-name">{{ displayName() }}</p>
          <p class="user-role">{{ primaryRole() }}</p>
        </div>
      </div>

      <ul class="nav-menu">
        <li *ngFor="let item of visibleNavItems()" class="nav-item">
          <a
            [routerLink]="item.path"
            [queryParams]="item.queryParams"
            routerLinkActive="active"
            class="nav-link"
          >
            <lucide-icon [name]="item.icon" class="nav-icon"></lucide-icon>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </li>
      </ul>

      <div class="nav-footer">
        <button class="logout-btn" (click)="onLogout()">
          <lucide-icon name="log-out" class="nav-icon"></lucide-icon>
          <span class="nav-label">Logout</span>
        </button>
      </div>
    </nav>
  `,
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  authService = inject(AuthService);

  private readonly navItems: NavItem[] = [
    // All authenticated users
    { label: 'Stock', path: '/stock', icon: 'package' },
    {
      label: 'Sales',
      path: '/sales',
      icon: 'banknote',
      roleCodes: ['SELLER', 'SUPERVISOR', 'ADMIN', 'STORE_SELLER'],
    },
    {
      label: 'Purchase Orders',
      path: '/purchase-orders',
      icon: 'arrow-down',
      roleCodes: ['SELLER', 'SUPERVISOR', 'ADMIN'],
    },
    {
      label: 'Inventory Adjustments',
      path: '/inventory-adjustments',
      icon: 'arrow-left-right',
      roleCodes: ['SUPERVISOR', 'ADMIN'],
    },
    {
      label: 'Transactions',
      path: '/transactions',
      icon: 'clipboard-list',
      roleCodes: ['SELLER', 'SUPERVISOR', 'ADMIN'],
    },

    // Reports (Admin Only)
    {
      label: 'Stock Report',
      path: '/reports/stock',
      icon: 'file-text',
      roleCodes: ['ADMIN', 'SUPERVISOR'],
    },
    {
      label: 'Sales Report',
      path: '/reports/sales',
      icon: 'file-text',
      roleCodes: ['ADMIN', 'SUPERVISOR'],
    },
    {
      label: 'Inventory Movements',
      path: '/reports/inventory-movements',
      icon: 'activity',
      roleCodes: ['ADMIN', 'SUPERVISOR'],
    },
    {
      label: 'Daily Close',
      path: '/reports/daily-close',
      icon: 'file-text',
      roleCodes: ['ADMIN', 'SUPERVISOR'],
    },
    {
      label: 'Kardex',
      path: '/reports/kardex',
      icon: 'file-text',
      roleCodes: ['ADMIN', 'SUPERVISOR'],
    },
    {
      label: 'Sales by Volume',
      path: '/reports/sales-by-volume',
      icon: 'file-text',
      roleCodes: ['ADMIN'],
    },

    // Admin Only
    { label: 'Dashboard', path: '/dashboard', icon: 'bar-chart-3', roleCodes: ['ADMIN'] },
    { label: 'Items', path: '/admin/items', icon: 'tag', roleCodes: ['ADMIN'] },
    { label: 'Prices', path: '/admin/prices', icon: 'dollar-sign', roleCodes: ['ADMIN'] },
    { label: 'Users', path: '/admin/users', icon: 'users', roleCodes: ['ADMIN'] },
    { label: 'Roles', path: '/admin/roles', icon: 'shield', roleCodes: ['ADMIN'] },
    { label: 'Groups', path: '/admin/groups', icon: 'layers', roleCodes: ['ADMIN'] },
  ];

  visibleNavItems = computed(() => {
    const userRoles = this.authService.roleCodes();
    if (!userRoles || userRoles.length === 0) return [];

    return this.navItems.filter(
      (item) => !item.roleCodes || item.roleCodes.some((code) => userRoles.includes(code)),
    );
  });

  displayName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  });

  userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user.username.substring(0, 2).toUpperCase();
  });

  primaryRole = computed(() => {
    const roles = this.authService.roleCodes();
    if (!roles || roles.length === 0) return '';
    return roles[0];
  });

  onLogout(): void {
    this.authService.logout();
  }
}
