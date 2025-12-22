# Screen Design Specifications

Complete layout details for every screen in the Henry's Tires Inventory System.

---

## 1. Login Screen

**Route:** `/login`
**Access:** Public (unauthenticated)
**Layout:** Centered card on full-screen background

### Components

```
┌────────────────────────────────────────────┐
│                                            │
│                                            │
│         ┌──────────────────────┐          │
│         │                      │          │
│         │   Henry's Tires      │          │
│         │   Inventory System   │          │
│         │                      │          │
│         │  ┌────────────────┐  │          │
│         │  │ Username       │  │          │
│         │  └────────────────┘  │          │
│         │                      │          │
│         │  ┌────────────────┐  │          │
│         │  │ Password       │  │          │
│         │  └────────────────┘  │          │
│         │                      │          │
│         │  ┌────────────────┐  │          │
│         │  │   Sign In      │  │          │
│         │  └────────────────┘  │          │
│         │                      │          │
│         │  Dev credentials:    │          │
│         │  admin / admin123    │          │
│         │                      │          │
│         └──────────────────────┘          │
│                                            │
│                                            │
└────────────────────────────────────────────┘
```

### Sections

1. **Logo/Title**
   - Company name: "Henry's Tires"
   - Subtitle: "Inventory Management System"
   - Centered, large typography

2. **Login Form**
   - Username input (text)
   - Password input (password)
   - Sign In button (full-width, primary)
   - Auto-focus on username field

3. **Dev Credentials** (Development Only)
   - Small text showing demo credentials
   - Removed in production build

### Behavior

- **On Submit:**
  - Show loading spinner on button
  - Disable form inputs
  - Call auth API
  - On success: Navigate to role-based landing
  - On error: Show error alert above form

- **Validation:**
  - Username required
  - Password required
  - Show field-level errors

- **States:**
  - Idle: Normal state
  - Loading: Button shows spinner, inputs disabled
  - Error: Red alert banner with error message

---

## 2. Branch Stock (Seller/Supervisor Default Landing)

**Route:** `/stock`
**Access:** All authenticated users
**Layout:** Main content area with header, search, and table

### Components

```
┌─────────────────────────────────────────────────────────────┐
│ SIDEBAR │ MAIN CONTENT                                      │
├─────────┼───────────────────────────────────────────────────┤
│         │ Branch Stock                                      │
│         │ ┌──────────────────┐  Branch: Mercury [Seller]   │
│ Stock   │ │ Search items...  │  [Filter ▼] [Refresh]       │
│ Trans.  │ └──────────────────┘                              │
│         │                                                   │
│         │ ┌─────────────────────────────────────────────┐   │
│         │ │ ITEM CODE │ DESC.  │ NEW  │ USED │ AVAIL. │   │
│         │ ├───────────┼────────┼──────┼──────┼────────┤   │
│         │ │ TIRE-001  │ Mich.. │   45 │   12 │    57  │   │
│         │ │ TIRE-002  │ Brid.. │  120 │    8 │   128  │   │
│         │ │ TIRE-003  │ Cont.. │   67 │   23 │    90  │   │
│         │ └─────────────────────────────────────────────┘   │
│         │                                                   │
│         │ Showing 1-20 of 247 items    [< Prev] [Next >]   │
└─────────┴───────────────────────────────────────────────────┘
```

### Sections

1. **Page Header**
   - Title: "Branch Stock"
   - Branch indicator: "Branch: [Branch Name]" (for Seller/Supervisor)
   - Admin sees: "All Branches" or branch filter dropdown

2. **Toolbar**
   - Search input (debounced)
   - Condition filter dropdown (All, New, Used)
   - Branch filter (Admin only)
   - Refresh button
   - Export button (future)

3. **Stock Table**
   - Sticky header
   - Sortable columns
   - Columns:
     - Item Code (left-aligned, bold)
     - Description (left-aligned)
     - New OnHand (right-aligned, number)
     - New Reserved (right-aligned, number, gray)
     - Used OnHand (right-aligned, number)
     - Used Reserved (right-aligned, number, gray)
     - Available (right-aligned, bold, calculated: onHand - reserved)
   - Row hover effect
   - Clickable rows → Transaction history for that item (future)

4. **Pagination**
   - Info: "Showing X-Y of Z items"
   - Previous/Next buttons
   - Page number

### Behavior

- **Loading State:**
  - Show skeleton rows (3-5)
  - Disable search and filters

