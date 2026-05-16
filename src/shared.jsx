// Shared UI building blocks for SchoolPay

const fmt = (n, frac = 2) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: frac, maximumFractionDigits: frac });
const fmt0 = (n) => Number(n).toLocaleString("en-US");

// ===== Sidebar =====
const Sidebar = ({ route, setRoute }) => {
  const NavItem = ({ id, iconName, label, badge, children }) => {
    const isActive = route === id || (children && children.some(c => c.id === route));
    return (
      <>
        <div className={"nav-item " + (route === id ? "active" : "")} onClick={() => setRoute(id)}>
          <span className="nav-icon"><Icon name={iconName} size={15} /></span>
          <span className="grow">{label}</span>
          {badge && <span className="badge solid" style={{padding: "1px 6px", fontSize: 10.5}}>{badge}</span>}
        </div>
        {isActive && children && (
          <div className="nav-children">
            {children.map(c => (
              <div key={c.id} className={"nav-child " + (route === c.id ? "active" : "")} onClick={() => setRoute(c.id)}>
                {c.label}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">หส</div>
        <div style={{minWidth: 0}}>
          <div className="brand-name">ระบบรับชำระเงินโรงเรียน</div>
          <div className="brand-sub" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ</div>
        </div>
      </div>

      <div className="nav-section">หน้าหลัก</div>
      <NavItem id="dashboard" iconName="dashboard" label="Dashboard" />
      <NavItem id="campaigns" iconName="campaign" label="รอบเก็บเงิน" />
      <NavItem id="invoices" iconName="invoice" label="ใบแจ้งชำระ" badge="2,184" />
      <NavItem id="payments" iconName="payments" label="การชำระเงิน" />
      <NavItem id="reconciliation" iconName="recon" label="ศูนย์กระทบยอด" badge="18" />
      <NavItem id="receipts" iconName="receipt" label="ใบเสร็จรับเงิน" />

      <div className="nav-section" style={{marginTop: 10}}>ข้อมูลพื้นฐาน</div>
      <NavItem id="students" iconName="students" label="นักเรียน" />
      <NavItem id="classes" iconName="classes" label="ชั้นเรียน" />
      <NavItem id="reports" iconName="reports" label="รายงาน" />

      <div className="nav-section" style={{marginTop: 10}}>การตั้งค่า</div>
      <NavItem id="settings-providers" iconName="settings" label="ตั้งค่าระบบ" children={[
        { id: "settings-providers", label: "ผู้ให้บริการ QR PromptPay" },
        { id: "settings-webhook", label: "Webhook / รหัสลับ" },
        { id: "settings-receipt", label: "เทมเพลตใบเสร็จ" },
      ]} />
      <NavItem id="audit" iconName="history" label="ประวัติการเปลี่ยนแปลง" />

      <div className="sidebar-foot">
        <div className="avatar">ชญ</div>
        <div className="grow" style={{minWidth: 0}}>
          <div className="user-name" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>ครูชนัญพร</div>
          <div className="user-role">ผู้ดูแลระบบการเงินโรงเรียน</div>
        </div>
        <Icon name="chevronDown" size={14} color="#8A98AE" />
      </div>
    </aside>
  );
};

// ===== Top bar =====
const Topbar = ({ crumb, rightSlot }) => (
  <div className="topbar">
    <div className="breadcrumb">
      <Icon name="home" size={13} />
      {crumb.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {i === crumb.length - 1 ? <b>{c}</b> : <span>{c}</span>}
        </React.Fragment>
      ))}
    </div>
    <div className="top-actions">
      <div className="search">
        <Icon name="search" size={14} />
        <input placeholder="ค้นหานักเรียน, เลขที่ใบแจ้งชำระ, รหัสอ้างอิง..." />
        <span className="kbd">⌘K</span>
      </div>
      {rightSlot}
      <button className="icon-btn" style={{position: "relative"}}>
        <Icon name="bell" size={15} />
        <span className="dot-red" />
      </button>
      <button className="icon-btn"><Icon name="settings" size={15} /></button>
    </div>
  </div>
);

// ===== Status badge map =====
const STATUS = {
  draft: { cls: "draft", th: "ร่าง" },
  issued: { cls: "issued", th: "ออกใบแจ้งแล้ว" },
  pending: { cls: "pending", th: "รอการชำระ" },
  paid: { cls: "paid", th: "ชำระแล้ว" },
  under_review: { cls: "review", th: "อยู่ระหว่างตรวจสอบ" },
  partial: { cls: "partial", th: "ชำระบางส่วน" },
  overpaid: { cls: "overpaid", th: "ชำระเกินยอด" },
  expired: { cls: "expired", th: "หมดอายุ" },
  cancelled: { cls: "cancelled", th: "ยกเลิก" },
  refunded: { cls: "refunded", th: "คืนเงินแล้ว" },
  receipt_issued: { cls: "receipt-issued", th: "ออกใบเสร็จแล้ว" },
  ready: { cls: "issued", th: "พร้อมออกใบเสร็จ" },
  voided: { cls: "expired", th: "ยกเลิกใบเสร็จ" },
  active: { cls: "paid", th: "เปิดใช้งาน" },
  inactive: { cls: "expired", th: "ปิดใช้งาน" },
};
const Badge = ({ status, label }) => {
  const s = STATUS[status] || { cls: "draft", th: label || status };
  return <span className={"badge " + s.cls}><span className="dot" />{label || s.th}</span>;
};

// ===== Reusable bits =====
const Switch = ({ on, onChange }) => (
  <div className={"switch " + (on ? "on" : "")} onClick={() => onChange && onChange(!on)} />
);

const Banner = ({ kind = "warn", title, children, action }) => (
  <div className={"banner " + kind}>
    <span className="banner-icon"><Icon name={kind === "danger" ? "alert" : kind === "info" ? "info" : kind === "success" ? "check" : "alert"} size={16} /></span>
    <div className="grow">
      {title && <div><b>{title}</b></div>}
      <div style={{lineHeight: 1.55}}>{children}</div>
    </div>
    {action}
  </div>
);

const Modal = ({ title, onClose, children, footer }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="card-head">
        <h3>{title}</h3>
        <button className="icon-btn" onClick={onClose} style={{border: "none", background: "transparent"}}><Icon name="x" /></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-foot">{footer}</div>}
    </div>
  </div>
);

const Pagination = ({ total, page = 1, pageSize = 20 }) => (
  <div className="pagination">
    <div>แสดง {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} จาก {fmt0(total)} รายการ</div>
    <div className="page-btns">
      <div className="page-btn"><Icon name="chevronLeft" size={13} /></div>
      <div className="page-btn">1</div>
      <div className="page-btn active">2</div>
      <div className="page-btn">3</div>
      <div className="page-btn">4</div>
      <div className="page-btn">…</div>
      <div className="page-btn">110</div>
      <div className="page-btn"><Icon name="chevronRight" size={13} /></div>
    </div>
  </div>
);

// ===== QR placeholder (deterministic visual) =====
const QRPlaceholder = ({ size = 220, seed = 7 }) => {
  // Build a deterministic 25x25 grid
  const N = 25;
  const cells = [];
  let h = seed * 131;
  for (let i = 0; i < N * N; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    cells.push((h & 7) > 3);
  }
  // Force corner finder patterns
  const isCorner = (r, c) => {
    const inSq = (rs, cs) => r >= rs && r < rs + 7 && c >= cs && c < cs + 7;
    return inSq(0, 0) || inSq(0, N - 7) || inSq(N - 7, 0);
  };
  const finder = (r, c) => {
    const rs = r < 7 ? 0 : N - 7;
    const cs = c < 7 ? 0 : N - 7;
    const lr = r - rs, lc = c - cs;
    const inner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
    const ring = (lr === 0 || lr === 6 || lc === 0 || lc === 6);
    return inner || ring;
  };
  return (
    <div className="qr-display" style={{width: size, height: size}}>
      <div className="qr-grid">
        {cells.map((on, i) => {
          const r = Math.floor(i / N), c = i % N;
          let dark = on;
          if (isCorner(r, c)) dark = finder(r, c);
          return <div key={i} className={"qr-cell " + (dark ? "" : "off")} />;
        })}
      </div>
    </div>
  );
};

// ===== Barcode placeholder =====
const BarcodePlaceholder = ({ payload = "099400015501020230610" }) => {
  // Deterministic bar pattern from payload
  const widths = [];
  for (let i = 0; i < payload.length; i++) {
    const code = payload.charCodeAt(i);
    widths.push(((code % 3) + 1) * 1.5);
    widths.push(1); // gap (rendered as transparent)
  }
  return (
    <div className="barcode">
      {widths.map((w, i) => (
        <div key={i} style={{width: w + "px", background: i % 2 === 0 ? "#0F1A2C" : "transparent"}} />
      ))}
    </div>
  );
};

// ===== Avatar w/ deterministic color =====
const Avatar = ({ name, size = 28 }) => {
  const colors = ["#0E2A47", "#0F7B5E", "#1E5BA6", "#B8893B", "#74675F", "#5C4E8F"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const bg = colors[h % colors.length];
  const initials = name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: "#fff",
      display: "grid", placeItems: "center",
      fontSize: size * 0.42, fontWeight: 600,
      fontFamily: "var(--latin)", flexShrink: 0,
    }}>{initials}</div>
  );
};

Object.assign(window, {
  fmt, fmt0,
  Sidebar, Topbar, Badge, Switch, Banner, Modal, Pagination,
  QRPlaceholder, BarcodePlaceholder, Avatar,
  STATUS,
});
