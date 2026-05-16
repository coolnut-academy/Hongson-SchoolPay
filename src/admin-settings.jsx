// Admin: Settings (Providers, Counter Service, Webhook, Receipt Template)

const AdminSettings = ({ tab, setRoute }) => {
  const tabs = [
    { id: "providers", label: "ผู้ให้บริการ QR PromptPay", icon: "bank" },
    { id: "webhook",   label: "Webhook / รหัสลับ",     icon: "key" },
    { id: "receipt",   label: "เทมเพลตใบเสร็จ",       icon: "receipt" },
  ];

  return (
    <>
      <Topbar crumb={["ตั้งค่าระบบ", tabs.find(t => t.id === tab)?.label.replace(/&amp;/g, "&")]} />
      <div className="content">
        <div className="page-head">
          <div>
            <h1 className="page-h1">ตั้งค่าระบบ</h1>
            <p className="page-sub">การตั้งค่าการเงินที่สำคัญ การแก้ไขใดๆ จะถูกบันทึกใน Audit Log และต้องยืนยันสองชั้นสำหรับรหัสลับ</p>
          </div>
        </div>

        <div className="card">
          <div className="tabs" style={{padding: "0 12px"}}>
            {tabs.map(t => (
              <div key={t.id}
                   className={"tab " + (tab === t.id ? "active" : "")}
                   onClick={() => setRoute("settings-" + t.id)}>
                <Icon name={t.icon} size={13} /> <span dangerouslySetInnerHTML={{__html: t.label}} />
              </div>
            ))}
          </div>

          <div style={{padding: 24}}>
            {tab === "providers" && <ProvidersTab />}
            {tab === "webhook"   && <WebhookTab />}
            {tab === "receipt"   && <ReceiptTemplateTab />}
          </div>
        </div>
      </div>
    </>
  );
};

