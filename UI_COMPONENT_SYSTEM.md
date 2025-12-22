# UI Component System

Professional design system for Henry's Tires Inventory Management System.

Inspired by: Stripe, Linear, Vercel — minimal, clean, B2B-focused.

---

## Design Principles

1. **Minimal & Clean** — No gradients, no clutter
2. **Functional First** — Prioritize usability over decoration
3. **Consistent** — Reusable patterns, predictable behavior
4. **Accessible** — WCAG 2.1 AA compliant
5. **Professional** — B2B aesthetic, Excel-like data tables

---

## 1. Typography Scale

### Font Family
```css
--font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
                     'Helvetica Neue', Arial, sans-serif;
--font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
```

### Font Sizes
```css
--text-xs:   0.75rem;  /* 12px */
--text-sm:   0.875rem; /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg:   1.125rem; /* 18px */
--text-xl:   1.25rem;  /* 20px */
--text-2xl:  1.5rem;   /* 24px */
--text-3xl:  1.875rem; /* 30px */
--text-4xl:  2.25rem;  /* 36px */
```

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Usage
- **Headings:** Semibold weight, tight line-height
- **Body text:** Normal weight, normal line-height
- **Labels:** Medium weight, uppercase (optional)
- **Numbers:** Tabular figures for alignment
- **Code:** Monospace font

---

## 2. Spacing Scale

### Base Unit: 4px

```css
--space-0:  0;
--space-1:  0.25rem;  /*  4px */
--space-2:  0.5rem;   /*  8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Usage
- **Micro spacing** (1-2): Icon gaps, tight layouts
- **Small spacing** (3-4): Form fields, card padding
- **Medium spacing** (5-6): Section gaps, card margins
- **Large spacing** (8-12): Page sections, major layouts
- **XL spacing** (16-20): Page gutters, hero sections

---

## 3. Color System

### Neutrals (Primary)
```css
--color-white: #FFFFFF;
--color-gray-50:  #FAFAFA;
--color-gray-100: #F5F5F5;
--color-gray-200: #E5E5E5;
--color-gray-300: #D4D4D4;
--color-gray-400: #A3A3A3;
--color-gray-500: #737373;
--color-gray-600: #525252;
--color-gray-700: #404040;
--color-gray-800: #262626;
--color-gray-900: #171717;
--color-black: #000000;
```

### Brand/Primary
```css
--color-primary: #6366F1;      /* Indigo-500 */
--color-primary-hover: #4F46E5; /* Indigo-600 */
--color-primary-light: #EEF2FF; /* Indigo-50 */
```

### Semantic Colors

**Success (Green)**
```css
--color-success: #22C55E;       /* Green-500 */
--color-success-light: #F0FDF4; /* Green-50 */
--color-success-dark: #16A34A;  /* Green-600 */
```

**Warning (Yellow)**
```css
--color-warning: #EAB308;       /* Yellow-500 */
--color-warning-light: #FEFCE8; /* Yellow-50 */
--color-warning-dark: #CA8A04;  /* Yellow-600 */
```

**Danger (Red)**
```css
--color-danger: #EF4444;        /* Red-500 */
--color-danger-light: #FEF2F2;  /* Red-50 */
--color-danger-dark: #DC2626;   /* Red-600 */
```

**Info (Blue)**
```css
--color-info: #3B82F6;          /* Blue-500 */
--color-info-light: #EFF6FF;    /* Blue-50 */
--color-info-dark: #2563EB;     /* Blue-600 */
```

### Application Colors
```css
--color-background: #FFFFFF;
--color-background-secondary: #FAFAFA;
--color-background-hover: #F5F5F5;

--color-border: #E5E5E5;
--color-border-focus: #6366F1;

--color-text-primary: #171717;
--color-text-secondary: #525252;
--color-text-tertiary: #A3A3A3;
--color-text-inverse: #FFFFFF;
```

### Usage Rules
- Use neutrals for 90% of UI
- Primary color for CTAs and key actions
- Semantic colors only for status/feedback
- Never use color alone to convey information

---

## 4. Border Radius
```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-full: 9999px; /* Circular */
```

### Usage
- **Buttons:** md
- **Inputs:** md
- **Cards:** lg
- **Modals:** lg
- **Badges:** full

---

## 5. Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Usage
- **Cards:** sm
- **Dropdowns:** md
- **Modals:** xl
- **Hover states:** Slightly stronger shadow

---

## 6. Components

### Button

**Variants:**
- Primary (filled, brand color)
- Secondary (outlined, neutral)
- Danger (filled, red)
- Ghost (transparent, text only)

**Sizes:**
- Small: 32px height, 12px padding
- Medium: 40px height, 16px padding
- Large: 48px height, 20px padding

**States:**
- Default
- Hover (darker background)
- Active (pressed)
- Disabled (opacity 0.5, cursor not-allowed)
- Loading (spinner, disabled)

**Code:**
```html
<app-button variant="primary" size="md" [loading]="false" [disabled]="false">
  Click Me
