# UX Behaviors Specification

Complete specification of user experience behaviors for Henry's Tires Inventory System.

---

## 1. Loading States

### Principle
**Always show progress.** Never leave the user wondering if something is happening.

### Implementation Patterns

#### A. Page Load
```typescript
// Component state
loading = signal(true);
data = signal<any[]>([]);

ngOnInit() {
  this.loadData();
}

loadData() {
  this.loading.set(true);

  this.service.getData().subscribe({
    next: (data) => {
      this.data.set(data);
      this.loading.set(false);
    },
    error: (err) => {
      this.loading.set(false);
      // Show error state
    }
  });
}
```

#### B. Table Loading
```html
<!-- While loading: Show skeleton rows -->
<table *ngIf="!loading(); else loadingSkeleton">
  <tr *ngFor="let item of items()">...</tr>
</table>

<ng-template #loadingSkeleton>
  <div class="skeleton-rows">
    <app-skeleton height="48px" *ngFor="let i of [1,2,3,4,5]"></app-skeleton>
  </div>
</ng-template>
```

#### C. Button Loading
```html
<app-button
  [loading]="saving()"
  [disabled]="saving()"
  (click)="onSubmit()">
  {{ saving() ? 'Saving...' : 'Save Changes' }}
</app-button>
```

**Visual:**
- Button shows spinner icon
- Text changes to present progressive ("Saving...")
- Button disabled (prevent double-click)
- Cursor: not-allowed

#### D. Form Loading
```html
<form>
  <app-input [disabled]="loading()" ...></app-input>
  <app-input [disabled]="loading()" ...></app-input>
  <app-button [loading]="loading()">Submit</app-button>
</form>
```

**Behavior:**
- All inputs disabled
- Submit button shows loading state
- User cannot modify form during save

### Loading State Guidelines

| Component | Loading Indicator | Duration Threshold |
|-----------|------------------|-------------------|
| Page | Skeleton layout | Always |
| Table | Skeleton rows (3-5) | Always |
| Form submission | Button spinner | Always |
| Autocomplete | Inline spinner in input | > 200ms |
| Search | Debounced, subtle spinner | > 300ms |
| Card data | Skeleton content | Always |

---

## 2. Empty States

### Principle
**Guide the user.** Empty states should be helpful, not just "No data."

### Implementation Patterns

#### A. List/Table Empty
```html
<div *ngIf="items().length === 0 && !loading()" class="empty-state">
  <svg class="empty-icon">...</svg>
  <h3>No items found</h3>
  <p>Get started by creating your first item.</p>
  <app-button variant="primary" (click)="createItem()">
    + Create Item
  </app-button>
</div>
```

**Components:**
- Icon (relevant to context)
- Heading (clear, concise)
- Message (helpful, actionable)
- CTA button (primary action)

#### B. Search No Results
```html
<div *ngIf="items().length === 0 && searchQuery && !loading()" class="empty-state">
  <svg>...</svg>
  <h3>No results for "{{ searchQuery }}"</h3>
  <p>Try adjusting your search or filters</p>
  <app-button variant="secondary" (click)="clearSearch()">
    Clear Search
  </app-button>
</div>
```

#### C. No Transactions Yet
```html
<div class="empty-state">
  <svg>...</svg>
  <h3>No transactions yet</h3>
  <p>Start by creating a Transfer IN or Transfer OUT transaction</p>
  <div class="button-group">
    <app-button routerLink="/transactions/in/new">Transfer IN</app-button>
    <app-button routerLink="/transactions/out/new">Transfer OUT</app-button>
  </div>
</div>
```

### Empty State Guidelines

| Context | Heading | Message | Action |
|---------|---------|---------|--------|
| No items | "No items found" | "Get started by creating your first item" | "+ Create Item" |
| No search results | "No results for '...'" | "Try adjusting your search or filters" | "Clear Search" |
| No transactions | "No transactions yet" | "Start by creating a Transfer IN or OUT" | Show both buttons |
| No stock | "No inventory" | "Add stock via Transfer IN" | "+ Transfer IN" |
| No users | "No users found" | "Create your first user" | "+ New User" |

### Styling
```css
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-secondary);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.empty-state p {
  font-size: var(--text-sm);
  margin-bottom: 24px;
}
```

