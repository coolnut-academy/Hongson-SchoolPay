# SchoolPay — ระบบรับชำระเงินโรงเรียน (Prototype)

> **ต้นแบบ (Design Prototype)** สำหรับโรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ  
> ยังไม่ใช่ระบบที่พร้อมรับเงินจริง — ต้องการ Backend ก่อนใช้งานจริง

## 🌐 ดูต้นแบบ

[**SchoolPay Prototype →**](https://coolnutmacbook.github.io/Hongson-SchoolPay/)

## ✨ ฟีเจอร์ที่แสดงในต้นแบบ

### มุมมองเจ้าหน้าที่การเงิน (Admin)
- **Dashboard** — ภาพรวมยอดเก็บ, KPI, กราฟรายเดือน
- **รอบเก็บเงิน** — สร้าง/จัดการรอบการเก็บเงิน
- **ใบแจ้งชำระ** — รายการ + รายละเอียดพร้อม Timeline
- **การชำระเงิน** — ธุรกรรมจากทุกช่องทาง (QR, Counter Service, โอนเงิน)
- **ศูนย์กระทบยอด** — Matched / Unmatched / Manual Review
- **ใบเสร็จรับเงิน** — ดู, ออก, พิมพ์ พร้อม Template เต็มรูปแบบ
- **รายงาน** — ส่งออก CSV / Excel / PDF
- **ตั้งค่าระบบ** — ผู้ให้บริการ, Counter Service, Webhook, เทมเพลตใบเสร็จ
- **ประวัติการเปลี่ยนแปลง (Audit Log)**

### มุมมองผู้ปกครอง (Parent Flow)
- **7 หน้าจอหลัก** — ค้นหา → เลือกวิธีชำระ → QR / Counter → รอยืนยัน → ใบเสร็จ → เอกสารเบิกค่าการศึกษาบุตร
- **ใบแจ้งชำระ PDF** — พร้อม QR PromptPay + Barcode Counter Service

## 🛠 Stack

| Component | Technology |
|-----------|-----------|
| UI | React 18 (UMD via CDN) |
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
