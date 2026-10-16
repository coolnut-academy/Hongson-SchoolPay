# Hongson-SchoolPay — Foundation Documentation

**Revision:** Audit Consolidated 2026-10-04  
**Status:** Foundation / Source of Truth for next-stage design and implementation  
**Purpose:** รวม Requirement เดิม + แบบฟอร์มจริงของโรงเรียน/สพฐ. + ข้อเสนอ UI + ผล Audit จากครูการเงินล่าสุด ให้เป็นฐานเดียวสำหรับพัฒนาระบบต่อ

---

## 1. เอกสารชุดนี้มีอะไรบ้าง

1. `01_blueprint.md` — ภาพรวมระบบ สถาปัตยกรรม ขอบเขต และหลักการออกแบบ
2. `02_workflow.md` — Workflow แบบ End-to-End แยกตามผู้ใช้งานและงานจริง
3. `03_ui_spec.md` — โครงสร้างหน้าเว็บ เมนู หน้าจอ และพฤติกรรม UI
4. `04_data_model.md` — Data Model / Firestore Schema เชิงตรรกะและกฎความสัมพันธ์
5. `05_roles_permissions.md` — Role, Permission, การเข้าถึงข้อมูล และ Auth Bridge
6. `06_receipt_control.md` — ระบบทะเบียนคุมใบเสร็จจริงแบบเขียนมือ 50 ใบ/เล่ม
7. `07_fee_master.md` — Fee Master, ภาระชำระนักเรียน, เงินประเภทอื่น และการตั้งค่ารายห้อง
8. `08_reporting_export.md` — บันทึกข้อความรายเดือน, รายงาน สพฐ., Excel/PDF/DOCX และการคืนเล่ม
9. `09_implementation_plan.md` — ลำดับการพัฒนาใหม่หลัง Audit พร้อม Acceptance Criteria
10. `10_decisions_audit.md` — Decision Log, สิ่งที่แก้จาก Blueprint เดิม, จุดที่ยังต้องยืนยัน

---

## 2. Source of Truth

เมื่อข้อมูลขัดกัน ให้ยึดลำดับต่อไปนี้

1. **ผล Audit ของครูการเงินล่าสุดใน `School Pay.pdf`**
2. **ข้อมูลจริงจากทะเบียนคุมใบเสร็จและแบบรายงาน สพฐ. ที่โรงเรียนใช้จริง**
3. **บันทึกข้อความติดตามการชำระเงินจริงของครูที่ปรึกษา**
4. Requirement/Blueprint/README เดิมของโครงการ
5. Mockup/Infographic เป็นเพียงภาพอธิบาย หากขัดกับข้อ 1–4 ให้แก้ตามข้อ 1–4

---

## 3. Non-negotiable Rules หลัง Audit

### 3.1 ใบเสร็จรับเงินจริง
- **Webapp ห้ามออกหรือพิมพ์ใบเสร็จรับเงินจริงทุกกรณี**
- ใบเสร็จจริงเป็น **แบบเขียนมือโดยเจ้าหน้าที่การเงิน**
- ระบบมีหน้าที่เพียง
  - บันทึกว่าการรับเงินครั้งนั้นใช้ใบเสร็จเล่มใด
  - หน้า/เลขที่ใด
  - รับเงินประเภทใด
  - จำนวนเงินเท่าใด
  - ใครเป็นผู้ชำระ/แหล่งเงิน
  - ใครเป็นผู้รับเงิน
  - สถานะของใบเสร็จหน้านั้น
- นักเรียน/ผู้ปกครองและผู้ใช้อื่นสามารถ **ดูรายละเอียดอ้างอิง** ได้ตามสิทธิ์ แต่ไม่มีปุ่ม Print Receipt / Download Receipt

### 3.2 ใบเสร็จ 1 เล่ม
- 1 เล่ม = **50 ใบ/หน้า**
- ระบบต้องติดตามสถานะระดับรายหน้าอย่างน้อย `AVAILABLE`, `USED`, `VOID`
- สามารถเปิดใช้งานใบเสร็จพร้อมกัน **มากกว่า 1 เล่ม**
- การ VOID ไม่ใช่การลบข้อมูล

