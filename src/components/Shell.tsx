import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  GraduationCap,
  History,
  Layers3,
  LayoutGrid,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Users,
} from "lucide-react";
import { useApp, useCurrentStaff } from "../app/AppProvider";
import { Button, Overlay } from "./ui";
import { canReceive, type StaffRole } from "../domain/model";

function focusContent(event: MouseEvent<HTMLAnchorElement>) {
  // Native hash navigation creates a history entry outside the SPA router and
  // can bypass its unsaved-change blocker on subsequent Back navigation.
  event.preventDefault();
  document.getElementById("main")?.focus();
}

export function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark" aria-hidden>
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M7 7h18v6H13v6h12v6H7v-6h12v-6H7V7Z" fill="currentColor" />
          <path d="m25 7-6 6M13 19l-6 6" stroke="var(--brand-bright)" strokeWidth="1.6" />
        </svg>
      </span>
      <span>
        <strong>
          SchoolPay<span className="brand-period">.</span>
        </strong>
        <small>HONGSON SCHOOL</small>
      </span>
      <span className="sr-only">หน้าแรก</span>
    </Link>
  );
}

export function ConnectionBanner() {
  const { reviewMode, connected } = useApp();
  if (connected) return null;
  return (
    <div className="demo-banner" role="status" data-testid="connection-status">
      <span className="demo-dot" />
      {reviewMode
        ? "โหมดตรวจหน้าจอ · ยังไม่เชื่อมข้อมูลโรงเรียน · ไม่สามารถบันทึกรายการ"
        : "อยู่ระหว่างเชื่อมต่อระบบโรงเรียน กรุณาติดต่อเจ้าหน้าที่เพื่อสอบถามข้อมูล"}
    </div>
  );
}

const nav = [
  { group: "ภาพรวม", items: [{ to: "/app/dashboard", label: "ภาพรวม", icon: LayoutGrid, key: "dashboard" }] },
  {
    group: "ติดตามนักเรียน",
    items: [
      { to: "/app/homeroom", label: "ห้องที่รับผิดชอบ", icon: Users, key: "homeroom" },
      { to: "/app/homeroom/collections", label: "ยอดจัดเก็บรายห้อง", icon: Users, key: "homeroom" },
      { to: "/app/monthly-followup", label: "ติดตามรายเดือน", icon: CalendarDays, key: "homeroom" },
      { to: "/app/memos", label: "บันทึกข้อความ", icon: FileText, key: "homeroom" },
    ],
  },
  {
    group: "งานการเงิน",
    items: [
      { to: "/app/finance/payments", label: "รับชำระนักเรียน", icon: CreditCard, key: "receive" },
      { to: "/app/finance/other", label: "รับเงินประเภทอื่น", icon: CreditCard, key: "other" },
      { to: "/app/finance/pending", label: "รายการรอผูกอ้างอิง", icon: FileText, key: "receive" },
    ],
  },
  {
    group: "ทะเบียนคุม",
    items: [
      { to: "/app/receipts/books", label: "เล่มใบเสร็จ", icon: BookOpen, key: "ledger" },
      { to: "/app/receipts/pages", label: "ตรวจสอบรายหน้า", icon: Search, key: "pages" },
      { to: "/app/receipts/movements", label: "ทะเบียนเคลื่อนไหว", icon: History, key: "stock" },
    ],
  },
  {
    group: "ข้อมูลและรายงาน",
    items: [
      { to: "/app/fees", label: "รายการเงิน", icon: Layers3, key: "fees" },
      { to: "/app/assignments", label: "กำหนดภาระรายห้อง", icon: Users, key: "assignments" },
      { to: "/app/reports", label: "รายงาน", icon: FileText, key: "reports" },
    ],
  },
  {
    group: "ดูแลระบบ",
    items: [
      { to: "/app/admin/users", label: "ผู้ใช้งานและสิทธิ์", icon: Users, key: "users" },
      { to: "/app/audit", label: "ประวัติการดำเนินงาน", icon: History, key: "audit" },
    ],
  },
];

const roleNames: Record<StaffRole, string> = {
  finance_officer: "เจ้าหน้าที่การเงิน",
  finance_teacher: "ครูการเงิน",
  superadmin: "ผู้ดูแลระบบ",
  executive: "ผู้บริหาร",
  homeroom_teacher: "ครูที่ปรึกษา",
};