- **Empty State:**
  - "No items in stock"
  - "Add inventory via Transfer IN"

- **Error State:**
  - "Failed to load stock data"
  - "Retry" button

- **Search:**
  - Debounced (300ms)
  - Searches item code and description
  - Resets to page 1

- **Filters:**
  - Condition filter: All, New, Used
  - Branch filter (Admin only)
  - Applied immediately

- **Real-time Updates:** (future)
  - Auto-refresh every 30 seconds
  - Show "Updated X seconds ago"

### Permission Differences

- **Seller/Supervisor:**
  - See only their assigned branch
  - Cannot switch branches
  - Branch name shown in header

- **Admin:**
  - Branch dropdown to filter
  - Default: "All Branches"
  - Can view any branch

---

## 3. Create Transfer IN

**Route:** `/transactions/in/new`
**Access:** All authenticated users
**Layout:** Form with multi-line item entry

### Components

```
┌────────────────────────────────────────────────────────────┐
│ Create Transfer IN                                         │
│                                                            │
│ Transaction Details                                        │
│ ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│ │ Branch: MER  │  │ Date: Today   │  │ Notes (optional) │ │
│ └──────────────┘  └───────────────┘  └──────────────────┘ │
│                                                            │
│ Items                                                      │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Item Code  │ Condition │ Qty │ Price │ Currency │ ✕  │   │
│ ├────────────┼───────────┼─────┼───────┼──────────┼────┤   │
│ │ TIRE-001   │ New ▼     │  25 │ 125.50│ USD      │ ✕  │   │
│ │ TIRE-003   │ Used ▼    │  10 │       │ USD      │ ✕  │   │
│ └──────────────────────────────────────────────────────┘   │
│ [+ Add Line]                                               │
│                                                            │
│ Summary                                                    │
│ Total Lines: 2                                             │
│ Total Qty: 35                                              │
│                                                            │
│ [Cancel]  [Create Draft]                                   │
└────────────────────────────────────────────────────────────┘
```

### Sections

1. **Page Header**
   - Title: "Create Transfer IN"
   - Breadcrumb: Home > Transactions > Transfer IN

2. **Transaction Details**
   - Branch selector (Admin) or fixed branch (Seller/Supervisor)
   - Transaction date (defaults to today, editable)
   - Notes textarea (optional)

3. **Item Lines**
   - Dynamic table with add/remove rows
   - Columns:
     - Item Code (autocomplete dropdown from items API)
     - Condition (dropdown: New, Used)
     - Quantity (number input, min: 1)
     - Unit Price (optional, decimal, 2 places)
     - Currency (dropdown: USD, defaults)
     - Actions (remove line button)
   - "+ Add Line" button below table

4. **Summary Panel**
   - Total lines count
   - Total quantity sum
   - Optional: Total value (if prices entered)

5. **Actions**
   - Cancel button (navigate back)
   - Create Draft button (primary)

### Behavior

- **Loading State:**
  - Show spinner while creating
  - Disable all inputs and buttons

- **Validation:**
  - At least 1 line required
  - All lines must have:
    - Valid item code
    - Valid condition
    - Quantity > 0
  - Show field-level errors
  - Disable submit if invalid

- **Item Code Autocomplete:**
  - Dropdown of items from API
  - Search as user types
  - Show item code + description
  - Validate item exists

- **On Submit:**
  - Create draft transaction (POST /api/v1/transactions/in)
  - Auto-commit transaction (POST /api/v1/transactions/:id/commit)
  - Show success toast: "Transfer IN created successfully"
  - Navigate to transaction details

- **Error Handling:**
  - API errors shown as alert banner
  - Field-level validation errors
  - Network errors: "Failed to create transaction. Retry?"

### Permission Differences

- **Seller/Supervisor:**
  - Branch fixed to their assigned branch
  - Cannot select other branches

- **Admin:**
  - Branch dropdown to select any branch
  - Can create for any location

---

## 4. Create Transfer OUT

**Route:** `/transactions/out/new`
**Access:** All authenticated users
**Layout:** Form with multi-line item entry and validation

### Components

