// Admin: Campaigns list + Create wizard + Campaign detail + Invoice detail

const CAMPAIGNS = [
  { id: "CMP-2569-01", title: "ค่าบำรุงการศึกษา ภาคเรียนที่ 1/2569", year: "2569", term: "1", due: "30 มิ.ย. 2569", target: "ทุกชั้นเรียน", students: 1742, paid: 1253, amt: 14820400, collected: 10664820, status: "active" },
  { id: "CMP-2569-02", title: "ค่ากิจกรรมพัฒนาผู้เรียน 1/2569", year: "2569", term: "1", due: "15 ก.ค. 2569", target: "ทุกชั้นเรียน", students: 1742, paid: 734, amt: 2090400, collected: 881200, status: "active" },
  { id: "CMP-2569-03", title: "ค่าเครื่องแบบนักเรียน ม.1, ม.4", year: "2569", term: "1", due: "20 พ.ค. 2569", target: "ม.1 + ม.4 รวม 412 ราย", students: 412, paid: 380, amt: 824000, collected: 760000, status: "active" },
  { id: "CMP-2569-04", title: "ค่าทัศนศึกษา ม.5 พิพิธภัณฑ์วิทยาศาสตร์", year: "2569", term: "1", due: "10 มิ.ย. 2569", target: "ม.5 ทั้งระดับ 286 ราย", students: 286, paid: 0, amt: 343200, collected: 0, status: "draft" },
  { id: "CMP-2568-04", title: "ค่าบำรุงการศึกษา ภาคเรียนที่ 2/2568", year: "2568", term: "2", due: "31 ม.ค. 2569", target: "ทุกชั้นเรียน", students: 1716, paid: 1716, amt: 14584400, collected: 14584400, status: "receipt_issued" },
  { id: "CMP-2568-03", title: "ค่าหนังสือแบบเรียนเสริม 2/2568", year: "2568", term: "2", due: "15 ธ.ค. 2568", target: "ป.1 - ป.6 รวม 612 ราย", students: 612, paid: 612, amt: 367200, collected: 367200, status: "receipt_issued" },
];