</app-button>
```

---

### Input

**Variants:**
- Text
- Number
- Email
- Password
- Date
- Textarea

**States:**
- Default
- Focus (border-primary)
- Error (border-danger)
- Disabled (background-gray-100)

**Features:**
- Label (optional)
- Hint text (optional)
- Error message (red, below input)
- Required indicator (red asterisk)

**Code:**
```html
<app-input
  label="Item Code"
  type="text"
  placeholder="Enter code"
  [required]="true"
  [error]="'This field is required'"
  hint="Unique identifier"
  [(ngModel)]="value"
></app-input>
```

---

### Table

**Features:**
- Sticky header
- Sortable columns
- Row hover effect
- Alternating row colors (subtle)
- Totals row (bold, darker background)
- Right-align numbers
- Empty state
- Loading state (skeleton rows)

**Structure:**
```html
<app-table
  [columns]="columns"
  [data]="data"
  [sortable]="true"
  [loading]="loading"
  emptyMessage="No data found"
></app-table>
```

**Column Definition:**
```typescript
columns = [
  { key: 'itemCode', label: 'Item Code', sortable: true, align: 'left' },
  { key: 'quantity', label: 'Qty', sortable: true, align: 'right' },
  { key: 'price', label: 'Price', sortable: false, align: 'right', type: 'currency' }
];
```

**Styling:**
```css
/* Header */
background: --color-gray-50
font-weight: 600
font-size: --text-sm
color: --color-text-secondary
text-transform: uppercase
padding: --space-3 --space-4
border-bottom: 2px solid --color-border

/* Rows */
padding: --space-3 --space-4
border-bottom: 1px solid --color-border
transition: background 0.15s

/* Row Hover */
background: --color-background-hover

/* Totals Row */
font-weight: 600
background: --color-gray-100
border-top: 2px solid --color-border

/* Numbers */
font-feature-settings: 'tnum' /* Tabular figures */
text-align: right
```

---

### Card

**Variants:**
- Default (white background, sm shadow)
- Outlined (border, no shadow)
- Flat (no shadow, no border)

**Structure:**
```html
<app-card [title]="'Card Title'">
  <div class="card-content">Content here</div>
</app-card>
```

**Styling:**
```css
background: --color-background
border-radius: --radius-lg
box-shadow: --shadow-sm
padding: --space-6
```

**Optional Sections:**
- Header (title + actions)
- Body (main content)
- Footer (actions or meta info)

---

### Badge

**Variants:**
- Default (gray)
- Success (green)
- Warning (yellow)
- Danger (red)
- Info (blue)

**Sizes:**
- Small: text-xs, 4px padding
- Medium: text-sm, 6px padding

**Code:**
```html
<app-badge variant="success" size="sm">Active</app-badge>
```

**Styling:**
```css
display: inline-flex
align-items: center
padding: 4px 8px
border-radius: --radius-full
font-size: --text-xs
font-weight: 600
```

---

### Alert

**Variants:**
- Success (green)
- Warning (yellow)
- Danger (red)
- Info (blue)

**Features:**
- Icon (auto-selected by variant)
- Title (optional)
- Message
- Dismissible (X button)

**Code:**
```html
<app-alert variant="danger" [dismissible]="true" (close)="onClose()">
  <strong>Error:</strong> Failed to save changes.
