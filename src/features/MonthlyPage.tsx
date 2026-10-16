import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScopedQuery as useQuery } from "../app/AppProvider";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useApp } from "../app/AppProvider";
import { Alert, Badge, Button, DetailList, EmptyState, Field, LoadingState, Money, Overlay, PageHeader, Panel, QueryError } from "../components/ui";
import { ResponsiveRows, RoomMetrics } from "../components/WorkspaceUI";
import { UnsavedChangesGuard } from "../components/UnsavedChangesGuard";
import { dateLabel, followupErrors, missingFollowup, type CollectionStudent, type DemoRole, type FollowupNote } from "../domain/model";
import { debtorRows, financialKey, PAPER_STAGES, type MonthlyDraft, type MonthlyWorkspace } from "../domain/workspace";

export default function MonthlyPage() {
  const { adapter, role } = useApp();
  const [params, setParams] = useSearchParams();
  const { pathname } = useLocation();
  const room = params.get("room") ?? "ม.2/1", month = params.get("month") ?? "2026-10";
  const access = useQuery({ queryKey: ["homeroom-access", role], queryFn: ({ signal }) => adapter.homeroomAccess(role, signal) });
  const allowed = access.data?.rooms.includes(room);
  const query = useQuery({ queryKey: ["monthly-workspace", role, room, month], queryFn: ({ signal }) => adapter.monthlyWorkspace(room, month, role, signal), enabled: !!allowed });
  const title = pathname.endsWith("memos") ? "บันทึกข้อความรายเดือน" : "ติดตามการชำระรายเดือน";
  if (access.isPending) return <LoadingState />;
  if (access.isError) return <QueryError onRetry={() => void access.refetch()} />;
  if (!allowed) return <EmptyState title={access.data.rooms.length ? "ไม่มีสิทธิ์ดูข้อมูลห้องนี้" : "ยังไม่ได้รับมอบหมายห้อง"} description="กรุณาติดต่อผู้ดูแลระบบหรือเลือกห้องที่ได้รับมอบหมาย" />;
  return <>
    <PageHeader eyebrow="MONTHLY FOLLOW-UP" title={title} description={`${room} · ${access.data.teacher}`} />
    <Panel className="mb-6"><div className="homeroom-filters">
      <Field id="monthly-room" label="ห้องที่รับผิดชอบ"><select id="monthly-room" value={room} onChange={e => setParams({ room: e.target.value, month })}>{access.data.rooms.map(r => <option key={r}>{r}</option>)}</select></Field>
      <Field id="monthly-month" label="เดือน"><input id="monthly-month" type="month" value={month} onChange={e => e.target.value && e.target.value !== month && setParams({ room, month: e.target.value })} /></Field>
      <p>ภาคเรียน 1 / ปีการศึกษา 2569</p>
      <Link className="text-link" to={`/app/homeroom/collections?room=${encodeURIComponent(room)}&month=${month}`}>ดูบัญชีปัจจุบัน</Link>
    </div></Panel>
    {query.isPending ? <LoadingState /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : !query.data ? <EmptyState title="ไม่มีข้อมูลเดือนที่เลือก" description="ชุดข้อมูลสาธิตมีเฉพาะตุลาคม 2569" /> : <MonthlyContent key={`${role}-${room}-${month}-${pathname}`} data={query.data} role={role} editable={access.data.editable} listOnly={pathname.endsWith("memos")} />}
  </>;
}