### 3.3 Fee / Money Model ต้องแยก 2 โลก
1. **Student Charge** — ภาระที่นักเรียนต้องชำระ เช่น เงินบำรุงการศึกษา รายการเฉพาะห้อง/แผนการเรียน สมาคมฯ ฯลฯ
2. **Other Receipt** — เงินที่โรงเรียนรับและใช้ใบเสร็จ แต่ไม่ใช่หนี้ของนักเรียน เช่น เงินทุนการศึกษา เงินอุดหนุน เงินบริจาค เงินสนับสนุนกิจกรรม เงินหลักประกัน ฯลฯ

ห้ามนำ Other Receipt ไปสร้าง Invoice ให้นักเรียน

### 3.4 การรายงาน
- Excel ของ สพฐ. เป็น **Output Contract**: ระบบต้องเก็บข้อมูลละเอียดพอที่จะ Export กลับเข้าแบบฟอร์มจริงได้
- บันทึกข้อความติดตามนักเรียนเป็นงาน **รายเดือน** ของครูที่ปรึกษา
- ต้องรองรับการบันทึก/ติดตาม **การคืนเล่มใบเสร็จ**
- Student/Parent ควรดูประวัติย้อนหลังอย่างน้อย **2 ปีการศึกษา**

---

## 4. System Boundary

```text
Hongson T-Academy ──> Student Directory Adapter ──┐
                                                   │
Hongson T-Folio ─────> Staff Profile Adapter ──────┼──> Hongson-SchoolPay Core
Firebase Auth Bridge ─> Authentication / RBAC ─────┘

Hongson-SchoolPay Core
├─ Student Charges / Payment Tracking
├─ Monthly Homeroom Follow-up
├─ Handwritten Receipt Ledger
├─ Other Receipt Recording
├─ Fee Master / Room Assignment
├─ Reports / OBEC Excel Export / DOCX Memo
└─ Audit Trail
```

---

## 5. แนวคิด UI หลัก

- Theme: **White / Green / Silver**
- โทน: วิชาการ + การเงิน + Enterprise + ใช้งานจริง
- Workflow ต้องสั้น เห็นสถานะทันที ไม่บังคับกรอกข้อมูลที่ระบบรู้อยู่แล้ว
- ใช้ Auto-fill จากระบบต้นทางทุกจุดที่ทำได้
- Desktop เป็น Primary สำหรับงานการเงิน/รายงาน และ Mobile ต้องรองรับการตรวจสอบข้อมูล
- คำว่า `ออกใบเสร็จ` ใน UI ให้ใช้เฉพาะในบริบท **การออกใบเสร็จจริงด้วยมือโดยการเงิน** ไม่ใช้เป็น Action ของ Webapp
- ปุ่มในระบบควรใช้คำว่า `บันทึกข้อมูลใบเสร็จจริง`, `ดูรายละเอียดใบเสร็จ`, `บันทึกเล่ม/หน้า`, `ตรวจสอบสถานะ`

---

## 6. เทคโนโลยีฐาน

แนวทางเดิมที่ยังใช้ได้:
- Vite + React + TypeScript
- Firebase Auth / Firestore / Storage (เฉพาะที่จำเป็น)
- Vercel Static Hosting
- Client-side heavy processing เพื่อลด Server Compute
- Firebase Auth Bridge เชื่อมบัญชีครู/บุคลากรเดิม

สิ่งที่ต้องทำ Technical Spike ก่อนล็อก Library:
- Excel template preservation: ทดสอบ `ExcelJS` vs `xlsx-populate` หรือวิธีอื่นที่รักษา merge/style/formula/print area ของแบบ สพฐ. ได้ดีที่สุด
- DOCX fixed-template merge: เลือก engine ที่รักษา layout ภาษาไทยของแบบจริงได้ดี

---

## 7. Definition of Done ระดับระบบ

ระบบถือว่าพร้อม Pilot เมื่อสามารถทำวงจรต่อไปนี้ได้ครบโดยไม่ต้องกรอก Excel ซ้ำ:

```text
กำหนด Fee Master
→ ผูกกับห้อง/แผนการเรียน
→ สร้างภาระนักเรียน
→ รับเงิน
→ บันทึกอ้างอิงใบเสร็จจริงเล่ม/หน้า
→ นักเรียน/ครูตรวจสอบสถานะ
→ ครูที่ปรึกษาติดตามรายเดือน
→ สร้าง DOCX บันทึกข้อความ
→ ควบคุมสต็อกใบเสร็จและการคืนเล่ม
→ ปิดปีงบประมาณ
→ Export แบบ สพฐ. จากข้อมูลชุดเดียว
```