---

## 3. Error States

### Principle
**Be helpful, not just informative.** Explain what went wrong AND how to fix it.

### Error Hierarchy

1. **Field-level errors** (inline, specific)
2. **Form-level errors** (banner, summary)
3. **Page-level errors** (full page, critical)
4. **Toast errors** (temporary, informational)

### Implementation Patterns

#### A. Field-Level Error
```html
<app-input
  label="Email"
  type="email"
  [(ngModel)]="email"
  [error]="emailError()"
  hint="We'll never share your email"
></app-input>
```

**Validation:**
```typescript
validateEmail() {
  if (!this.email) {
    this.emailError.set('Email is required');
    return false;
  }
  if (!this.isValidEmail(this.email)) {
    this.emailError.set('Please enter a valid email address');
    return false;
  }
  this.emailError.set('');
  return true;
}
```

#### B. Form-Level Error (Banner)
```html
<app-alert
  *ngIf="formError()"
  variant="danger"
  [dismissible]="true"
  (close)="formError.set('')">
  {{ formError() }}
</app-alert>

<form (ngSubmit)="onSubmit()">
  ...
</form>
```

**On Submit:**
```typescript
onSubmit() {
  if (!this.validateForm()) {
    this.formError.set('Please fix the errors above');
    return;
  }

  this.service.save(this.form).subscribe({
    error: (err) => {
      this.formError.set(
        err.error?.errorMessage || 'Failed to save. Please try again.'
      );
    }
  });
}
```

#### C. Page-Level Error
```html
<div *ngIf="error()" class="error-page">
  <svg>...</svg>
  <h2>Failed to load data</h2>
  <p>{{ error() }}</p>
  <app-button (click)="retry()">Retry</app-button>
</div>

<div *ngIf="!error()">
  <!-- Normal content -->
</div>
```

#### D. Toast Error (Transient)
```typescript
this.toastService.error('Failed to delete item');
```

### Error Message Guidelines

**Bad:**
- "Error occurred"
- "Invalid input"
- "500 Internal Server Error"

**Good:**
- "Failed to save item. Please try again."
- "Item code must be unique. 'TIRE-001' already exists."
- "Cannot connect to server. Check your internet connection."

### Error Response Handling
```typescript
.subscribe({
  error: (err) => {
    if (err.status === 400) {
      // Validation error
      this.error.set(err.error?.errorMessage || 'Invalid input');
    } else if (err.status === 401) {
      // Unauthorized - handled by interceptor
      this.authService.logout();
    } else if (err.status === 403) {
      // Forbidden
      this.error.set('You do not have permission to perform this action');
    } else if (err.status === 404) {
      // Not found
      this.error.set('Item not found');
    } else if (err.status === 409) {
      // Conflict
      this.error.set('Item already exists');
    } else if (err.status === 0) {
      // Network error
      this.error.set('Cannot connect to server. Please check your connection.');
    } else {
      // Generic error
      this.error.set('An unexpected error occurred. Please try again.');
    }
  }
});
```

---

## 4. Permission Behavior

### Principle
**Hide what users can't do.** Don't show disabled features — just don't show them at all.

### A. Menu Items (Role-based)

```typescript
// Sidebar navigation
menuItems = computed(() => {
  const role = this.authService.userRole();
  const baseItems = [
    { label: 'Stock', path: '/stock', icon: 'box' },
    { label: 'Transactions', path: '/transactions', icon: 'repeat' }
  ];

  if (role === Role.Admin) {
    return [
      { label: 'Dashboard', path: '/dashboard', icon: 'home' },
      ...baseItems,
      {
        label: 'Administration',
        icon: 'settings',
        children: [
          { label: 'Items', path: '/admin/items' },
          { label: 'Prices', path: '/admin/prices' },
          { label: 'Users', path: '/admin/users' }
        ]
      }
    ];
  }

  return baseItems;
});
```

**Result:**
- Seller sees: Stock, Transactions
- Admin sees: Dashboard, Stock, Transactions, Administration

### B. Page-Level Guards

```typescript
// app.routes.ts
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [adminGuard] // Only Admin can access
}
```

**Behavior:**
- If non-admin tries to access `/dashboard`
- Guard runs: `authService.isAdmin()` → false
- Redirect to: `/stock` (their default landing)
- No "Access Denied" page shown
- Silent redirect

