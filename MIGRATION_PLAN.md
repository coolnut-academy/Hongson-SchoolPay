# MIGRATION_PLAN.md
# แผนเปลี่ยนจาก Prototype → Production Stack

> Prototype (React + Babel + GitHub Pages) → Next.js 15 + TypeScript + Vercel + Firebase

---

## Tech Stack เปรียบเทียบ

| ส่วน | ตอนนี้ (Prototype) | Production |
|------|-------------------|------------|
| Framework | React 18 UMD CDN | Next.js 15 App Router |
| Language | JSX (no types) | TypeScript |
| Database | ไม่มี (mock data) | Firebase Firestore |
| Auth | ไม่มี | Firebase Auth + NextAuth.js |
| Hosting | GitHub Pages | Vercel |
| Payment | ไม่มี (UI เท่านั้น) | Bank API + Webhook |
| PDF | ไม่มี | Puppeteer (server-side) |

---

## Phase 1 — Bootstrap (สัปดาห์ 1–2)

```bash
npx create-next-app@latest hongson-schoolpay \
  --typescript --tailwind --app --no-src-dir

npm install firebase firebase-admin next-auth @auth/firebase-adapter \
  react-hook-form zod @hookform/resolvers qrcode.react puppeteer date-fns
```

### Firestore Collections

```
/campaigns/{id}     ← รอบเก็บเงิน
/invoices/{id}      ← ใบแจ้งชำระ + status + ref1/ref2
/payments/{id}      ← ธุรกรรมจาก Webhook (write ผ่าน server เท่านั้น)
/receipts/{id}      ← ใบเสร็จ (append เมื่อ confirmed)
/students/{id}      ← ข้อมูลนักเรียน
/audit_logs/{id}    ← append-only, ห้าม update/delete
/users/{id}         ← เจ้าหน้าที่ + role
```

---

## Phase 2 — Migrate UI (สัปดาห์ 2–4)

### โครงสร้าง App Router

```
app/
├── (admin)/
│   ├── layout.tsx          ← Sidebar + Topbar
│   ├── dashboard/page.tsx
│   ├── campaigns/page.tsx
│   ├── invoices/[id]/page.tsx
│   ├── payments/page.tsx
│   ├── receipts/page.tsx
│   ├── settings/
│   │   ├── providers/page.tsx
│   │   ├── webhook/page.tsx
│   │   └── receipt/page.tsx
│   └── audit/page.tsx
├── (parent)/
│   └── pay/[invoiceId]/
│       ├── page.tsx        ← Lookup
│       ├── qr/page.tsx     ← QR screen + real-time status
│       └── done/page.tsx   ← Receipt download
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── invoices/[id]/qr/route.ts   ← POST → Bank API → return QR
│   ├── receipts/[id]/pdf/route.ts  ← GET → Puppeteer → return PDF
│   └── webhook/payment/route.ts    ← POST from bank
└── verify/[receiptNo]/page.tsx     ← Public QR verification
```

### ลำดับ Migrate

1. `icons.jsx` → ใช้ **lucide-react** แทน (ไม่ต้อง migrate)
2. `shared.jsx` → `components/ui/*.tsx`
3. `admin-dashboard.jsx` → `app/(admin)/dashboard/page.tsx`
4. `admin-campaigns.jsx` → `app/(admin)/campaigns/`
5. `admin-receipts.jsx` → `app/(admin)/receipts/`
6. `admin-settings.jsx` → `app/(admin)/settings/*/`
7. `admin-audit.jsx` → `app/(admin)/audit/`
8. `parent-flow.jsx` → `app/(parent)/pay/*/` (แยก route จริง)

---

## Phase 3 — API & Webhook (สัปดาห์ 3–5)

### QR Generation

```typescript
// POST /api/invoices/[id]/qr
// 1. ดึง invoice จาก Firestore
// 2. เรียก Bank API สร้าง QR → ได้ qrString
// 3. คืน { qrString, expiresAt }
```

### Webhook Handler (ใจกลางระบบ)

```typescript
// POST /api/webhook/payment
// 1. Verify HMAC-SHA256 signature
// 2. Check IP whitelist
// 3. Idempotency (ถ้า tx_id ซ้ำ → ตอบ 200 เฉยๆ)
// 4. Match invoice ด้วย ref1
// 5. เปรียบ amount → confirmed หรือ under_review
// 6. Firestore batch write: payments + update invoice + audit_log
```

### Real-time Status (Parent)

```typescript
// ใช้ Firestore onSnapshot — ผู้ปกครองเห็น "ชำระแล้ว" ทันที
useEffect(() => {
  return onSnapshot(doc(db, 'invoices', invoiceId), snap => {
    setStatus(snap.data()?.status);
  });
}, [invoiceId]);
```

---

## Phase 4 — PDF + Deploy (สัปดาห์ 5–6)

### PDF ใบเสร็จ (Puppeteer)

```typescript
// GET /api/receipts/[id]/pdf
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(renderReceiptHTML(receiptData));
const pdf = await page.pdf({ format: 'A4', printBackground: true });
await browser.close();
return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' }});
```

> Vercel Hobby timeout = 10s → ถ้านานเกินใช้ Firebase Cloud Function แทน

### Deploy

```bash
npm install -g vercel
vercel --prod

# ตั้ง env vars ทุกตัวใน Vercel Dashboard
# ดูรายการ env vars ทั้งหมดใน BANK_INTEGRATION.md
```

---

## Timeline

| สัปดาห์ | งาน |
|---------|-----|
| 1–2 | Bootstrap + Firebase + Auth + migrate UI shell |
| 2–4 | Migrate components + Firestore schema |
| 3–5 | Bank API + Webhook handler |
| 4–5 | PDF generation |
| 5–6 | Sandbox testing + UAT |
| 7 | **Go-live** |

**1 คน → ~10 สัปดาห์** | **2 คน → ~6 สัปดาห์**