function MonthlyContent({ data, role, editable, listOnly }: { data: MonthlyWorkspace; role: DemoRole; editable: boolean; listOnly: boolean }) {
  const { adapter } = useApp();
  const client = useQueryClient();
  const [preview, setPreview] = useState<MonthlyDraft | null>(null);
  const [refresh, setRefresh] = useState(false);
  const first = debtorRows(data.draft.snapshot)[0] ?? null;
  const [selected, setSelected] = useState<CollectionStudent | null>(first);
  const [draft, setDraft] = useState<FollowupNote>(first ?? { reason: "", solution: "", note: "" });
  const [editingMobile, setEditingMobile] = useState(false);
  const [pendingRow, setPendingRow] = useState<CollectionStudent | null>(null);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const [validated, setValidated] = useState(false);
  const batch = data.draft;
  const rows = debtorRows(batch.snapshot), missing = rows.filter(missingFollowup);
  const changed = financialKey(batch.snapshot) !== financialKey(data.live);
  const errors = followupErrors(draft);
  const dirty = !!selected && (["reason", "solution", "note"] as const).some(k => selected[k] !== draft[k]);
  const invalidate = () => client.invalidateQueries({ queryKey: ["monthly-workspace"] });
  const close = () => { if (dirty) setDiscard(true); else setEditingMobile(false); };
  function edit(row: CollectionStudent) {
    if (dirty && row.id !== selected?.id) { setPendingRow(row); setDiscard(true); return; }
    if (dirty) { setEditingMobile(window.matchMedia("(max-width: 767px)").matches); return; }
    setSelected(row); setDraft(row); setEditingMobile(window.matchMedia("(max-width: 767px)").matches); setError(""); setValidated(false);
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setValidated(true);
    if (!selected || busy || Object.keys(errors).length) return;
    setBusy(true); setError("");
    try {
      const result = await adapter.saveMonthlyNote({ room: batch.snapshot.room, month: batch.snapshot.month, studentId: selected.id, expectedVersion: selected.version, revision: batch.revision, ...draft }, role);
      await invalidate(); setSelected(result); setDraft(result); setSaved("บันทึกการติดตามแล้ว");
    } catch (e) { setError(e instanceof Error ? e.message : "ไม่สามารถบันทึกได้"); await invalidate(); }
    finally { setBusy(false); }
  }
  async function confirmRefresh() {
    if (busy) return;
    setBusy(true); setError("");
    try { const next = await adapter.refreshMonthly(batch.snapshot.room, batch.snapshot.month, batch.revision, batch.version, financialKey(data.live), role); await invalidate(); const row = debtorRows(next.snapshot).find(s => s.id === selected?.id) ?? debtorRows(next.snapshot)[0] ?? null; setSelected(row); setDraft(row ?? { reason: "", solution: "", note: "" }); setEditingMobile(false); setRefresh(false); setSaved("ปรับข้อมูลฉบับร่างแล้ว โดยเก็บเวอร์ชันเดิมไว้"); }
    catch (e) { setError(e instanceof Error ? e.message : "ไม่สามารถปรับข้อมูลได้"); await invalidate(); }
    finally { setBusy(false); }
  }
  const current = batch.snapshot.students.find(s => s.id === selected?.id);
  const editor = selected && <form onSubmit={save} className="space-y-5" noValidate>
    <div><h2>บันทึกการติดตาม</h2><p className="text-sm text-secondary mt-1">{selected.name} · {selected.code}</p></div>
    <div><p className="text-sm text-secondary">ยอดค้าง ณ วันที่จัดทำข้อมูล · อ่านอย่างเดียว</p><p className="text-xl"><Money value={selected.outstanding} /></p></div>
    {([ ["reason", "สาเหตุการค้างชำระ"], ["solution", "แนวทางแก้ไข / ความต้องการผู้ปกครอง"] ] as const).map(([key, label]) => <Field key={key} id={`monthly-${key}`} label={label} error={validated ? errors[key] : undefined}><textarea id={`monthly-${key}`} rows={4} value={draft[key]} readOnly={!editable} disabled={busy} aria-invalid={validated && !!errors[key]} aria-describedby={errors[key] && validated ? `monthly-${key}-error` : undefined} onChange={e => setDraft({ ...draft, [key]: e.target.value })} /></Field>)}
    <details><summary>บันทึกเพิ่มเติม (ไม่บังคับ)</summary><div className="mt-3"><Field id="monthly-note" label="บันทึกเพิ่มเติม" error={validated ? errors.note : undefined}><textarea id="monthly-note" rows={3} value={draft.note} readOnly={!editable} disabled={busy} aria-invalid={validated && !!errors.note} aria-describedby={errors.note && validated ? "monthly-note-error" : undefined} onChange={e => setDraft({ ...draft, note: e.target.value })} /></Field></div></details>
    <p className="text-xs text-secondary">บันทึกฉบับร่างที่กรอกไม่ครบได้ สาเหตุ/แนวทางแก้ไขช่องละไม่เกิน 1,000 ตัวอักษร บันทึกเพิ่มเติม 2,000 ตัวอักษร</p>
    <p className="text-xs text-secondary">ข้อมูลการเงิน ณ {dateLabel(batch.snapshot.asOf)} {batch.snapshot.asOf.slice(11, 16)} น. · v{batch.revision}</p>
    {error && <Alert tone="danger">{error}</Alert>}
    {current && current.version !== selected.version && <Alert tone="warning" title="บันทึกปัจจุบันเปลี่ยนแปลง"><p>{current.reason || "ยังไม่บันทึก"} / {current.solution || "ยังไม่บันทึก"}</p><Button variant="secondary" onClick={() => { setSelected(current); setDraft(current); setError(""); }}>โหลดบันทึกปัจจุบันแทนฉบับร่าง</Button></Alert>}
    <div className="homeroom-save"><Button type="submit" className="w-full" busy={busy} disabled={!editable || !dirty || data.live.stale || current?.version !== selected.version}>บันทึกฉบับร่าง</Button>
      {dirty && <Button variant="ghost" className="w-full mt-2" disabled={busy} onClick={() => { setDraft(selected); setError(""); }}>ยกเลิกการแก้ไข</Button>}
      <p className="text-xs text-secondary mt-2" role="status">{dirty ? "มีการแก้ไขที่ยังไม่บันทึก" : selected.savedAt ? `บันทึกแล้ว ${dateLabel(selected.savedAt)} · v${selected.version}` : "ยังไม่บันทึก"}</p>
    </div>
  </form>;
  return <>
    <UnsavedChangesGuard dirty={dirty} locked={busy} protectSearch lockedDescription="กรุณารอผลการบันทึกก่อนเปลี่ยนหน้า" />
    {listOnly && <div className="mb-6"><ResponsiveRows label="ทะเบียนบันทึกข้อความ" rows={[batch, ...data.history]} rowKey={v => `${v.id}-${v.revision}`} columns={[
      { label: "เดือน / ห้อง", value: v => `${v.snapshot.month} · ${v.snapshot.room}` },
      { label: "ครูที่ปรึกษา", value: v => v.teacher },
      { label: "แหล่งข้อมูล / เวอร์ชัน", value: v => `${v.id} · v${v.revision} · ${v.snapshot.asOf}` },
      { label: "สถานะเอกสาร", value: v => v.revision === batch.revision ? "ฉบับร่าง · ยังไม่มีแม่แบบ" : "เวอร์ชันก่อนหน้า · อ่านอย่างเดียว" },
      { label: "ขั้นตอนกระดาษ", value: () => "ครูที่ปรึกษา · ยังไม่ส่ง" },
      { label: "รายละเอียด", value: v => <Button variant="secondary" onClick={() => setPreview(v)}>ดูรายละเอียด v{v.revision}</Button> },
    ]} /><Link className="btn btn-secondary mt-4" to={`/app/monthly-followup?room=${encodeURIComponent(batch.snapshot.room)}&month=${batch.snapshot.month}`}>สร้างบันทึกจากข้อมูลรายเดือน</Link></div>}
    <div className="flex flex-wrap items-center gap-3 mb-6"><Badge>ฉบับร่าง v{batch.revision}</Badge><span className="text-sm text-secondary">ข้อมูล ณ {dateLabel(batch.snapshot.asOf)} {batch.snapshot.asOf.slice(11, 16)} น.</span><Button variant="secondary" onClick={() => setPreview(batch)}>ดูตัวอย่างบันทึกข้อความ</Button><Button disabled>ดาวน์โหลด DOCX · ยังไม่มีแม่แบบ</Button></div>
    <div className="mb-6"><Alert>ข้อมูลการเงินถูกตรึงตามเวอร์ชัน การชำระใหม่จะไม่เปลี่ยนฉบับร่างโดยอัตโนมัติ · G04 ยังไม่มีแม่แบบจริง</Alert></div>
    {data.live.stale && <div className="mb-6"><Alert tone="warning">ข้อมูลต้นทางล้าสมัย กรุณาตรวจสอบก่อนบันทึก</Alert></div>}
    {changed && <div className="mb-6"><Alert tone="warning" title="มีข้อมูลการชำระใหม่หลังจัดทำข้อมูล"><Button variant="secondary" disabled={!editable || data.live.stale || dirty} onClick={() => { setError(""); setRefresh(true); }}>ตรวจสอบข้อมูลใหม่</Button>{dirty && <p>บันทึกหรือยกเลิกข้อความที่แก้ไขก่อนปรับฉบับร่าง</p>}</Alert></div>}
    {!listOnly && <>
    <RoomMetrics data={batch.snapshot} />
    <Panel className="mb-6"><h2>ความพร้อมของบันทึกข้อความ</h2><p className="mt-2">{missing.length ? `ยังไม่บันทึก ${missing.length} คน` : "ข้อมูลการติดตามครบ · รอแม่แบบจริงก่อนสร้างเอกสาร"}</p><div className="flex flex-wrap gap-2 mt-3">{missing.map(row => <Button key={row.id} variant="ghost" onClick={() => edit(row)}>{row.name} · ยังไม่บันทึก</Button>)}</div><p role="status" className="mt-2">{saved}</p></Panel>
    <div className="homeroom-grid"><Panel><ResponsiveRows label="นักเรียนในฉบับร่างรายเดือน" rows={rows} rowKey={s => s.id} columns={[
      { label: "นักเรียน / รหัส", value: s => <>{s.name}<div className="table-sub">{s.code}</div></> },
      { label: "ยอดค้าง ณ จัดทำ", value: s => <Money value={s.outstanding} /> },
      { label: "การติดตาม", value: s => <Badge tone={missingFollowup(s) ? "warning" : "success"}>{missingFollowup(s) ? "ยังไม่บันทึก" : "บันทึกแล้ว"}</Badge> },
      { label: "ดำเนินการ", value: s => <Button variant="secondary" onClick={() => edit(s)} aria-label={`บันทึกรายเดือน ${s.name}`}>{editable ? "บันทึกการติดตาม" : "ดูข้อมูล"}</Button> },
    ]} /></Panel><Panel className="homeroom-desktop-editor">{!editingMobile && editor}</Panel></div>
    </>}
    <Panel className="mt-6"><h2>สถานะเอกสารและขั้นตอนกระดาษ</h2><ol className="space-y-3 mt-4">{PAPER_STAGES.map((stage, i) => <li key={stage}>{i + 1}. {stage} {i === 0 ? "· ฉบับร่าง" : "· ยังไม่ส่ง"}</li>)}</ol><div className="mt-4"><Alert>G12 รอยืนยันผู้มีสิทธิ์บันทึกขั้นตอนและนโยบายเก็บรักษา จึงยังเปลี่ยนสถานะกระดาษไม่ได้ ไม่มีการลงนามอิเล็กทรอนิกส์</Alert></div></Panel>
    {!!data.history.length && <Panel className="mt-6"><h2>เวอร์ชันก่อนหน้า · อ่านอย่างเดียว</h2>{data.history.map(version => <Button key={version.revision} variant="ghost" onClick={() => setPreview(version)}>ดู v{version.revision} · <Money value={version.snapshot.totals.outstanding} /></Button>)}</Panel>}
    <Overlay open={editingMobile} onClose={close} title="บันทึกการติดตามรายเดือน" drawer busy={busy}>{editingMobile && editor}</Overlay>
    <Overlay open={discard} onClose={() => { setDiscard(false); setPendingRow(null); }} title="มีการแก้ไขที่ยังไม่บันทึก" footer={<><Button variant="secondary" onClick={() => { setDiscard(false); setPendingRow(null); }}>แก้ไขต่อ</Button><Button variant="danger" onClick={() => { if (pendingRow) { setSelected(pendingRow); setDraft(pendingRow); setEditingMobile(window.matchMedia("(max-width: 767px)").matches); } else { if (selected) setDraft(selected); setEditingMobile(false); } setPendingRow(null); setDiscard(false); }}>ทิ้งการแก้ไข</Button></>}><p>ออกโดยไม่บันทึกข้อความนี้</p></Overlay>
    <Overlay open={refresh} onClose={() => setRefresh(false)} title="ตรวจสอบส่วนต่างก่อนปรับฉบับร่าง" busy={busy} footer={<Button busy={busy} onClick={() => void confirmRefresh()}>ยืนยันสร้างเวอร์ชันใหม่</Button>}>
      <DetailList items={[
        { label: "ชำระครบ ก่อน → หลัง", value: `${batch.snapshot.totals.settled} → ${data.live.totals.settled}` },
        { label: "ค้างชำระ ก่อน → หลัง", value: `${batch.snapshot.totals.debtors} → ${data.live.totals.debtors}` },
        { label: "ยอดค้าง ก่อน → หลัง", value: <><Money value={batch.snapshot.totals.outstanding} /> → <Money value={data.live.totals.outstanding} /></> },
        { label: "ออกจากรายชื่อค้างชำระ", value: rows.filter(row => !debtorRows(data.live).some(s => s.id === row.id)).map(s => s.name).join(", ") || "ไม่มี" },
        { label: "เพิ่มในรายชื่อค้างชำระ", value: debtorRows(data.live).filter(row => !rows.some(s => s.id === row.id)).map(s => s.name).join(", ") || "ไม่มี" },
      ]} /><p className="mt-4">เก็บข้อความของนักเรียนที่ตรงกันและเก็บเวอร์ชันเดิมแบบอ่านอย่างเดียว</p>{error && <Alert tone="danger">{error}</Alert>}
    </Overlay>
    <Overlay open={!!preview} onClose={() => setPreview(null)} title="ตัวอย่างข้อมูล · ยังไม่ใช่เอกสารพร้อมส่ง" drawer>
      {preview && <><DetailList items={[{ label: "เดือน", value: preview.snapshot.month }, { label: "ห้อง", value: preview.snapshot.room }, { label: "ครูที่ปรึกษา", value: preview.teacher }, { label: "ภาคเรียน / ปีการศึกษา", value: `${preview.snapshot.term}/${preview.snapshot.academicYear}` }, { label: "แหล่งข้อมูล", value: `${preview.id} · v${preview.revision} · ${preview.snapshot.asOf}` }]} /><div className="mt-6"><RoomMetrics data={preview.snapshot} /></div><h3>ภาคผนวกการติดตาม</h3>{debtorRows(preview.snapshot).map(s => <article key={s.id} className="py-4 border-b border-border"><h4>{s.name} · {s.code}</h4><Money value={s.outstanding} /><p>สาเหตุ: {s.reason || "ยังไม่บันทึก"}</p><p>แนวทางแก้ไข: {s.solution || "ยังไม่บันทึก"}</p><p>เพิ่มเติม: {s.note || "ยังไม่บันทึก"}</p></article>)}<Alert>G04 ยังไม่มีแม่แบบ DOCX จริง การแสดงตัวอย่างไม่ใช่การสร้างไฟล์หรืออนุมัติเอกสาร</Alert></>}
    </Overlay>
  </>;
}