### C. Feature-Level Permissions

```html
<!-- Price override in Transfer OUT -->
<div class="price-field">
  <label>Unit Price</label>

  <!-- Seller: Read-only -->
  <input
    *ngIf="!canOverridePrices()"
    [value]="latestPrice"
    disabled
  />

  <!-- Admin/Supervisor: Editable -->
  <input
    *ngIf="canOverridePrices()"
    [(ngModel)]="unitPrice"
    type="number"
  />

  <!-- Price notes (only if overridable) -->
  <textarea
    *ngIf="canOverridePrices()"
    [(ngModel)]="priceNotes"
    placeholder="Required if price changed"
  ></textarea>
</div>
```

```typescript
canOverridePrices = computed(() => {
  return this.authService.hasRole([Role.Admin, Role.Supervisor]);
});
```

### D. Action Buttons

```html
<!-- Item management actions -->
<div class="actions">
  <app-button
    *ngIf="isAdmin()"
    (click)="editItem(item)">
    Edit
  </app-button>
  <app-button
    *ngIf="isAdmin()"
    variant="danger"
    (click)="deleteItem(item)">
    Delete
  </app-button>
</div>
```

### Permission Check Patterns

```typescript
// Service method
isAdmin = computed(() => this.authService.isAdmin());
isSupervisor = computed(() => this.authService.isSupervisor());
isSeller = computed(() => this.authService.isSeller());

canOverridePrices = computed(() =>
  this.authService.hasRole([Role.Admin, Role.Supervisor])
);

canViewAllBranches = computed(() =>
  this.authService.hasRole([Role.Admin])
);
```

### Guidelines

**DO:**
- ✅ Hide features user cannot access
- ✅ Redirect silently if unauthorized
- ✅ Show relevant menu items only
- ✅ Use computed signals for reactive permissions

**DON'T:**
- ❌ Show "Access Denied" pages
- ❌ Show disabled buttons for unauthorized actions
- ❌ Display error messages for permission issues (unless manual URL entry)
- ❌ Expose sensitive data in disabled state

---

## 5. Validation Behavior

### Principle
**Validate early, prevent errors.** Real-time feedback is better than submit-time surprises.

### A. Required Fields

```html
<app-input
  label="Item Code"
  [(ngModel)]="itemCode"
  [required]="true"
  [error]="itemCodeError()"
  (blur)="validateItemCode()"
></app-input>
```

**Validation:**
```typescript
validateItemCode() {
  if (!this.itemCode.trim()) {
    this.itemCodeError.set('Item code is required');
    return false;
  }
  if (this.itemCode.length < 3) {
    this.itemCodeError.set('Item code must be at least 3 characters');
    return false;
  }
  this.itemCodeError.set('');
  return true;
}
```

### B. Real-time Stock Validation (Transfer OUT)

```typescript
// When item or quantity changes
checkStock(lineIndex: number) {
  const line = this.lines()[lineIndex];
  const branchCode = this.branchCode || this.authService.branchCode();

  this.inventoryService.getInventorySummaryByBranchAndItem(
    branchCode,
    line.itemCode
  ).subscribe({
    next: (summary) => {
      const entry = summary.entries.find(e => e.condition === line.condition);
      const available = entry ? (entry.onHand - entry.reserved) : 0;

      // Update line with available stock
      line.availableStock = available;
      line.hasStockError = line.quantity > available;

      // Show error message
      if (line.hasStockError) {
        line.stockErrorMessage =
          `Insufficient stock: Need ${line.quantity}, Available ${available}`;
      } else {
        line.stockErrorMessage = '';
      }
    }
  });
}
```

**Visual Feedback:**
```html
<div class="stock-indicator">
  <span *ngIf="!line.hasStockError" class="success">
    ✓ Available: {{ line.availableStock }}
  </span>
  <span *ngIf="line.hasStockError" class="error">
    ✗ {{ line.stockErrorMessage }}
  </span>
</div>
```

### C. Price Override Validation