```
┌────────────────────────────────────────────────────────────┐
│ Create Transfer OUT                                        │
│                                                            │
│ Transaction Details                                        │
│ ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐ │
│ │ Branch: MER  │  │ Date: Today   │  │ Notes (optional) │ │
│ └──────────────┘  └───────────────┘  └──────────────────┘ │
│                                                            │
│ Items                                                      │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ Item │ Cond. │ Qty │ Avail. │ Price │ Notes    │ ✕    │  │
│ ├──────┼───────┼─────┼────────┼───────┼──────────┼──────┤  │
│ │ TIRE │ New   │  10 │ 45 ✓   │125.50 │          │  ✕   │  │
│ │ TIRE │ New   │  50 │ 45 ✗   │120.00*│Required! │  ✕   │  │
│ └───────────────────────────────────────────────────────┘  │
│ * Price override (Admin/Supervisor only)                   │
│ ✗ Insufficient stock - cannot submit                      │
│                                                            │
│ [+ Add Line]                                               │
│                                                            │
│ [Cancel]  [Create Transaction]                             │
└────────────────────────────────────────────────────────────┘
```

### Sections

1. **Page Header**
   - Title: "Create Transfer OUT"
   - Warning: "Stock will be deducted upon commit"

2. **Transaction Details**
   - Branch (fixed or selectable)
   - Date
   - Notes

3. **Item Lines**
   - Columns:
     - Item Code (autocomplete)
     - Condition (New, Used)
     - Quantity (number)
     - **Available Stock** (read-only, fetched real-time)
     - Unit Price (editable for Admin/Supervisor, read-only for Seller)
     - **Price Notes** (required if price override used)
     - Actions (remove)
   - Real-time stock validation
   - Visual indicators:
     - ✓ Green check if qty ≤ available
     - ✗ Red X if qty > available

4. **Validation Messages**
   - Inline per line:
     - "Insufficient stock: Need 50, Available 45"
     - "Price override requires notes"
   - Form-level:
     - "Cannot submit: Fix errors above"

5. **Actions**
   - Cancel
   - Create Transaction (disabled if validation errors)

### Behavior

- **Real-time Stock Check:**
  - When item + condition selected: Fetch available stock
  - When quantity changes: Re-validate
  - Show available vs requested
  - Block submit if insufficient

- **Price Override Logic:**
  - **Seller:**
    - Price shown from ConsumableItemPrice (read-only)
    - Cannot edit price
    - Price notes field hidden
  - **Supervisor/Admin:**
    - Price editable
    - If price changed: "Price Notes" field becomes required
    - Validation: Notes required if price != latest price
    - Visual indicator: "*" next to price field if overridden

- **Validation:**
  - All lines: qty ≤ available stock
  - If price override: Notes required
  - Cannot submit with errors
  - Show specific error messages

- **On Submit:**
  - Create draft OUT transaction
  - Auto-commit
  - Success: Navigate to details
  - Error: Show alert

### Permission Differences

- **Seller:**
  - ❌ Cannot override prices
  - Price field disabled
  - Price notes hidden

- **Supervisor/Admin:**
  - ✅ Can override prices
  - Price field editable
  - Price notes required if changed

---

## 5. Transaction Details

**Route:** `/transactions/:id`
**Access:** All authenticated users
**Layout:** Details view with header, metadata, and line items

### Components

```
┌────────────────────────────────────────────────────────────┐
│ Transaction Details                                        │
│ ← Back to Transactions                                     │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Transfer OUT #TXN-000123                               │ │
│ │ Status: [Committed]  Branch: Mercury  Date: 1/15/2025 │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Items (3)                                                  │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Item Code │ Condition │ Qty │ Price  │ Total       │   │
│ ├───────────┼───────────┼─────┼────────┼─────────────┤   │
│ │ TIRE-001  │ New       │  10 │ 125.50 │   1,255.00  │   │
│ │ TIRE-002  │ Used      │   5 │  80.00*│     400.00  │   │
│ │ TIRE-003  │ New       │  15 │ 150.00 │   2,250.00  │   │
│ ├───────────┴───────────┴─────┴────────┼─────────────┤   │
│ │                            Total Qty: │     30      │   │
│ │                          Total Value: │  $3,905.00  │   │
│ └──────────────────────────────────────────────────────┘   │
│ * Price override by admin (Notes: Special customer deal)   │
│                                                            │
│ Audit Trail                                                │
│ Created: 1/15/2025 10:30 AM by mercury                    │
│ Committed: 1/15/2025 10:31 AM by mercury                  │
│                                                            │
│ Notes                                                      │
│ Customer purchase - Walk-in sale                          │
│                                                            │
│ [Print] [Export PDF]                                       │
└────────────────────────────────────────────────────────────┘
```

