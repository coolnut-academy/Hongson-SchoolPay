import { CALENDAR_YEAR, FISCAL_YEAR } from "../domain/model";
import { CURRENT_MONTH } from "../domain/model";
import { useState } from "react";
import { useScopedQuery as useQuery } from "../app/AppProvider";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../app/AppProvider";
import { Alert, Button, DetailList, EmptyState, Field, LoadingState, Money, PageHeader, PageState, Panel, QueryError } from "../components/ui";
import { ResponsiveRows } from "../components/WorkspaceUI";
import { REPORT_KINDS, REPORT_LABELS, type ReportKind } from "../domain/workspace";
export default function ReportsPage() {
  const { adapter, role } = useApp();
  const [params, setParams] = useSearchParams();
  const rawKind = params.get("kind") ?? "student_outstanding";
  const valid = REPORT_KINDS.includes(rawKind as ReportKind);
  const kind = rawKind as ReportKind;
  const academic = ["monthly_memo", "student_collections", "student_outstanding"].includes(kind);
  const permitted = role !== "homeroom_teacher" || academic;
  const [month, setMonth] = useState(params.get("month") ?? CURRENT_MONTH);
  const [year, setYear] = useState(params.get("year") ?? (academic ? String(CALENDAR_YEAR) : String(FISCAL_YEAR)));
  const [validated, setValidated] = useState(false), [draftMode, setDraftMode] = useState(false), [cancelled, setCancelled] = useState(false);
  const room = params.get("room") ?? "", selectedMonth = params.get("month") ?? CURRENT_MONTH;
  const selectedYear = Number(params.get("year") ?? (academic ? CALENDAR_YEAR : FISCAL_YEAR));
  const access = useQuery({ queryKey: ["homeroom-access", role], queryFn: ({ signal }) => adapter.homeroomAccess(role, signal), enabled: academic });
  const allowedRoom = !academic || access.data?.rooms.includes(room);
  const query = useQuery({ queryKey: ["report-preview", role, kind, room, selectedMonth, selectedYear, params.get("grade")], queryFn: ({ signal }) => adapter.previewReport({ kind, room, month: selectedMonth, year: selectedYear, grade: params.get("grade") ?? "all" }, role, signal), enabled: valid && permitted && !!allowedRoom });
  if (!valid || !permitted) return <EmptyState title="ไม่มีสิทธิ์ดูรายงานประเภทนี้" description="เลือกเฉพาะรายงานที่อนุญาต ไม่มีประเภทเอกสารใบเสร็จ" />;
  if (academic && access.isPending) return <LoadingState />;
  if (academic && access.isError) return <QueryError onRetry={() => void access.refetch()} />;
  if (!allowedRoom) return <PageState kind="chart" eyebrow="REPORTS & ANALYTICS" pageTitle="รายงาน" description="ตรวจสอบผลการจัดเก็บและเตรียมข้อมูลประกอบรายงาน" title="ไม่มีสิทธิ์ดูรายงานห้องนี้" message="รายงานจำกัดเฉพาะห้องที่ได้รับมอบหมาย กรุณาตรวจสอบขอบเขตห้องเรียนกับผู้ดูแลระบบ" />;
  function selectKind(value: ReportKind) {
    const nextAcademic = ["monthly_memo", "student_collections", "student_outstanding"].includes(value);
    setYear(nextAcademic ? String(CALENDAR_YEAR) : String(FISCAL_YEAR)); setValidated(false); setCancelled(false);
    setParams({ kind: value, room, month: selectedMonth, year: nextAcademic ? String(CALENDAR_YEAR) : String(FISCAL_YEAR), grade: params.get("grade") ?? "all" });
  }
  return <>
    <PageHeader eyebrow="REPORT CENTER" title="รายงาน" description="ตัวอย่างข้อมูลเชิงความหมาย · ตรวจสอบก่อนสร้างไฟล์ด้วยแม่แบบจริง" />
    <div className="mb-6"><Alert>ไม่มีการสร้าง พิมพ์ หรือดาวน์โหลดใบเสร็จรับเงิน รายงานที่อนุญาตมีเฉพาะประเภทด้านล่าง</Alert></div>
    <Panel className="mb-6"><div className="flex flex-wrap gap-2">{REPORT_KINDS.filter(k => role !== "homeroom_teacher" || ["monthly_memo", "student_collections", "student_outstanding"].includes(k)).map(k => <Button key={k} variant={k === kind ? "primary" : "secondary"} aria-pressed={k === kind} onClick={() => selectKind(k)}>{REPORT_LABELS[k]}</Button>)}</div></Panel>
    <Panel className="mb-6"><form className="homeroom-filters" onSubmit={e => { e.preventDefault(); setValidated(false); setCancelled(false); setParams({ kind, room, month, year, grade: params.get("grade") ?? "all" }); }}>
      <Field id="report-year" label={academic ? "ปีการศึกษา" : "ปีงบประมาณ"}><select id="report-year" value={year} onChange={e => setYear(e.target.value)}>{(academic ? [CALENDAR_YEAR, CALENDAR_YEAR - 1] : [FISCAL_YEAR, FISCAL_YEAR - 1]).map(y => <option key={y}>{y}</option>)}</select></Field>
      {academic && <><Field id="report-room" label="ห้อง"><select id="report-room" value={room} onChange={e => { setValidated(false); setParams({ kind, year, month, room: e.target.value }); }}>{access.data?.rooms.map(r => <option key={r}>{r}</option>)}</select></Field><Field id="report-month" label="เดือน"><input id="report-month" type="month" value={month} onChange={e => setMonth(e.target.value)} /></Field></>}
      <Button type="submit">แสดงตัวอย่างข้อมูล</Button>
    </form><p className="text-sm text-secondary mt-3">ตัวอย่างไม่เกิน 100 แถว · รายละเอียดตามชุดข้อมูลต้นทางที่มี · ระดับชั้น {params.get("grade") ?? "all"}</p></Panel>
    {query.isPending ? <LoadingState /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : <>
      <Panel className="mb-6"><h2>{REPORT_LABELS[kind]}</h2><DetailList items={[{ label: "แหล่งข้อมูล", value: query.data.source }, { label: "เวอร์ชัน", value: query.data.revision }, { label: "ข้อมูล ณ", value: query.data.asOf }, { label: "ปี", value: String(query.data.academicYear ?? query.data.fiscalYear) }, { label: "แม่แบบ", value: "ยังไม่มีแม่แบบจริง · version: ไม่มี · checksum: ไม่มี" }]} /></Panel>
      {!query.data.rows.length ? <EmptyState title="ไม่มีข้อมูลในช่วงที่เลือก" description="ไม่แทนยอดที่ไม่พร้อมด้วยศูนย์" /> : <ResponsiveRows label="ตัวอย่างรายงานเชิงความหมาย" rows={query.data.rows} rowKey={r => r.id} columns={[{ label: "รายการ", value: r => r.label }, { label: "จำนวนเงิน", value: r => <Money value={r.amount} /> }, { label: "รายละเอียด", value: r => r.detail }]} />}
      <Panel className="mt-6"><h2>ตรวจสอบความพร้อมและรูปแบบไฟล์</h2><Button className="my-4" onClick={() => { setValidated(true); setCancelled(false); void query.refetch(); }}>ตรวจสอบข้อมูล</Button>
        {validated && <ul className="space-y-3" aria-label="ผลการตรวจสอบ">{query.data.issues.map((issue, i) => <li key={`${issue.message}-${i}`}><Alert tone={issue.severity === "error" ? "danger" : "warning"}>{issue.message}</Alert></li>)}</ul>}
        {kind === "monthly_memo" && <Link className="text-link mt-4" to={`/app/monthly-followup?room=${encodeURIComponent(room)}&month=${selectedMonth}`}>กลับไปแก้ไขข้อมูลการติดตาม</Link>}
        {["superadmin", "finance_officer"].includes(role) && <label className="flex items-center gap-3 min-h-11 mt-3"><input type="checkbox" checked={draftMode} onChange={e => setDraftMode(e.target.checked)} />ตัวอย่างฉบับร่าง · ข้อมูลยังไม่ครบ</label>}
        <p className="text-sm text-secondary my-4">{draftMode ? "ฉบับร่างไม่สามารถข้ามแม่แบบที่ขาดหาย" : "ต้องผ่านการตรวจสอบและมีแม่แบบที่อนุมัติก่อนสร้างไฟล์"}</p>
        <div className="flex flex-wrap gap-3"><Button disabled>{kind === "monthly_memo" ? "DOCX ไม่พร้อมใช้งาน" : "XLSX ไม่พร้อมใช้งาน"}</Button><Button variant="secondary" onClick={() => { setCancelled(true); setValidated(false); }}>ยกเลิกการเตรียมรายงาน</Button></div>{cancelled && <p role="status" className="mt-3">ยกเลิกการเตรียมรายงานแล้ว ไม่มีการสร้างไฟล์หรือเปลี่ยนรายการเงิน</p>}
      </Panel>
    </>}
  </>;
}