```typescript
validatePriceOverride(line: TransactionLine): boolean {
  if (!this.canOverridePrices()) {
    // Seller cannot override
    return true; // Skip validation
  }

  const priceChanged = line.unitPrice !== line.latestPrice;

  if (priceChanged && !line.priceNotes?.trim()) {
    line.priceNotesError = 'Price notes required when overriding price';
    return false;
  }

  line.priceNotesError = '';
  return true;
}
```

**Visual:**
```html
<div class="price-override">
  <input [(ngModel)]="line.unitPrice" />
  <span *ngIf="priceChanged" class="override-indicator">*</span>

  <textarea
    *ngIf="priceChanged"
    [(ngModel)]="line.priceNotes"
    placeholder="Reason for price override (required)"
  ></textarea>
  <span *ngIf="line.priceNotesError" class="error">
    {{ line.priceNotesError }}
  </span>
</div>
```

### D. Form Submit Validation

```typescript
isFormValid(): boolean {
  if (this.lines().length === 0) return false;

  return this.lines().every(line => {
    const hasValidItem = !!line.itemCode;
    const hasValidQty = line.quantity > 0;
    const hasValidStock = !line.hasStockError;
    const hasValidPriceNotes = this.validatePriceOverride(line);

    return hasValidItem && hasValidQty && hasValidStock && hasValidPriceNotes;
  });
}
```

```html
<app-button
  type="submit"
  [disabled]="!isFormValid()"
  (click)="onSubmit()">
  Create Transaction
</app-button>
```

**Button States:**
- Enabled: All validations pass
- Disabled: Any validation fails
- Tooltip (optional): "Fix errors above to continue"

### Validation Timing

| Field Type | Validation Trigger | Feedback Timing |
|------------|-------------------|-----------------|
| Required text | On blur | Immediate |
| Email/format | On blur | Immediate |
| Unique item code | On blur + debounce | After 300ms |
| Stock availability | On item/qty change | Real-time |
| Price override | On price change | Immediate |
| Form submission | On submit click | Prevent if invalid |

---

## 6. Draft vs Committed Behavior

### Principle
**Transactions are immutable once committed.** Drafts are flexible, committed are locked.

### Status Workflow

```
┌───────┐    commit()     ┌───────────┐
│ Draft ├───────────────→ │ Committed │ (Immutable)
└───┬───┘                 └───────────┘
    │
    │ cancel()
    ↓
┌───────────┐
│ Cancelled │ (Immutable)
└───────────┘
```

### Implementation

```typescript
// Current implementation: Auto-commit
createTransaction() {
  this.transactionsService.createInTransaction(request).subscribe({
    next: (transaction) => {
      // Auto-commit immediately
      this.commitTransaction(transaction.id);
    }
  });
}

commitTransaction(id: string) {
  this.transactionsService.commitTransaction(id).subscribe({
    next: () => {
      this.toastService.success('Transaction committed successfully');
      this.router.navigate(['/transactions', id]);
    }
  });
}
```

### Future Enhancement: Draft Support

```typescript
createDraft() {
  // Save as draft (status = Draft)
  this.transactionsService.createInTransaction(request).subscribe({
    next: (transaction) => {
      this.toastService.info('Draft saved');
      // User can edit later
    }
  });
}
```

**Draft Features:**
- Editable
- Can be cancelled
- Doesn't affect inventory
- Shown in transaction list with "Draft" badge

**Committed Features:**
- Read-only
- Cannot be edited
- Cannot be cancelled (only Admin can reverse via Adjust)
- Inventory updated
- Shown with "Committed" badge

---

## 7. Confirmation Patterns

### Principle
**Use confirmations sparingly.** Only for destructive or irreversible actions.

### When to Confirm

**YES (Destructive):**
- ✅ Delete item
- ✅ Delete user
- ✅ Cancel committed transaction (admin only)
- ✅ Deactivate user

**NO (Reversible or Safe):**
- ❌ Create transaction
- ❌ Update price
- ❌ Edit item description
- ❌ Filter/search

### Implementation

#### A. Browser Confirm (Simple)
```typescript
deleteItem(item: Item) {
  if (!confirm(`Delete "${item.itemCode}"? This cannot be undone.`)) {
    return;
  }

  this.itemsService.deleteItem(item.itemCode).subscribe({
    next: () => {
      this.toastService.success('Item deleted');
      this.loadItems();
    }
  });
}
```

