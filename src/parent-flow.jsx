// Parent / Student payment flow — 7 mobile screens shown side-by-side

const ParentFlow = () => {
  return (
    <div className="phone-stage" style={{minHeight: "calc(100vh - 60px)", padding: "32px 16px"}}>
      <div style={{maxWidth: 1620, margin: "0 auto"}}>
        <div style={{textAlign: "center", marginBottom: 24, padding: "0 16px"}}>
          <h2 style={{margin: "0 0 6px", fontSize: 18}}>ขั้นตอนการชำระเงินสำหรับผู้ปกครอง</h2>
          <p className="page-sub" style={{margin: 0}}>
            หน้าจอผู้ปกครองออกแบบให้เรียบง่ายและทำงานได้ดีบนมือถือ · 7 หน้าจอหลักของเส้นทางการชำระเงิน
          </p>
        </div>

        <div className="phone-multi">
          <PhoneScreen label="1 · ค้นหาใบแจ้งชำระ"><LookupScreen /></PhoneScreen>
          <PhoneScreen label="2 · เลือกวิธีชำระเงิน"><MethodScreen /></PhoneScreen>
          <PhoneScreen label="3 · ชำระด้วย QR"><QRScreen /></PhoneScreen>
        </div>

        <div className="phone-multi" style={{marginTop: 32}}>
          <PhoneScreen label="4 · ชำระที่ Counter Service"><CounterScreen /></PhoneScreen>
          <PhoneScreen label="5 · รอการยืนยัน"><StatusPendingScreen /></PhoneScreen>
          <PhoneScreen label="6 · ยืนยันแล้ว · ดาวน์โหลดใบเสร็จ"><ReceiptReadyScreen /></PhoneScreen>
        </div>

        <div className="phone-multi" style={{marginTop: 32}}>
          <PhoneScreen label="7 · ชุดเอกสารเบิกค่าการศึกษาบุตร"><ReimbursementScreen /></PhoneScreen>
          <PhoneScreen label="A · ใบแจ้งชำระ PDF"><PaymentNoticePreview /></PhoneScreen>
        </div>
      </div>
    </div>
  );
};

// ===== Phone shell =====
const PhoneScreen = ({ label, children }) => (
  <div>
    <div className="phone-screen-label">{label}</div>
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-status">
          <span>9:41</span>
          <span style={{display: "flex", gap: 4, alignItems: "center"}}>
            <span style={{fontSize: 10}}>●●●●</span>
            <span style={{fontSize: 10}}>5G</span>
            <span style={{display: "inline-block", width: 18, height: 9, border: "1px solid currentColor", borderRadius: 2, position: "relative"}}>
              <span style={{position: "absolute", inset: 1, width: "80%", background: "currentColor"}}></span>
            </span>
          </span>
        </div>
        <PhoneHeader />
        <div className="phone-body">{children}</div>
      </div>
    </div>
  </div>
);

const PhoneHeader = () => (
  <div className="phone-header">
    <div className="school-mark">หส</div>
    <div className="grow" style={{minWidth: 0}}>
      <div className="phone-title" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ</div>
      <div className="phone-subtitle">ระบบรับชำระเงินโรงเรียน</div>
    </div>
    <Icon name="more" size={16} color="#5C6878" />
  </div>
);

