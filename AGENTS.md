# AGENTS.md
# SchoolPay — คู่มือสำหรับ AI Agent

> อ่านไฟล์นี้ก่อนทำงานทุกครั้ง — ห้ามข้าม

---

## Project Context

**SchoolPay** คือระบบรับชำระเงินโรงเรียนสำหรับโรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ  
ปัจจุบัน: **Design Prototype** (React + Babel + GitHub Pages)  
เป้าหมาย: Production (Next.js 15 + TypeScript + Vercel + Firebase)

**ช่องทางชำระเงิน: QR PromptPay และ KTB Branch (เจ้าหน้าที่ธนาคาร)** (ตัด Counter Service ออกแล้ว)

---

## โครงสร้างไฟล์ปัจจุบัน (Prototype)

```
Hongson-SchoolPay/
├── index.html              ← Entry point (GitHub Pages)
├── styles.css              ← Design system ทั้งหมด (1,214 บรรทัด)
├── .nojekyll               ← ป้องกัน Jekyll
├── README.md               ← เอกสาร project
├── AGENTS.md               ← ไฟล์นี้
├── BANK_INTEGRATION.md     ← คู่มือติดต่อธนาคาร
├── MIGRATION_PLAN.md       ← แผนเปลี่ยน stack จริง
└── src/
    ├── icons.jsx           ← SVG icon library (window.Icon)
    ├── shared.jsx          ← Sidebar, Topbar, Badge, Modal, QRPlaceholder
    ├── admin-dashboard.jsx ← Dashboard page
    ├── admin-campaigns.jsx ← รอบเก็บเงิน + ใบแจ้งชำระ
    ├── admin-reconciliation.jsx
    ├── admin-receipts.jsx  ← ใบเสร็จ + ReceiptPreview
    ├── admin-settings.jsx  ← Providers, Webhook, Receipt Template (3 tabs)
    ├── admin-audit.jsx     ← Audit log
    ├── parent-flow.jsx     ← 6 หน้าจอผู้ปกครอง (QR + KTB Branch)
    └── app.jsx             ← Root app + routing
```

---

## Architecture ของ Prototype

### Rendering Pattern

ทุก JSX file โหลดผ่าน `<script type="text/babel" src="...">` ใน `index.html`  
Babel transpile ใน browser — **ไม่มี build step**

### Global State (window)

แต่ละไฟล์ export ผ่าน `window.ComponentName`:
```javascript
window.Icon = Icon;          // icons.jsx
window.Sidebar = Sidebar;    // shared.jsx
window.AdminDashboard = ...  // admin-dashboard.jsx
window.ParentFlow = ...      // parent-flow.jsx
// ...
```

### Routing

`app.jsx` จัดการ routing ด้วย `React.useState("dashboard")`:
```javascript
const [route, setRoute] = React.useState("dashboard");
const [mode, setMode] = React.useState("admin"); // admin | parent
```

Routes ที่มี: `dashboard`, `campaigns`, `invoices`, `payments`, `reconciliation`, `receipts`, `students`, `classes`, `reports`, `settings-providers`, `settings-webhook`, `settings-receipt`, `audit`

**Routes ที่ถูกลบออกแล้ว:** `settings-counter` (Counter Service ถูกตัดออก)

---

## Design System

ทุกอย่างอยู่ใน `styles.css` — **ห้ามใช้ inline style ที่ขัดแย้งกับ design tokens**

### CSS Variables หลัก
```css
--navy: #0E2A47        /* สีหลักแบรนด์ */
--emerald: #0F7B5E     /* paid / success */
--gold: #B8893B        /* warning / pending */
--danger: #BE3A2E      /* error / danger */
--info: #1E5BA6        /* info / link */
```

### Typography
```css
--thai: "Sarabun"      /* ข้อความภาษาไทย */
--latin: "IBM Plex Sans" /* ข้อความภาษาอังกฤษ / ตัวเลข */
--mono: "IBM Plex Mono"  /* รหัส / เลขอ้างอิง */
```

### Component Classes
```
.card / .card-pad / .card-head
.btn / .btn.primary / .btn.sm / .btn.lg
.badge.paid / .badge.pending / .badge.review / ...
.table / .filters / .tabs / .modal
.kpi / .kpis / .progress
.phone / .phone-screen / .phone-body   ← parent flow
.receipt                               ← admin receipts
```

---

## กฎที่ต้องทำตามเสมอ

### ห้ามทำ

- ❌ เพิ่ม Counter Service กลับเข้ามา (ตัดสินใจแล้ว — QR only)
- ❌ เพิ่ม `settings-counter` route ใน app.jsx
- ❌ เพิ่ม `CounterTab` ใน admin-settings.jsx
- ❌ เพิ่ม Counter Service barcode ใน parent-flow.jsx
- ❌ แก้ไข `audit_logs` ให้รองรับ UPDATE/DELETE (append-only เสมอ)
- ❌ เก็บ secrets ลงใน source code
- ❌ ลบ `ProductionNote` modal โดยไม่มีเหตุผล (ต้องแจ้งผู้ใช้ว่าเป็น prototype)

### ต้องทำ

- ✅ รักษา design system ของ `styles.css` — ไม่เพิ่ม class ซ้ำซ้อน
- ✅ ทุก component ใหม่ต้อง `window.ComponentName = ComponentName`
- ✅ ทุก route ใหม่ต้องเพิ่มทั้งใน `app.jsx` switch และ `shared.jsx` sidebar
- ✅ ใช้ฟอนต์ภาษาไทย `Sarabun` เสมอ
- ✅ ข้อความทั้งหมดเป็นภาษาไทย ยกเว้น technical terms

---

## การเพิ่ม Page ใหม่ (Checklist)

1. สร้าง `src/admin-[name].jsx`
2. Export: `window.Admin[Name] = Admin[Name];`
3. เพิ่ม `<script type="text/babel" src="src/admin-[name].jsx">` ใน `index.html`
4. เพิ่ม case ใน switch ของ `app.jsx`
5. เพิ่ม `<NavItem>` ใน `shared.jsx`

---

## สิ่งที่ยังไม่ได้ทำ (สำหรับ Agent ทำต่อ)

- [ ] เชื่อมต่อ Bank API จริง (ดู `BANK_INTEGRATION.md`)
- [ ] Migration ไป Next.js (ดู `MIGRATION_PLAN.md`)
- [ ] สร้าง admin-reconciliation.jsx ให้สมบูรณ์ (ปัจจุบัน มีแต่โครงสร้าง)
- [ ] PDF generation สำหรับใบเสร็จ (ปัจจุบัน มีแค่ preview UI)
- [ ] Real webhook endpoint

---

## Context สำคัญ

- โรงเรียน: **ห้องสอนศึกษา ในพระอุปถัมภ์ฯ** จ.แม่ฮ่องสอน
- นักเรียน: ~1,800 คน ชำระปีละ 2 ครั้ง (~3,600 transactions/ปี)
- ค่า infra: **฿0/เดือน** (Vercel Free + Firebase Free tier)
- ค่าธรรมเนียม QR: ผลักให้ผู้ปกครองชำระ (โรงเรียนเสีย ฿0)
- Prototype URL: `https://coolnut-academy.github.io/Hongson-SchoolPay/`
- GitHub repo: `coolnut-academy/Hongson-SchoolPay`