function StaffNavigation({ onNavigate, search = "" }: { onNavigate?: () => void; search?: string }) {
  const { role } = useApp();
  const identity = useCurrentStaff();
  const groups = nav
    .map(group => ({
      ...group,
      items: group.items.filter(
        item =>
          (role !== "homeroom_teacher" || ["homeroom", "dashboard", "reports", "audit"].includes(item.key)) &&
          (item.key !== "receive" || canReceive(role)) &&
          (item.key !== "other" ||
            ["superadmin", "finance_officer"].includes(role) ||
            (role === "finance_teacher" && identity.data?.capabilities?.includes("other.receive"))) &&
          (item.key !== "users" || ["superadmin", "executive"].includes(role)) &&
          item.label.includes(search.trim()),
      ),
    }))
    .filter(group => group.items.length);

  return (
    <nav aria-label="เมนูบุคลากร">
      {!groups.length && (
        <p className="menu-no-results" role="status">
          ไม่พบเมนูที่ค้นหา
        </p>
      )}
      {groups.map(group => (
        <div className="nav-group" key={group.group}>
          <p>{group.group}</p>
          {group.items.map(item => (
            <NavLink
              end={item.to === "/app/homeroom"}
              aria-label={item.label}
              title={item.label}
              onClick={onNavigate}
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <item.icon size={20} aria-hidden />
              <span>{item.label}</span>
              <ChevronRight className="nav-arrow" size={14} aria-hidden />
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export function StaffShell() {
  const [menu, setMenu] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [help, setHelp] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { role, logoutStaff } = useApp(),
    location = useLocation();
  const navigate = useNavigate();
  const identity = useCurrentStaff();
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !(event.target instanceof HTMLSelectElement)
      ) {
        event.preventDefault();
        if (collapsed) setCollapsed(false);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [collapsed]);

  const logout = async () => {
    try {
      await logoutStaff();
      navigate("/", { replace: true });
    } catch {
      setLogoutError("ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  };

  const title =
    nav
      .flatMap(g => g.items)
      .sort((a, b) => b.to.length - a.to.length)
      .find(n => location.pathname.startsWith(n.to))?.label || "พื้นที่ทำงาน";

  return (
    <div className={`staff-shell${collapsed ? " sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#main" onClick={focusContent}>
        ข้ามไปเนื้อหา
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">
          <span className="sidebar-dot" />
          พื้นที่ทำงานบุคลากร
        </div>
        <div className="sidebar-search search-input">
          <Search size={17} aria-hidden />
          <input
            ref={searchInputRef}
            aria-label="ค้นหาเมนู"
            placeholder="ค้นหาเมนู... (กด /)"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <StaffNavigation search={search} />
        <div className="sidebar-bottom">
          <Link to="/" className="nav-item">
            <ArrowLeft size={18} aria-hidden />
            <span>กลับหน้าแรก</span>
          </Link>
          <Button variant="secondary" className="w-full shell-logout" aria-label="ออกจากระบบ" onClick={logout}>
            <LogOut size={18} aria-hidden />
            <span>ออกจากระบบ</span>
          </Button>
          <div className="sidebar-profile">
            <span className="avatar">{identity.data?.name.slice(0, 1) ?? "—"}</span>
            <div>
              <strong>{identity.data?.name ?? "กำลังตรวจสอบบุคลากร"}</strong>
              <small>{roleNames[role]}</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="staff-main">
        <header className="topbar">
          <button
            className="icon-button sidebar-toggle"
            aria-label={collapsed ? "ขยายแถบเมนู" : "ย่อแถบเมนู"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(value => !value)}
          >
            {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>
          <button className="icon-button mobile-menu" aria-label="เปิดเมนู" onClick={() => setMenu(true)}>
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            <LayoutGrid size={17} aria-hidden />
            <span>SchoolPay</span>
            <ChevronRight size={14} aria-hidden />
            <strong>{title}</strong>
          </div>
          <div className="topbar-context">
            <button className="icon-button help-button" aria-label="วิธีใช้งาน" onClick={() => setHelp(true)}>
              <CircleHelp size={20} aria-hidden />
            </button>
            <CalendarDays size={16} aria-hidden />
            <span>พื้นที่ทำงานโรงเรียน</span>
            <span className="topbar-divider" />
            <span className="avatar avatar-small">{identity.data?.name.slice(0, 1) ?? "—"}</span>
            <div className="topbar-profile">
              <strong>{identity.data?.name ?? "บุคลากรโรงเรียน"}</strong>
              <small>{roleNames[role]}</small>
            </div>
          </div>
        </header>
        <ConnectionBanner />
        <main
          id="main"
          tabIndex={-1}
          className="staff-content"
          data-page={location.pathname.split("/").slice(2).join("-")}
        >
          {logoutError && <p role="alert">{logoutError}</p>}
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Hongson-SchoolPay</span>
          <span>ความถูกต้อง โปร่งใส ตรวจสอบได้</span>
        </footer>
      </div>
      <nav className="staff-dock" aria-label="เมนูหลักบนมือถือ">
        <NavLink to="/app/dashboard">
          <LayoutGrid size={21} aria-hidden />
          <span>ภาพรวม</span>
        </NavLink>
        <NavLink to="/app/homeroom">
          <Users size={21} aria-hidden />
          <span>ห้องเรียน</span>
        </NavLink>
        <NavLink to="/app/reports">
          <FileText size={21} aria-hidden />
          <span>รายงาน</span>
        </NavLink>
        <button onClick={() => setMenu(true)} aria-label="เปิดเมนูทั้งหมด" aria-expanded={menu}>
          <Menu size={21} aria-hidden />
          <span>ทั้งหมด</span>
        </button>
      </nav>
      <Overlay open={help} onClose={() => setHelp(false)} title="เริ่มต้นใช้งาน SchoolPay" description="พื้นที่ทำงานการเงินโรงเรียน">
        <div className="help-steps">
          <p>
            <strong>01 · เลือกงานจากเมนู</strong>เมนูจะแสดงตามบทบาทและสิทธิ์ที่ได้รับจากโรงเรียน
          </p>
          <p>
            <strong>02 · ตรวจสอบข้อมูลก่อนบันทึก</strong>ตรวจสอบนักเรียน ยอดเงิน และข้อมูลอ้างอิงใบเสร็จจริงให้ครบถ้วน
          </p>
          <p>
            <strong>03 · ติดตามได้จากรายงาน</strong>ดูผลการจัดเก็บและประวัติการดำเนินงานจากเมนูที่คุณมีสิทธิ์เข้าถึง
          </p>
        </div>
      </Overlay>
      <Overlay open={menu} onClose={() => setMenu(false)} title="เมนูบุคลากร" description={roleNames[role]} drawer>
        <div className="search-input drawer-search">
          <Search size={17} aria-hidden />
          <input
            aria-label="ค้นหาในเมนูทั้งหมด"
            placeholder="ค้นหาเมนู..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <StaffNavigation search={search} onNavigate={() => setMenu(false)} />
        <Button variant="secondary" className="my-4 w-full" onClick={logout}>
          ออกจากระบบ
        </Button>
        <Link to="/" className="text-link" onClick={() => setMenu(false)}>
          กลับหน้าแรก
        </Link>
      </Overlay>
    </div>
  );
}

export function StudentShell() {
  const { setVisitor, adapter } = useApp();
  const [exitError, setExitError] = useState("");
  const navigate = useNavigate();
  return (
    <div className="student-shell">
      <a className="skip-link" href="#main" onClick={focusContent}>
        ข้ามไปเนื้อหา
      </a>
      <header className="student-topbar">
        <Brand />
        <Link
          to="/"
          onClick={async event => {
            event.preventDefault();
            try {
              await adapter.endVisitorSession();
            } catch {
              setExitError("ออกจากหน้าข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง");
              return;
            }
            // Commit one navigation before clearing scope, so the guard does not
            // start a second redirect that can race with immediate browser Back.
            navigate("/", { flushSync: true });
            setVisitor(false);
          }}
          className="text-link"
        >
          เปลี่ยนรหัส <ArrowUpRight size={16} aria-hidden />
        </Link>
      </header>
      <ConnectionBanner />
      <nav className="student-nav" aria-label="เมนูนักเรียน">
        <NavLink to="/student" end>
          <GraduationCap size={20} aria-hidden />
          ยอดชำระ
        </NavLink>
        <NavLink to="/student/history">
          <History size={20} aria-hidden />
          ประวัติ
        </NavLink>
        <NavLink to="/student/documents">
          <FileText size={20} aria-hidden />
          เอกสาร
        </NavLink>
      </nav>
      <main id="main" tabIndex={-1} className="student-content">
        {exitError && <p role="alert">{exitError}</p>}
        <Outlet />
      </main>
      <footer className="student-footer">Hongson-SchoolPay · ข้อมูลเพื่อการตรวจสอบ</footer>
    </div>
  );
}
