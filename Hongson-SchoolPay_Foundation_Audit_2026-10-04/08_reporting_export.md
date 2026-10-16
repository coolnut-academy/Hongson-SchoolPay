# Hongson-SchoolPay — Reporting & Export Foundation

**Revision:** 2026-10-04 Audit Consolidated

---

## 1. Reporting Principle

ข้อมูลถูกบันทึกครั้งเดียวในระบบ แล้วนำไปสร้างรายงานหลายแบบ

```text
Operational Data
→ Validation
→ Report Transformer
→ Official Template
→ Export
```

ห้ามให้ผู้ใช้คัดลอกข้อมูลจากระบบไปกรอก Excel ซ้ำ หากระบบมีข้อมูลเพียงพอแล้ว

---

## 2. Required Report Families

### 2.1 Monthly Homeroom Follow-up Memo
Output: `.docx`

ข้อมูลจากแบบจริง:
- ส่วนราชการ
- วันที่
- เรื่องรายงานการติดตามการชำระเงินค่าบำรุงการศึกษา เงินระดมทรัพยากร และเงินสมาคมผู้ปกครองและครู
- เดือน
- ชั้น/ห้อง
- ชื่อครูที่ปรึกษา
- ภาคเรียน
- ปีการศึกษา
- จำนวนนักเรียนทั้งหมด
- จำนวนชำระครบ
- จำนวนค้างชำระ
- ยอดค้างรวม

ตารางแนบท้าย:
- ลำดับ
- ชื่อ-สกุล
- ยอดค้างชำระ/ปีการศึกษา
- สาเหตุการค้างชำระ
- แนวทางแก้ไข/ความต้องการของผู้ปกครอง
- ลายมือชื่อนักเรียนรับทราบการติดตาม (พื้นที่สำหรับเซ็นบนกระดาษ)

เส้นทางเอกสาร:
1. ครูที่ปรึกษา
2. หัวหน้างานการเงินและบัญชี
3. หัวหน้ากลุ่มบริหารงานงบประมาณ
4. รองผู้อำนวยการกลุ่มบริหารงานงบประมาณ
5. ผู้อำนวยการ

---

## 3. Receipt Control Reports

### 3.1 ทะเบียนคุมใบเสร็จ
ต้องสร้างมุมมอง/Export ที่มีอย่างน้อย:
- วัน เดือน ปี
- รายการ
- รับ
- จ่าย
- คงเหลือ
- จำนวน
- เล่มที่-เลขที่
- ผู้รับใบเสร็จ/ผู้รับผิดชอบ

### 3.2 แบบตรวจสอบการใช้ใบเสร็จรับเงิน สพฐ.
ต้องเติมลง Template จริง ไม่สร้างฟอร์มใหม่

ข้อมูลที่ระบบต้อง reconstruct ได้:
- ยอดยกมา
- ขอเบิกเพิ่มจากส่วนกลางระหว่างปี
- ใบเสร็จใช้ไประหว่างปี
- คงเหลือ
- วันที่
- เล่มที่
- เลขที่ใบเสร็จที่เปิดใช้งาน
- จำนวนใบเสร็จตามเล่ม
- จำนวนใบที่ใช้รับเงินรายได้สถานศึกษา
- อัตราที่เก็บเงิน
- จำนวนเงินรวม
- ใบเสร็จที่ยกเลิก
- รับเงินอื่น ๆ
- คงเหลือในเล่มที่เปิดใช้
- หมายเหตุ

### 3.3 รายงานการใช้ใบเสร็จประจำปีงบประมาณ
ต้องสรุปข้อมูลการใช้ใบเสร็จตลอด Fiscal Year ตามแบบ สพฐ. ที่โรงเรียนได้รับ

### 3.4 Receipt Book Return / Reconciliation
หลัง Audit ต้องเพิ่มรายงาน/เอกสารเกี่ยวกับการส่งคืนเล่มใบเสร็จรับเงิน

ข้อมูล:
- เล่ม
- ผู้ถือครอง
- วันที่เบิก
- วันที่คืน
- USED
- VOID
- AVAILABLE
- รวมตรวจนับ 50
- ผู้ส่งคืน
- ผู้รับคืน
- หมายเหตุ discrepancy

---

## 4. Other Receipt Reporting

