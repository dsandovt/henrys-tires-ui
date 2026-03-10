import { Routes } from '@angular/router';
import { authGuard, adminGuard, roleGuard } from './core/guards/auth.guard';
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

      // Transactions — read-only list and details (following dispatch-instruction pattern)
      {
        path: 'transactions',
        canActivate: [roleGuard(['SELLER', 'SUPERVISOR', 'ADMIN'])],
        loadComponent: () =>
          import('./features/transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
      },
      {
        path: 'transaction-details',
        canActivate: [roleGuard(['SELLER', 'SUPERVISOR', 'ADMIN'])],
        loadComponent: () =>
          import('./features/transactions/transaction-details/transaction-details.component').then(m => m.TransactionDetailsComponent)
      },

      // Purchase Orders — flat routes with query params: /purchase-orders (list), /purchase-order-details?id=xxx or ?new=
      {
        path: 'purchase-orders',
        canActivate: [roleGuard(['SELLER', 'SUPERVISOR', 'ADMIN'])],
        loadComponent: () =>
          import('./features/purchase-orders/purchase-order-list/purchase-order-list.component').then(m => m.PurchaseOrderListComponent)
      },
      {
        path: 'purchase-order-details',
        canActivate: [roleGuard(['SELLER', 'SUPERVISOR', 'ADMIN'])],
        loadComponent: () =>
          import('./features/purchase-orders/purchase-order-details/purchase-order-details.component').then(m => m.PurchaseOrderDetailsComponent)
      },

      // Sales — flat routes with query params: /sales (list), /sale-details?id=xxx or ?new=
      {
        path: 'sales',
        canActivate: [roleGuard(['SELLER', 'SUPERVISOR', 'ADMIN', 'STORE_SELLER'])],
        loadComponent: () =>
          import('./features/sales/sales-list/sales-list.component').then(m => m.SalesListComponent)
      },
      {
        path: 'sale-details',
        canActivate: [roleGuard(['SELLER', 'SUPERVISOR', 'ADMIN', 'STORE_SELLER'])],
        loadComponent: () =>
          import('./features/sales/sale-details/sale-details.component').then(m => m.SaleDetailsComponent)
      },

      // Reports (Admin only)
      {
        path: 'reports/stock',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/reports/stock-report/stock-report.component').then(m => m.StockReportComponent)
      },
      {
        path: 'reports/sales',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/reports/sales-report/sales-report.component').then(m => m.SalesReportComponent)
      },
      {
        path: 'reports/inventory-movements',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/reports/inventory-movements/inventory-movements.component').then(m => m.InventoryMovementsComponent)
      },
      {
        path: 'reports/daily-close',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/reports/daily-close-report/daily-close-report.component').then(m => m.DailyCloseReportComponent)
      },
      {
        path: 'reports/kardex',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/reports/kardex-report/kardex-report.component').then(m => m.KardexReportComponent)
      },
      {
        path: 'reports/sales-by-volume',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/reports/sales-by-volume-report/sales-by-volume-report.component').then(m => m.SalesByVolumeReportComponent)
      },
      {
        path: 'reports/invoice/:type/:id',
        loadComponent: () =>
          import('./features/reports/invoice-view/invoice-view.component').then(m => m.InvoiceViewComponent)
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
      },
      // Roles — dispatch-instruction pattern: list at /admin/roles
      {
        path: 'admin/roles',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/roles/roles-list/roles-list.component').then(m => m.RolesListComponent)
      },
      // Groups — dispatch-instruction pattern: list at /admin/groups
      {
        path: 'admin/groups',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/groups/groups-list/groups-list.component').then(m => m.GroupsListComponent)
      }
    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: '/stock'
  }
];
