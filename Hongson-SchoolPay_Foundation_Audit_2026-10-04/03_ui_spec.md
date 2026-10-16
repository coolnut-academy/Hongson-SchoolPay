# Hongson-SchoolPay — UI / UX Foundation Specification

**Theme:** White / Green / Silver  
**Tone:** Academic + Finance + Enterprise + Serious + Contemporary

---

## 1. UX Principles

1. **See-first, type-less** — ให้ข้อมูลที่ระบบรู้อยู่แล้ว Auto-fill
2. **One task per workspace** — รับเงินนักเรียน ≠ รับเงินอื่น ≠ คุมใบเสร็จ
3. **Status visible at a glance** — badge และ KPI ชัดเจน
4. **No receipt-print affordance** — ห้ามมี printer icon หรือคำสื่อว่า print receipt
5. **Audit visible** — รายการสำคัญมี who/when/history
6. **Role-based navigation** — ผู้ใช้เห็นเฉพาะเมนูที่ต้องใช้
7. **Prevent mistakes before submit** — duplicate receipt page, VOID page, stale roster ต้อง block/confirm

---

## 2. Global Design Tokens

### Colors
- Primary Green: ใช้กับ action หลักและ status success
- Dark Green: header/enterprise emphasis
- White: background หลัก
- Silver/Gray: structure / table / secondary
- Amber: pending/follow-up
- Red: VOID/error/critical rule only

### Components
- KPI Card
- Data Table
- Filter Bar
- Status Badge
- Right Detail Drawer
- Confirmation Modal
- Timeline / Audit Log
- Empty State
- Read-only Source Badge เช่น `ข้อมูลจาก Hongson T-Academy`

---

## 3. Landing Page `/`

### Layout
2 tabs/cards สลับกัน:

#### นักเรียน/ผู้ปกครอง
- Input: `รหัสนักเรียน`
- CTA: `ตรวจสอบข้อมูลการชำระเงิน`
- Note: `ข้อมูลนักเรียนล่าสุดจาก Hongson T-Academy`

#### ครู/บุคลากร
- ID / Password หรือ flow ที่ Auth Bridge ใช้จริง
- CTA: `เข้าสู่ระบบ`
- Note: `Firebase Auth Bridge • Profile จาก Hongson T-Folio`

### Footer Policy
`ระบบนี้ไม่มีการพิมพ์ใบเสร็จรับเงินจริง ใบเสร็จออกโดยเจ้าหน้าที่การเงินแบบเขียนมือเท่านั้น`

---

## 4. Student / Parent UI

### Route `/student`

#### Header Profile
- รหัสนักเรียน
- ชื่อ-สกุล
- ชั้น/ห้อง
- Source badge + last sync

#### KPI
- ภาระทั้งหมด
- ชำระแล้ว
- ค้างชำระ
- สถานะล่าสุด

#### Charge Table
Columns:
- รายการ
- ภาคเรียน/ปี
- ยอดเงิน
- สถานะ
- การดำเนินการ

Action:
- `ดูรายละเอียด`
- `ดูรายละเอียดใบเสร็จ` เฉพาะรายการชำระแล้ว

### Receipt Detail Drawer
Read-only:
- วันที่รับเงิน
- จำนวนเงิน
- รายการ
- เล่มใบเสร็จ
- หน้า/เลขที่ใบเสร็จ
- สถานะ

**ไม่มี Print / Download Receipt**

### History
Filter ปีการศึกษา ย้อนหลังอย่างน้อย 2 ปี

### Documents
เมนู `ประกาศ/เอกสารการเรียกเก็บ`
- View
- Download document
- ไม่ใช่ receipt

---

## 5. Staff Dashboard

หลัง Auth:
- Greeting + Staff name/profile
- Role badge
- Assigned Room(s)
- Source: T-Folio

Dashboard content เปลี่ยนตาม Role

---

## 6. Homeroom UI

### `/app/homeroom`
KPI:
- นักเรียนทั้งหมด
- ชำระครบ
- ค้างชำระ
- ต้องติดตาม

Table:
- เลขที่
- รหัสนักเรียน
- ชื่อ-สกุล
- ยอดค้าง
- สถานะ
- ล่าสุด
- `ดูข้อมูล`

### `/app/monthly-followup`
Filter:
- เดือน
- ปีการศึกษา
- ภาคเรียน
- ห้อง

Table:
- ชื่อ-สกุล
- ยอดค้าง
- สาเหตุการค้างชำระ
- แนวทางแก้ไข/ความต้องการผู้ปกครอง
- สถานะติดตาม

Sticky summary:
- รวม นร.
- ชำระครบ
- ค้างชำระ
- ยอดค้างรวม

CTA:
- `บันทึก`
- `ดูตัวอย่างบันทึกข้อความ`
- `สร้างไฟล์ .docx`

