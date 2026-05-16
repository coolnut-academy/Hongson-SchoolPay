# <img src="assets/logo.png" width="48" align="center" style="border-radius: 8px;"> SchoolPay — ระบบรับชำระเงินโรงเรียน (Prototype)

> **ต้นแบบ (Design Prototype)** สำหรับโรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ  
> ช่องทางชำระ: **QR PromptPay เท่านั้น** | ต้นทุน: **฿0/เดือน**

## 🌐 ดูต้นแบบ

[**SchoolPay Prototype →**](https://coolnut-academy.github.io/Hongson-SchoolPay/)

## ✨ ฟีเจอร์ในต้นแบบ

### มุมมองเจ้าหน้าที่การเงิน (Admin)
Dashboard · รอบเก็บเงิน · ใบแจ้งชำระ · การชำระเงิน · กระทบยอด · ใบเสร็จ · รายงาน · ตั้งค่า QR / Webhook · Audit Log

### มุมมองผู้ปกครอง (QR Only — 6 หน้าจอ)
ค้นหา → สแกน QR PromptPay → รอยืนยัน → ใบเสร็จ → เอกสารเบิกค่าการศึกษาบุตร

## 💰 ต้นทุนจริงเมื่อ Deploy

| รายการ | ค่าใช้จ่าย |
|--------|-----------|
| Vercel + Firebase (1,800 นักเรียน ปีละ 2 ครั้ง) | **฿0/เดือน** |
| Bank API / QR | ฿0 (ผลักค่าธรรมเนียม 1–2% ให้ผู้ปกครอง) |

## 🛠 Stack

| Transpiler | Babel Standalone (browser) |
| Styling | Vanilla CSS (design system) |
| Fonts | Sarabun + IBM Plex Sans + IBM Plex Mono |
| Icons | Custom inline SVG |
| Hosting | GitHub Pages (static) |

## 📁 โครงสร้างไฟล์

```
Hongson-SchoolPay/
├── index.html              ← Entry point (GitHub Pages)
├── styles.css              ← Design system ทั้งหมด
├── .nojekyll               ← ป้องกัน Jekyll ซ่อนไฟล์ใน src/
└── src/
    ├── icons.jsx           ← SVG icon library
    ├── shared.jsx          ← Sidebar, Topbar, Badge, Modal, QR, Barcode
    ├── admin-dashboard.jsx ← หน้า Dashboard
    ├── admin-campaigns.jsx ← หน้ารอบเก็บเงิน + ใบแจ้งชำระ
    ├── admin-reconciliation.jsx ← หน้ากระทบยอด
    ├── admin-receipts.jsx  ← หน้าใบเสร็จ
    ├── admin-settings.jsx  ← หน้าตั้งค่า
    ├── admin-audit.jsx     ← หน้า Audit Log
    ├── parent-flow.jsx     ← 7 หน้าจอผู้ปกครอง
    └── app.jsx             ← Root app + routing
```

## ⚠️ สิ่งที่ต้องพัฒนาก่อนใช้งานจริง

- [ ] Backend server สำหรับรับ Webhook จากธนาคาร
- [ ] ระบบยืนยัน Webhook signature + replay protection
- [ ] Database สำหรับเก็บข้อมูลธุรกรรมและใบเสร็จ
- [ ] Audit Log แบบ append-only (WORM)
- [ ] RBAC (Role-Based Access Control) + 2FA
- [ ] การสร้างใบเสร็จ server-side พร้อมเลขที่ต่อเนื่อง
- [ ] การกระทบยอดกับ Settlement file จริงของผู้ให้บริการ
- [ ] KMS / Vault สำหรับเก็บ API keys และ Webhook secrets

---

> ตัวเลข ผู้ใช้ ผู้ลงนาม และเอกสารทั้งหมดเป็นข้อมูลตัวอย่างเพื่อสาธิตเท่านั้น  
> ไม่เกี่ยวข้องกับธุรกรรมหรือบุคคลจริง
