import { useState } from "react";
import { useScopedQuery as useQuery } from "../app/AppProvider";
import { Link, useSearchParams } from "react-router-dom";
import { useApp, useCapability, useSnapshot } from "../app/AppProvider";
import { Alert, Button, EmptyState, Field, LoadingState, Metric, Money, Overlay, PageHeader, Panel, QueryError } from "../components/ui";
import { ResponsiveRows, RoomMetrics } from "../components/WorkspaceUI";
import { money } from "../domain/model";
import type { GradeSummary } from "../domain/workspace";

export default function DashboardPage() {
  const { role } = useApp();
  if (role === "homeroom_teacher") return <RoomDashboard />;
  if (role === "superadmin") return <AdminDashboard />;
  if (role === "finance_officer" || role === "finance_teacher") return <FinanceDashboard />;
  return <ExecutiveDashboard />;
}
function RoomDashboard() {
  const { adapter, role } = useApp();
  const access = useQuery({ queryKey: ["homeroom-access", role], queryFn: ({ signal }) => adapter.homeroomAccess(role, signal) });
  const query = useQuery({ queryKey: ["monthly-collections", role, "ม.2/1", "2026-10"], queryFn: ({ signal }) => adapter.monthlyCollections("ม.2/1", "2026-10", role, signal), enabled: !!access.data?.rooms.includes("ม.2/1") });
  if (access.isPending) return <LoadingState />;
  if (access.isError) return <QueryError onRetry={() => void access.refetch()} />;
  if (!access.data.rooms.length) return <EmptyState title="ยังไม่ได้รับมอบหมายห้อง" description="ติดต่อผู้ดูแลระบบโรงเรียน" />;
  return <><PageHeader eyebrow="HOMEROOM" title="ภาพรวมห้องที่รับผิดชอบ" description="เฉพาะห้องที่ได้รับมอบหมาย" />{query.isPending ? <LoadingState /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : query.data ? <><RoomMetrics data={query.data} /><Link className="btn btn-primary" to="/app/monthly-followup?room=ม.2/1&month=2026-10">ติดตามรายเดือน</Link></> : <EmptyState title="ยังไม่ได้รับมอบหมายห้อง" description="ติดต่อผู้ดูแลระบบโรงเรียน" />}</>;
}
function AdminDashboard() {
  const query = useSnapshot();
  const { adapter, role } = useApp();
  const staff = useQuery({ queryKey: ["staff-access", role], queryFn: ({ signal }) => adapter.staffAccess(role, signal) });
  if (query.isPending || staff.isPending) return <LoadingState />;
  if (query.isError || staff.isError) return <QueryError onRetry={() => { void query.refetch(); void staff.refetch(); }} />;
  return <><PageHeader eyebrow="ADMINISTRATION" title="ความพร้อมของระบบ" description="รายการรอข้อมูลยืนยัน ไม่ใช่การรับรองความพร้อมใช้งานจริง" />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6"><Metric label="บุคลากร" value={`${staff.data.length} คน`} /><Metric label="บทบาทที่ใช้งาน" value={`${new Set(staff.data.filter(s => s.active).map(s => s.role)).size} บทบาท`} /><Metric label="เล่มเปิดใช้" value={`${query.data.books.filter(b => b.status === "active").length} เล่ม`} /><Metric label="รายการต้องตรวจสอบ" value="4 รายการ" /></div>
    <Panel><h2>รายการรอข้อมูลยืนยัน</h2><div className="space-y-4 mt-4">{[
      ["G10 · กระทบยอดสต็อกตั้งต้น 6 + 80 = 86", "/app/receipts/books"], ["G04 · แม่แบบ XLSX/DOCX จริง", "/app/reports"], ["G08 · การเชื่อมโยงตัวตนจากระบบต้นทาง", "/app/admin/users"], ["G05 · อัตราเงินและนโยบายการสร้างภาระ", "/app/assignments"],
    ].map(([label, to]) => <div key={to}><Link className="text-link" to={to}>{label}</Link><p className="text-sm text-secondary">รอข้อมูลยืนยัน</p></div>)}</div></Panel>
    <div className="flex flex-wrap gap-3 mt-6"><Link className="btn btn-secondary" to="/app/admin/users">ผู้ใช้งานและสิทธิ์</Link><Link className="btn btn-secondary" to="/app/audit">ประวัติการดำเนินงาน</Link></div>
  </>;
}
function FinanceDashboard() {
  const query = useSnapshot();
  const { role, adapter } = useApp();
  const canOther = useCapability("other.receive");
  const pending = useQuery({ queryKey: ["pending-references", role], queryFn: ({ signal }) => adapter.pendingReferences(role, signal) });
  return <><PageHeader eyebrow="FINANCE" title="ภาพรวมงานการเงิน" description="สรุปเฉพาะรายละเอียดที่มีในชุดสาธิต ไม่ใช่ยอดทั้งโรงเรียน" />
    <div className="flex flex-wrap gap-3 mb-6"><Link className="btn btn-primary" to="/app/finance/payments">รับชำระนักเรียน</Link>{canOther && <Link className="btn btn-secondary" to="/app/finance/other">รับเงินประเภทอื่น</Link>}<Link className="btn btn-secondary" to="/app/finance/pending">รายการรอผูกอ้างอิง {pending.data?.length ?? "—"}</Link></div>
    {query.isPending ? <LoadingState /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : <><Panel className="mb-6"><h2>เล่มเปิดใช้</h2>{query.data.books.map(b => <p className="my-3" key={b.id}><Link className="text-link" to={`/app/receipts/books/${b.id}`}>{b.bookNo} · {b.holder}</Link></p>)}</Panel><ResponsiveRows label="รายการล่าสุดในชุดสาธิต" rows={query.data.books.flatMap(b => b.pages.filter(p => p.transaction).map(p => p.transaction!)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)} rowKey={t => t.id} columns={[{ label: "รายการ", value: t => t.description }, { label: "ผู้ชำระ", value: t => t.payer }, { label: "จำนวนเงิน", value: t => <Money value={t.amount} /> }, { label: "อ้างอิง", value: t => `${t.bookNo} / ${t.pageNo}` }]} /></>}
  </>;
}
function ExecutiveDashboard() {
  const { adapter, role } = useApp();
  const [params, setParams] = useSearchParams();
  const [grade, setGrade] = useState(params.get("grade") ?? "all"), [year, setYear] = useState(params.get("year") ?? "2569"), [detail, setDetail] = useState("");
  const query = useQuery({ queryKey: ["dashboard", role], queryFn: ({ signal }) => adapter.dashboard(role, signal) });
  const selectedGrade = params.get("grade") ?? "all", selectedYear = params.get("year") ?? "2569";
  const rows = query.data?.grades.filter(g => selectedGrade === "all" || g.grade === selectedGrade) ?? [];
  const total = rows.reduce((sum, g) => ({ students: sum.students + g.students, settled: sum.settled + g.settled, adjusted: sum.adjusted + g.adjusted, paid: sum.paid + g.paid, outstanding: sum.outstanding + g.outstanding }), { students: 0, settled: 0, adjusted: 0, paid: 0, outstanding: 0 });
  const columns = [ { label: "ระดับชั้น", value: (g: GradeSummary) => g.grade }, { label: "นักเรียน", value: (g: GradeSummary) => `${g.students} คน` }, { label: "ภาระเรียกเก็บ", value: (g: GradeSummary) => <Money value={g.adjusted} /> }, { label: "ชำระแล้ว", value: (g: GradeSummary) => <Money value={g.paid} /> }, { label: "คงค้าง", value: (g: GradeSummary) => <Money value={g.outstanding} /> }, { label: "อัตราจัดเก็บ", value: (g: GradeSummary) => g.adjusted ? `${(g.paid / g.adjusted * 100).toFixed(1)}%` : "—" }, { label: "รายละเอียด", value: (g: GradeSummary) => <Button variant="ghost" onClick={() => setDetail(g.grade)}>ดู {g.grade}</Button> } ];
  return <>
    <PageHeader eyebrow="EXECUTIVE OVERVIEW" title="ภาพรวมการจัดเก็บ" description="ปีการศึกษา 2569 · ภาคเรียนที่ 1" action={<Link className="btn btn-secondary" to={`/app/reports?year=${selectedYear}&grade=${encodeURIComponent(selectedGrade)}&kind=student_collections`}>ดูรายงาน</Link>} />
    <Panel className="mb-6"><form className="homeroom-filters" onSubmit={e => { e.preventDefault(); setParams({ year, grade }); }}><Field id="summary-year" label="ปีการศึกษา"><select id="summary-year" value={year} onChange={e => setYear(e.target.value)}><option>2569</option><option>2568</option></select></Field><Field id="summary-grade" label="ระดับชั้น"><select id="summary-grade" value={grade} onChange={e => setGrade(e.target.value)}><option value="all">ทุกระดับชั้น</option>{query.data?.grades.map(g => <option key={g.grade}>{g.grade}</option>)}</select></Field><Button type="submit">แสดงข้อมูล</Button></form></Panel>
    {query.isPending ? <LoadingState /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : (selectedYear !== "2569" || !rows.length) ? <EmptyState title="ไม่มีข้อมูลในชุดสาธิต" description="ไม่มีรายละเอียดปีการศึกษาที่เลือก อัตราจัดเก็บ —" /> : <>
      {query.data.stale && <Alert tone="warning">ข้อมูลต้นทางล้าสมัย · ข้อมูล ณ {query.data.asOf}</Alert>}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6"><Metric label="ภาระเรียกเก็บ" value={<Money value={total.adjusted} />} /><Metric label="ชำระแล้ว" value={<Money value={total.paid} />} /><Metric label="คงค้าง" value={<Money value={total.outstanding} />} /><Metric label="อัตราจัดเก็บ" value={total.adjusted ? `${(total.paid / total.adjusted * 100).toFixed(1)}%` : "—"} caption="ยอดชำระนักเรียน ÷ ภาระหลังปรับปรุง" /></div>
      <div className="homeroom-grid mb-6"><Panel><h2>ยอดค้างตามระดับชั้น</h2><div className="space-y-4 mt-5" aria-label="ยอดค้างสูงสุด 160,000 บาท">{query.data.grades.map(g => <button key={g.grade} className="w-full text-left min-h-11" onClick={() => { setGrade(g.grade); setParams({ year: selectedYear, grade: g.grade }); }} aria-label={`${g.grade} ยอดค้าง ${money(g.outstanding)}`}><span className="flex justify-between gap-3"><span>{g.grade}</span><Money value={g.outstanding} /></span><span className="block rounded bg-border h-3 mt-1"><span className="block rounded bg-primary h-3" style={{ width: `${g.outstanding / 16000000 * 100}%` }} /></span></button>)}</div><a className="text-link mt-4" href="#grade-table">ดูตารางข้อมูล</a></Panel><Panel><h2>สถานะการติดตาม</h2><p className="mt-4">นักเรียนทั้งหมด {total.students.toLocaleString()} คน</p><p>ชำระครบ {total.settled.toLocaleString()} คน</p><p>ค้างชำระ {total.students - total.settled} คน</p><hr className="my-4" /><p>บันทึกข้อความรายเดือน ส่งแล้ว 24 / 30 ห้อง</p><p>ฉบับร่าง 6 ห้อง</p><Link className="text-link mt-3" to="/app/memos">ดูสถานะบันทึกข้อความ</Link><p className="text-xs text-secondary mt-3">ตัวเลขภาพรวมเป็นชุดข้อมูลแยก รายละเอียดมีเฉพาะ ม.2/1</p></Panel></div>
      <div id="grade-table"><ResponsiveRows label="ผลการจัดเก็บรายระดับชั้น" rows={rows} rowKey={g => g.grade} columns={columns} /></div>
      <Panel className="mt-6"><h2>เงินรับประเภทอื่น · ปีงบประมาณ 2570</h2><p className="text-xl my-4"><Money value={query.data.other.reduce((sum, x) => sum + x.amount, 0)} /></p>{query.data.other.map(x => <p key={x.id} className="flex flex-wrap justify-between gap-3 my-3">{x.name}<Money value={x.amount} /></p>)}<Alert>ไม่นำมารวมอัตราจัดเก็บเงินนักเรียน</Alert></Panel>
      <Panel className="mt-6"><h2>สต็อกตามต้นทาง 6 + 80 = 86 เล่ม</h2><Alert tone="warning">G10 ยังไม่ยืนยันเลขเล่มยกมาหกเล่ม ตัวเลขรวมไม่ใช่ผลกระทบยอดรายเล่ม</Alert></Panel>
    </>}
    <Overlay open={!!detail} onClose={() => setDetail("")} title={`รายละเอียด ${detail}`} drawer>{detail === "ม.2" ? <><p>รายละเอียดเฉพาะห้องที่มีในชุดข้อมูลสาธิต ไม่ใช่ทั้งระดับชั้น</p><Link className="btn btn-secondary mt-4" to="/app/homeroom?room=ม.2/1">ดู ม.2/1</Link></> : <EmptyState title="ไม่มีรายละเอียดในชุดข้อมูลสาธิต" description="ไม่มีการสร้างรายชื่อนักเรียนเพิ่มเติมจากยอดภาพรวม" />}</Overlay>
  </>;
}
