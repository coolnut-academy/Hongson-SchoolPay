# Hongson-SchoolPay — Fee Master & Money Classification

**Revision:** 2026-10-04 Audit Consolidated

---

## 1. Why Two Master Types Are Required

หลัง Audit ต้องแยกชัดเจนว่าเงินที่มีใบเสร็จไม่ได้แปลว่าเป็น “ค่าเทอม/ภาระนักเรียน” เสมอไป

### Type A — Student Charge Master
ใช้สร้างภาระให้นักเรียน

### Type B — Other Receipt Category Master
ใช้จำแนกเงินรับประเภทอื่น แต่ไม่สร้างหนี้นักเรียน

---

## 2. Student Charge Master

โครงสร้างเดิมที่มีข้อมูลยืนยันใน Blueprint:

### กลุ่ม สพฐ./เงินบำรุงการศึกษา
- ค่าจ้างครู บุคลากรและครูต่างชาติ
- ห้องเรียนวิทย์พิเศษ ม.ปลาย
- ห้องเรียนวิทย์คอม ม.ปลาย
- ห้องเรียนวิทย์สุขภาพ ม.ปลาย
- ห้องเรียนเตรียมวิทย์ ม.ต้น
- ห้องเรียนเตรียมวิทย์คอม ม.ต้น
- ห้องเรียนเตรียมวิทย์ภาษา ม.ต้น
- เงินประกันอุบัติเหตุ
- เงินระดมทรัพยากร

### กลุ่มสมาคมผู้ปกครองและครู
- ค่าสมัครสมาคมผู้ปกครองและครู
- ค่าบำรุงสมาคมรายปี

> จำนวนชื่อหมวดจากเอกสารเดิมมีความไม่สอดคล้องระหว่างคำว่า “10+2” กับรายการแจกแจงจริง 9+2 ให้ใช้รายการจริงเป็นฐาน และให้ Admin สามารถเพิ่ม/ปิดรายการได้แทนการ hard-code จำนวน

---

## 3. Fee Master Design

```ts
StudentChargeItem {
  code
  name
  category
  receiptGroup
  frequency
  defaultAmount?
  active
}
```

### Frequency
- once
- annual
- term
- custom

---

## 4. Annual / Term Templates

ทุกปี Admin ต้องสามารถ:
- คัดลอกจากปีก่อน
- ปรับราคา
- เปิด/ปิดรายการ
- เพิ่มรายการใหม่
- เปลี่ยนหมวด

ห้าม hard-code ราคาลง source code

---

## 5. Room / Program Assignment

กำหนดได้ละเอียดถึง:
- ปีการศึกษา
- ภาคเรียน
- ระดับชั้น
- ห้อง
- แผนการเรียน

ตัวอย่างเชิง UI:

```text
ม.1/1 ห้องเรียนพิเศษวิทย์
├─ หมวดพื้นฐาน
│  ├─ เงินบำรุงการศึกษา
│  └─ ประกันอุบัติเหตุ
├─ หมวดห้อง/แผนพิเศษ
│  └─ รายการเฉพาะแผนที่โรงเรียนกำหนด
└─ หมวดสมาคม/อื่นตามนโยบาย
```

> จำนวนเงินตัวอย่างใน Infographic ไม่ถือเป็นข้อมูลทางการจน Finance ใส่ค่าจริงใน Fee Master

---

## 6. Publication Workflow

```text
Draft Fee Template
→ Preview ห้อง/แผน
→ Finance Review
→ Publish
→ Generate Student Obligations
```

Published template ห้ามแก้แบบ silent update หากมี Obligation ถูกสร้างแล้ว ต้อง version ใหม่

---

## 7. Other Receipt Category Master

รายการจากเอกสารการใช้ใบเสร็จจริงพบตัวอย่าง เช่น:
- เงินทุนการศึกษา
- เงินจัดสรร/เงินอุดหนุน
- เงินบริจาค
- เงินสนับสนุนการจัดกิจกรรมพิเศษนอกเหนือหลักสูตร
- เงินหลักค้ำประกันสัญญา
- เงินหลักประกันเสนอราคา
- เงินค่าอาหารกลางวัน
- เงินค่าอาหารนักเรียนพักนอน
- เงินปัจจัยพื้นฐานนักเรียนยากจน
- เงิน กสศ.
- เงินพัฒนานวัตกรรมการศึกษา
- เงินค่าพัสดุครุภัณฑ์
- อื่น ๆ

### Rule
Admin สร้าง/แก้ Category ได้ทุกปีโดยไม่ต้อง deploy code

---

## 8. Other Receipt Transaction Fields

- fiscal year
- date
- category
- description
- payer/source
- amount
- receiver
- receipt book
- receipt page
- note for OBEC report

---

## 9. Category Mapping to Reports

แต่ละ Category ควรมี:
- displayName
- reportMappingKey
- default note pattern (optional)
- active period

เพื่อให้ Exporter รู้ว่า transaction นี้ต้องไปอยู่ `รับเงินรายได้สถานศึกษา` หรือ `รับเงินอื่น ๆ` และสร้างหมายเหตุอย่างไร

---

## 10. Validation Rules

### Student Charge
- ต้องมี academicYear
- ต้องรู้ scope
- amount >= 0
- published before generation

### Other Receipt
- ไม่ต้องมี studentId
- ต้องมี source/payer description
- ต้องมี category + amount
- ถ้ามี physical receipt ต้อง link Receipt Page

---

## 11. Admin UI Acceptance

Admin ต้องสามารถทำงานเหล่านี้โดยไม่แก้ code:
- เพิ่มรายการเงิน
- ปิดรายการเก่า
- คัดลอก setup จากปีก่อน
- จัดหมวด
- ตั้งราคาแยกห้อง
- ตั้งราคาแยกแผน
- Preview ต่อคน/ทั้งห้อง
- Publish
- เพิ่ม Other Receipt Category