// ===== Providers tab =====
const ProvidersTab = () => {
  const providers = [
    { name: "KrungThai Bank · PromptPay QR", mode: "production", merch: "501234567890", note: "ใช้สำหรับ QR ในใบแจ้งชำระ ค่าธรรมเนียม 0 บาท", status: "active", primary: true },
    { name: "SCB Easy · QR Payment",          mode: "production", merch: "509988776655", note: "สำรองเมื่อ KTB ขัดข้อง · auto-failover เปิดอยู่", status: "active" },
    { name: "Bangkok Bank · QR Service",      mode: "sandbox",    merch: "—",            note: "อยู่ระหว่างทดสอบกับสาขาพญาไท", status: "inactive" },
  ];
  return (
    <>
      <Banner kind="warn" title="คำเตือนสำคัญก่อนแก้ไขผู้ให้บริการ">
        การปิดใช้งานหรือเปลี่ยน Merchant ID อาจทำให้ใบแจ้งชำระที่ออกไปแล้วถูกปฏิเสธจากธนาคาร ตรวจสอบให้แน่ใจว่าทุกใบในระบบหมดอายุก่อน
      </Banner>

      <div style={{marginTop: 18, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <h3 style={{margin: 0}}>ผู้ให้บริการ Mobile Banking / QR Payment</h3>
        <button className="btn primary sm"><Icon name="plus" size={12} /> เพิ่มผู้ให้บริการ</button>
      </div>

      <div className="flex-col" style={{gap: 10}}>
        {providers.map((p, i) => (
          <div key={i} className="card" style={{padding: 14, borderColor: p.primary ? "var(--navy)" : "var(--border)"}}>
            <div className="flex" style={{justifyContent: "space-between"}}>
              <div className="flex">
                <div style={{width: 40, height: 40, borderRadius: 8, background: "var(--navy-soft)", color: "var(--navy)", display: "grid", placeItems: "center"}}>
                  <Icon name="bank" size={18} />
                </div>
                <div>
                  <div style={{fontWeight: 600, fontSize: 14}}>{p.name}</div>
                  <div className="tiny muted">{p.note}</div>
                </div>
                {p.primary && <span className="badge gold"><span className="dot" /> ใช้เป็นช่องทางหลัก</span>}
              </div>
              <div className="flex">
                <span className="badge issued" style={{textTransform: "uppercase", fontSize: 10.5}}>{p.mode}</span>
                <Badge status={p.status} />
                <button className="btn sm"><Icon name="pencil" size={11} /> แก้ไข</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{marginTop: 28, marginBottom: 12}}>การตั้งค่า KrungThai Bank · PromptPay QR <span className="tiny muted">(ช่องทางหลัก)</span></h3>

      <div className="grid-2-equal">
        <div className="flex-col">
          <div className="field">
            <div className="label">ชื่อบัญชี (Account Name)</div>
            <input className="input" defaultValue="โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ · เพื่อรับชำระค่าธรรมเนียม" />
          </div>
          <div className="field-row">
            <div className="field">
              <div className="label">หมายเลขบัญชี (Masked)</div>
              <input className="input locked" defaultValue="••••••5501" disabled />
            </div>
            <div className="field">
              <div className="label">Merchant ID</div>
              <input className="input mono" defaultValue="501234567890" />
            </div>
          </div>
          <div className="field">
            <div className="label">Biller ID (PromptPay)</div>
            <input className="input mono" defaultValue="0994000155010" />
            <div className="hint">เป็นเลขที่ผู้ให้บริการกำหนด มีผลต่อ QR ที่ออกใบแจ้งชำระ</div>
          </div>
          <div className="field">
            <div className="label">API Base URL</div>
            <input className="input mono" defaultValue="https://api.krungthai.com/biller/v3" />
          </div>
          <div className="field">
            <div className="label">Client ID</div>
            <input className="input mono" defaultValue="ktb-biller-prd-9842" />
          </div>
        </div>

        <div className="flex-col">
          <div className="field">
            <div className="label">โหมดการทำงาน</div>
            <div className="flex" style={{gap: 0, border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden", width: "fit-content"}}>
              <button className="btn" style={{borderRadius: 0, border: "none", background: "var(--surface-2)"}}>Sandbox</button>
              <button className="btn primary" style={{borderRadius: 0, border: "none"}}>Production</button>
            </div>
            <div className="hint">โหมด Production จะปฏิเสธ QR ที่สร้างจาก Sandbox โดยอัตโนมัติ</div>
          </div>

          <div className="field">
            <div className="label">Client Secret</div>
            <div className="secret-row">
              <span className="secret-val">••••••••••••••••••••2c8f</span>
              <span className="secret-act"><Icon name="eye" size={11} /> เปิดดู</span>
              <span className="secret-act"><Icon name="rotate" size={11} /> หมุนรหัส</span>
            </div>
            <div className="hint">หมุนรหัสล่าสุด 12 ก.พ. 2569 โดย ครูชนัญพร (ผู้ดูแลระบบ) · สถานะ: ใช้งาน</div>
          </div>

          <div className="field">
            <div className="label">Allowed IP addresses</div>
            <textarea className="textarea mono" rows="2" defaultValue="203.150.32.0/24&#10;203.151.0.0/16"></textarea>
            <div className="hint">เฉพาะ IP เหล่านี้เท่านั้นที่จะสามารถยิง Webhook เข้าระบบได้</div>
          </div>

          <div className="field">
            <div className="label">QR หมดอายุภายใน (นาที)</div>
            <input className="input mono" defaultValue="120" style={{width: 100}} />
            <div className="hint">หลังจากนี้ ผู้ปกครองต้องสร้างใบแจ้งใหม่</div>
          </div>

          <div className="switch-row">
            <div className="grow">
              <div className="switch-title">ยืนยันการชำระอัตโนมัติเมื่อได้รับ Webhook ที่ลายเซ็นถูกต้อง</div>
              <div className="switch-desc">แนะนำ: เปิด · ลดงานของเจ้าหน้าที่การเงินอย่างมาก</div>
            </div>
            <Switch on={true} />
          </div>
          <div className="switch-row">
            <div className="grow">
              <div className="switch-title">ส่งอีเมลแจ้งเตือนเจ้าหน้าที่เมื่อ Webhook ล้มเหลว</div>
              <div className="switch-desc">ส่งสรุปทุก 15 นาที ไม่ส่งรายตัวเพื่อหลีกเลี่ยง spam</div>
            </div>
            <Switch on={true} />
          </div>
          <div className="switch-row">
            <div className="grow">
              <div className="switch-title">อนุญาตให้ใช้ Sandbox QR ในระบบทดสอบของโรงเรียน</div>
              <div className="switch-desc">มีผลเฉพาะเจ้าหน้าที่ที่มี role <span className="mono">qa_admin</span></div>
            </div>
            <Switch on={false} />
          </div>
        </div>
      </div>

      <div className="flex" style={{justifyContent: "flex-end", marginTop: 24, gap: 8}}>
        <button className="btn">ยกเลิก</button>
        <button className="btn"><Icon name="refresh" size={12} /> ทดสอบการเชื่อมต่อ</button>
        <button className="btn primary">บันทึกการตั้งค่า</button>
      </div>
    </>
  );
};

// ===== Counter Service tab =====
const CounterTab = () => {
  return (
    <>
      <Banner kind="info" title="Counter Service / Bill Payment">
        ผู้ปกครองสามารถนำใบแจ้งชำระเงินไปชำระผ่าน Counter Service และจุดรับชำระที่ผู้ให้บริการกำหนด ระบบจะรับยอดเงินผ่านไฟล์ Settlement รายวันจากผู้ให้บริการ
      </Banner>

      <div className="flex-col" style={{gap: 12, marginTop: 18}}>
        <div className="card" style={{padding: 16}}>
          <div className="flex" style={{justifyContent: "space-between"}}>
            <div className="flex">
              <div style={{width: 40, height: 40, borderRadius: 8, background: "var(--emerald-soft)", color: "var(--emerald)", display: "grid", placeItems: "center"}}>
                <Icon name="store" size={18} />
              </div>
              <div>
                <div style={{fontWeight: 600}}>Counter Service · จุดรับชำระเงิน</div>
                <div className="tiny muted">ชำระผ่าน Counter Service และจุดรับชำระที่ผู้ให้บริการกำหนด · เปิดใช้สำหรับใบแจ้งชำระที่มียอด ≥ 100 บาท</div>
              </div>
            </div>
            <Switch on={true} />
          </div>
        </div>
      </div>

      <div className="grid-2-equal" style={{marginTop: 18}}>
        <div className="flex-col">
          <h3 style={{margin: "0 0 4px"}}>รหัสและรูปแบบบาร์โค้ด</h3>
          <div className="field-row">
            <div className="field">
              <div className="label">Biller Code</div>
              <input className="input mono" defaultValue="099400" />
            </div>
            <div className="field">
              <div className="label">Service Code</div>
              <input className="input mono" defaultValue="0155" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <div className="label">Company Code</div>
              <input className="input mono" defaultValue="01" />
            </div>
            <div className="field">
              <div className="label">Merchant ID</div>
              <input className="input mono" defaultValue="099400015501" />
            </div>
          </div>

          <div className="field">
            <div className="label">REF1 Pattern <span className="muted" style={{fontWeight: 400}}>(13 หลัก)</span></div>
            <input className="input mono" defaultValue="{studentId}{yearTerm}" />
            <div className="hint">ตัวอย่าง: <span className="mono">65120184026901</span> ← รหัสนักเรียน(8) + ปีการศึกษา(2) + ภาคเรียน(1) + ปี(3)</div>
          </div>
          <div className="field">
            <div className="label">REF2 Pattern <span className="muted" style={{fontWeight: 400}}>(10 หลัก)</span></div>
            <input className="input mono" defaultValue="{campaignSeq}{invoiceSeq}" />
            <div className="hint">รหัสรอบเก็บเงิน + ลำดับใบแจ้ง · ใช้ค้นหาใบแจ้งใน Reconciliation</div>
          </div>
          <div className="field">
            <div className="label">Checksum (REF3) Algorithm</div>
            <select className="select" defaultValue="mod11">
              <option value="mod11">Mod-11 (มาตรฐาน Counter Service)</option>
              <option value="luhn">Luhn</option>
              <option value="none">ไม่ใช้ Checksum</option>
            </select>
          </div>

          <div className="card" style={{padding: 12, background: "var(--bg-soft)", marginTop: 6}}>
            <div className="tiny muted" style={{marginBottom: 8}}>ตัวอย่าง Barcode ที่จะออกในใบแจ้งชำระ</div>
            <BarcodePlaceholder payload="099400015501020230610" />
            <div className="mono" style={{fontSize: 11, marginTop: 6, textAlign: "center"}}>| 099400015501 | 65120184026901 | 569018421 | 0420000 |</div>
            <div className="flex" style={{justifyContent: "center", marginTop: 8}}>
              <button className="btn sm"><Icon name="refresh" size={11} /> ทดสอบสร้างบาร์โค้ด</button>
              <button className="btn sm"><Icon name="upload" size={11} /> ทดสอบนำเข้าไฟล์ Settlement</button>
            </div>
          </div>
        </div>

        <div className="flex-col">
          <h3 style={{margin: "0 0 4px"}}>กฎการจับคู่ &amp; การชำระ</h3>

          <div className="switch-row">
            <div className="grow">
              <div className="switch-title">จับคู่อัตโนมัติด้วย REF1, REF2 และยอดเงิน</div>
              <div className="switch-desc">หากไม่ตรง 3 ใน 3 ระบบจะส่งเข้า Manual Review</div>
            </div>
            <Switch on={true} />
          </div>
          <div className="switch-row">
            <div className="grow">
              <div className="switch-title">อนุญาตให้ชำระบางส่วน (Partial Payment)</div>
              <div className="switch-desc">ค่าเริ่มต้น: ปิด · กรณีนโยบายโรงเรียนต่างไปจึงเปิด</div>
            </div>
            <Switch on={false} />
          </div>
          <div className="switch-row">
            <div className="grow">
              <div className="switch-title">อนุญาตให้ชำระเกินยอด (Overpayment)</div>
              <div className="switch-desc">เปิดจะถือว่าส่วนเกินเป็นเครดิตยกยอดไปงวดถัดไป</div>
            </div>
            <Switch on={false} />
          </div>

          <div className="field" style={{marginTop: 6}}>
            <div className="label">การจัดการค่าธรรมเนียม Counter Service (10 บาท/รายการ)</div>
            <div className="flex-col" style={{gap: 6}}>
              {[
                { id: "parent", t: "ผู้ปกครองชำระเอง", d: "ใบแจ้งชำระแสดงยอดและค่าธรรมเนียมแยก · Counter เก็บค่าธรรมเนียมที่หน้าเคาน์เตอร์" },
                { id: "school", t: "โรงเรียนรับภาระค่าธรรมเนียม", d: "ระบบจะหัก 10 บาทจากยอดที่ได้รับ ก่อนตัดใบแจ้งชำระ" },
                { id: "include", t: "รวมในยอดใบแจ้งชำระ", d: "ใบแจ้งจะแสดงค่าธรรมเนียมรวมอยู่ในยอดเดียวกับค่าธรรมเนียมการศึกษา · เลือกใช้นี้" },
              ].map((r, i) => (
                <label key={i} className="method-card" style={{padding: 12, borderColor: r.id === "include" ? "var(--navy)" : "var(--border)", background: r.id === "include" ? "var(--navy-soft)" : "var(--surface)"}}>
                  <input type="radio" name="fee" defaultChecked={r.id === "include"} style={{marginRight: 8}} />
                  <div className="grow">
                    <div style={{fontSize: 13, fontWeight: 500}}>{r.t}</div>
                    <div className="tiny muted">{r.d}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <div className="label">ใบแจ้งชำระหมดอายุภายใน</div>
            <div className="flex">
              <input className="input mono" defaultValue="60" style={{width: 80}} />
              <span style={{color: "var(--muted)"}}>วันหลังออกใบแจ้ง</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex" style={{justifyContent: "flex-end", marginTop: 24, gap: 8}}>
        <button className="btn">ยกเลิก</button>
        <button className="btn primary">บันทึกการตั้งค่า</button>
      </div>
    </>
  );
};

// ===== Webhook tab =====
const WebhookTab = () => {
  const events = [
    { ts: "15 พ.ค. 09:42:18", ok: true,  src: "KTB",  ref: "TX-KB-26051509421783", reason: "Signature valid · matched invoice INV-2569-018421" },
    { ts: "15 พ.ค. 09:38:02", ok: true,  src: "KTB",  ref: "TX-KB-26051509380441", reason: "Signature valid · matched invoice INV-2569-018407" },
    { ts: "15 พ.ค. 09:18:14", ok: false, src: "KTB",  ref: "TX-KB-26051509180014", reason: "Amount mismatch — invoice 4,200 / payment 3,800" },
    { ts: "15 พ.ค. 08:14:11", ok: false, src: "SCB",  ref: "TX-SCB-26051508140020", reason: "Unknown REF1 — 99988877766 not found in active invoices" },
    { ts: "14 พ.ค. 22:09:33", ok: false, src: "KTB",  ref: "—",                     reason: "Invalid signature — HMAC mismatch · IP 203.150.32.18" },
    { ts: "14 พ.ค. 18:22:47", ok: false, src: "KTB",  ref: "TX-KB-26051418224711", reason: "Duplicate transaction — TX already processed at 13:14" },
  ];

  return (
    <>
      <Banner kind="danger" title="พื้นที่ความปลอดภัยสูง — Production Webhook">
        การเปลี่ยน Secret หรือ Endpoint จะมีผลทันที ใบแจ้งชำระที่กำลังถูกประมวลผลโดยธนาคารอาจถูกปฏิเสธ หากไม่ได้ตั้งค่ากับธนาคารควบคู่กัน
      </Banner>

      <div className="grid-2-equal" style={{marginTop: 18, gap: 24}}>
        <div className="flex-col">
          <h3 style={{margin: "0 0 4px"}}>Webhook Endpoint</h3>
          <div className="field">
            <div className="label">URL ที่ผู้ให้บริการส่งข้อมูลธุรกรรมมา</div>
            <div className="copy-row">
              <span>https://pay.hongson.ac.th/api/v3/webhook/ktb</span>
              <span className="copy"><Icon name="copy" size={11} /> คัดลอก</span>
            </div>
            <div className="hint">ผู้ให้บริการต้องส่ง POST request พร้อม header X-SchoolPay-Signature</div>
          </div>

          <div className="field" style={{marginTop: 4}}>
            <div className="label">Signing Secret (HMAC-SHA256)</div>
            <div className="secret-row">
              <span className="secret-val">spwk_prd_••••••••••••••••••2c8f</span>
              <span className="secret-act"><Icon name="eye" size={11} /> เปิดดู</span>
              <span className="secret-act" style={{color: "var(--danger)"}}><Icon name="rotate" size={11} /> หมุนรหัส</span>
            </div>
            <div className="hint">หมุนรหัสล่าสุด 12 ก.พ. 2569 โดย ครูชนัญพร (ผู้ดูแลระบบการเงินโรงเรียน)</div>
          </div>

          <Banner kind="warn">
            <b>การหมุนรหัสลับ</b> จะทำให้ Webhook จากธนาคารถูกปฏิเสธทันทีจนกว่าธนาคารจะตั้งค่ารหัสใหม่ ระบบจะแสดง modal ยืนยันสองชั้น
          </Banner>

          <div className="field" style={{marginTop: 16}}>
            <div className="label">Algorithm</div>
            <select className="select" defaultValue="hmac256">
              <option value="hmac256">HMAC-SHA256 (มาตรฐาน · แนะนำ)</option>
              <option value="hmac512">HMAC-SHA512</option>
              <option value="ed25519">Ed25519</option>
            </select>
          </div>

          <div className="field">
            <div className="label">Replay Protection</div>
            <div className="switch-row" style={{padding: "8px 0"}}>
              <div className="grow">
                <div className="switch-title">ปฏิเสธ Webhook ที่มี timestamp เก่ากว่า 5 นาที</div>
                <div className="switch-desc">ป้องกัน Replay Attack</div>
              </div>
              <Switch on={true} />
            </div>
            <div className="switch-row" style={{padding: "8px 0"}}>
              <div className="grow">
                <div className="switch-title">ปฏิเสธ Webhook ที่มี nonce ซ้ำ</div>
                <div className="switch-desc">เก็บ nonce 24 ชั่วโมง</div>
              </div>
              <Switch on={true} />
            </div>
          </div>

          <div className="flex" style={{gap: 8, marginTop: 4}}>
            <button className="btn"><Icon name="sparkle" size={12} /> ส่ง Test Webhook</button>
            <button className="btn"><Icon name="eye" size={12} /> ดู Raw Event (Admin)</button>
          </div>
        </div>

        <div className="flex-col">
          <h3 style={{margin: "0 0 4px"}}>สถานะ Webhook</h3>
          <div className="grid-3" style={{gap: 8, marginBottom: 12}}>
            <StatBox label="สำเร็จ 24 ชม." value="2,486" tone="emerald" />
            <StatBox label="ล้มเหลว" value="5" tone="danger" />
            <StatBox label="Latency p99" value="142 ms" tone="info" />
          </div>

          <div className="copy-row">
            <span>ล่าสุดเมื่อ <b className="latin">1 นาที</b>ที่แล้ว · <b>200 OK</b></span>
            <span className="copy"><Icon name="check" size={11} color="var(--emerald)" /> ปกติ</span>
          </div>

          <h4 style={{margin: "16px 0 8px", fontSize: 13}}>เหตุการณ์ Webhook ล่าสุด</h4>
          <div className="card" style={{padding: 0, fontSize: 12}}>
            {events.map((e, i) => (
              <div key={i} style={{padding: "8px 12px", borderBottom: i < events.length - 1 ? "1px solid var(--border)" : "none", display: "flex", gap: 10, alignItems: "flex-start"}}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: e.ok ? "var(--emerald-soft)" : "var(--danger-soft)",
                  color: e.ok ? "var(--emerald-2)" : "var(--danger)",
                  display: "grid", placeItems: "center", flexShrink: 0,
                  marginTop: 2,
                }}>
                  <Icon name={e.ok ? "check" : "x"} size={11} />
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="flex" style={{justifyContent: "space-between"}}>
                    <span className="mono" style={{fontSize: 11.5, fontWeight: 500}}>{e.ref}</span>
                    <span className="tiny muted latin">{e.ts}</span>
                  </div>
                  <div className="tiny" style={{color: e.ok ? "var(--muted)" : "var(--danger)", marginTop: 2}}>{e.reason}</div>
                </div>
              </div>
            ))}
          </div>

          <h4 style={{margin: "16px 0 8px", fontSize: 13}}>ตัวอย่าง Webhook payload (KTB)</h4>
          <div className="code">
            <span style={{color: "#8A98AE"}}>POST /api/v3/webhook/ktb · Content-Type: application/json</span>{"\n"}
            <span style={{color: "#8A98AE"}}>X-SchoolPay-Signature: t=1726373942,v1=8f2c…</span>{"\n"}
            {"\n"}
            {"{"}{"\n"}
            {"  "}<span className="k">"event"</span>: <span className="s">"payment.confirmed"</span>,{"\n"}
            {"  "}<span className="k">"tx_id"</span>:  <span className="s">"TX-KB-26051509421783"</span>,{"\n"}
            {"  "}<span className="k">"ref1"</span>:   <span className="s">"65120184026901"</span>,{"\n"}
            {"  "}<span className="k">"ref2"</span>:   <span className="s">"569018421"</span>,{"\n"}
            {"  "}<span className="k">"amount"</span>: <span className="n">4200.00</span>,{"\n"}
            {"  "}<span className="k">"ts"</span>:     <span className="s">"2026-05-15T09:42:18+07:00"</span>{"\n"}
            {"}"}
          </div>
        </div>
      </div>
    </>
  );
};

const StatBox = ({ label, value, tone }) => {
  const colors = {
    emerald: { bg: "var(--emerald-soft)", fg: "var(--emerald-2)" },
    danger:  { bg: "var(--danger-soft)",  fg: "var(--danger)" },
    info:    { bg: "var(--info-soft)",    fg: "var(--info)" },
  };
  const c = colors[tone] || colors.info;
  return (
    <div style={{background: c.bg, padding: "10px 12px", borderRadius: 6}}>
      <div className="tiny" style={{color: c.fg}}>{label}</div>
      <div className="latin" style={{fontSize: 18, fontWeight: 600, color: c.fg}}>{value}</div>
    </div>
  );
};

// ===== Receipt template tab =====
const ReceiptTemplateTab = () => {
  return (
    <>
      <div className="grid-2" style={{gap: 24}}>
        <div className="flex-col" style={{gap: 14}}>
          <div>
            <h3 style={{margin: "0 0 10px"}}>ข้อมูลโรงเรียน</h3>
            <div className="field">
              <div className="label">ชื่อโรงเรียน (ภาษาไทย)</div>
              <input className="input" defaultValue="โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ" />
            </div>
            <div className="field">
              <div className="label">School Name (English)</div>
              <input className="input latin" defaultValue="Hong Son Sueksa School Under Royal Patronage" />
            </div>
            <div className="field">
              <div className="label">ที่อยู่</div>
              <textarea className="textarea" rows="2" defaultValue="เลขที่ 12 ถนนขุนลุมประพาส ตำบลจองคำ อำเภอเมือง จังหวัดแม่ฮ่องสอน 58000"></textarea>
            </div>
            <div className="field-row">
              <div className="field">
                <div className="label">เลขประจำตัวผู้เสียภาษี</div>
                <input className="input mono" defaultValue="0-9940-00155-01-0" />
              </div>
              <div className="field">
                <div className="label">รหัสสถานศึกษา</div>
                <input className="input mono" defaultValue="1058100015" />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{margin: "0 0 10px"}}>โลโก้ และตราโรงเรียน</h3>
            <div className="grid-2-equal" style={{gap: 12}}>
              <div className="card" style={{padding: 12, textAlign: "center", borderStyle: "dashed"}}>
                <div className="school-crest" style={{margin: "0 auto"}}>โลโก้<br/>SCHOOL<br/>LOGO</div>
                <div className="tiny muted" style={{marginTop: 8}}>school-logo.png · 256×256</div>
                <button className="btn sm" style={{marginTop: 6}}><Icon name="upload" size={11} /> เปลี่ยน</button>
              </div>
              <div className="card" style={{padding: 12, textAlign: "center", borderStyle: "dashed"}}>
                <div className="school-seal" style={{margin: "0 auto"}}>ตราประทับ<br/>SCHOOL<br/>SEAL</div>
                <div className="tiny muted" style={{marginTop: 8}}>school-seal.png · 300×300</div>
                <button className="btn sm" style={{marginTop: 6}}><Icon name="upload" size={11} /> เปลี่ยน</button>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{margin: "0 0 10px"}}>เลขที่ใบเสร็จ</h3>
            <div className="field-row">
              <div className="field">
                <div className="label">รูปแบบเลขที่ใบเสร็จ (Receipt Running Number)</div>
                <input className="input mono" defaultValue="R{year}-{seq:05}" />
                <div className="hint">ปัจจุบัน: <span className="mono">R6907-00482</span> · seq รีเซ็ตทุกปีงบประมาณ</div>
              </div>
              <div className="field">
                <div className="label">เล่มที่ (Receipt Book Number)</div>
                <input className="input mono" defaultValue="67/2569" />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{margin: "0 0 6px"}}>ผู้ลงนามในใบเสร็จ</h3>
            <Banner kind="warn">
              ข้อมูลผู้รับเงินและผู้มีอำนาจลงนามควรตรวจสอบตามระเบียบการเงินของโรงเรียนก่อนใช้งานจริง
            </Banner>

            <div style={{marginTop: 14}}>
              <div className="label" style={{fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--navy)"}}>
                <Icon name="user" size={12} /> ผู้รับเงิน · เจ้าหน้าที่การเงิน
              </div>
              <div className="field-row">
                <div className="field" style={{marginBottom: 0}}>
                  <div className="label">ชื่อ-สกุล</div>
                  <input className="input" defaultValue="นางสาวพิมพ์ลดา ศรีวิชัย" />
                </div>
                <div className="field" style={{marginBottom: 0}}>
                  <div className="label">ตำแหน่ง</div>
                  <input className="input" defaultValue="เจ้าหน้าที่การเงิน" />
                </div>
              </div>
            </div>

            <div style={{marginTop: 14}}>
              <div className="label" style={{fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--navy)"}}>
                <Icon name="check" size={12} /> ผู้ตรวจสอบรายการ
              </div>
              <div className="field-row">
                <div className="field" style={{marginBottom: 0}}>
                  <div className="label">ชื่อ-สกุล</div>
                  <input className="input" defaultValue="นางอาภาภรณ์ ดวงดี" />
                </div>
                <div className="field" style={{marginBottom: 0}}>
                  <div className="label">ตำแหน่ง</div>
                  <input className="input" defaultValue="หัวหน้ากลุ่มงานบริหารงบประมาณ" />
                </div>
              </div>
            </div>

            <div style={{marginTop: 14}}>
              <div className="label" style={{fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--navy)"}}>
                <Icon name="shield" size={12} /> ผู้มีอำนาจลงนาม
              </div>
              <div className="field-row">
                <div className="field" style={{marginBottom: 0}}>
                  <div className="label">ชื่อ-สกุล</div>
                  <input className="input" defaultValue="นายสมศักดิ์ ใจดี" />
                </div>
                <div className="field" style={{marginBottom: 0}}>
                  <div className="label">ตำแหน่ง</div>
                  <input className="input" defaultValue="ผู้อำนวยการสถานศึกษา" />
                </div>
              </div>
              <div className="hint" style={{marginTop: 6}}>โดยทั่วไปคือผู้อำนวยการสถานศึกษา หรือผู้ที่ได้รับมอบหมายตามคำสั่งของโรงเรียน</div>
            </div>

            <div style={{marginTop: 14}}>
              <div className="label">URL ตรวจสอบความถูกต้องของใบเสร็จ (QR Verification URL)</div>
              <input className="input mono" defaultValue="https://pay.hongson.ac.th/v/{receiptNo}" />
              <div className="hint">QR บนใบเสร็จจะนำผู้สแกนมาที่ URL นี้ของระบบโรงเรียน</div>
            </div>
          </div>

          <div>
            <h3 style={{margin: "0 0 10px"}}>ตัวเลือกการแสดงผล</h3>
            <div className="switch-row">
              <div className="grow">
                <div className="switch-title">แสดงชื่อผู้ปกครองที่ชำระเงิน</div>
                <div className="switch-desc">จำเป็นสำหรับใบเสร็จเบิกค่าการศึกษาบุตร</div>
              </div>
              <Switch on={true} />
            </div>
            <div className="switch-row">
              <div className="grow">
                <div className="switch-title">ปิดบังเลขประจำตัวประชาชนของนักเรียน</div>
                <div className="switch-desc">PDPA · ปิดบังเลข 6 หลักหลัง</div>
              </div>
              <Switch on={true} />
            </div>
            <div className="switch-row">
              <div className="grow">
                <div className="switch-title">แสดงช่องทางการชำระเงินบนใบเสร็จ</div>
                <div className="switch-desc">QR / Counter / โอน · ดีต่อการเบิก</div>
              </div>
              <Switch on={true} />
            </div>
            <div className="switch-row">
              <div className="grow">
                <div className="switch-title">แสดง QR ตรวจสอบความถูกต้องของใบเสร็จ</div>
                <div className="switch-desc">เอกสารมี QR สำหรับให้ผู้รับและหน่วยงานต้นสังกัดตรวจสอบกับระบบของโรงเรียน</div>
              </div>
              <Switch on={true} />
            </div>
          </div>

          <div className="field">
            <div className="label">หมายเหตุท้ายใบเสร็จ (Reimbursement note)</div>
            <textarea className="textarea" rows="3" defaultValue="เอกสารชุดนี้จัดทำเพื่อใช้ประกอบการยื่นเบิกค่าการศึกษาบุตร ทั้งนี้การอนุมัติขึ้นอยู่กับหลักเกณฑ์ของหน่วยงานต้นสังกัด"></textarea>
          </div>
        </div>

        {/* Live preview */}
        <div className="card" style={{padding: 16, background: "var(--bg-soft)", position: "sticky", top: 80, alignSelf: "flex-start"}}>
          <div className="flex" style={{justifyContent: "space-between", marginBottom: 12}}>
            <h3 style={{margin: 0}}>ตัวอย่างก่อนพิมพ์</h3>
            <div className="flex">
              <span className="badge issued"><Icon name="eye" size={11} /> A4 Preview</span>
              <button className="btn sm"><Icon name="print" size={11} /> พิมพ์ทดสอบ</button>
            </div>
          </div>
          <div style={{transform: "scale(0.72)", transformOrigin: "top center", display: "flex", justifyContent: "center", marginBottom: -160}}>
            <ReceiptPreview />
          </div>
        </div>
      </div>

      <div className="flex" style={{justifyContent: "flex-end", marginTop: 24, gap: 8}}>
        <button className="btn">ยกเลิก</button>
        <button className="btn"><Icon name="eye" size={12} /> ดูตัวอย่างเต็มหน้า</button>
        <button className="btn primary">บันทึกเทมเพลต</button>
      </div>
    </>
  );
};

window.AdminSettings = AdminSettings;
