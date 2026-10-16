import { useState, type MouseEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CreditCard,
  FileText,
  GraduationCap,
  History,
  Layers3,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useApp, useCurrentStaff } from "../app/AppProvider";
import { Button, Overlay } from "./ui";
import { canReceive, type DemoRole, type Scenario } from "../domain/model";
function focusContent(event: MouseEvent<HTMLAnchorElement>) {
  // Native hash navigation creates a history entry outside the SPA router and
  // can bypass its unsaved-change blocker on subsequent Back navigation.
  event.preventDefault();
  document.getElementById("main")?.focus();
}
export function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark">HS</span>
      <span>
        <strong>Hongson-SchoolPay</strong>
        <small>ACADEMIC FINANCE</small>
      </span>
      <span className="sr-only">หน้าแรก</span>
    </Link>
  );
}
export function DemoBanner() {
  return (
    <div className="demo-banner">
      <span className="demo-dot" />
      ข้อมูลสาธิต · ไม่ใช่รายการเงินจริง{" "}
      <span className="hidden sm:inline">
        · บันทึกในหน่วยความจำของหน้านี้เท่านั้น
      </span>
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
      {
        to: "/app/finance/payments",
        label: "รับชำระนักเรียน",
        icon: CreditCard,
        key: "receive",
      },
      { to: "/app/finance/other", label: "รับเงินประเภทอื่น", icon: CreditCard, key: "other" },
      { to: "/app/finance/pending", label: "รายการรอผูกอ้างอิง", icon: FileText, key: "receive" },
    ],
  },
  {
    group: "ทะเบียนคุม",
    items: [
      {
        to: "/app/receipts/books",
        label: "เล่มใบเสร็จ",
        icon: BookOpen,
        key: "ledger",
      },
      {
        to: "/app/receipts/pages",
        label: "ตรวจสอบรายหน้า",
        icon: Search,
        key: "pages",
      },
      { to: "/app/receipts/movements", label: "ทะเบียนเคลื่อนไหว", icon: History, key: "stock" },
    ],
  },
  {
    group: "ข้อมูลและรายงาน",
    items: [
      { to: "/app/fees", label: "รายการเงิน", icon: Layers3, key: "fees" },
      {
        to: "/app/assignments",
        label: "กำหนดภาระรายห้อง",
        icon: Users,
        key: "assignments",
      },
      { to: "/app/reports", label: "รายงาน", icon: FileText, key: "reports" },
    ],
  },
  { group: "ดูแลระบบ", items: [
    { to: "/app/admin/users", label: "ผู้ใช้งานและสิทธิ์", icon: Users, key: "users" },
    { to: "/app/audit", label: "ประวัติการดำเนินงาน", icon: History, key: "audit" },
  ] },
];
const roleNames: Record<DemoRole, string> = {
  finance_officer: "เจ้าหน้าที่การเงิน",
  finance_teacher: "ครูการเงิน",
  superadmin: "ผู้ดูแลระบบ",
  executive: "ผู้บริหาร",
  homeroom_teacher: "ครูที่ปรึกษา",
};
function StaffNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const { role, scenario } = useApp();
  return (
    <nav aria-label="เมนูบุคลากร">
      {nav.map(group => ({ ...group, items: group.items.filter(item => (role !== "homeroom_teacher" || ["homeroom", "dashboard", "reports", "audit"].includes(item.key)) && (item.key !== "receive" || canReceive(role)) && (item.key !== "other" || ["superadmin", "finance_officer"].includes(role) || (role === "finance_teacher" && scenario === "delegated-finance")) && (item.key !== "users" || ["superadmin", "executive"].includes(role))) })).filter(group => group.items.length).map((group) => (
        <div className="nav-group" key={group.group}>
          <p>{group.group}</p>
          {group.items
            .filter((item) => item.key !== "receive" || canReceive(role))
            .map((item) => (
              <NavLink
                end={item.to === "/app/homeroom"}
                aria-label={item.label}
                title={item.label}
                onClick={onNavigate}
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
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
  const { role, logoutStaff } = useApp(),
    location = useLocation();
  const navigate = useNavigate();
  const identity = useCurrentStaff();
  const logout = () => { logoutStaff(); navigate("/", { replace: true }); };
  const title =
    nav.flatMap((g) => g.items).sort((a, b) => b.to.length - a.to.length).find((n) => location.pathname.startsWith(n.to))
      ?.label || "พื้นที่ทำงาน";
  return (
    <div className="staff-shell">
      <a className="skip-link" href="#main" onClick={focusContent}>
        ข้ามไปเนื้อหา
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">
          <span className="sidebar-dot" />
          พื้นที่ทำงานบุคลากร
        </div>
        <StaffNavigation />
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <ShieldCheck size={20} aria-hidden />
            <p>
              ตรวจสอบได้ทุกขั้นตอน<small>บันทึกข้อมูลอ้างอิงใบเสร็จจริง</small>
            </p>
          </div>
          <Link to="/" className="nav-item">
            <ArrowLeft size={18} aria-hidden />
            <span>กลับหน้าสาธิต</span>
          </Link>
          <Button variant="secondary" className="w-full shell-logout" aria-label="ออกจากระบบสาธิต" onClick={logout}><LogOut size={18} aria-hidden /><span>ออกจากระบบสาธิต</span></Button>
          <div className="sidebar-profile">
            <span className="avatar">ปภ</span>
            <div>
              <strong>
                {identity.data?.name ?? "กำลังตรวจสอบบุคลากร"}
              </strong>
              <small>{roleNames[role]} · สาธิต</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="staff-main">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="เปิดเมนู"
            onClick={() => setMenu(true)}
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            <LayoutGrid size={17} aria-hidden />
            <span>SchoolPay</span>
            <ChevronRight size={14} aria-hidden />
            <strong>{title}</strong>
          </div>
          <div className="topbar-context">
            <CalendarDays size={16} aria-hidden />
            <span>ปีการศึกษา 2569</span>
            <span className="topbar-divider" />
            <span className="avatar avatar-small">ปภ</span>
          </div>
        </header>
        <DemoBanner />
        <main id="main" tabIndex={-1} className="staff-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Hongson-SchoolPay</span>
          <span>ความถูกต้อง โปร่งใส ตรวจสอบได้</span>
        </footer>
      </div>
      <Overlay
        open={menu}
        onClose={() => setMenu(false)}
        title="เมนูบุคลากร"
        description={roleNames[role]}
        drawer
      >
        <StaffNavigation onNavigate={() => setMenu(false)} />
        <Button variant="secondary" className="my-4 w-full" onClick={logout}>ออกจากระบบสาธิต</Button>
        <Link to="/" className="text-link" onClick={() => setMenu(false)}>
          กลับหน้าสาธิต
        </Link>
      </Overlay>
    </div>
  );
}
export function StudentShell() {
  const { setVisitor } = useApp();
  const navigate = useNavigate();
  return (
    <div className="student-shell">
      <a className="skip-link" href="#main" onClick={focusContent}>
        ข้ามไปเนื้อหา
      </a>
      <header className="student-topbar">
        <Brand />
        <Link to="/" onClick={event => {
          event.preventDefault();
          // Commit one navigation before clearing scope, so the guard does not
          // start a second redirect that can race with immediate browser Back.
          navigate("/", { flushSync: true });
          setVisitor(false);
        }} className="text-link">
          เปลี่ยนรหัส <ArrowUpRight size={16} aria-hidden />
        </Link>
      </header>
      <DemoBanner />
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
        <Outlet />
      </main>
      <footer className="student-footer">
        Hongson-SchoolPay · ข้อมูลเพื่อการตรวจสอบ
      </footer>
    </div>
  );
}
export function DevTools() {
  const { role, setRole, scenario, setScenario, reset } = useApp();
  const [open, setOpen] = useState(false);
  if (!import.meta.env.DEV) return null;
  return (
    <div className="dev-tools">
      <button
        className="dev-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Settings2 size={16} aria-hidden />
        สาธิต
      </button>
      {open && (
        <div className="dev-panel">
          <p className="font-semibold">เครื่องมือทดสอบ UI เท่านั้น</p>
          <p className="text-xs text-secondary">
            ไม่ใช่การยืนยันตัวตนหรือระบบรักษาความปลอดภัย
          </p>
          <label htmlFor="demo-role">บทบาทจำลอง</label>
          <select
            id="demo-role"
            value={role}
            onChange={(e) => setRole(e.target.value as DemoRole)}
          >
            {Object.entries(roleNames).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor="demo-scenario">สถานการณ์จำลอง</label>
          <select
            id="demo-scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value as Scenario)}
          >
            <option value="baseline">ข้อมูลปกติ</option>
            <option value="offline">ออฟไลน์</option>
            <option value="page-conflict">
              หน้าใบเสร็จถูกใช้ระหว่างบันทึก
            </option>
            <option value="unknown-outcome">
              บันทึกแล้วแต่ไม่ได้รับผลตอบกลับ
            </option>
            <option value="read-error">โหลดข้อมูลผิดพลาด</option>
            <option value="stale">ข้อมูลต้นทางล้าสมัย</option>
            <option value="no-assigned-rooms">ยังไม่ได้รับมอบหมายห้อง</option>
            <option value="report-invalid">ข้อมูลรายงานไม่ผ่านกระทบยอด</option>
            <option value="loading">ค้างการโหลดจนกว่าจะเปลี่ยนสถานการณ์</option>
            <option value="empty-valid">ช่วงข้อมูลว่าง</option>
            <option value="balance-changed">ยอดชำระเปลี่ยนระหว่างตรวจสอบ</option>
            <option value="permission-revoked">เพิกถอนสิทธิ์ระหว่างใช้งาน</option>
            <option value="delegated-finance">สิทธิ์เสริมครูการเงิน · เฉพาะชุดสาธิต</option>
          </select>
          <button className="btn btn-secondary" onClick={reset}>
            รีเซ็ตข้อมูลสาธิต
          </button>
        </div>
      )}
    </div>
  );
}
