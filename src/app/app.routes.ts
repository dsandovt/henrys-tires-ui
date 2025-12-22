import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './features/layout/main-layout/main-layout.component';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    component: LoginComponent
  },

  // Protected routes with main layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Default redirect
      {
        path: '',
        redirectTo: '/stock',
        pathMatch: 'full'
      },

      // Stock (all authenticated users)
      {
        path: 'stock',
        loadComponent: () =>
          import('./features/stock/stock-list/stock-list.component').then(m => m.StockListComponent)
      },

      // Transactions (all authenticated users)
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
      },
      {
        path: 'transactions/in/new',
        loadComponent: () =>
          import('./features/transactions/create-in/create-in.component').then(m => m.CreateInComponent)
      },
      {
        path: 'transactions/out/new',
        loadComponent: () =>
          import('./features/transactions/create-out/create-out.component').then(m => m.CreateOutComponent)
      },
      {
        path: 'transactions/:id',
        loadComponent: () =>
          import('./features/transactions/transaction-details/transaction-details.component').then(m => m.TransactionDetailsComponent)
      },

      // Sales (all authenticated users)
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/sales/sales-list/sales-list.component').then(m => m.SalesListComponent)
      },
      {
        path: 'sales/new',
        loadComponent: () =>
          import('./features/sales/create-sale/create-sale.component').then(m => m.CreateSaleComponent)
      },
      {
        path: 'sales/:id',
        loadComponent: () =>
          import('./features/sales/sale-details/sale-details.component').then(m => m.SaleDetailsComponent)
      },

      // Admin-only routes
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'admin/items',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/items/items-list/items-list.component').then(m => m.ItemsListComponent)
      },
      {
        path: 'admin/prices',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/prices/prices-list/prices-list.component').then(m => m.PricesListComponent)
      },
      {
        path: 'admin/users',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/users/users-list/users-list.component').then(m => m.UsersListComponent)
      }
    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: '/stock'
  }
];
