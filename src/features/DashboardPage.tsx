import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, BookOpen, ChartColumnIncreasing, ChevronRight, FileText, GraduationCap, Layers3, ShieldCheck, Wallet, CircleDollarSign, Percent } from "lucide-react";
import { useApp, useCurrentStaff, useScopedQuery } from "../app/AppProvider";
import { Alert, Badge, EmptyArtwork, EmptyState, LoadingState, Money, PageHeader, Panel, QueryError } from "../components/ui";
import { ResponsiveRows } from "../components/WorkspaceUI";
import { ROLE_LABELS } from "../domain/workspace";

export default function DashboardPage() {
  const { role, adapter } = useApp();
  const identity = useCurrentStaff();
  const [chartMode, setChartMode] = useState<"paid" | "outstanding">("paid");
  const query = useScopedQuery({ queryKey: ["dashboard", role], queryFn: ({ signal }) => adapter.dashboard(role, signal) });
  const teacher = role === "homeroom_teacher", admin = role === "superadmin";
  const title = admin ? "ภาพรวมผู้ดูแลระบบ" : teacher ? "ภาพรวมครูที่ปรึกษา" : role === "executive" ? "ภาพรวมการจัดเก็บ" : "ภาพรวมงานการเงิน";
  const data = query.data, available = !!data && data.available !== false;
  const grades = available ? data.grades : [];
  const total = grades.reduce((sum, g) => ({ adjusted: sum.adjusted + g.adjusted, paid: sum.paid + g.paid, outstanding: sum.outstanding + g.outstanding, students: sum.students + g.students }), { adjusted: 0, paid: 0, outstanding: 0, students: 0 });
  const percentage = total.adjusted > 0 ? Math.min(100, Math.max(0, total.paid / total.adjusted * 100)) : 0;
  const max = Math.max(...grades.map(g => g[chartMode]), 1);
  const links = admin ? [["/app/admin/users", "ผู้ใช้งานและสิทธิ์", "จัดการบทบาทและขอบเขตห้องเรียน"], ["/app/audit", "ประวัติการดำเนินงาน", "ตรวจสอบรายการเปลี่ยนแปลง"], ["/app/fees", "รายการเงิน", "ตรวจสอบรายการและอัตราเรียกเก็บ"]] : teacher ? [["/app/homeroom", "ห้องที่รับผิดชอบ", "ตรวจสอบข้อมูลนักเรียนในห้อง"], ["/app/monthly-followup", "ติดตามรายเดือน", "บันทึกผลการติดตามยอดชำระ"], ["/app/memos", "บันทึกข้อความ", "ตรวจสอบข้อมูลประกอบรายงาน"]] : role === "executive" ? [["/app/reports", "รายงานการจัดเก็บ", "ตรวจสอบภาพรวมและผลการจัดเก็บ"], ["/app/receipts/books", "ทะเบียนคุมใบเสร็จ", "ตรวจสอบสถานะเล่มและหน้า"], ["/app/audit", "ประวัติการดำเนินงาน", "ตรวจสอบรายการเปลี่ยนแปลง"]] : [["/app/finance/payments", "รับชำระนักเรียน", "ตรวจสอบยอดและบันทึกการรับเงิน"], ["/app/receipts/books", "ทะเบียนคุมใบเสร็จ", "ตรวจสอบสถานะเล่มและหน้า"], ["/app/reports", "รายงาน", "ตรวจสอบผลการจัดเก็บ"]];
  const quickIcons = [Wallet, BookOpen, FileText];
  return <div data-testid="staff-dashboard" className="dashboard-page">
    <PageHeader eyebrow="YOUR SCHOOL, AT A GLANCE" title={title} description={`ยินดีต้อนรับ · ${identity.data?.name ?? ROLE_LABELS[role]}`} action={<span className="period-chip"><span className="sidebar-dot" />{data?.periodLabel || "พื้นที่ทำงานโรงเรียน"}</span>} />
    {query.isPending ? <LoadingState /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : <>
      {data?.stale && <div className="mb-6"><Alert tone="warning">ข้อมูลต้นทางยังไม่เป็นปัจจุบัน กรุณาตรวจสอบก่อนดำเนินการ</Alert></div>}
      <section className="finance-summary" aria-label="สรุปการเงิน"><div className="finance-summary-heading"><span><Wallet size={17} aria-hidden /> สรุปบัญชีโรงเรียน</span><span>THB · บาท</span></div><div className="overview-grid">
        <Panel className="overview-card">
          <div className="dashboard-card-heading"><h2>ภาระชำระทั้งหมด</h2><span className="overview-icon neutral"><CircleDollarSign size={18} aria-hidden /></span></div>
          <div className="overview-value">{available ? <Money value={total.adjusted} /> : "—"}</div>
          <p className="card-caption">เงินบำรุงการศึกษาและเงินสมาคมฯ</p>
        </Panel>
        <Panel className="overview-card overview-paid">
          <div className="dashboard-card-heading"><h2>ยอดชำระแล้ว</h2><span className="overview-icon"><ArrowDownLeft size={18} aria-hidden /></span></div>
          <div className="overview-value">{available ? <Money value={total.paid} /> : "—"}</div>
          <p className="card-caption">ยอดรับชำระในขอบเขตของคุณ</p>
        </Panel>
        <Panel className="overview-card overview-outstanding">
          <div className="dashboard-card-heading"><h2>ยอดคงค้าง</h2><span className="overview-icon"><ArrowUpRight size={18} aria-hidden /></span></div>
          <div className="overview-value">{available ? <Money value={total.outstanding} /> : "—"}</div>
          <p className="card-caption">อยู่ระหว่างติดตามการชำระ</p>
        </Panel>
        <Panel className="overview-card">
          <div className="dashboard-card-heading"><h2>สัดส่วนการจัดเก็บ</h2><span className="overview-icon neutral"><Percent size={18} aria-hidden /></span></div>
          <div className="overview-value">{available && total.adjusted > 0 ? `${percentage.toFixed(1)}%` : "—"}</div>
          <div className="progress-track" aria-hidden><span style={{ width: `${percentage}%` }} /></div>
          <p className="card-caption">เทียบกับภาระชำระทั้งหมด</p>
        </Panel>
      </div></section>
      <div className="dashboard-scope"><span><GraduationCap size={16} aria-hidden />นักเรียนในขอบเขต <strong>{available ? total.students.toLocaleString("th-TH") : "—"}</strong> คน</span><span><Layers3 size={16} aria-hidden />ระดับชั้นที่มีข้อมูล <strong>{available ? grades.length : "—"}</strong></span><Badge tone={available ? "success" : "neutral"}>{available ? "ข้อมูลจากระบบโรงเรียน" : "รอข้อมูลจากโรงเรียน"}</Badge></div>
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <Panel className="collection-chart">
            <div className="dashboard-card-heading"><div><h2>สรุปยอดการจัดเก็บ</h2><p className="card-caption">เปรียบเทียบยอดเงินตามระดับชั้น</p></div><ChartColumnIncreasing size={21} className="text-muted" aria-hidden /></div>
            <div className="chart-toolbar"><div className="chart-tabs" role="group" aria-label="ยอดที่แสดงในกราฟ"><button aria-pressed={chartMode === "paid"} onClick={() => setChartMode("paid")}>ชำระแล้ว</button><button aria-pressed={chartMode === "outstanding"} onClick={() => setChartMode("outstanding")}>คงค้าง</button></div><span className="chart-unit">หน่วย: บาท</span></div>
            {grades.length ? <div className="grade-chart" role="list" aria-label={chartMode === "paid" ? "ยอดชำระแล้วตามระดับชั้น" : "ยอดคงค้างตามระดับชั้น"}>{grades.map(g => <div className="grade-column" role="listitem" key={g.grade}><span className="grade-value"><Money value={g[chartMode]} /></span><div className="grade-bar-space"><div className={`grade-bar ${chartMode}`} style={{ height: `${Math.max(0, g[chartMode]) / max * 100}%` }} /></div><span className="grade-name">{g.grade}</span></div>)}</div> : <div className="chart-empty"><div className="chart-gridlines" aria-hidden><i /><i /><i /><i /></div><EmptyArtwork kind="chart" /><strong>ภาพรวมจะเริ่มต้นที่นี่</strong><p>กราฟจะแสดงเมื่อมีข้อมูลการจัดเก็บจากโรงเรียน</p></div>}
            <div className="chart-footer"><span className="legend-dot paid" />{chartMode === "paid" ? "ยอดชำระแล้ว" : "ยอดคงค้าง"}<span>{data?.periodLabel || "รอข้อมูลรอบการจัดเก็บ"}</span></div>
          </Panel>
          <Panel className="grade-table-panel"><div className="dashboard-card-heading"><h2>{teacher ? "ห้องเรียนและผลการจัดเก็บ" : "ผลการจัดเก็บตามระดับชั้น"}</h2><span className="table-label">{available ? `${grades.length} ระดับชั้น` : "รอข้อมูล"}</span></div>{grades.length ? <ResponsiveRows label="ผลการจัดเก็บ" rows={grades} rowKey={g => g.grade} columns={[{ label: "ระดับชั้น", value: g => g.grade }, { label: "นักเรียน", value: g => g.students }, { label: "ชำระแล้ว", value: g => <Money value={g.paid} /> }, { label: "คงค้าง", value: g => <Money value={g.outstanding} /> }]} /> : <EmptyState title={teacher ? "ยังไม่มีข้อมูลห้องที่รับผิดชอบ" : "ยังไม่มีข้อมูลการจัดเก็บ"} description="ข้อมูลจะแสดงเมื่อเชื่อมต่อระบบโรงเรียนและได้รับสิทธิ์ที่เหมาะสม" />}</Panel>
        </div>
        <aside className="dashboard-aside" aria-label="ทางลัดและข้อมูลการทำงาน">
          <Panel className="quick-work"><div className="dashboard-card-heading"><h2>พื้นที่ทำงานของคุณ</h2><ArrowUpRight size={20} aria-hidden /></div><p className="card-caption">เข้าถึงงานที่ใช้เป็นประจำ</p><div className="quick-links">{links.map(([to, label, description], index) => { const Icon = quickIcons[index]; return <Link key={to} to={to} className="quick-work-link"><span className="icon-tile"><Icon size={21} aria-hidden /></span><div><strong>{label}</strong><p>{description}</p></div><ChevronRight size={17} aria-hidden /></Link>; })}</div><div className="workspace-access"><ShieldCheck size={16} aria-hidden /><span>แสดงเครื่องมือตามสิทธิ์ของคุณ</span></div></Panel>
          <Link to="/app/audit" className="dashboard-note"><ShieldCheck size={23} aria-hidden /><div><h2>ตรวจสอบที่มาของรายการ</h2><p>เปิดประวัติการดำเนินงานตามสิทธิ์ของคุณ</p></div><ArrowUpRight size={19} aria-hidden /></Link>
        </aside>
      </div>
      {available && data?.other.length ? <Panel className="mt-6"><h2>เงินรับประเภทอื่น</h2>{data.other.map(item => <p className="history-row" key={item.id}>{item.name}<Money value={item.amount} /></p>)}</Panel> : null}
      {data?.asOf && <p className="source-caption mt-4">ข้อมูล ณ {data.asOf}</p>}
    </>}
  </div>;
}