// ===== Screen 1: Lookup =====
const LookupScreen = () => (
  <>
    <h2 style={{fontSize: 18, fontWeight: 600, margin: "4px 0 6px"}}>ตรวจสอบยอดที่ต้องชำระ</h2>
    <p className="muted" style={{fontSize: 12.5, margin: "0 0 18px"}}>
      กรอกรหัสนักเรียน หรือเลขที่ใบแจ้งชำระเพื่อเริ่มต้น
    </p>

    <div className="field">
      <div className="label">รหัสนักเรียน หรือเลขที่ใบแจ้งชำระ</div>
      <input className="input mono" defaultValue="65120184" style={{padding: "10px 12px", fontSize: 14}} />
    </div>
    <div className="field">
      <div className="label">เลขประจำตัวประชาชนผู้ปกครอง <span className="muted" style={{fontWeight: 400}}>(4 หลักสุดท้าย)</span></div>
      <input className="input mono" placeholder="••••" style={{padding: "10px 12px", fontSize: 14}} />
      <div className="hint">เพื่อยืนยันสิทธิ์การเข้าถึงข้อมูลของนักเรียน</div>
    </div>

    <button className="btn primary lg" style={{width: "100%", justifyContent: "center", marginTop: 8}}>
      ค้นหาใบแจ้งชำระ <Icon name="arrowRight" size={14} />
    </button>

    <div className="divider" style={{margin: "20px 0"}} />

    <div className="tiny muted" style={{textAlign: "center", lineHeight: 1.7}}>
      ติดต่อฝ่ายการเงินของโรงเรียน 0-2374-XXXX<br/>
      วันจันทร์–ศุกร์ 08:30–16:30 น.
    </div>

    <div style={{position: "absolute", bottom: 20, left: 16, right: 16, display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)"}}>
      <div className="flex" style={{gap: 8}}>
        <Icon name="shield" size={14} color="var(--emerald)" />
        <span className="tiny">ระบบมีการเข้ารหัส TLS 1.3</span>
      </div>
      <span className="tiny muted latin">v3.1</span>
    </div>
  </>
);

// ===== Screen 2: Method selection =====
const MethodScreen = () => (
  <>
    {/* Student summary */}
    <div className="card" style={{padding: 12, marginBottom: 14, background: "var(--navy-soft)", border: "none"}}>
      <div className="flex" style={{gap: 10}}>
        <Avatar name="ภาคิน วงศ์อิสรกุล" size={36} />
        <div className="grow">
          <div style={{fontSize: 13.5, fontWeight: 600}}>เด็กชายภาคิน วงศ์อิสรกุล</div>
          <div className="tiny" style={{color: "var(--text-2)"}}>ม.5/1 · รหัสนักเรียน <span className="mono">65120184</span></div>
        </div>
      </div>
    </div>

    {/* Amount */}
    <div className="parent-amount" style={{padding: "8px 0 16px"}}>
      <div className="label">ยอดที่ต้องชำระ</div>
      <div className="value"><span className="cur">฿</span>4,200<span style={{fontSize: 18, color: "var(--muted)"}}>.00</span></div>
      <div className="sub">ใบแจ้งชำระเลขที่ <span className="mono">INV-2569-018421</span> · กำหนด 30 มิ.ย. 2569</div>
    </div>

    <h3 style={{fontSize: 13, margin: "0 0 10px"}}>เลือกช่องทางชำระเงิน</h3>

    <div className="flex-col" style={{gap: 8}}>
      <div className="method-card qr selected">
        <div className="method-icon"><Icon name="qr" size={20} /></div>
        <div className="grow">
          <div className="method-title">Mobile Banking QR</div>
          <div className="method-desc">สแกน QR ผ่านแอพธนาคารของผู้ปกครอง · ระบบยืนยันยอดอัตโนมัติ</div>
        </div>
      </div>
      <div className="method-card cs">
        <div className="method-icon"><Icon name="store" size={20} /></div>
        <div className="grow">
          <div className="method-title">Counter Service / 7-Eleven</div>
          <div className="method-desc">นำใบแจ้งชำระเงินไปชำระที่เคาน์เตอร์ · ค่าบริการ 10 บาท</div>
        </div>
      </div>
      <div className="method-card bank">
        <div className="method-icon"><Icon name="chat" size={20} /></div>
        <div className="grow">
          <div className="method-title">ติดต่อฝ่ายการเงิน</div>
          <div className="method-desc">กรณีพิเศษ · นัดชำระเงินสดที่โรงเรียนหรือสอบถามรายละเอียดเพิ่มเติม</div>
        </div>
      </div>
    </div>

    <button className="btn primary lg" style={{width: "100%", justifyContent: "center", marginTop: 16}}>
      ดำเนินการต่อ <Icon name="arrowRight" size={14} />
    </button>
  </>
);

// ===== Screen 3: QR payment =====
const QRScreen = () => (
  <>
    <div className="parent-amount" style={{padding: "0 0 14px"}}>
      <div className="label">ยอดที่ต้องชำระ · กรุณาตรวจสอบก่อนยืนยัน</div>
      <div className="value"><span className="cur">฿</span>4,200<span style={{fontSize: 18, color: "var(--muted)"}}>.00</span></div>
      <div className="sub">INV-2569-018421 · ภาคิน วงศ์อิสรกุล · ม.5/1</div>
    </div>

    <QRPlaceholder size={210} seed={421} />

    <div style={{textAlign: "center", margin: "12px 0"}}>
      <div className="badge issued" style={{fontSize: 11}}><Icon name="clock" size={11} /> หมดอายุภายใน 09:42 น.</div>
    </div>

    <div className="card" style={{padding: 10, marginBottom: 10, background: "var(--surface-2)"}}>
      <div className="flex" style={{justifyContent: "space-between", fontSize: 12, padding: "4px 0"}}>
        <span className="muted">รหัสอ้างอิง 1 (REF1)</span>
        <span className="mono" style={{fontWeight: 500}}>65120184026901</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderTop: "1px dashed var(--border)"}}>
        <span className="muted">รหัสอ้างอิง 2 (REF2)</span>
        <span className="mono" style={{fontWeight: 500}}>569018421</span>
      </div>
    </div>

    <Banner kind="warn">
      <b>กรุณาชำระตามยอดที่ระบุเท่านั้น</b><br/>
      หากแก้ไขยอด ระบบจะไม่ยืนยันโดยอัตโนมัติ และจะต้องรอเจ้าหน้าที่ตรวจสอบ
    </Banner>

    <div className="flex" style={{gap: 8, marginTop: 14}}>
      <button className="btn grow" style={{justifyContent: "center"}}><Icon name="download" size={13} /> บันทึก QR</button>
      <button className="btn grow" style={{justifyContent: "center"}}><Icon name="copy" size={13} /> คัดลอกเลขอ้างอิง</button>
    </div>
  </>
);