### Sections

1. **Page Header**
   - Back link to transaction list
   - Transaction type + number
   - Status badge (Draft, Committed, Cancelled)

2. **Transaction Metadata**
   - Transaction number
   - Status (colored badge)
   - Branch
   - Transaction date
   - Type (IN, OUT, ADJUST)

3. **Line Items Table**
   - Sticky header
   - Columns:
     - Item Code
     - Condition
     - Quantity (right-aligned)
     - Unit Price (right-aligned, show currency)
     - Line Total (right-aligned, bold)
   - Totals row:
     - Total Qty
     - Total Value
   - Price override indicator:
     - "*" next to price
     - Footnote showing override details

4. **Audit Trail**
   - Created by/when
   - Modified by/when (if applicable)
   - Committed by/when
   - Cancelled by/when (if applicable)

5. **Notes Section**
   - Transaction-level notes
   - Price override notes (if any)

6. **Actions** (future)
   - Print button
   - Export to PDF
   - Cancel transaction (if Draft status, Admin only)

### Behavior

- **Loading State:**
  - Show skeleton layout
  - Disable actions

- **Error State:**
  - "Transaction not found"
  - "Failed to load details"

- **Status-based Display:**
  - **Draft:** Yellow badge, editable (future), cancellable
  - **Committed:** Green badge, read-only, immutable
  - **Cancelled:** Red badge, read-only, strikethrough

- **Price Override Display:**
  - If price source is "Manual":
    - Show "*" indicator
    - Display who overrode (role + user)
    - Show price notes below table

---

## 6. Admin Global Dashboard

**Route:** `/dashboard`
**Access:** Admin only
**Layout:** Metrics cards + tables

### Components