Other Receipt ต้องถูกนำไปใช้ในรายงานใบเสร็จด้วย

ตัวอย่าง Description ที่ต้องรองรับจากข้อมูลจริง:
- รับเงินทุนการศึกษา ... บาท
- รับเงินจัดสรรเงินอุดหนุน ... บาท
- รับเงินบริจาค ... บาท
- รับเงินสนับสนุนกิจกรรมพิเศษ ... บาท
- รับเงินหลักค้ำประกัน ... บาท

ระบบต้องเก็บ category และ description แบบ structured และมี free-text note สำหรับกรณีรายละเอียดราชการยาว

---

## 5. Report Center

Suggested list:

```text
[รายงานรายเดือน]
- บันทึกข้อความติดตามการชำระเงิน .docx
- สรุปยอดรายห้อง

[ใบเสร็จ]
- ทะเบียนคุมใบเสร็จ
- แบบตรวจสอบการใช้ใบเสร็จรับเงิน สพฐ.
- รายงานการใช้ใบเสร็จประจำปีงบประมาณ
- รายงานส่งคืน/ตรวจนับเล่ม

[การเงิน]
- รายการรับเงินนักเรียน
- รายการรับเงินประเภทอื่น
- สรุปยอดค้างชำระ
```

---

## 6. Export Policy

### Excel
ใช้สำหรับ:
- แบบ สพฐ.
- Ledger
- Operational report

### PDF
ใช้สำหรับ:
- Preview/report summary
- เอกสารประกอบที่ไม่ใช่ Receipt

### DOCX
ใช้สำหรับ:
- บันทึกข้อความรายเดือน
- เอกสารราชการที่ต้องแก้/พิมพ์/ลงนามต่อ

### Forbidden
- Receipt PDF
- Receipt DOCX
- Digital Receipt Image

---

## 7. Official Excel Template Strategy

### Requirement
ต้องรักษา:
- Merge cells
- Font/style
- Borders
- Column width
- Row height
- Print area
- Formula/หัวแบบ หากมี
- ช่องลงนาม

### Architecture
```text
Official .xlsx Template
→ Load client-side
→ Populate mapped cells/ranges
→ Extend rows onlyตาม rule ที่กำหนด
→ Recalculate derived values
→ Validate totals
→ Export .xlsx
```

### Technical Spike
ก่อน implementation จริงให้สร้าง Test Workbook จากไฟล์ สพฐ. จริงและเปรียบเทียบ library ที่รักษารูปแบบดีที่สุด

---

## 8. Mapping Layer

ห้าม hard-code cell address กระจายทั่ว UI

สร้าง config:

```ts
interface ReportTemplateMapping {
  templateId: string
  version: string
  fields: Record<string, string>
  repeatingSections: Array<{
    name: string
    startRow: number
    columns: Record<string, string>
  }>
}
```

ตัวอย่าง semantic key:
- `opening_stock.quantity`
- `received_during_year.quantity`
- `book.book_no`
- `usage.school_revenue.count`
- `usage.void.count`
- `usage.other_receipt.count`

---

## 9. Pre-export Validation

ก่อน Export แบบ สพฐ. ต้องตรวจ:

- Stock opening balance exists
- Receipt book count matches movement ledger
- Book reconciliation completed or explicitly flagged
- USED pages have linked transactions
- VOID pages have reasons
- Other receipt transactions have category/description
- No duplicate book/page usage
- Totals reconcile

ถ้า fail:
- ไม่ควร Export แบบ “พร้อมส่ง”
- อนุญาต Draft Export ได้เฉพาะ Superadmin/Finance หากมี watermark/flag `ข้อมูลยังไม่ครบ`

---

## 10. Monthly Memo Template Strategy

ใช้ fixed `.docx` template จากแบบจริง

Data merge:
- Teacher name from T-Folio
- Room/student roster from T-Academy
- Payment status from SchoolPay
- Reason/solution from monthly follow-up

Generated document ต้องรักษารูปแบบต้นฉบับและเหลือพื้นที่สำหรับลายเซ็นจริง

---

## 11. Report Versioning

เก็บ:
- templateVersion
- generatedAt
- generatedBy
- filters
- validation summary

เพื่อย้อนตรวจว่าไฟล์หนึ่งถูกสร้างจากแบบและข้อมูลเวอร์ชันใด