// ===== Screen 4: Counter Service barcode =====
const CounterScreen = () => (
  <>
    <div style={{textAlign: "center", marginBottom: 10}}>
      <div style={{display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: "var(--emerald-soft)", color: "var(--emerald-2)", borderRadius: 999, fontSize: 12, fontWeight: 500}}>
        <Icon name="store" size={12} /> ชำระที่ Counter Service / 7-Eleven
      </div>
    </div>

    <div className="parent-amount" style={{padding: "6px 0 14px"}}>
      <div className="label">ยอดที่ต้องชำระ + ค่าบริการ 10 บาท</div>
      <div className="value"><span className="cur">฿</span>4,210<span style={{fontSize: 18, color: "var(--muted)"}}>.00</span></div>
      <div className="sub">ภาคิน วงศ์อิสรกุล · ม.5/1 · INV-2569-018421</div>
    </div>

    <div style={{background: "#fff", padding: 12, border: "1px solid var(--border)", borderRadius: 6}}>
      <BarcodePlaceholder payload="099400015501651201840269015690184210" />
      <div className="mono" style={{fontSize: 11, textAlign: "center", marginTop: 6, letterSpacing: "0.05em"}}>
        | 099400015501 | 65120184026901 | 569018421 | 4210 |
      </div>
    </div>

    <div className="card" style={{padding: 10, margin: "12px 0", background: "var(--surface-2)"}}>
      <div className="flex" style={{justifyContent: "space-between", fontSize: 11.5, padding: "3px 0"}}>
        <span className="muted">Biller / Service code</span>
        <span className="mono">099400 / 0155</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", fontSize: 11.5, padding: "3px 0"}}>
        <span className="muted">REF1</span>
        <span className="mono">65120184026901</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", fontSize: 11.5, padding: "3px 0"}}>
        <span className="muted">REF2</span>
        <span className="mono">569018421</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", fontSize: 11.5, padding: "3px 0"}}>
        <span className="muted">กำหนดชำระภายใน</span>
        <span className="mono">30 มิ.ย. 2569</span>
      </div>
    </div>

    <div className="card" style={{padding: 12, marginBottom: 10}}>
      <div style={{fontSize: 12.5, fontWeight: 600, marginBottom: 8}}>ขั้นตอน 6 ข้อ</div>
      <ol style={{paddingLeft: 18, margin: 0, fontSize: 12, lineHeight: 1.7, color: "var(--text-2)"}}>
        <li>บันทึกหรือพิมพ์ใบแจ้งชำระฉบับนี้</li>
        <li>นำใบไปที่ 7-Eleven / Counter Service ทุกสาขา</li>
        <li>ชำระ <b>ตามยอดที่ระบุเท่านั้น</b></li>
        <li>เก็บใบรับเงินจากเคาน์เตอร์ไว้</li>
        <li>รอการยืนยันจากระบบโรงเรียน (1–2 ชั่วโมง)</li>
        <li>ดาวน์โหลดใบเสร็จรับเงินจากเว็บไซต์</li>
      </ol>
    </div>

    <Banner kind="danger">
      <b>สลิป Counter ไม่ใช่ใบเสร็จของโรงเรียน</b> โปรดรอใบเสร็จรับเงินอย่างเป็นทางการที่ออกโดยระบบโรงเรียน
    </Banner>

    <button className="btn primary lg" style={{width: "100%", justifyContent: "center", marginTop: 10}}>
      <Icon name="download" size={13} /> ดาวน์โหลดใบแจ้งชำระ PDF
    </button>
  </>
);

