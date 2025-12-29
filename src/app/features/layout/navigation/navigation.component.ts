import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  Package,
  ShoppingCart,
  Banknote,
  ArrowDown,
  ArrowUp,
  ClipboardList,
  BarChart3,
  Tag,
  DollarSign,
  Users,
  LogOut
} from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/auth.models';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({ Package, ShoppingCart, Banknote, ArrowDown, ArrowUp, ClipboardList, BarChart3, Tag, DollarSign, Users, LogOut })
    }
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
          <p class="user-name">{{ authService.currentUser()?.username }}</p>
          <p class="user-role">{{ authService.currentUser()?.role }}</p>
        </div>
      </div>

      <ul class="nav-menu">
        <li *ngFor="let item of visibleNavItems()" class="nav-item">
          <a
            [routerLink]="item.path"
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
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  authService = inject(AuthService);

  private readonly navItems: NavItem[] = [
    // Seller & All Roles
    { label: 'Stock', path: '/stock', icon: 'package', roles: [Role.Seller, Role.Supervisor, Role.Admin] },
    { label: 'New Sale', path: '/sales/new', icon: 'shopping-cart', roles: [Role.Seller, Role.Supervisor, Role.Admin] },
    { label: 'Sales', path: '/sales', icon: 'banknote', roles: [Role.Seller, Role.Supervisor, Role.Admin] },
    { label: 'New Transaction IN', path: '/transactions/in/new', icon: 'arrow-down', roles: [Role.Seller, Role.Supervisor, Role.Admin] },
    { label: 'New Transaction OUT', path: '/transactions/out/new', icon: 'arrow-up', roles: [Role.Seller, Role.Supervisor, Role.Admin] },
    { label: 'Transactions', path: '/transactions', icon: 'clipboard-list', roles: [Role.Seller, Role.Supervisor, Role.Admin] },

    // Admin Only
    { label: 'Dashboard', path: '/dashboard', icon: 'bar-chart-3', roles: [Role.Admin] },
    { label: 'Items', path: '/admin/items', icon: 'tag', roles: [Role.Admin] },
    { label: 'Prices', path: '/admin/prices', icon: 'dollar-sign', roles: [Role.Admin] },
    { label: 'Users', path: '/admin/users', icon: 'users', roles: [Role.Admin] }
  ];

  visibleNavItems = computed(() => {
    const userRole = this.authService.userRole();
    if (!userRole) return [];

    return this.navItems.filter(item =>
      !item.roles || item.roles.includes(userRole)
    );
  });

  userInitials = computed(() => {
    const username = this.authService.currentUser()?.username || '';
    return username.substring(0, 2).toUpperCase();
  });

  onLogout(): void {
    this.authService.logout();
  }
}