// ===== Campaign list (with wizard modal) =====
const AdminCampaigns = ({ setRoute }) => {
  const [wizard, setWizard] = React.useState(false);
  const [tab, setTab] = React.useState("active");
  const filtered = CAMPAIGNS.filter(c => {
    if (tab === "active") return c.status === "active";
    if (tab === "draft") return c.status === "draft";
    if (tab === "closed") return c.status === "receipt_issued";
    return true;
  });

  return (
    <>
      <Topbar crumb={["รอบเก็บเงิน"]} />
      <div className="content">
        <div className="page-head">
          <div>
            <h1 className="page-h1">รอบเก็บเงิน</h1>
            <p className="page-sub">การจัดเก็บค่าธรรมเนียมการศึกษา · กำหนดกลุ่มเป้าหมาย · กำหนดรายการค่าธรรมเนียม · ออกใบแจ้งชำระอัตโนมัติ</p>
          </div>
          <div className="flex">
            <button className="btn"><Icon name="upload" size={13} /> นำเข้าไฟล์ Excel</button>
            <button className="btn primary" onClick={() => setWizard(true)}>
              <Icon name="plus" size={14} /> สร้างรอบเก็บเงิน
            </button>
          </div>
        </div>

        <div className="card">
          <div className="tabs" style={{padding: "0 12px"}}>
            <div className={"tab " + (tab === "all" ? "active" : "")} onClick={() => setTab("all")}>ทั้งหมด <span className="muted">({CAMPAIGNS.length})</span></div>
            <div className={"tab " + (tab === "active" ? "active" : "")} onClick={() => setTab("active")}>กำลังเปิดรับ <span className="muted">(3)</span></div>
            <div className={"tab " + (tab === "draft" ? "active" : "")} onClick={() => setTab("draft")}>ร่าง <span className="muted">(1)</span></div>
            <div className={"tab " + (tab === "closed" ? "active" : "")} onClick={() => setTab("closed")}>ปิดรอบแล้ว <span className="muted">(2)</span></div>
          </div>
          <div className="filters">
            <div className="filter"><Icon name="calendar" size={12} /> ปีการศึกษา: <b>2569</b> <Icon name="chevronDown" size={11} /></div>
            <div className="filter">ภาคเรียน: <b>ทั้งหมด</b> <Icon name="chevronDown" size={11} /></div>
            <div className="filter">ระดับชั้น: <b>ทั้งหมด</b> <Icon name="chevronDown" size={11} /></div>
            <div className="filter"><Icon name="search" size={12} /> ค้นหา</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{width: 18}}><span className="checkbox" /></th>
                <th>รหัส / รอบเก็บเงิน</th>
                <th>กลุ่มเป้าหมาย</th>
                <th>กำหนดชำระ</th>
                <th>ความคืบหน้า</th>
                <th className="r">ยอดเก็บได้ / ยอดเป้าหมาย</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} style={{cursor: "pointer"}} onClick={() => setRoute("invoices")}>
                  <td onClick={e => e.stopPropagation()}><span className="checkbox" /></td>
                  <td>
                    <div className="stack">
                      <div style={{fontWeight: 500}}>{c.title}</div>
                      <div className="sub mono">{c.id} · ภาคเรียน {c.term}/{c.year}</div>
                    </div>
                  </td>
                  <td>
                    <div className="stack">
                      <div>{c.target}</div>
                      <div className="sub latin">{fmt0(c.students)} ราย</div>
                    </div>
                  </td>
                  <td className="latin" style={{fontSize: 12.5}}>{c.due}</td>
                  <td style={{minWidth: 200}}>
                    <div className="progress" style={{marginBottom: 4}}>
                      <div className="seg-paid" style={{width: (c.paid / c.students * 100) + "%"}} />
                    </div>
                    <div className="tiny muted latin">{fmt0(c.paid)} / {fmt0(c.students)} ราย · {((c.paid / c.students) * 100).toFixed(1)}%</div>
                  </td>
                  <td className="r">
                    <div style={{fontWeight: 600}}>฿{fmt(c.collected, 0)}</div>
                    <div className="sub muted" style={{fontSize: 11.5}}>/ ฿{fmt(c.amt, 0)}</div>
                  </td>
                  <td><Badge status={c.status} /></td>
                  <td><Icon name="more" size={14} color="#8A95A3" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={CAMPAIGNS.length} page={1} pageSize={20} />
        </div>

        {/* Active campaign quick view */}
        <div style={{marginTop: 20}}>
          <h2 className="section-h">รอบเก็บเงินที่กำลังเปิดรับ · ภาพรวม</h2>
          <CampaignDetailCard setRoute={setRoute} />
        </div>
      </div>

      {wizard && <CreateCampaignWizard onClose={() => setWizard(false)} />}
    </>
  );
};

