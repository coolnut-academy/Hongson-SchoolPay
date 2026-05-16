# BANK_INTEGRATION.md
# คู่มือดำเนินการเชื่อมต่อธนาคาร — SchoolPay QR PromptPay

> ใช้เอกสารนี้เป็น checklist จริงในการติดต่อและเชื่อมต่อระบบ Payment Gateway กับธนาคาร

---

## ขั้นตอนที่ 1: เลือกธนาคารและเตรียมเอกสาร

### ธนาคารที่แนะนำ (เรียงลำดับความเหมาะสม)

| ธนาคาร | เหตุผล | API Documentation |
|--------|--------|-------------------|
| **กรุงไทย (KTB)** | ธนาคารรัฐ · อาจได้ค่าธรรมเนียมพิเศษสำหรับโรงเรียนรัฐบาล | [KTB Developer Portal](https://developer.ktb.co.th) |
| **กสิกรไทย (KBank)** | KBank PGW มีเอกสาร API ครบถ้วน | [KBank PGW](https://apiportal.kasikornbank.com) |
| **ไทยพาณิชย์ (SCB)** | SCB Payment Gateway มีระบบ Sandbox ดี | [SCB Developer](https://developer.scb.co.th) |

### เอกสารที่ต้องเตรียม

- [ ] หนังสือรับรองโรงเรียน / หนังสือจัดตั้ง
- [ ] สำเนาบัตรประจำตัวผู้อำนวยการสถานศึกษา
- [ ] เลขประจำตัวนิติบุคคล (ใช้เลขที่ได้จากกระทรวงศึกษา)
- [ ] เลขที่บัญชีธนาคารของโรงเรียน (สำหรับรับโอนเงิน)
- [ ] หนังสือมอบอำนาจ (ถ้าไม่ใช่ผู้อำนวยการดำเนินการเอง)
- [ ] แผนผังระบบ (System Architecture) ของ SchoolPay
- [ ] URL ของ Webhook Endpoint (ได้หลัง deploy บน Vercel)

---

## ขั้นตอนที่ 2: สมัคร Payment Gateway

### 2.1 ติดต่อทีม Corporate / Business Banking

ไม่ใช่ Branch ทั่วไป — ต้องติดต่อ **ทีม Corporate Banking** หรือ **ทีม Digital Payment Solution** โดยตรง

```
กรุงไทย: โทร 02-111-1111 กด Business → Digital Payment
กสิกรไทย: https://www.kasikornbank.com/th/business/page/kpgw
SCB: https://www.scb.co.th/th/personal-banking/stories/scb-payment-gateway.html
```

### 2.2 สิ่งที่จะได้รับจากธนาคาร

หลังสมัครและผ่านการตรวจสอบ ธนาคารจะให้:

| สิ่ง | ใช้ทำอะไร |
|------|-----------|
| `CLIENT_ID` | ระบุตัวตนเมื่อเรียก API |
| `CLIENT_SECRET` | ใช้ขอ Access Token |
| `MERCHANT_ID` | ระบุร้านค้า/โรงเรียนในระบบธนาคาร |
| `BILLER_ID` | ระบุ PromptPay Biller (13 หลัก) |
| `WEBHOOK_SECRET` | ใช้ verify HMAC signature ของ callback |
| `SANDBOX_URL` | Base URL สำหรับ test |
| `PRODUCTION_URL` | Base URL จริง |
| `IP Whitelist ของธนาคาร` | IP ที่ธนาคารใช้ยิง Webhook มาหา |

---

## ขั้นตอนที่ 3: ตั้งค่าระบบ

### 3.1 Environment Variables ที่ต้องตั้งใน Vercel

```env
# ===== Bank API =====
BANK_PROVIDER=ktb                          # ktb | kbank | scb
BANK_API_BASE_URL=https://api.ktb.co.th/biller/v3
BANK_CLIENT_ID=ktb-biller-prd-XXXX
BANK_CLIENT_SECRET=your_secret_here
BANK_MERCHANT_ID=501234567890
BANK_BILLER_ID=0994000155010              # 13 หลัก สำหรับ PromptPay

# ===== Webhook =====
BANK_WEBHOOK_SECRET=spwk_prd_your_secret_here
BANK_ALLOWED_IPS=203.150.32.0/24,203.151.0.0/16   # IP จากธนาคาร

# ===== Firebase =====
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# ===== App =====
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app
QR_EXPIRE_MINUTES=120
```

### 3.2 แจ้ง Webhook URL กับธนาคาร

```
https://your-app.vercel.app/api/webhook/payment
```

ธนาคารจะทดสอบโดยส่ง `HTTP POST` มาที่ URL นี้ — ต้องมีระบบรับ HMAC verification พร้อมก่อน

---

## ขั้นตอนที่ 4: ทดสอบบน Sandbox

### Flow การทดสอบ QR PromptPay

```
1. เรียก POST /api/invoices/qr  → ได้ QR payload
2. ใช้ Sandbox app ของธนาคาร simulate การสแกน
3. ธนาคารยิง Webhook มาที่ /api/webhook/payment
4. ตรวจสอบว่า invoice status เปลี่ยนเป็น "paid"
5. ตรวจสอบ real-time update บนหน้า Parent
```

### Test Cases ที่ต้องผ่านก่อน Go-Live

- [ ] จ่ายตรงยอด → สถานะ `paid` ✓
- [ ] จ่ายเกินยอด → เข้า `under_review` ✓
- [ ] จ่ายขาดยอด → เข้า `under_review` ✓
- [ ] Webhook ลายเซ็นผิด → ปฏิเสธ 401 ✓
- [ ] Webhook ซ้ำ (duplicate tx_id) → ตอบ 200 แต่ไม่ประมวลผลซ้ำ ✓
- [ ] Webhook IP ไม่อยู่ใน whitelist → ปฏิเสธ 403 ✓
- [ ] QR หมดอายุ → parent เห็น error ชัดเจน ✓
- [ ] ระบบล่มระหว่างประมวลผล Webhook → idempotency ทำงานถูกต้อง ✓

---

## ขั้นตอนที่ 5: Go-Live Checklist

- [ ] Sandbox ผ่านทุก test case
- [ ] ธนาคารอนุมัติ Production access
- [ ] เปลี่ยน environment variables จาก Sandbox → Production
- [ ] ทดสอบจ่ายจริง 1 รายการ (ยอดน้อยที่สุด เช่น ฿1)
- [ ] ตรวจสอบว่าเงินเข้าบัญชีโรงเรียนถูกต้อง
- [ ] เปิดใช้งาน Budget Alert บน Firebase
- [ ] แจ้งผู้ปกครองและเจ้าหน้าที่การเงินก่อน Go-Live อย่างน้อย 2 สัปดาห์

---

## ข้อมูลอ้างอิง

| เรื่อง | Link |
|--------|------|
| PromptPay Standard (BoT) | https://www.bot.or.th/Thai/PaymentSystems/PSIssuePublish/Pages/2559_39.aspx |
| QRCS Specification | https://www.bot.or.th/en/financial-innovation/digital-finance/qr-payment.html |
| KTB Developer Portal | https://developer.ktb.co.th |
| KBank API Portal | https://apiportal.kasikornbank.com |
