# Layer ERP – Legal Practice & Case Management System

A modern, professional, responsive Legal Case Management Admin Panel built with **React.js**, **Vite**, **Tailwind CSS**, **React Router DOM**, **Lucide React**, and **Recharts**.

---

## 🚀 Quick Start

### 1. Navigate to the project directory:
```bash
cd frontend
```

### 2. Install dependencies (if not already installed):
```bash
npm install
```

### 3. Run the development server:
```bash
npm run dev
```

The application will be available at **`http://localhost:5173/`**.

---

## 🔐 Admin Login Credentials

- **Username**: `admin`
- **Password**: `admin123`
- *An Auto-fill helper button is also provided on the login page for instant one-click sign-in.*

---

## 📂 Project Architecture

```
frontend/
├── index.html                   # HTML template with Google Fonts (Inter, Plus Jakarta Sans)
├── package.json                 # Dependencies & scripts
├── tailwind.config.js           # Theme configuration (Navy palette, shadows, custom fonts)
├── vite.config.js               # Vite + Tailwind + React plugins
└── src/
    ├── main.jsx                 # React root entry
    ├── App.jsx                  # React Router setup & ProtectedRoute guards
    ├── index.css                # Tailwind CSS v4 & custom scrollbar styling
    ├── context/
    │   ├── AuthContext.jsx      # Admin authentication (admin / admin123) & session persistence
    │   └── ERPContext.jsx       # Unified reactive state (Juniors, Cases, Amounts, Hearings, Notes, Toasts)
    ├── data/
    │   ├── mockJuniors.js       # Indian junior advocates mock records
    │   ├── mockCases.js         # Indian legal cases & court matters
    │   ├── mockAmounts.js       # Transaction entries totaling ₹12,84,500
    │   ├── mockHearings.js      # Court listings with next 7-day schedule
    │   └── mockSettings.js      # Practice settings & notification configurations
    ├── utils/
    │   └── formatters.js        # Indian Rupee (₹) formatters, DD MMM YYYY dates, ID generators
    ├── components/
    │   ├── common/              # Reusable UI library
    │   │   ├── Button.jsx       # Button with variants (primary, outline, danger, success, ghost)
    │   │   ├── Input.jsx        # Input with icons, validation errors & helper text
    │   │   ├── Select.jsx       # Custom styled select dropdown
    │   │   ├── Badge.jsx        # Colored status badges (Active, Pending, Paid, Closed, etc.)
    │   │   ├── Modal.jsx        # Accessible dialog wrapper with backdrop & ESC support
    │   │   ├── Toast.jsx        # Bottom-right animated toast notification system
    │   │   ├── StatCard.jsx     # KPI metric cards with icons & percentage indicators
    │   │   ├── Pagination.jsx   # Pagination component ("Showing 1–8 of 186")
    │   │   ├── EmptyState.jsx   # Clean empty state for search & tables
    │   │   └── ConfirmDialog.jsx# Delete confirmation modal
    │   ├── layout/
    │   │   ├── Layout.jsx       # Main shell with independent scrolling content
    │   │   ├── Sidebar.jsx      # Collapsible desktop sidebar & mobile drawer
    │   │   ├── Header.jsx       # Title, Breadcrumb, quick search, notification dropdown & user profile
    │   │   └── Breadcrumb.jsx   # Dynamic path breadcrumbs
    │   └── modals/
    │       ├── AddEditJuniorModal.jsx  # Junior advocate form
    │       ├── ViewJuniorModal.jsx     # Detailed advocate profile & case allocation stats
    │       ├── AddEditCaseModal.jsx    # Complete legal case creation form
    │       ├── AddEditAmountModal.jsx  # Payment retainer logger (syncs with dashboard)
    │       ├── AddEditHearingModal.jsx # Court listing scheduler
    │       └── WhatsAppModal.jsx       # Client WhatsApp reminder preview & simulated delivery
    └── pages/
        ├── Login.jsx            # Sign-in portal with auto-fill helper
        ├── Dashboard.jsx        # 6 KPI cards, Recharts Cases & Revenue charts, upcoming hearings, recent tables
        ├── Juniors.jsx          # Advocate roster, specialization, status toggle, case workload
        ├── Cases.jsx            # Case management with multi-filter bar & full CRUD
        ├── CaseDetails.jsx      # Tabs: Overview, Hearings timeline, Payments ledger, Counsel notes
        ├── Amounts.jsx          # Transaction entries, payment modes (UPI, Cash, Bank Transfer), INR totals
        ├── Hearings.jsx         # List view & interactive Calendar view with WhatsApp reminders
        └── Settings.jsx         # Chamber profile, 2FA, Case Masters, WhatsApp toggles & system reset
```

---

## 🌟 Core Features & Data Flow

1. **Dashboard & Visual Analytics**:
   - 6 KPI metric cards (*Total Juniors, Active Juniors, Total Cases, Active Cases, Upcoming Hearings, Total Received: ₹12,84,500*).
   - **Cases Overview**: Recharts stacked/grouped bar chart tracking Monthly New, Active, and Closed litigation.
   - **Amount Collection**: Recharts smooth area chart in Indian Rupee format.
   - **Junior-Wise Case Count**: Real-time horizontal bar chart showing advocate caseload.
   - **Upcoming Hearings (Next 7 Days)**: Actionable table with one-click WhatsApp client reminder.

2. **Full Frontend Reactive State & Sync**:
   - Adding a **Junior Advocate** makes them immediately available in case allocation dropdowns.
   - Adding a **Legal Case** updates Dashboard metrics and junior workload.
   - Recording an **Amount Entry** auto-recalculates Case paid/balance status and updates Dashboard Total Amount Received.
   - Scheduling a **Hearing** updates the case listing timeline and calendar view.
   - Sending a **WhatsApp Reminder** opens a simulated chat preview modal with loading state and confirmation toast.

3. **Case Details Deep Dive (`/cases/:id`)**:
   - Header with case reference, status, client name, and financial cards (*Total Fee, Paid, Balance*).
   - **Overview Tab**: Client contact, court bench, opposing counsel & full statement of facts.
   - **Hearings Tab**: Chronological hearing history with WhatsApp reminder buttons.
   - **Payments Tab**: Itemized retainer receipts with payment modes.
   - **Notes Tab**: Interactive counsel note taking that persists in state.

4. **Interactive Hearing Calendar & List**:
   - Switch effortlessly between tabular List view and monthly Calendar grid view.
   - Upcoming listings highlighted with case IDs and client names.

5. **Settings & Localization**:
   - Chamber profile editor.
   - Security toggles (Two-Factor Authentication, Audit Logging).
   - WhatsApp automated alert triggers (2 Days Before, 1 Day Before, Morning of Hearing).
   - One-click *Reset Sample Data* button to restore factory mock records anytime.