**Pros:** Simple, native, fast
**Cons:** Cannot customize styling

#### B. Custom Modal (Future)
```typescript
deleteItem(item: Item) {
  this.confirmModal.open({
    title: 'Delete Item?',
    message: `Are you sure you want to delete "${item.itemCode}"? This action cannot be undone.`,
    confirmText: 'Delete',
    confirmVariant: 'danger',
    onConfirm: () => {
      this.itemsService.deleteItem(item.itemCode).subscribe({...});
    }
  });
}
```

**Pros:** Custom styling, branded
**Cons:** More code, slower

### Confirmation Message Guidelines

**Structure:**
1. Question: "Delete item?"
2. Context: Name of item being affected
3. Warning: "This cannot be undone"
4. Buttons: "Cancel" (default) + "Delete" (danger)

**Examples:**
- "Delete 'TIRE-001'? This action cannot be undone."
- "Deactivate user 'mercury'? They will no longer be able to log in."
- "Cancel transaction #TXN-000123? Inventory changes will be reversed."

---

## 8. Auto-refresh and Real-time Updates

### Principle
**Keep data fresh, but don't disrupt the user.**

### Auto-refresh (Future)

```typescript
// Dashboard auto-refresh every 30 seconds
private refreshInterval: any;

ngOnInit() {
  this.loadDashboard();

  this.refreshInterval = setInterval(() => {
    this.loadDashboard();
  }, 30000); // 30 seconds
}

ngOnDestroy() {
  if (this.refreshInterval) {
    clearInterval(this.refreshInterval);
  }
}
```

**With User Feedback:**
```html
<div class="page-header">
  <h1>Dashboard</h1>
  <span class="last-updated">Updated {{ lastUpdated() }}</span>
  <app-button size="sm" variant="ghost" (click)="refresh()">
    ⟲ Refresh
  </app-button>
</div>
```

### Guidelines

| Page | Auto-refresh | Interval | Manual Refresh |
|------|-------------|----------|----------------|
| Dashboard | Yes | 30s | ✓ |
| Stock List | Optional | 60s | ✓ |
| Transaction List | No | - | ✓ |
| Transaction Details | No | - | ✗ |
| Admin pages | No | - | ✓ |

---

## 9. Search and Filter Behavior

### Debounced Search

```typescript
searchQuery = '';
private searchSubject = new Subject<string>();

ngOnInit() {
  this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged()
  ).subscribe(query => {
    this.currentPage.set(1);
    this.loadData();
  });
}

onSearchChange(query: string) {
  this.searchQuery = query;
  this.searchSubject.next(query);
}
```

**Behavior:**
- User types
- Wait 300ms after last keystroke
- Execute search
- Reset to page 1

### Filter Behavior

```typescript
onFilterChange(filter: any) {
  this.currentFilters.set(filter);
  this.currentPage.set(1); // Reset pagination
  this.loadData(); // Immediate (no debounce)
}
```

---

## 10. Toast Notification Guidelines

### When to Use

**Success:**
- ✅ Item created
- ✅ Transaction committed
- ✅ Price updated
- ✅ User saved

**Error:**
- ✅ Failed to save
- ✅ Network error
- ✅ Validation failed (summary)

**Info:**
- ✅ Data refreshed
- ✅ Draft saved

**Warning:**
- ✅ Low stock alert
- ✅ Price override detected

### Don't Overuse

**Avoid toasts for:**
- ❌ Navigation (just navigate)
- ❌ Loading states (use spinners)
- ❌ Field validation (use inline errors)

---

## Summary

1. **Loading States:** Always show progress (spinners, skeletons, disabled states)
2. **Empty States:** Helpful messages with clear CTAs
3. **Error States:** Specific messages, recovery actions, graceful degradation
4. **Permissions:** Hide unauthorized features, silent redirects, no "access denied"
5. **Validation:** Real-time for stock, on-blur for fields, prevent invalid submits
6. **Drafts:** Future feature for editable transactions
7. **Confirmations:** Only for destructive actions, use native confirm()
8. **Auto-refresh:** Optional, 30-60s intervals, manual refresh always available
9. **Search:** Debounced (300ms), reset pagination, immediate filters
10. **Toasts:** Success/error feedback, auto-dismiss 3s, top-right