```
┌────────────────────────────────────────────────────────────┐
│ Admin Dashboard                                            │
│                                                            │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│ │  5   │ │ 247  │ │1,523 │ │  12  │ │  89  │             │
│ │Branch│ │Items │ │Stock │ │Users │ │Trans │             │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                            │
│ Sales Summary (Last 30 Days)                               │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Branch      │ Daily Avg │ Weekly │ Monthly │ Total   │ │
│ ├─────────────┼───────────┼────────┼─────────┼─────────┤ │
│ │ Mercury     │   $2,450  │$17,150 │ $73,500 │$220,500││ │
│ │ Williamsbg  │   $1,890  │$13,230 │ $56,700 │$170,100││ │
│ │ Warwick     │   $3,120  │$21,840 │ $93,600 │$280,800││ │
│ │ Jefferson   │   $1,650  │$11,550 │ $49,500 │$148,500││ │
│ │ Pembroke    │   $2,200  │$15,400 │ $66,000 │$198,000││ │
│ ├─────────────┼───────────┼────────┼─────────┼─────────┤ │
│ │ TOTAL       │  $11,310  │$79,170 │$339,300 │$1.02M  ││ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Recent Activity (Last 10 Transactions)                     │
│ • Transfer OUT #TXN-000123 - Mercury - $1,255 (5m ago)    │
│ • Transfer IN #TXN-000122 - Warwick - 45 units (12m ago)  │
│ • Transfer OUT #TXN-000121 - Jeff. - $890 (1h ago)        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Sections

1. **Page Header**
   - Title: "Admin Dashboard"
   - Period selector: Last 7 days, 30 days, 90 days (future)
   - Last updated timestamp

2. **Metrics Cards** (5 cards)
   - Total Branches (static: 5)
   - Total Items (from items API)
   - Total Stock Units (from inventory API)
   - Active Users (from users API)
   - Total Transactions (from transactions API)
   - Large number, small label
   - Loading skeleton while fetching

3. **Sales Summary Table**
   - Excel-like professional table
   - Sticky header
   - Columns:
     - Branch (left-aligned)
     - Daily Avg (right-aligned, currency)
     - Weekly Total (right-aligned, currency)
     - Monthly Total (right-aligned, currency)
     - Grand Total (right-aligned, currency, bold)
   - Totals row at bottom:
     - Bold text
     - Slightly darker background
     - Sum of all columns
   - Number formatting:
     - Currency with $ symbol
     - Thousand separators
     - Abbreviated large numbers (1.02M)

4. **Recent Activity Feed**
   - Last 10 transactions
   - Format: Type + Number + Branch + Value/Qty + Time ago
   - Clickable → Navigate to transaction details
   - Auto-refresh every 30 seconds

5. **Quick Actions** (future)
   - "View Low Stock Items"
   - "Export Monthly Report"
   - "View All Transactions"

### Behavior

- **Loading State:**
  - Show skeleton cards (5)
  - Show skeleton table rows (5)
  - Show skeleton activity items (3)

- **Empty State:**
  - If no data: "No transactions yet"
  - Encourage action: "Create first transaction"

- **Error State:**
  - Failed to load metrics
  - Retry button

- **Real-time Updates:**
  - Auto-refresh metrics every 30 seconds
  - Show "Updated X seconds ago"
  - Activity feed updates automatically

- **Data Aggregation:**
  - Fetch from multiple APIs in parallel
  - Calculate sums and averages
  - Cache for 30 seconds

### Table Styling (Excel-like)

- Grid borders (subtle gray)
- Alternating row colors (very subtle)
- Bold totals row
- Right-align numbers
- Hover row highlight
- Sticky header on scroll

---

## 7. Item Management

**Route:** `/admin/items`
**Access:** Admin only
**Layout:** List with search and CRUD operations

### Components

```
┌────────────────────────────────────────────────────────────┐
│ Item Management                                            │
│ ┌──────────────────┐                        [+ New Item]   │
│ │ Search items...  │                                       │
│ └──────────────────┘                                       │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Item Code │ Description              │ Created  │ ⚙  │   │
│ ├───────────┼─────────────────────────┼──────────┼────┤   │
│ │ TIRE-001  │ Michelin Pilot Sport 4S │ mercury  │ ✎ ✕│   │
│ │ TIRE-002  │ Bridgestone Potenza RE  │ admin    │ ✎ ✕│   │
│ │ TIRE-003  │ Continental ExtremeC.   │ admin    │ ✎ ✕│   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ Showing 1-20 of 247 items    [< Prev] [Next >]            │
└────────────────────────────────────────────────────────────┘
```

### Sections

1. **Page Header**
   - Title: "Item Management"
   - "+ New Item" button (primary)

2. **Search Bar**
   - Debounced search
   - Searches code and description

3. **Items Table**
   - Columns:
     - Item Code (bold, left-aligned)
     - Description (left-aligned)
     - Created By (left-aligned)
     - Actions (Edit, Delete icons)
   - Row hover
   - Deleted items shown with opacity 0.5

4. **Pagination**
   - Standard pagination controls

5. **Item Form Modal**
   - Triggered by "+ New Item" or "Edit" icon
   - Fields:
     - Item Code (required, uppercase, disabled when editing)
     - Description (required)
   - Actions: Cancel, Create/Update

### Behavior

- **Create Item:**
  - Click "+ New Item"
  - Modal opens
  - Fill form
  - Submit: POST /api/v1/items
  - Success: Close modal, reload list, show toast
  - Error: Show error in modal

- **Edit Item:**
  - Click edit icon
  - Modal opens with pre-filled data
  - Item code disabled (cannot change)
  - Update description
  - Submit: PUT /api/v1/items/:itemCode
  - Success: Close modal, reload list, show toast

- **Delete Item:**
  - Click delete icon
  - Confirm: "Delete TIRE-001?"
  - Submit: DELETE /api/v1/items/:itemCode
  - Success: Reload list, show toast
  - Soft delete: Item still in list but grayed out

- **Loading State:**
  - Skeleton table rows
  - Disable search and buttons

- **Empty State:**
  - "No items found"
  - "Create your first item"

---

## 8. Price Management

**Route:** `/admin/prices`
**Access:** Admin only
**Layout:** List with price history

### Components

```
┌────────────────────────────────────────────────────────────┐
│ Price Management                                           │
│ ┌──────────────────┐                                       │
│ │ Search items...  │                                       │
│ └──────────────────┘                                       │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Item Code │ Current Price │ Updated    │ Updated By│ ✎ │   │
│ ├───────────┼───────────────┼────────────┼───────────┼───┤   │
│ │ TIRE-001  │ $125.50 USD   │ 1/15/2025  │ admin     │ ✎ │   │
│ │ TIRE-002  │ $ 89.99 USD   │ 1/10/2025  │ admin     │ ✎ │   │
│ │ TIRE-003  │ $150.00 USD   │ 1/08/2025  │ admin     │ ✎ │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ Showing 1-20 of 247 items    [< Prev] [Next >]            │
└────────────────────────────────────────────────────────────┘
```

### Sections

1. **Page Header**
   - Title: "Price Management"

2. **Search Bar**
   - Search by item code or description

3. **Prices Table**
   - Columns:
     - Item Code
     - Current Price (right-aligned, bold)
     - Currency (USD)
     - Last Updated Date
     - Updated By (username)
     - Actions (Edit icon)

4. **Price Update Modal**
   - Triggered by edit icon
   - Fields:
     - Item Code (read-only)
     - Current Price (read-only, shown for reference)
     - New Price (decimal, 2 places, required)
     - Currency (dropdown, defaults to USD)
     - Notes (optional)
   - Show price history below (read-only list)
   - Actions: Cancel, Update Price

### Behavior

- **Update Price:**
  - Click edit icon
  - Modal shows current price and history
  - Enter new price
  - Submit: PUT /api/v1/prices/:itemCode
  - Success: Close modal, reload list, toast
  - Price history automatically tracked

- **Price History:**
  - Modal shows last 10 price changes
  - Format: "$125.50 → $130.00 on 1/15/2025 by admin"
  - Expandable to see all history

---

## 9. User Management

**Route:** `/admin/users`
**Access:** Admin only
**Layout:** List with CRUD operations

### Components

```
┌────────────────────────────────────────────────────────────┐
│ User Management                                 [+ New User]│
│ ┌──────────────────┐                                       │
│ │ Search users...  │                                       │
│ └──────────────────┘                                       │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Username │ Role       │ Branch       │ Active │ ⚙    │   │
│ ├──────────┼────────────┼──────────────┼────────┼──────┤   │
│ │ admin    │ Admin      │ -            │ ✓      │ ✎    │   │
│ │ mercury  │ Seller     │ Mercury      │ ✓      │ ✎ ✕  │   │
│ │ warwick  │ Supervisor │ Warwick      │ ✓      │ ✎ ✕  │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ Showing 1-12 of 12 users    [< Prev] [Next >]             │
└────────────────────────────────────────────────────────────┘
```

### Sections

1. **Page Header**
   - Title: "User Management"
   - "+ New User" button

2. **Users Table**
   - Columns:
     - Username
     - Role (badge: Admin=red, Supervisor=blue, Seller=gray)
     - Branch (N/A for Admin)
     - Active (checkmark or X)
     - Actions (Edit, Deactivate)

3. **User Form Modal**
   - Fields:
     - Username (required, disabled when editing)
     - Password (required for create, optional for edit)
     - Role (dropdown: Admin, Supervisor, Seller)
     - Branch (dropdown, required if not Admin)
     - Active (checkbox, default true)
   - Actions: Cancel, Create/Update

### Behavior

- **Create User:**
  - Modal opens
  - All fields required
  - If role = Seller/Supervisor: Branch required
  - Submit: POST /api/v1/users
  - Password hashed by backend

- **Edit User:**
  - Modal pre-filled
  - Username disabled
  - Password optional (only if changing)
  - Update role/branch/active status
  - Submit: PUT /api/v1/users/:id

- **Deactivate User:**
  - Set active = false
  - User cannot login
  - Data preserved

---

## Common UI Patterns

### Loading States
- Skeleton placeholders for tables (3-5 rows)
- Spinner for buttons during submit
- Disabled inputs during loading
- "Loading..." text for slow operations

### Empty States
- Icon + message + action
- Example: "No items found. Create your first item."
- Friendly, actionable

### Error States
- Red alert banner at top of form/page
- Specific error message
- Retry button if applicable
- Field-level errors in red below input

### Success Feedback
- Toast notification (auto-dismiss 3s)
- Green checkmark icon
- Short message: "Item created successfully"

### Confirmation Patterns
- Use browser confirm() for destructive actions
- Example: "Delete TIRE-001? This cannot be undone."
- Avoid modal dialogs for simple confirmations

---

## Responsive Behavior

- **Desktop (>1024px):** Full layout with sidebar
- **Tablet (768-1023px):** Collapsible sidebar
- **Mobile (<768px):** Bottom nav or hamburger menu, stacked tables

---

## Accessibility

- Focus states visible
- Keyboard navigation (Tab, Enter, Esc)
- ARIA labels on buttons and inputs
- Sufficient color contrast
- Screen reader announcements for state changes

