# Information Architecture (IA)

## Navigation Structure by Role

### 🔵 SELLER Role
**Default Landing:** `/stock` (Branch Stock)

```
├── Stock Management
│   ├── /stock - Branch Stock View
│   │   └── Shows inventory for seller's assigned branch only
│   │   └── View-only, no global access
│   │
├── Transactions
│   ├── /transactions - Transaction List
│   │   └── View transactions for their branch
│   ├── /transactions/in/new - Create Transfer IN
│   │   └── Receive tires into their branch
│   ├── /transactions/out/new - Create Transfer OUT
│   │   └── Remove tires from stock (sales, transfers)
│   │   └── ⚠️ CANNOT override prices
│   └── /transactions/:id - Transaction Details
│       └── View complete transaction information
```

**Menu Items (Visible to Seller):**
- Stock
- Transactions
  - View All
  - Transfer IN
  - Transfer OUT

**Hidden from Seller:**
- Admin Dashboard
- Items Management
- Price Management
- User Management
- Global Reports

---

### 🟢 SUPERVISOR Role
**Default Landing:** `/stock` (Branch Stock)

```
├── Stock Management
│   ├── /stock - Branch Stock View
│   │   └── Shows inventory for supervisor's assigned branch
│   │   └── May have access to view other branches (future)
│   │
├── Transactions
│   ├── /transactions - Transaction List
│   │   └── View transactions for their branch
│   ├── /transactions/in/new - Create Transfer IN
│   │   └── Receive tires into their branch
│   ├── /transactions/out/new - Create Transfer OUT
│   │   └── Remove tires from stock
│   │   └── ✅ CAN override prices (with mandatory notes)
│   └── /transactions/:id - Transaction Details
│       └── View complete transaction information
│   │
├── Reports (Future)
│   └── /reports/branch - Branch Reports
│       └── Sales, inventory, performance for their branch
```

**Menu Items (Visible to Supervisor):**
- Stock
- Transactions
  - View All
  - Transfer IN
  - Transfer OUT
- Reports (future)

**Hidden from Supervisor:**
- Admin Dashboard
- Items Management
- Price Management
- User Management
- Cross-branch operations

---

### 🔴 ADMIN Role
**Default Landing:** `/dashboard` (Admin Dashboard)

```
├── Dashboard
│   └── /dashboard - Admin Global Dashboard
│       └── System-wide metrics and analytics
│       └── All branches overview
│       └── Recent activity feed
│
├── Stock Management
│   └── /stock - Global Stock View
│       └── View inventory across ALL branches
│       └── Filter by branch
│       └── Advanced search and filters
│
├── Transactions
│   ├── /transactions - Transaction List (All Branches)
│   │   └── View all transactions system-wide
│   ├── /transactions/in/new - Create Transfer IN
│   │   └── For any branch
│   ├── /transactions/out/new - Create Transfer OUT
│   │   └── For any branch
│   │   └── ✅ CAN override prices (with mandatory notes)
│   └── /transactions/:id - Transaction Details
│       └── Complete audit trail
│
├── Administration
│   ├── /admin/items - Item Management
│   │   └── Create, edit, delete items
│   │   └── Manage product catalog
│   │
│   ├── /admin/prices - Price Management
│   │   └── Update ConsumableItemPrice
│   │   └── View price history
│   │   └── Set default pricing
│   │
│   └── /admin/users - User Management
│       └── Create, edit, deactivate users
│       └── Assign roles and branches
│       └── Reset passwords
│
└── Reports (Future)
    ├── /reports/sales - Sales Reports
    │   └── Daily/weekly/monthly sales
    │   └── By branch, by item, by condition
    │
    ├── /reports/inventory - Inventory Reports
    │   └── Stock levels, turnover
    │   └── Low stock alerts
    │
    └── /reports/financial - Financial Reports
        └── Revenue, COGS, margins
        └── Export to Excel
```

**Menu Items (Visible to Admin):**
- Dashboard
- Stock
- Transactions
  - View All
  - Transfer IN
  - Transfer OUT
- Administration
  - Items
  - Prices
  - Users
- Reports (future)