// ===== Screen 5: Waiting for confirmation =====
const StatusPendingScreen = () => (
  <>
    <div style={{textAlign: "center", padding: "20px 0 14px"}}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "var(--info-soft)", color: "var(--info)",
        display: "grid", placeItems: "center", margin: "0 auto 12px",
        position: "relative",
      }}>
        <Icon name="clock" size={28} />
        <div style={{position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid var(--info)", opacity: 0.3, animation: "pulse 1.6s infinite"}}></div>
      </div>
      <div style={{fontSize: 16, fontWeight: 600}}>รอการยืนยันจากธนาคาร</div>
      <div className="tiny muted" style={{marginTop: 4}}>โดยทั่วไปใช้เวลาไม่เกิน 5 นาที</div>
      <div style={{marginTop: 12}}>
        <span className="status-pill pending">
          <span className="dot pulse" />
          รอการยืนยันจากธนาคาร/ผู้ให้บริการ
        </span>
      </div>
    </div>

    <div className="card" style={{padding: 12, marginBottom: 12}}>
      <div className="flex" style={{justifyContent: "space-between", padding: "4px 0", fontSize: 12.5}}>
        <span className="muted">ใบแจ้งชำระ</span>
        <span className="mono">INV-2569-018421</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", padding: "4px 0", fontSize: 12.5, borderTop: "1px solid var(--border)"}}>
        <span className="muted">ยอดที่ชำระ</span>
        <span className="mono" style={{fontWeight: 600}}>฿4,200.00</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", padding: "4px 0", fontSize: 12.5, borderTop: "1px solid var(--border)"}}>
        <span className="muted">ช่องทาง</span>
        <span>Mobile Banking QR</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", padding: "4px 0", fontSize: 12.5, borderTop: "1px solid var(--border)"}}>
        <span className="muted">เวลาที่สแกน QR</span>
        <span className="latin">15 พ.ค. 09:41:08</span>
      </div>
    </div>

    {/* Progress steps — 5 states */}
    <div className="card" style={{padding: 12}}>
      <div style={{fontSize: 12, fontWeight: 600, marginBottom: 10}}>สถานะรายการรับชำระ</div>
      <Step done label="รอการชำระเงิน" sub="ออกใบแจ้งชำระเงินแล้ว · 1 พ.ค. 06:00" />
      <Step done label="ผู้ปกครองทำรายการชำระเงิน" sub="สแกน QR · 15 พ.ค. 09:41:08" />
      <Step active label="รอการยืนยันจากธนาคาร / ผู้ให้บริการ" sub="ระบบกำลังตรวจสอบ Webhook · ไม่เกิน 5 นาที" />
      <Step label="รอออกใบเสร็จรับเงินของโรงเรียน" sub="เจ้าหน้าที่การเงินดำเนินการ · โดยทั่วไป 30 นาที" />
      <Step label="ใบเสร็จพร้อมดาวน์โหลด" sub="แจ้งเตือนทาง SMS หรือ Email" last />
    </div>

    <Banner kind="info" style={{marginTop: 12}}>
      ระบบจะแจ้งเตือนเมื่อยืนยันเรียบร้อย · คุณสามารถปิดหน้าจอนี้ได้
    </Banner>
  </>
);

const Step = ({ done, active, label, sub, last }) => (
  <div style={{display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0", position: "relative"}}>
    <div style={{position: "relative", flexShrink: 0}}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: done ? "var(--emerald)" : active ? "var(--info)" : "var(--bg-soft)",
        border: active ? "2px solid var(--info)" : "none",
        color: "#fff",
        display: "grid", placeItems: "center",
        fontSize: 11, fontWeight: 600,
      }}>
        {done ? <Icon name="check" size={11} /> : active ? <span style={{width: 6, height: 6, borderRadius: "50%", background: "var(--info)"}} /> : ""}
      </div>
      {!last && <div style={{position: "absolute", left: 10, top: 22, bottom: -8, width: 2, background: done ? "var(--emerald)" : "var(--border)"}}></div>}
    </div>
    <div style={{paddingBottom: last ? 0 : 4}}>
      <div style={{fontSize: 12.5, fontWeight: active || done ? 500 : 400, color: active || done ? "var(--text)" : "var(--muted)"}}>{label}</div>
      <div className="tiny muted">{sub}</div>
    </div>
  </div>
);

// ===== Screen 6: Receipt ready =====
const ReceiptReadyScreen = () => (
  <>
    <div style={{textAlign: "center", padding: "16px 0 12px"}}>
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        background: "var(--emerald-soft)", color: "var(--emerald-2)",
        display: "grid", placeItems: "center", margin: "0 auto 10px",
      }}>
        <Icon name="check" size={28} stroke={2.4} />
      </div>
      <div style={{fontSize: 16, fontWeight: 600}}>ยืนยันการชำระแล้ว</div>
      <div className="tiny muted" style={{marginTop: 2}}>ขอบคุณค่ะ · ใบเสร็จพร้อมดาวน์โหลด</div>
      <div style={{marginTop: 10}}>
        <span className="status-pill confirmed">
          <Icon name="check" size={11} /> ออกใบเสร็จแล้ว
        </span>
      </div>
    </div>

    <div className="card" style={{padding: 12, marginBottom: 12}}>
      <div className="flex" style={{justifyContent: "space-between", padding: "4px 0", fontSize: 12.5}}>
        <span className="muted">ใบเสร็จเลขที่</span>
        <span className="mono" style={{fontWeight: 600}}>R6907-00482</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", padding: "4px 0", fontSize: 12.5, borderTop: "1px solid var(--border)"}}>
        <span className="muted">ยอดเงิน</span>
        <span className="mono">฿4,200.00</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", padding: "4px 0", fontSize: 12.5, borderTop: "1px solid var(--border)"}}>
        <span className="muted">วันที่ชำระ</span>
        <span className="latin">15 พ.ค. 2569 · 09:42</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", padding: "4px 0", fontSize: 12.5, borderTop: "1px solid var(--border)"}}>
        <span className="muted">ผู้รับเงิน</span>
        <span>นางสาวพิมพ์ลดา ศรีวิชัย</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", padding: "4px 0", fontSize: 12.5, borderTop: "1px solid var(--border)"}}>
        <span className="muted">ตำแหน่ง</span>
        <span>เจ้าหน้าที่การเงิน</span>
      </div>
      <div className="flex" style={{justifyContent: "space-between", padding: "6px 0 4px", fontSize: 11.5, borderTop: "1px dashed var(--border)", marginTop: 2}}>
        <span className="muted">ผู้ดำเนินการในระบบ</span>
        <span className="muted">ครูชนัญพร · ผู้ดูแลระบบ</span>
      </div>
    </div>

    <div className="flex-col" style={{gap: 8}}>
      <div className="doc-card">
        <div className="doc-icon">PDF</div>
        <div className="grow">
          <div className="doc-title">ใบเสร็จรับเงินของโรงเรียน</div>
          <div className="doc-meta">R6907-00482.pdf · 124 KB · มี QR ตรวจสอบความถูกต้อง</div>
        </div>
        <button className="btn sm primary"><Icon name="download" size={12} /></button>
      </div>
      <div className="doc-card">
        <div className="doc-icon" style={{background: "var(--gold-soft)", borderColor: "#E8D2A0", color: "var(--gold-2)"}}>ZIP</div>
        <div className="grow">
          <div className="doc-title">ชุดเอกสารเบิกค่าการศึกษาบุตร</div>
          <div className="doc-meta">5 ฉบับ · 1.4 MB · สำหรับข้าราชการ</div>
        </div>
        <button className="btn sm primary"><Icon name="download" size={12} /></button>
      </div>
      <div className="doc-card">
        <div className="doc-icon" style={{background: "var(--bg-soft)", borderColor: "var(--border)", color: "var(--muted)"}}>PDF</div>
        <div className="grow">
          <div className="doc-title">ใบแจ้งชำระเงิน (สำเนา)</div>
          <div className="doc-meta">INV-2569-018421.pdf · 88 KB</div>
        </div>
        <button className="btn sm"><Icon name="download" size={12} /></button>
      </div>
    </div>

    <Banner kind="success" style={{marginTop: 12}}>
      เอกสารชุดนี้จัดทำเพื่อใช้ประกอบการยื่นเบิกค่าการศึกษาบุตร ทั้งนี้การอนุมัติขึ้นอยู่กับหลักเกณฑ์ของหน่วยงานต้นสังกัด
    </Banner>
  </>
);

