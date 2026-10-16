# สถานะและการตรวจหน้าจอ — 16 ตุลาคม 2569

Frontend พร้อมตรวจหน้าแรก นักเรียน ครู/การเงิน และ admin โดยไม่มีข้อมูลธุรกิจสมมติ ยังไม่ใช่ระบบ production ที่เชื่อมข้อมูลจริง: ต้องรับไฟล์ Auth Bridge และ data adapter แล้วทดสอบกับบริการโรงเรียนก่อนเปิดใช้งานจริง

## เปิดตรวจหน้าจอ

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

เปิด http://127.0.0.1:5173 ใช้ Test ID ด้านล่างโดยไม่ต้องใช้รหัสผ่าน

| พื้นที่ | Test ID | เส้นทางหลังเข้า |
| --- | --- | --- |
| นักเรียน/ผู้ปกครอง | `TEST-STUDENT` | `/student` |
| ครูที่ปรึกษา | `TEST-TEACHER` | `/app/dashboard` |
| เจ้าหน้าที่การเงิน | `TEST-FINANCE` | `/app/dashboard` |
| ครูการเงิน | `TEST-FINANCE-TEACHER` | `/app/dashboard` |
| ผู้ดูแลระบบ | `TEST-ADMIN` | `/app/dashboard` → ผู้ใช้งานและสิทธิ์ |
| ผู้บริหาร | `TEST-EXECUTIVE` | `/app/dashboard` |

บัญชีเหล่านี้เป็นตัวเลือกหน้าจอเท่านั้น ไม่ใช่บัญชีโรงเรียน ไม่ได้สร้างบุคลากร นักเรียน ห้องเรียน ยอดเงิน หรือเอกสาร และปฏิเสธคำสั่งบันทึกทั้งหมด ออกจากระบบหรือ reload ต้องเข้าใหม่ ไม่มีการเก็บตัวตนใน browser storage

`VITE_REVIEW_MODE=false` ปิดทางเข้าตรวจหน้าจอใน dev ส่วน `npm run build` ตัด Test ID และ review adapter ออกเสมอ แม้ตั้ง flag เป็น true ถ้ายังไม่มี integration ปุ่มเข้าสู่ระบบ production จะปิดและทุก protected route กลับหน้าแรก

## ไฟล์สำหรับเชื่อมต่อรอบถัดไป

- `src/integration/runtime.ts`: เปลี่ยน `schoolRuntime()` ให้คืน `{ auth, adapter }` ที่เชื่อมจริง ไม่มีการ fallback ไปใช้ review adapter
- `src/auth/SchoolAuthBridge.ts`: orchestration ตรวจ project, mapping, profile, role และ scope พร้อม subscribe/logout และกันคำตอบเก่าหลัง logout
- `src/ports/AuthBridgeAdapter.ts`: รูปแบบ Firebase driver และแหล่งข้อมูลบุคลากร/สิทธิ์ที่ต้องส่งมา
- `src/ports/SchoolPayAdapter.ts`: data operations ที่หน้าจอเรียก บริการต้นทางต้องตรวจสิทธิ์ด้วย session จริงทุกครั้ง ไม่เชื่อ role ที่ client ส่ง
- `src/domain/model.ts` และ `src/domain/workspace.ts`: response types เงินเป็นจำนวนเต็มหน่วยสตางค์

สิ่งที่ต้องส่งต่อ: ไฟล์ bridge/SDK initialization, public Firebase config และ project/school ID, วิธี mapping auth UID กับบุคลากร, รูปแบบข้อมูลและช่องทางอ่าน/เขียน, กติกาการเข้าถึงข้อมูลนักเรียน ไม่ต้องส่ง service-account private key หรือ production secret ลงใน frontend

`read(signal, studentCode?)` คือ snapshot ตามสิทธิ์บุคลากร โดยค้นนักเรียนเฉพาะเมื่อระบุ code; `lookup(code)` และ `visitorAccount()` เป็น session ฝั่งนักเรียนแยกต่างหาก `endVisitorSession()` ต้องยกเลิก session ต้นทางด้วย การใช้รหัสนักเรียนเพียงอย่างเดียวต้องมีนโยบายยืนยันตัวตนและป้องกันการไล่ค้นจากโรงเรียนก่อนเปิดจริง

`VisitorAccount.student = null` หมายถึงไม่มีข้อมูลให้แสดง ไม่ใช่ชำระครบ; `documents` ต้องเป็นรายการที่อนุญาตให้ผู้ใช้รายนั้นอ่าน และ URL ต้องเปิดได้จริง; `asOf` และ `periodLabel` ต้องมาจากต้นทาง ส่วน `DashboardData.available = false` แสดง “—” แทนยอดศูนย์ที่ยังไม่ทราบ

## การตรวจสอบ

```sh
npm run lint
npm test
npm run test:e2e
npm run build
npm run check:static
npm run test:built
```

ชุดทดสอบเดิมที่ผูกกับ seeded MockAdapter ถูกแทนด้วยการทดสอบข้อมูลว่าง, Test ID, การกันเส้นทาง, การล้าง session, ทุกเมนู, responsive และ accessibility โดยคง unit tests ของ domain และ Auth Bridge ไว้ ภาพมือถืออยู่ `artifacts/review/` ผล/ภาพใน `artifacts/verification/` และเอกสาร Stage B เดิมเป็นประวัติ ไม่ใช่หลักฐานยืนยัน build ปัจจุบัน

ยังไม่ได้ยืนยัน: การล็อกอินโรงเรียนจริง, reads/writes จริง, security rules สำหรับระบบจริง, concurrency/idempotency ของการเงิน, template รายงานจริง หรือ deployment ตัว host ต้องรองรับ SPA fallback สำหรับเส้นทางแอป แต่ `/assets/*` ที่ไม่มีไฟล์ต้องคืน 404 ต้องทดสอบ integration เหล่านี้ก่อนเปิดใช้งาน production