**Full System Access**

---

## Route Definitions (Angular)

### Public Routes
```typescript
/login - LoginComponent
  - No authentication required
  - Redirects to role-based landing if already authenticated
```

### Protected Routes (All Authenticated Users)
```typescript
/ - MainLayoutComponent (with authGuard)
  ├── '' → redirectTo: '/stock'
  │
  ├── /stock - StockListComponent
  │   Purpose: View inventory by branch
  │   Access: All roles (Seller sees only their branch)
  │
  ├── /transactions - TransactionListComponent
  │   Purpose: List all transactions with filters
  │   Access: All roles (Seller/Supervisor see only their branch)
  │
  ├── /transactions/in/new - CreateInComponent
  │   Purpose: Create Transfer IN transaction
  │   Access: All roles
  │   Permissions: Seller/Supervisor restricted to their branch
  │
  ├── /transactions/out/new - CreateOutComponent
  │   Purpose: Create Transfer OUT transaction
  │   Access: All roles
  │   Permissions: Price override only for Admin/Supervisor
  │
  └── /transactions/:id - TransactionDetailsComponent
      Purpose: View complete transaction details
      Access: All roles
```

### Admin-Only Routes (with adminGuard)
```typescript
/dashboard - DashboardComponent
  Purpose: System-wide metrics and analytics
  Access: Admin only
  Features:
    - Total branches, items, stock, users, transactions
    - Sales summary (daily/weekly/monthly)
    - Branch breakdown with totals
    - Recent activity feed

/admin/items - ItemsListComponent
  Purpose: Manage product catalog
  Access: Admin only
  Features:
    - Create new items
    - Edit item descriptions
    - Soft delete items
    - Search and pagination

/admin/prices - PricesListComponent
  Purpose: Manage item pricing
  Access: Admin only
  Features:
    - Update latest price for items
    - View price history
    - Set currency
    - Track who changed prices and when

/admin/users - UsersListComponent
  Purpose: Manage system users
  Access: Admin only
  Features:
    - Create new users
    - Edit user details
    - Assign roles (Seller, Supervisor, Admin)
    - Assign branch to users
    - Activate/deactivate users
    - Reset passwords
```

---

## Route Guards

### authGuard
- Applied to: All routes except `/login`
- Purpose: Ensure user is authenticated
- Behavior: Redirect to `/login` if not authenticated

### adminGuard
- Applied to: `/dashboard`, `/admin/*`
- Purpose: Ensure user has Admin role
- Behavior: Redirect to role-based landing if not Admin
- Implementation: Uses `roleGuard([Role.Admin])`

### canOverridePricesGuard (Future)
- Applied to: Price override functionality
- Purpose: Ensure user is Admin or Supervisor
- Behavior: Hide/disable price override UI if Seller
- Implementation: Uses `roleGuard([Role.Admin, Role.Supervisor])`

---

## Navigation Menu Structure

### Seller Menu
```
┌─────────────────────────┐
│ Henry's Tires           │
├─────────────────────────┤
│ 📦 Stock                │
│ 🔄 Transactions         │
│   ├─ View All           │
│   ├─ Transfer IN        │
│   └─ Transfer OUT       │
└─────────────────────────┘
```

### Supervisor Menu
```
┌─────────────────────────┐
│ Henry's Tires           │
├─────────────────────────┤
│ 📦 Stock                │
│ 🔄 Transactions         │
│   ├─ View All           │
│   ├─ Transfer IN        │
│   └─ Transfer OUT       │
│ 📊 Reports (future)     │
└─────────────────────────┘
```

### Admin Menu
```
┌─────────────────────────┐
│ Henry's Tires           │
├─────────────────────────┤
│ 🏠 Dashboard            │
│ 📦 Stock                │
│ 🔄 Transactions         │
│   ├─ View All           │
│   ├─ Transfer IN        │
│   └─ Transfer OUT       │
│ ⚙️  Administration      │
│   ├─ Items              │
│   ├─ Prices             │
│   └─ Users              │
│ 📊 Reports (future)     │
└─────────────────────────┘
```

---

## Page-Level Permissions Matrix