---

## 7. Finance — Student Payment UI

### `/app/finance/payments`
Design ให้จบงานในหน้าเดียว แต่แบ่ง 4 Block

1. **ค้นหานักเรียน**
2. **เลือกภาระที่รับชำระ**
3. **รับเงิน**
4. **บันทึกข้อมูลใบเสร็จจริง**

#### Block 4 Receipt Reference
- Active Book selector (รองรับหลายเล่ม)
- Page selector เฉพาะ AVAILABLE
- ประเภทเงิน
- ผู้รับเงิน Auto-fill
- Preview ว่า Page นี้ว่างจริง

Buttons:
- `บันทึกรับชำระ`
- `บันทึกข้อมูลใบเสร็จจริง`

Forbidden:
- `ออกใบเสร็จ`
- `พิมพ์ใบเสร็จ`

ด้านข้างแสดง `เล่มที่เปิดใช้งานอยู่` เป็นหลาย card ไม่ใช่ singular

---

## 8. Finance — Other Receipt UI

### `/app/finance/other`
Fields:
- วันที่รับเงิน
- หมวดเงิน
- รายละเอียด
- แหล่งเงิน/ผู้จ่าย
- จำนวนเงิน
- ผู้รับเงิน
- Active Receipt Book
- Page
- หมายเหตุ

CTA:
- `บันทึกรายการรับเงินอื่น`

Side panel:
- Preview how it will appear in annual report note/mapping

---

## 9. Receipt Book UI

### `/app/receipts/books`
KPI:
- ยอดยกมา
- รับเพิ่ม
- Active Books
- Returned/Closed
- Stock remaining

Table:
- เล่ม
- Fiscal Year
- Source
- Status
- Holder
- Used / 50
- Void / 50
- Available / 50
- Last activity

Actions:
- ดูรายละเอียด
- เปิดใช้
- คืนเล่ม
- ดูประวัติ

### Multiple Active Books
หน้าจอต้องเห็น concurrent active books และ filter by holder

---

## 10. Receipt Page UI

### `/app/receipts/pages`
Search:
- Fiscal Year
- Book
- Page / printed receipt no.

Result:
- Status badge: AVAILABLE / USED / VOID
- Money type
- Amount
- Student / payer/source
- Receiver
- Date
- Linked transaction
- Audit timeline

Mini grid 1–50 ให้ scan สถานะทั้งเล่มได้อย่างรวดเร็ว

---

## 11. Fee Master UI

### `/app/fees`
Left: Fee Master
- code
- name
- category
- type: STUDENT_CHARGE / OTHER_RECEIPT_CATEGORY
- frequency
- active

Actions:
- เพิ่ม
- แก้ไข
- คัดลอกจากปีก่อน
- ปิดใช้งาน

### `/app/assignments`
Filter:
- academic year
- term
- grade
- room
- program

Grouped Charge Cards:
- หมวดพื้นฐาน
- หมวดแผนการเรียน/ห้องพิเศษ
- หมวดประกัน/ระดมทรัพยากร
- หมวดสมาคม/อื่นตามนโยบาย

Preview:
- total per student
- count students
- estimated total

CTA:
`Publish / สร้างภาระชำระ`

---

## 12. Report Center UI

### `/app/reports`
Report Types:
- บันทึกข้อความติดตามรายเดือน
- ทะเบียนคุมใบเสร็จ
- แบบตรวจสอบการใช้ใบเสร็จรับเงิน สพฐ.
- รายงานการใช้ใบเสร็จประจำปีงบประมาณ
- รายงานคืนเล่ม/ตรวจนับ
- สรุปรับชำระ/ค้างชำระ

Filters:
- fiscal year
- academic year
- term
- room
- category
- status

Buttons:
- Export Excel
- Export PDF (เฉพาะ report)
- Export DOCX (เฉพาะ memo/document)

Persistent warning:
`ไม่มีการพิมพ์ใบเสร็จรับเงินจริงจากระบบ`

---

## 13. Admin / Role UI

### `/app/admin/users`
- list staff from Auth/T-Folio
- role
- assigned rooms
- active status
- last login

### `/app/audit`
Filter by:
- user
- module
- action
- date
- entity

Detail drawer:
- before/after
- reason
- timestamp

---

## 14. Error Prevention UX

| Situation | UI Behavior |
|---|---|
| Receipt page USED | Disable select + show linked transaction |
| Receipt page VOID | Disable select + show void reason |
| Multiple active books | Force user to choose book before page |
| Student data stale | Warning sourceUpdatedAt |
| Fee template unpublished | No obligation generation |
| Duplicate payment attempt | Warning based on open balance |
| Report data incomplete | Pre-export validation list |
| Receipt reconciliation != 50 | Block close/return confirmation |