</app-alert>
```

**Styling:**
```css
/* Danger Alert */
background: --color-danger-light
border-left: 4px solid --color-danger
color: --color-danger-dark
padding: --space-4
border-radius: --radius-md
```

---

### Toast

**Behavior:**
- Appears top-right corner
- Auto-dismiss after 3 seconds
- Stack multiple toasts
- Slide-in animation

**Variants:**
- Success
- Error
- Info
- Warning

**Service:**
```typescript
this.toastService.success('Item created successfully');
this.toastService.error('Failed to delete item');
this.toastService.info('Data refreshed');
this.toastService.warning('Low stock alert');
```

**Styling:**
```css
position: fixed
top: 80px
right: 20px
z-index: 9999
width: 360px
animation: slideIn 0.2s ease-out
```

---

### Skeleton

**Purpose:** Loading placeholder

**Variants:**
- Text (single line)
- Block (rectangle)
- Circle (avatar)

**Code:**
```html
<app-skeleton height="20px" width="200px"></app-skeleton>
<app-skeleton height="100px" variant="block"></app-skeleton>
<app-skeleton variant="circle" size="40px"></app-skeleton>
```

**Styling:**
```css
background: linear-gradient(
  90deg,
  var(--color-gray-200) 25%,
  var(--color-gray-100) 50%,
  var(--color-gray-200) 75%
)
background-size: 200% 100%
animation: shimmer 1.5s infinite
```

---

### Modal

**Features:**
- Overlay (dark backdrop)
- Centered dialog
- Close button (X)
- Title
- Body (content)
- Footer (actions, optional)
- Click outside to close
- Esc to close

**Sizes:**
- Small: 400px
- Medium: 600px
- Large: 800px

**Code:**
```html
<app-modal #modal [title]="'Create Item'" size="md">
  <form>...</form>
</app-modal>
```

**Styling:**
```css
/* Overlay */
position: fixed
inset: 0
background: rgba(0, 0, 0, 0.5)
z-index: 1000

/* Dialog */
background: --color-background
border-radius: --radius-lg
box-shadow: --shadow-xl
max-width: 600px
max-height: 90vh
overflow-y: auto
```

---

### Dropdown

**Features:**
- Trigger button
- Menu (list of options)
- Position: bottom-left, bottom-right, top-left, top-right
- Searchable (optional)
- Multi-select (optional)

**Code:**
```html
<app-dropdown
  [options]="branches"
  [(selected)]="selectedBranch"
  placeholder="Select branch"
></app-dropdown>
```

**Styling:**
```css
/* Menu */
background: --color-background
border: 1px solid --color-border
border-radius: --radius-md
box-shadow: --shadow-md
padding: --space-2
margin-top: --space-1

/* Option */
padding: --space-2 --space-3
border-radius: --radius-sm
cursor: pointer

/* Option Hover */
background: --color-background-hover
```

---

### Pagination

**Features:**
- Info text: "Showing X-Y of Z items"
- Previous button
- Page number
- Next button

**Code:**
```html
<app-pagination
  [currentPage]="currentPage"
  [pageSize]="pageSize"
  [totalCount]="totalCount"
  (pageChange)="onPageChange($event)"
></app-pagination>
```

**Styling:**
```css
display: flex
justify-content: space-between
align-items: center
padding: --space-4 0
border-top: 1px solid --color-border

/* Info Text */
font-size: --text-sm
color: --color-text-secondary

/* Buttons */
size: sm
variant: secondary
```

---

## 7. Table Standards (Professional Excel-like)

### Design Goals
- Clean, readable, scannable
- Professional B2B aesthetic
- Excel/Google Sheets inspired
- Data-dense but not cluttered

### Grid System
```css
/* Grid borders */
border: 1px solid --color-gray-200

/* Cells */
border-right: 1px solid --color-gray-100
border-bottom: 1px solid --color-gray-100
```

### Header Styling
```css
background: --color-gray-50
font-weight: 600
font-size: --text-xs
color: --color-text-secondary
text-transform: uppercase
letter-spacing: 0.05em
padding: 10px 16px
border-bottom: 2px solid --color-gray-300
position: sticky
top: 0
z-index: 10
```

### Cell Styling
```css
padding: 12px 16px
font-size: --text-sm
color: --color-text-primary
vertical-align: middle
```

### Number Alignment
```css
/* All numbers */
text-align: right
font-feature-settings: 'tnum' /* Tabular figures for alignment */

/* Currency */
&::before {
  content: '$'
}

/* Percentages */
&::after {
  content: '%'
}
```

### Row Styles
```css
/* Alternating rows (very subtle) */
tr:nth-child(even) {
  background: --color-gray-50
}

/* Hover */
tr:hover {
  background: --color-gray-100
  cursor: pointer
}