| Page | Seller | Supervisor | Admin | Notes |
|------|--------|------------|-------|-------|
| Login | ✅ | ✅ | ✅ | Public |
| Stock | ✅ (branch) | ✅ (branch) | ✅ (all) | Branch-filtered for non-admin |
| Transactions List | ✅ (branch) | ✅ (branch) | ✅ (all) | Branch-filtered for non-admin |
| Transfer IN | ✅ | ✅ | ✅ | All can create |
| Transfer OUT | ✅ (no override) | ✅ (can override) | ✅ (can override) | Price override restricted |
| Transaction Details | ✅ | ✅ | ✅ | All can view |
| Dashboard | ❌ | ❌ | ✅ | Admin only |
| Items Management | ❌ | ❌ | ✅ | Admin only |
| Price Management | ❌ | ❌ | ✅ | Admin only |
| User Management | ❌ | ❌ | ✅ | Admin only |

---

## URL Parameters and State

### Query Parameters
```typescript
// Stock List
/stock?search=tire&branch=MER&condition=New&page=1&pageSize=20

// Transaction List
/transactions?type=Out&status=Committed&branch=MER&page=1&pageSize=20&search=TXN-001

// Admin Dashboard
/dashboard?period=weekly&branch=all
```

### Route Parameters
```typescript
// Transaction Details
/transactions/:id
  - id: Transaction MongoDB ObjectId
  - Example: /transactions/507f1f77bcf86cd799439011

// Item Edit (modal)
/admin/items (opens modal with item data)
  - Item passed via component state, not URL

// User Edit (modal)
/admin/users (opens modal with user data)
  - User passed via component state, not URL
```

---

## Navigation Behavior

### On Login Success
```typescript
if (userRole === 'Admin') {
  navigate('/dashboard')
} else {
  navigate('/stock') // Seller or Supervisor
}
```

### On Unauthorized Access
```typescript
// User types /dashboard manually but is not Admin
if (!hasRole('Admin')) {
  // Redirect to their default landing
  if (userRole === 'Admin') navigate('/dashboard')
  else navigate('/stock')
}

// Do NOT show "Access Denied" page
// Silently redirect to appropriate page
```

### On Logout
```typescript
clearAuthState()
navigate('/login')
```

### Breadcrumb Navigation (Future Enhancement)
```
Home > Transactions > Transfer IN > Create
Home > Administration > Items > Edit Item
Home > Stock > Branch: Mercury
```

---

## Deep Linking Support

All routes support deep linking:
- `/transactions/507f1f77bcf86cd799439011` - Direct link to transaction
- `/stock?branch=MER&search=tire` - Shareable filtered view
- `/admin/items?search=michelin` - Admin shares search results

---

## Mobile Responsive Navigation

- **Desktop**: Full sidebar menu
- **Tablet**: Collapsible sidebar with hamburger
- **Mobile**: Bottom navigation bar or drawer menu

---

## Accessibility (A11y)

- Keyboard navigation (Tab, Enter, Esc)
- ARIA labels on navigation items
- Skip to content link
- Focus visible indicators
- Screen reader announcements for route changes

---

## Future Enhancements

1. **Multi-branch Selector** (Supervisor)
   - Allow supervisors to view multiple branches
   - Dropdown in header to switch context

2. **Favorites / Recents**
   - Recently viewed transactions
   - Favorite items for quick access

3. **Advanced Search**
   - Global search across items, transactions, users
   - Quick command palette (Cmd+K)

4. **Reports Module**
   - Sales reports
   - Inventory reports
   - Financial reports
   - Export to Excel/PDF

5. **Notifications**
   - Low stock alerts
   - Price change notifications
   - Transaction approval workflows

---

## Summary

- **3 roles**: Seller, Supervisor, Admin
- **12 routes** total (7 shared, 4 admin-only, 1 public)
- **Role-based navigation**: Menu items hidden based on permissions
- **Branch-scoped access**: Sellers/Supervisors see only their branch
- **Price override**: Admin and Supervisor only
- **Clean routing**: No "access denied" pages, automatic redirects
- **Deep linking**: All pages support direct URLs