// ===== Screen 7: Reimbursement doc pack on phone =====
const ReimbursementScreen = () => {
  const docs = [
    { t: "ใบเสร็จรับเงินของโรงเรียน", d: "R6907-00482 · 1 แผ่น", ok: true },
    { t: "หนังสือรับรองการเก็บเงินบำรุงการศึกษา", d: "ลงนามผู้อำนวยการ · 1 แผ่น", ok: true },
    { t: "รายละเอียดรายการค่าธรรมเนียม", d: "ตามประกาศโรงเรียน · 1 แผ่น", ok: true },
    { t: "หนังสือรับรองการเป็นนักเรียน", d: "ภาคเรียนที่ 1/2569 · 1 แผ่น", ok: true },
    { t: "สรุปยืนยันการชำระเงิน", d: "พร้อมรหัสธุรกรรม · 1 แผ่น", ok: true },
  ];
  return (
    <>
      <div className="flex" style={{gap: 8, marginBottom: 6, alignItems: "center"}}>
        <Icon name="arrowLeft" size={14} color="var(--muted)" />
        <h2 style={{fontSize: 15, fontWeight: 600, margin: 0}}>ชุดเอกสารเบิกค่าการศึกษาบุตร</h2>
      </div>
      <p className="muted" style={{fontSize: 12, margin: "0 0 14px"}}>
        สำหรับผู้ปกครองที่เป็นข้าราชการ พนักงานรัฐวิสาหกิจ หรือผู้มีสิทธิ์เบิกค่าการศึกษาบุตรตามหลักเกณฑ์ของหน่วยงานต้นสังกัด
      </p>

      <div className="card" style={{padding: 12, background: "var(--gold-soft)", border: "1px solid #E8D2A0", marginBottom: 12}}>
        <div style={{fontSize: 12.5, fontWeight: 600, color: "var(--gold-2)", marginBottom: 4}}>ผู้ปกครองที่ใช้สิทธิ์</div>
        <div style={{fontSize: 13}}>นายธวัชชัย วงศ์อิสรกุล</div>
        <div className="tiny" style={{color: "var(--gold-2)", marginTop: 2}}>นักวิชาการศึกษาชำนาญการ · กรมส่งเสริมการเรียนรู้</div>
      </div>

      <div className="card" style={{overflow: "hidden", marginBottom: 12}}>
        {docs.map((d, i) => (
          <div key={i} style={{padding: "10px 12px", borderBottom: i < docs.length - 1 ? "1px solid var(--border)" : "none", display: "flex", gap: 10, alignItems: "center"}}>
            <div style={{width: 28, height: 34, background: "var(--emerald-soft)", border: "1px solid #BCDDD0", borderRadius: 4, display: "grid", placeItems: "center", color: "var(--emerald-2)", flexShrink: 0, fontSize: 9, fontFamily: "var(--latin)", fontWeight: 700}}>PDF</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontSize: 12.5, fontWeight: 500}}>{d.t}</div>
              <div className="tiny muted">{d.d}</div>
            </div>
            <Icon name="check" size={12} color="var(--emerald)" />
          </div>
        ))}
      </div>

      <button className="btn primary lg" style={{width: "100%", justifyContent: "center"}}>
        <Icon name="download" size={14} /> ดาวน์โหลดทั้งชุด (.ZIP · 1.4 MB)
      </button>
      <button className="btn lg" style={{width: "100%", justifyContent: "center", marginTop: 8}}>
        <Icon name="eye" size={14} /> ดูแบบรวมไฟล์เดียว PDF
      </button>

      <div className="tiny muted" style={{textAlign: "center", marginTop: 14, lineHeight: 1.6}}>
        เอกสารมี QR สำหรับตรวจสอบความถูกต้องกับระบบของโรงเรียน<br/>
        หน่วยงานต้นสังกัดของผู้ปกครองสามารถสแกน QR เพื่อตรวจสอบได้ทันที
      </div>
    </>
  );
};

