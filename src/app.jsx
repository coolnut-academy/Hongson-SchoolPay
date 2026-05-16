// SchoolPay — root app with sidebar routing + parent mode toggle

const App = () => {
  const [route, setRoute] = React.useState("dashboard");
  const [mode, setMode] = React.useState("admin"); // admin | parent
  const [showNote, setShowNote] = React.useState(true);
  const [toast, setToast] = React.useState(null);

  window.showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Listen for cross-link from parent flow back to admin and vice versa
  React.useEffect(() => {
    window.__go = (r) => { setMode("admin"); setRoute(r); };
    window.__goParent = () => setMode("parent");
    window.__showProtoNote = () => setShowNote(true);
  }, []);

  if (mode === "parent") {
    return (
      <>
        {showNote && <ProductionNote onClose={() => setShowNote(false)} />}
        <div style={{minHeight: "100vh", background: "#E8EDF3"}}>
        <div style={{
          background: "#fff", borderBottom: "1px solid var(--border)",
          padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{display: "flex", alignItems: "center", gap: 10}}>
            <div className="brand-mark">SP</div>
            <div>
              <div style={{fontWeight: 600, fontSize: 14}}>SchoolPay · หน้าจอผู้ปกครอง</div>
              <div className="tiny muted">มุมมองจำลองอุปกรณ์มือถือ · ขั้นตอนการชำระเงิน 7 หน้าจอ</div>
            </div>
          </div>
          <button className="btn" onClick={() => setMode("admin")}>
            <Icon name="arrowLeft" size={13} /> กลับมุมมองเจ้าหน้าที่
          </button>
        </div>
        <ParentFlow />
        </div>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </>
    );
  }

  let page = null;
  switch (route) {
    case "dashboard":        page = <AdminDashboard setRoute={setRoute} />; break;
    case "campaigns":        page = <AdminCampaigns setRoute={setRoute} />; break;
    case "invoices":         page = <AdminInvoiceDetail setRoute={setRoute} />; break;
    case "payments":         page = <AdminPayments setRoute={setRoute} />; break;
    case "reconciliation":   page = <AdminReconciliation setRoute={setRoute} />; break;

    case "receipts":         page = <AdminReceipts setRoute={setRoute} />; break;
    case "students":         page = <AdminStub title="นักเรียน" sub="รายชื่อนักเรียนทั้งหมด · 1,742 ราย" />; break;
    case "classes":          page = <AdminStub title="ชั้นเรียน" sub="โครงสร้างชั้นเรียนปีการศึกษา 2569" />; break;
    case "reports":          page = <AdminReports setRoute={setRoute} />; break;
    case "settings-providers": page = <AdminSettings tab="providers" setRoute={setRoute} />; break;
    case "settings-webhook":   page = <AdminSettings tab="webhook" setRoute={setRoute} />; break;
    case "settings-receipt":   page = <AdminSettings tab="receipt" setRoute={setRoute} />; break;
    case "audit":              page = <AdminAudit setRoute={setRoute} />; break;
    default:                   page = <AdminDashboard setRoute={setRoute} />;
  }

  return (
    <div className="app">
      {showNote && <ProductionNote onClose={() => setShowNote(false)} />}
      <Sidebar route={route} setRoute={setRoute} />
      <main className="main">
        {page}
        {/* Floating button to preview parent flow */}
        <div style={{position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", zIndex: 50}}>
          <button
            onClick={() => window.__showProtoNote && window.__showProtoNote()}
            style={{
              background: "var(--gold-soft)", color: "var(--gold-2)", border: "1px solid #E8D2A0",
              padding: "5px 11px", borderRadius: 999,
              fontSize: 11.5, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
              boxShadow: "var(--shadow-sm)",
            }}>
            <Icon name="info" size={11} /> ระบบต้นแบบ · ดูข้อกำหนด
          </button>
          <button
            onClick={() => setMode("parent")}
            style={{
              background: "var(--navy)", color: "#fff", border: "none",
              padding: "10px 16px", borderRadius: 999,
              boxShadow: "var(--shadow-lg)", fontSize: 13, fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
            }}>
            <Icon name="eye" size={14} /> ดูมุมมองผู้ปกครอง
          </button>
        </div>
      </main>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

// Stub for pages that don't need full design (students, classes)
const AdminStub = ({ title, sub }) => (
  <>
    <Topbar crumb={[title]} />
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-h1">{title}</h1>
          <p className="page-sub">{sub}</p>
        </div>
      </div>
      <div className="card card-pad-lg" style={{textAlign: "center", padding: 60}}>
        <Icon name="info" size={28} color="#8A95A3" />
        <div style={{marginTop: 12, color: "var(--muted)"}}>หน้าจอนี้เป็นส่วนข้อมูลพื้นฐาน · ใช้รูปแบบตารางมาตรฐานเดียวกับใบแจ้งชำระ</div>
      </div>
    </div>
  </>
);

// Reports landing (light)
const AdminReports = ({ setRoute }) => {
  const reports = [
    { t: "สรุปการชำระต่อรอบเก็บเงิน", d: "ภาพรวมยอดที่ต้องเก็บ · ชำระแล้ว · คงค้าง", icon: "campaign" },
    { t: "สถานะการชำระต่อชั้นเรียน", d: "ตารางชั้น · จำนวนชำระแล้ว / รอชำระ", icon: "classes" },
    { t: "นักเรียนที่ยังไม่ชำระ", d: "พร้อมเหตุผลและข้อมูลติดต่อผู้ปกครอง", icon: "students" },
    { t: "รายการรับชำระผ่าน QR PromptPay", d: "ตามรายงาน Webhook ของธนาคาร", icon: "qr" },
    { t: "รายการชำระผ่าน KTB สาขา", d: "ยืนยันโดยเจ้าหน้าที่หลังตรวจ Bank Statement", icon: "bank" },
    { t: "รายงานการกระทบยอด", d: "Matched · Unmatched · Manual Review", icon: "recon" },
    { t: "รายงานใบเสร็จที่ออกแล้ว", d: "พร้อมเลขที่และผู้อนุมัติ", icon: "receipt" },
    { t: "รายงานใบเสร็จเบิกค่าการศึกษาบุตร", d: "สำหรับเจ้าหน้าที่ราชการที่เป็นผู้ปกครอง", icon: "fileText" },
  ];
  return (
    <>
      <Topbar crumb={["รายงาน"]} />
      <div className="content">
        <div className="page-head">
          <div>
            <h1 className="page-h1">รายงาน &amp; การส่งออก</h1>
            <p className="page-sub">รายงานทางการเงินสำหรับโรงเรียนและผู้บริหาร · ส่งออกได้ทั้ง CSV / Excel / PDF</p>
          </div>
        </div>
        <div className="grid-3" style={{gap: 12}}>
          {reports.map((r, i) => (
            <div key={i} className="card card-pad" style={{cursor: "pointer"}}>
              <div className="flex" style={{gap: 12, alignItems: "flex-start"}}>
                <div style={{width: 36, height: 36, borderRadius: 8, background: "var(--navy-soft)", color: "var(--navy)", display: "grid", placeItems: "center", flexShrink: 0}}>
                  <Icon name={r.icon} size={16} />
                </div>
                <div className="grow" style={{minWidth: 0}}>
                  <div style={{fontSize: 13.5, fontWeight: 600, marginBottom: 2}}>{r.t}</div>
                  <div className="tiny muted">{r.d}</div>
                </div>
              </div>
              <div className="flex" style={{marginTop: 12, gap: 6}}>
                <button className="btn sm"><Icon name="download" size={11} /> CSV</button>
                <button className="btn sm"><Icon name="download" size={11} /> Excel</button>
                <button className="btn sm"><Icon name="print" size={11} /> PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Light "Payments" page = filtered transaction list
const AdminPayments = ({ setRoute }) => {
  const rows = [
    { ts: "15 พ.ค. 09:42", ref: "TX-KB-26051509421783", ch: "qr",  inv: "INV-2569-018421", name: "เด็กชายภาคิน วงศ์อิสรกุล", amt: 4200.00, status: "paid" },
    { ts: "15 พ.ค. 09:37", ref: "TX-KB-26051509370022", ch: "qr",  inv: "INV-2569-018407", name: "เด็กหญิงพิมพ์ลภัส รักษ์เผ่า", amt: 4200.00, status: "paid" },
    { ts: "15 พ.ค. 09:31", ref: "TX-BB-26051509310028", ch: "qr",  inv: "INV-2569-018395", name: "เด็กชายธีรเดช สุขสันต์ชัย", amt: 5800.00, status: "paid" },
    { ts: "15 พ.ค. 09:18", ref: "TX-KB-26051509180014", ch: "qr",  inv: "INV-2569-018307", name: "เด็กหญิงณิชาภา จันทรานนท์", amt: 3800.00, status: "under_review" },
    { ts: "15 พ.ค. 09:06", ref: "TX-KTB-BRANCH-0021",  ch: "ktb", inv: "INV-2569-018384", name: "เด็กชายกฤตเมธ เรืองศิริ", amt: 4200.00, status: "paid" },
    { ts: "15 พ.ค. 08:54", ref: "TX-KTB-BRANCH-0020",  ch: "ktb", inv: "INV-2569-018220", name: "เด็กหญิงปุณยาพร เกษมสุข", amt: 7800.00, status: "under_review" },
    { ts: "15 พ.ค. 08:48", ref: "TX-KB-26051508481129", ch: "qr",  inv: "INV-2569-018201", name: "เด็กชายภาณุพงศ์ ตั้งใจดี", amt: 4200.00, status: "paid" },
    { ts: "15 พ.ค. 08:36", ref: "TX-SCB-26051508361002", ch: "qr",  inv: "INV-2569-018178", name: "เด็กหญิงอัญชิสา ภักดีศรี", amt: 5800.00, status: "paid" },
  ];
  const chIcon =  { qr: "qr", ktb: "bank" };
  const chLabel = { qr: "Mobile Banking QR", ktb: "KTB สาขา (เจ้าหน้าที่)" };
  return (
    <>
      <Topbar crumb={["การชำระเงิน"]} />
      <div className="content">
        <div className="page-head">
          <div>
            <h1 className="page-h1">การชำระเงิน</h1>
            <p className="page-sub">รายการธุรกรรมที่เข้าระบบจากทุกช่องทาง · อัปเดตอัตโนมัติจาก Webhook ของผู้ให้บริการ</p>
          </div>
          <div className="flex">
            <button className="btn"><Icon name="download" size={13} /> ส่งออก CSV</button>
          </div>
        </div>

        <div className="card">
          <div className="filters">
            <div className="filter"><Icon name="calendar" size={12} /> วันที่: <b>1–15 พ.ค. 2569</b> <span className="x">×</span></div>
            <div className="filter">ช่องทาง: <b>ทั้งหมด</b> <Icon name="chevronDown" size={11} /></div>
            <div className="filter">รอบเก็บเงิน: <b>CMP-2569-01</b> <span className="x">×</span></div>
            <div className="filter">สถานะ: <b>ทั้งหมด</b> <Icon name="chevronDown" size={11} /></div>
            <div style={{flex: 1}} />
            <div className="filter"><Icon name="filter" size={12} /> ตัวกรองเพิ่มเติม</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>เวลา</th>
                <th>รหัสธุรกรรม</th>
                <th>ช่องทาง</th>
                <th>ใบแจ้งชำระ</th>
                <th>นักเรียน</th>
                <th className="r">ยอด (บาท)</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="mono" style={{fontSize: 12}}>{r.ts}</td>
                  <td className="mono" style={{fontSize: 12}}>{r.ref}</td>
                  <td>
                    <span className="flex" style={{gap: 6}}>
                      <Icon name={chIcon[r.ch]} size={13} color="#5C6878" /> {chLabel[r.ch]}
                    </span>
                  </td>
                  <td className="mono" style={{fontSize: 12}}>
                    <span style={{color: "var(--info)", cursor: "pointer"}} onClick={() => setRoute("invoices")}>{r.inv}</span>
                  </td>
                  <td>{r.name}</td>
                  <td className="r">{fmt(r.amt)}</td>
                  <td><Badge status={r.status} /></td>
                  <td><Icon name="more" size={14} color="#8A95A3" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={2486} page={1} pageSize={20} />
        </div>
      </div>
    </>
  );
};

window.AdminStub = AdminStub;
window.AdminReports = AdminReports;
window.AdminPayments = AdminPayments;

// ===== Production note modal — shown on first load =====
const ProductionNote = ({ onClose }) => {
  const items = [
    { icon: "shield",  t: "การยืนยันธุรกรรมจากธนาคาร (Webhook signature, replay protection, allowed IPs)" },
    { icon: "key",     t: "การจัดเก็บรหัสลับและคีย์อย่างปลอดภัยในระบบสำรอง (KMS หรือ Vault)" },
    { icon: "history", t: "Audit Log ที่ไม่สามารถแก้ไขย้อนหลังได้ (append-only / WORM storage)" },
    { icon: "user",    t: "การควบคุมสิทธิ์ตามบทบาท (RBAC) และยืนยันตัวตนสองชั้นสำหรับการเงิน" },
    { icon: "fileText",t: "การสร้างใบเสร็จและเอกสารฝั่ง Server พร้อมเลขที่ใบเสร็จต่อเนื่อง" },
    { icon: "bank",    t: "การกระทบยอดกับรายงาน Settlement จริงของผู้ให้บริการ" },
  ];
  return (
    <div className="modal-backdrop" onClick={onClose} style={{zIndex: 200}}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth: 580, borderRadius: 12}}>
        <div style={{padding: "22px 26px 6px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 14}}>
          <div style={{width: 44, height: 44, borderRadius: 10, background: "var(--gold-soft)", color: "var(--gold-2)", display: "grid", placeItems: "center", flexShrink: 0}}>
            <Icon name="info" size={22} />
          </div>
          <div style={{flex: 1, paddingTop: 2}}>
            <div style={{fontSize: 11, fontWeight: 600, color: "var(--gold-2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, fontFamily: "var(--latin)"}}>ข้อมูลก่อนเข้าใช้งาน · Prototype Notice</div>
            <h2 style={{margin: 0, fontSize: 18, fontWeight: 600}}>นี่คือต้นแบบการออกแบบ (Design Prototype)</h2>
          </div>
        </div>

        <div style={{padding: "18px 26px 8px"}}>
          <p style={{margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.65, color: "var(--text-2)"}}>
            หน้าจอทุกหน้าในระบบนี้เป็นเพียงต้นแบบเพื่อทบทวนการออกแบบเท่านั้น <b>ยังไม่ใช่ระบบจริงที่พร้อมรับเงิน</b> ก่อนนำไปใช้งานจริงในโรงเรียน จำเป็นต้องมีระบบสนับสนุนด้านหลัง (Backend) ที่ครบถ้วนตามนี้
          </p>

          <div className="flex-col" style={{gap: 8, marginBottom: 4}}>
            {items.map((x, i) => (
              <div key={i} className="flex" style={{gap: 10, alignItems: "flex-start", padding: "7px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6}}>
                <div style={{width: 24, height: 24, borderRadius: 6, background: "var(--navy-soft)", color: "var(--navy)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1}}>
                  <Icon name={x.icon} size={12} />
                </div>
                <div style={{fontSize: 12.5, lineHeight: 1.5, color: "var(--text-2)"}}>{x.t}</div>
              </div>
            ))}
          </div>

          <div className="tiny muted" style={{marginTop: 14, lineHeight: 1.6}}>
            <Icon name="info" size={11} /> ตัวเลข ผู้ใช้ ผู้ลงนาม และเอกสารทั้งหมดเป็นข้อมูลตัวอย่างเพื่อสาธิตเท่านั้น ไม่เกี่ยวข้องกับธุรกรรมหรือบุคคลจริง
          </div>
        </div>

        <div className="modal-foot">
          <div className="grow tiny muted">โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ · ระบบรับชำระเงินโรงเรียน (Prototype)</div>
          <button className="btn primary" onClick={onClose}><Icon name="check" size={13} /> เข้าใจแล้ว เริ่มดูต้นแบบ</button>
        </div>
      </div>
    </div>
  );
};

window.ProductionNote = ProductionNote;

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