/* Selected */
tr.selected {
  background: --color-primary-light
}
```

### Totals Row
```css
font-weight: 700
background: --color-gray-100
border-top: 2px solid --color-gray-400
border-bottom: 2px solid --color-gray-400

/* Totals label */
text-align: left
text-transform: uppercase
font-size: --text-xs
letter-spacing: 0.05em
```

### Responsive Tables
- **Desktop:** Full table
- **Tablet:** Horizontal scroll
- **Mobile:** Stacked cards (transform table to cards)

---

## 8. Icons

### Icon Library
**Heroicons** (https://heroicons.com)
- Outline style for default
- Solid style for filled/active states

### Common Icons
- ✓ Checkmark (success)
- ✗ X (close, error)
- ⚠ Warning triangle
- ℹ Info circle
- ⟲ Refresh
- ⚙ Settings/gear
- ✎ Edit/pencil
- ➕ Plus (add)
- ➖ Minus (remove)
- ▼ Chevron down
- ▶ Chevron right
- ◀ Chevron left
- ▲ Chevron up

### Icon Sizes
```css
--icon-xs: 12px
--icon-sm: 16px
--icon-md: 20px
--icon-lg: 24px
--icon-xl: 32px
```

---

## 9. Forms

### Layout
- Vertical stacking (default)
- Labels above inputs
- Hint text below label (gray, small)
- Error text below input (red, small)

### Required Fields
- Red asterisk (*) next to label
- OR "required" text in hint

### Validation
- Real-time for some (password strength)
- On blur for most (email, username)
- On submit for all

### Error Display
```html
<div class="form-field">
  <label>Email *</label>
  <input type="email" class="error" />
  <span class="error-text">Please enter a valid email</span>
</div>
```

**Error Styling:**
```css
.error {
  border-color: --color-danger
}

.error-text {
  color: --color-danger
  font-size: --text-sm
  margin-top: --space-1
}
```

---

## 10. Animations

### Transitions
```css
/* Default transition for interactive elements */
transition: all 0.15s ease

/* Slower for complex animations */
transition: all 0.3s ease
```

### Hover States
- Background color change (0.15s)
- Border color change (0.15s)
- Shadow change (0.15s)
- No transform (keep it subtle)

### Loading Spinner
```css
@keyframes spin {
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
}

.spinner {
  animation: spin 1s linear infinite
}
```

### Skeleton Shimmer
```css
@keyframes shimmer {
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}
```

### Toast Slide-in
```css
@keyframes slideIn {
  from {
    transform: translateX(100%)
    opacity: 0
  }
  to {
    transform: translateX(0)
    opacity: 1
  }
}
```

---

## 11. Accessibility (A11y)

### Focus States
```css
:focus-visible {
  outline: 2px solid --color-primary
  outline-offset: 2px
}
```

### Color Contrast
- Text on white: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio

### ARIA Labels
```html
<button aria-label="Close dialog">
  <svg>...</svg>
</button>

<input aria-describedby="hint-email" />
<span id="hint-email">We'll never share your email</span>
```

### Keyboard Navigation
- Tab to navigate
- Enter to submit
- Esc to close modals/dropdowns
- Arrow keys for dropdowns

---

## 12. Responsive Breakpoints

```css
--breakpoint-sm: 640px   /* Mobile */
--breakpoint-md: 768px   /* Tablet */
--breakpoint-lg: 1024px  /* Desktop */
--breakpoint-xl: 1280px  /* Large desktop */
```

### Mobile-first Approach
```css
/* Mobile (default) */
.container {
  padding: --space-4
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: --space-6
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: --space-8
  }
}
```

---

## Summary

- **Typography:** System fonts, 8-level scale, tabular figures for numbers
- **Spacing:** 4px base unit, 0-20 scale
- **Colors:** Neutrals + 4 semantic colors (success, warning, danger, info)
- **Components:** 12 core components (Button, Input, Table, Card, Badge, Alert, Toast, Skeleton, Modal, Dropdown, Pagination)
- **Tables:** Excel-like, sticky headers, right-align numbers, totals row
- **Icons:** Heroicons, 5 sizes
- **Forms:** Vertical layout, clear validation
- **Animations:** Subtle, 0.15s default
- **Accessibility:** Focus states, ARIA labels, keyboard nav
- **Responsive:** Mobile-first, 4 breakpoints

This system provides everything needed for a professional, accessible, and consistent UI.