// ===== A: Payment notice PDF preview (8th) =====
const PaymentNoticePreview = () => (
  <>
    <h2 style={{fontSize: 15, fontWeight: 600, margin: "4px 0 4px"}}>ใบแจ้งชำระเงิน</h2>
    <p className="tiny muted" style={{margin: "0 0 12px"}}>ตัวอย่าง PDF · พิมพ์หรือบันทึกเพื่อใช้ที่ Counter Service</p>

    <div className="card" style={{padding: 12, background: "#fff", border: "1px solid var(--border)"}}>
      <div style={{borderBottom: "2px solid var(--navy)", paddingBottom: 8, marginBottom: 8, display: "flex", gap: 10, alignItems: "center"}}>
        <div className="school-mark" style={{width: 28, height: 28, fontSize: 11}}>หส</div>
        <div>
          <div style={{fontSize: 12, fontWeight: 700, color: "var(--navy)"}}>โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ</div>
          <div className="tiny muted">ใบแจ้งชำระเงิน Payment Notice</div>
        </div>
      </div>

      <div className="tiny" style={{lineHeight: 1.8}}>
        <div className="flex" style={{justifyContent: "space-between"}}><span className="muted">เลขที่</span><span className="mono">INV-2569-018421</span></div>
        <div className="flex" style={{justifyContent: "space-between"}}><span className="muted">นักเรียน</span><span>ภาคิน วงศ์อิสรกุล</span></div>
        <div className="flex" style={{justifyContent: "space-between"}}><span className="muted">ระดับชั้น</span><span>ม.5/1</span></div>
        <div className="flex" style={{justifyContent: "space-between"}}><span className="muted">รหัสนักเรียน</span><span className="mono">65120184</span></div>
        <div className="flex" style={{justifyContent: "space-between"}}><span className="muted">กำหนดชำระ</span><span>30 มิ.ย. 2569</span></div>
      </div>

      <div style={{borderTop: "1px dashed var(--border)", margin: "10px 0", paddingTop: 8}}>
        <table style={{width: "100%", fontSize: 11}}>
          <tbody>
            <tr><td className="muted">ค่าบำรุงการศึกษา</td><td className="r mono">3,500.00</td></tr>
            <tr><td className="muted">ค่าสาธารณูปโภค</td><td className="r mono">400.00</td></tr>
            <tr><td className="muted">ค่าประกันอุบัติเหตุ</td><td className="r mono">200.00</td></tr>
            <tr><td className="muted">ค่ากิจกรรมพิเศษ</td><td className="r mono">100.00</td></tr>
            <tr style={{borderTop: "1px solid var(--navy)"}}><td style={{fontWeight: 700, paddingTop: 4}}>รวม</td><td className="r mono" style={{fontWeight: 700, paddingTop: 4}}>4,200.00</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{display: "flex", gap: 8, alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--border)"}}>
        <QRPlaceholder size={70} seed={42} />
        <div style={{flex: 1, fontSize: 10, lineHeight: 1.6}}>
          <div><b>QR PromptPay</b></div>
          <div className="mono">REF1 65120184026901</div>
          <div className="mono">REF2 569018421</div>
          <div className="muted">หรือชำระที่ Counter Service</div>
        </div>
      </div>

      <BarcodePlaceholder payload="099400015501651201840269015690184200" />
      <div className="mono" style={{fontSize: 9, textAlign: "center", marginTop: 2}}>099400015501 65120184026901 569018421 4200</div>
    </div>

    <div className="flex" style={{gap: 8, marginTop: 14}}>
      <button className="btn grow" style={{justifyContent: "center"}}><Icon name="download" size={12} /> บันทึก PDF</button>
      <button className="btn grow primary" style={{justifyContent: "center"}}><Icon name="print" size={12} /> พิมพ์</button>
    </div>

    <Banner kind="warn" style={{marginTop: 12}}>
      ใบแจ้งนี้ใช้สำหรับนักเรียนคนเดียวเท่านั้น <b>ห้ามแก้ไขยอดเงินหรือเลขอ้างอิง</b>
    </Banner>
  </>
);

window.ParentFlow = ParentFlow;