// ===== Create campaign wizard =====
const CreateCampaignWizard = ({ onClose }) => {
  const [step, setStep] = React.useState(2);
  const [feeItems, setFeeItems] = React.useState([
    { name: "ค่าบำรุงการศึกษา", amount: 3500 },
    { name: "ค่าสาธารณูปโภค", amount: 400 },
    { name: "ค่าประกันอุบัติเหตุนักเรียน", amount: 200 },
    { name: "ค่ากิจกรรมพิเศษ", amount: 100 },
  ]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: 880}}>
        <div className="card-head">
          <h3>สร้างรอบเก็บเงินใหม่</h3>
          <button className="icon-btn" onClick={onClose} style={{border: "none"}}><Icon name="x" /></button>
        </div>
        <div className="modal-body" style={{padding: 0}}>
          <div style={{padding: "16px 24px", borderBottom: "1px solid var(--border)"}}>
            <div className="stepper" style={{margin: 0, padding: 0, border: "none"}}>
              {[
                { n: 1, l: "ข้อมูลพื้นฐาน" },
                { n: 2, l: "กลุ่มเป้าหมาย" },
                { n: 3, l: "รายการค่าธรรมเนียม" },
                { n: 4, l: "ช่องทาง &amp; วันที่" },
                { n: 5, l: "ตรวจสอบ" },
              ].map((s, i, arr) => (
                <React.Fragment key={i}>
                  <div className={"step " + (step === s.n ? "active" : step > s.n ? "done" : "")}>
                    <div className="step-num">{step > s.n ? "✓" : s.n}</div>
                    <span>{s.l}</span>
                  </div>
                  {i < arr.length - 1 && <div className="step-line" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div style={{padding: 24}}>
            {step === 2 && (
              <>
                <div className="field">
                  <div className="label">ชื่อรอบเก็บเงิน <span className="req">*</span></div>
                  <input className="input" defaultValue="ค่าบำรุงการศึกษา ภาคเรียนที่ 1 ปีการศึกษา 2569" />
                </div>
                <div className="field-row">
                  <div className="field">
                    <div className="label">ปีการศึกษา <span className="req">*</span></div>
                    <select className="select"><option>2569</option></select>
                  </div>
                  <div className="field">
                    <div className="label">ภาคเรียน <span className="req">*</span></div>
                    <select className="select"><option>1</option><option>2</option></select>
                  </div>
                </div>
                <div className="field">
                  <div className="label">กลุ่มเป้าหมาย <span className="req">*</span></div>
                  <div className="card" style={{padding: 12, background: "var(--surface-2)"}}>
                    <div className="flex" style={{flexWrap: "wrap", gap: 6, marginBottom: 10}}>
                      <span className="badge issued">อนุบาล 1–3</span>
                      <span className="badge issued">ประถม 1–6</span>
                      <span className="badge issued">มัธยม 1–6</span>
                      <span className="badge draft">+ เพิ่มกลุ่ม</span>
                    </div>
                    <div className="tiny muted">ครอบคลุม 1,742 นักเรียน · ทุกชั้นเรียนจะออกใบแจ้งชำระอัตโนมัติเมื่อเปิดรอบเก็บเงิน</div>
                  </div>
                </div>
                <div className="field">
                  <div className="label">ยกเว้นนักเรียน <span className="muted" style={{fontWeight: 400}}>(ไม่บังคับ)</span></div>
                  <input className="input" placeholder="ค้นหารหัสนักเรียน เพื่อยกเว้นจากรอบเก็บเงินนี้..." />
                  <div className="hint">เหมาะกับกรณีนักเรียนรับทุน นักเรียนยืมเรียน หรือกรณีพิเศษอื่นๆ</div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="field">
                  <div className="label">รายการค่าธรรมเนียม <span className="req">*</span></div>
                  <table className="table" style={{border: "1px solid var(--border)", borderRadius: 6}}>
                    <thead>
                      <tr>
                        <th style={{width: 36}}>#</th>
                        <th>ชื่อรายการ</th>
                        <th className="r" style={{width: 140}}>ยอด (บาท)</th>
                        <th style={{width: 36}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeItems.map((f, i) => (
                        <tr key={i}>
                          <td className="latin muted">{i + 1}</td>
                          <td><input className="input" defaultValue={f.name} style={{border: "none", padding: "4px 0"}} /></td>
                          <td className="r"><input className="input mono" defaultValue={fmt(f.amount)} style={{textAlign: "right"}} /></td>
                          <td><Icon name="trash" size={13} color="#8A95A3" /></td>
                        </tr>
                      ))}
                      <tr style={{background: "var(--surface-2)"}}>
                        <td colSpan="2"><button className="btn sm ghost"><Icon name="plus" size={11} /> เพิ่มรายการ</button></td>
                        <td className="r" style={{fontWeight: 700, fontSize: 14}}>{fmt(feeItems.reduce((s, f) => s + f.amount, 0))}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="hint">ยอดรวมต่อนักเรียน 4,200.00 บาท · ยอดรวมรอบนี้ประมาณ 7,316,400.00 บาท (1,742 ราย)</div>
                </div>
                <Banner kind="info">
                  ระบบจะออกใบแจ้งชำระเฉพาะนักเรียนในกลุ่มเป้าหมายที่ยังไม่มีใบแจ้งของรอบนี้ ใบแจ้งชำระเดิมจะไม่ถูกเขียนทับ
                </Banner>
              </>
            )}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={() => setStep(Math.max(1, step - 1))}>
            <Icon name="arrowLeft" size={12} /> ก่อนหน้า
          </button>
          <div className="grow tiny muted" style={{textAlign: "center"}}>ขั้นตอน {step} จาก 5 · ระบบบันทึกฉบับร่างอัตโนมัติทุก 30 วินาที</div>
          <button className="btn">บันทึกร่าง</button>
          <button className="btn primary" onClick={() => setStep(Math.min(5, step + 1))}>
            ถัดไป <Icon name="arrowRight" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Campaign detail (embedded card on campaigns page) =====
const CampaignDetailCard = ({ setRoute }) => {
  const byClass = [
    { c: "ม.6/1", t: 38, p: 36, r: 1, u: 1 },
    { c: "ม.6/2", t: 40, p: 6, r: 0, u: 34 },
    { c: "ม.6/3", t: 39, p: 32, r: 2, u: 5 },
    { c: "ม.5/1", t: 36, p: 34, r: 0, u: 2 },
    { c: "ม.5/2", t: 38, p: 28, r: 1, u: 9 },
    { c: "ม.4/1", t: 41, p: 39, r: 0, u: 2 },
    { c: "ม.3/1", t: 42, p: 41, r: 0, u: 1 },
    { c: "ม.2/1", t: 40, p: 38, r: 0, u: 2 },
  ];

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 style={{marginBottom: 2}}>ค่าบำรุงการศึกษา ภาคเรียนที่ 1/2569 · CMP-2569-01</h3>
          <div className="tiny muted">เปิดรับชำระ 1 พ.ค. – 30 มิ.ย. 2569 · ออกใบแจ้งชำระ 1,742 ราย · ค่าธรรมเนียมต่อนักเรียน 4,200–8,500 บาท</div>
        </div>
        <div className="flex">
          <button className="btn"><Icon name="chat" size={12} /> ส่งเตือนผู้ปกครอง</button>
          <button className="btn"><Icon name="download" size={12} /> ส่งออกรายการ</button>
          <button className="btn primary" onClick={() => setRoute("invoices")}>เปิดใบแจ้งทั้งหมด <Icon name="arrowRight" size={12} /></button>
        </div>
      </div>
      <div style={{padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 0, borderBottom: "1px solid var(--border)"}}>
        <KPIInline label="ยอดเป้าหมาย" value="฿14,820,400" sub="1,742 ราย" />
        <KPIInline label="เก็บได้แล้ว" value="฿10,664,820" sub="71.9% · 1,253 ราย" tone="emerald" />
        <KPIInline label="คงค้าง" value="฿4,155,580" sub="489 ราย" tone="gold" />
        <KPIInline label="ต้องตรวจสอบ" value="11" sub="ใน Reconciliation Center" tone="danger" />
      </div>
      <div className="card-pad">
        <div className="section-h" style={{marginTop: 0}}>
          <span>สถานะการชำระต่อชั้นเรียน</span>
          <span className="link">ดูทุกห้อง 48 ห้อง →</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ชั้นเรียน</th>
              <th>ครูประจำชั้น</th>
              <th>ความคืบหน้า</th>
              <th className="r">นักเรียน</th>
              <th className="r">ชำระแล้ว</th>
              <th className="r">รอชำระ</th>
              <th className="r">ต้องตรวจสอบ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {byClass.map((b, i) => (
              <tr key={i}>
                <td><b>{b.c}</b></td>
                <td className="muted">{["อ.ปริยา", "อ.สรชา", "อ.กรกนก", "อ.ธีรพล", "อ.รัฐนันท์", "อ.สุพัตรา", "อ.พิชญา", "อ.เกียรติยศ"][i]}</td>
                <td style={{minWidth: 160}}>
                  <div className="progress" style={{marginBottom: 2}}>
                    <div className="seg-paid" style={{width: (b.p / b.t * 100) + "%"}} />
                    <div className="seg-review" style={{width: (b.r / b.t * 100) + "%"}} />
                  </div>
                </td>
                <td className="r">{b.t}</td>
                <td className="r" style={{color: "var(--emerald-2)"}}>{b.p}</td>
                <td className="r" style={{color: "var(--muted)"}}>{b.u}</td>
                <td className="r" style={{color: b.r > 0 ? "var(--danger)" : "var(--muted-2)"}}>{b.r || "—"}</td>
                <td><Icon name="chevronRight" size={13} color="#8A95A3" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const KPIInline = ({ label, value, sub, tone }) => {
  const c = tone === "emerald" ? "var(--emerald-2)" : tone === "gold" ? "var(--gold-2)" : tone === "danger" ? "var(--danger)" : "var(--text)";
  return (
    <div style={{padding: "4px 16px", borderRight: "1px solid var(--border)"}}>
      <div className="tiny muted" style={{marginBottom: 4}}>{label}</div>
      <div className="latin" style={{fontSize: 20, fontWeight: 600, color: c, letterSpacing: "-0.01em"}}>{value}</div>
      <div className="tiny muted" style={{marginTop: 2}}>{sub}</div>
    </div>
  );
};

// ===== Invoice detail (single student) =====
const AdminInvoiceDetail = ({ setRoute }) => {
  const items = [
    { n: "ค่าบำรุงการศึกษา", a: 3500 },
    { n: "ค่าสาธารณูปโภค (น้ำ ไฟฟ้า อินเทอร์เน็ต)", a: 400 },
    { n: "ค่าประกันอุบัติเหตุนักเรียน", a: 200 },
    { n: "ค่ากิจกรรมพิเศษภาคเรียน", a: 100 },
  ];
  const total = items.reduce((s, i) => s + i.a, 0);

  return (
    <>
      <Topbar crumb={["ใบแจ้งชำระ", "INV-2569-018421"]} />
      <div className="content">
        <div className="page-head">
          <div>
            <div className="flex" style={{gap: 8, marginBottom: 6}}>
              <h1 className="page-h1" style={{margin: 0}}>INV-2569-018421</h1>
              <Badge status="paid" />
              <Badge status="receipt_issued" />
            </div>
            <p className="page-sub">
              เด็กชายภาคิน วงศ์อิสรกุล · ม.5/1 · เลขประจำตัวนักเรียน 65120184
              <span className="dot-sep" />
              ค่าบำรุงการศึกษา ภาคเรียนที่ 1/2569 · กำหนดชำระ 30 มิ.ย. 2569
            </p>
          </div>
          <div className="flex">
            <button className="btn"><Icon name="print" size={13} /> พิมพ์ใบแจ้งชำระ</button>
            <button className="btn"><Icon name="download" size={13} /> ใบเสร็จ PDF</button>
            <button className="btn primary"><Icon name="receipt" size={13} /> ออกใบเสร็จเบิกฯ</button>
          </div>
        </div>

        <div className="grid-2">
          <div className="flex-col" style={{gap: 16}}>
            {/* Fee items */}
            <div className="card">
              <div className="card-head"><h3>รายการค่าธรรมเนียม</h3></div>
              <table className="receipt-table" style={{margin: 0}}>
                <thead>
                  <tr>
                    <th style={{width: 40, paddingLeft: 22}}>#</th>
                    <th>รายการ</th>
                    <th className="r" style={{paddingRight: 22}}>ยอด (บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="latin muted" style={{paddingLeft: 22}}>{i + 1}</td>
                      <td>{it.n}</td>
                      <td className="r" style={{paddingRight: 22}}>{fmt(it.a)}</td>
                    </tr>
                  ))}
                  <tr className="total">
                    <td colSpan="2" style={{paddingLeft: 22}}>ยอดรวมทั้งสิ้น</td>
                    <td className="r" style={{paddingRight: 22}}>{fmt(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment timeline */}
            <div className="card">
              <div className="card-head"><h3>ประวัติธุรกรรม</h3></div>
              <div className="card-pad" style={{paddingTop: 8, paddingBottom: 12}}>
                <Timeline items={[
                  { t: "15 พ.ค. 2569 · 09:42", a: "ระบบ", l: "Webhook KrungThai รายงานยืนยันการชำระ", d: "TX-KB-26051509421783 · 4,200.00 บาท · ตรงกับยอดและ REF1/REF2", k: "paid" },
                  { t: "15 พ.ค. 2569 · 09:41", a: "ผู้ปกครอง", l: "สแกน QR ชำระเงินผ่านแอพ KrungThai NEXT", d: "ระยะเวลา 47 วินาที จากสแกนถึงยืนยัน", k: "info" },
                  { t: "15 พ.ค. 2569 · 09:38", a: "ผู้ปกครอง", l: "เปิดหน้าใบแจ้งชำระและเลือกช่องทาง Mobile Banking QR", d: "IP 184.22.x.x · iOS 18 · Safari", k: "info" },
                  { t: "01 พ.ค. 2569 · 06:00", a: "ระบบ", l: "ออกใบแจ้งชำระอัตโนมัติจากรอบเก็บเงิน CMP-2569-01", d: "ผ่านการตรวจสอบ checksum ของ REF1/REF2 แล้ว", k: "issued" },
                  { t: "15 พ.ค. 2569 · 10:14", a: "ครูชนัญพร", l: "ออกใบเสร็จรับเงินเลขที่ R6907-00482", d: "เทมเพลตใบเสร็จเบิกค่าการศึกษาบุตร · พิมพ์ครั้งที่ 1", k: "receipt_issued" },
                ]} />
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div className="flex-col" style={{gap: 16}}>
            <div className="card card-pad">
              <div className="section-h">ข้อมูลใบแจ้งชำระ</div>
              <KV k="เลขที่ใบแจ้งชำระ" v="INV-2569-018421" mono />
              <KV k="REF1" v="65120184026901" mono />
              <KV k="REF2" v="569018421" mono />
              <KV k="ยอดรวม" v={"฿" + fmt(total)} bold />
              <KV k="กำหนดชำระ" v="30 มิถุนายน 2569" />
              <KV k="ช่องทางที่ใช้ชำระ" v="Mobile Banking QR · KrungThai NEXT" />
              <KV k="เวลาที่ยืนยัน" v="15 พ.ค. 2569 · 09:42:18" />
              <KV k="สถานะใบเสร็จ" v={<Badge status="receipt_issued" />} />
            </div>

            <div className="card card-pad">
              <div className="section-h">นักเรียน / ผู้ปกครอง</div>
              <KV k="นักเรียน" v="เด็กชายภาคิน วงศ์อิสรกุล" />
              <KV k="รหัสนักเรียน" v="65120184" mono />
              <KV k="ชั้นเรียน" v="มัธยมศึกษาปีที่ 5/1" />
              <KV k="ผู้ปกครอง" v="นายธวัชชัย วงศ์อิสรกุล" />
              <KV k="ตำแหน่ง" v="นักวิชาการศึกษาชำนาญการ · กรมส่งเสริมการเรียนรู้" />
              <div style={{marginTop: 10}}>
                <Badge status="issued" label="เบิกค่าการศึกษาบุตร" />
                <span className="tiny muted" style={{marginLeft: 8}}>เป็นเจ้าหน้าที่ราชการ · มีสิทธิ์เบิก</span>
              </div>
            </div>

            <Banner kind="info" title="การออกใบเสร็จ">
              ใบเสร็จรับเงินของโรงเรียนสำหรับใบแจ้งนี้ออกแล้ว · เลขที่ R6907-00482 · ใช้สำหรับเบิกค่าการศึกษาบุตรของบิดา
            </Banner>
          </div>
        </div>
      </div>
    </>
  );
};

const KV = ({ k, v, mono, bold }) => (
  <div style={{display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", gap: 14, fontSize: 13}}>
    <span className="muted" style={{flexShrink: 0}}>{k}</span>
    <span className={mono ? "mono" : ""} style={{textAlign: "right", fontWeight: bold ? 600 : 400}}>{v}</span>
  </div>
);

const Timeline = ({ items }) => (
  <div style={{position: "relative", paddingLeft: 22}}>
    <div style={{position: "absolute", left: 7, top: 8, bottom: 8, width: 1, background: "var(--border)"}} />
    {items.map((it, i) => {
      const color = it.k === "paid" ? "var(--emerald)" : it.k === "receipt_issued" ? "var(--navy)" : it.k === "issued" ? "var(--info)" : "var(--muted-2)";
      return (
        <div key={i} style={{position: "relative", padding: "10px 0", borderBottom: i < items.length - 1 ? "1px dashed var(--border)" : "none"}}>
          <div style={{position: "absolute", left: -19, top: 14, width: 11, height: 11, borderRadius: "50%", background: color, border: "2px solid #fff", boxShadow: "0 0 0 1px " + color}} />
          <div className="tiny muted latin" style={{marginBottom: 2}}>{it.t} · {it.a}</div>
          <div style={{fontSize: 13, fontWeight: 500}}>{it.l}</div>
          <div className="tiny muted">{it.d}</div>
        </div>
      );
    })}
  </div>
);

window.AdminCampaigns = AdminCampaigns;
window.AdminInvoiceDetail = AdminInvoiceDetail;
