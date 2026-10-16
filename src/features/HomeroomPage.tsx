import { useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScopedQuery as useQuery } from "../app/AppProvider";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../app/AppProvider";
import { UnsavedChangesGuard } from "../components/UnsavedChangesGuard";
import { Alert, Badge, Button, EmptyState, Field, LoadingState, Metric, Money, Overlay, PageHeader, Panel, QueryError, SectionTitle } from "../components/ui";
import { dateLabel, DomainError, followupErrors, missingFollowup, type CollectionStudent, type FollowupNote, type HomeroomAccess, type MonthlyCollection } from "../domain/model";

export default function HomeroomPage() {
  const { adapter, role } = useApp();
  const [params, setParams] = useSearchParams();
  const access = useQuery({ queryKey: ["homeroom-access", role], queryFn: ({ signal }) => adapter.homeroomAccess(role, signal) });
  const room = params.get("room") ?? access.data?.rooms[0] ?? "";
  const month = params.get("month") ?? "2026-10";
  const allowed = !!access.data?.rooms.includes(room);
  const collection = useQuery({
    queryKey: ["monthly-collections", role, room, month],
    queryFn: ({ signal }) => adapter.monthlyCollections(room, month, role, signal),
    enabled: allowed,
  });
  const changeFilter = (key: string, value: string) => {
    if (value === (key === "month" ? month : room)) return;
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  };
  if (access.isPending) return <LoadingState />;
  if (access.isError) return <QueryError onRetry={() => void access.refetch()} />;
  if (!access.data.rooms.length) return <EmptyState title="ยังไม่ได้รับมอบหมายห้อง" description="กรุณาติดต่อผู้ดูแลระบบของโรงเรียนเพื่อกำหนดห้องที่รับผิดชอบ" />;
  if (!allowed) return <EmptyState title="ไม่มีสิทธิ์ดูข้อมูลห้องนี้" description="เลือกเฉพาะห้องที่ได้รับมอบหมาย" action={<Button onClick={() => changeFilter("room", access.data.rooms[0])}>กลับห้องที่รับผิดชอบ</Button>} />;
  return <>
    <PageHeader eyebrow="HOMEROOM COLLECTIONS" title="ติดตามการชำระรายเดือน" description={`${room} · ${access.data.teacher}`} />
    <Panel className="mb-6">
      <div className="homeroom-filters">
        <Field id="collection-room" label="ห้องที่รับผิดชอบ"><select id="collection-room" value={room} onChange={e => changeFilter("room", e.target.value)}>{access.data.rooms.map(r => <option key={r}>{r}</option>)}</select></Field>
        <Field id="collection-month" label="เดือน"><input id="collection-month" type="month" value={month} onChange={e => { if (e.target.value) changeFilter("month", e.target.value); }} /></Field>
        <p className="text-sm text-secondary">ภาคเรียน 1 / ปีการศึกษา 2569<br />ข้อมูลสาธิตเฉพาะตุลาคม 2569</p>
      </div>
    </Panel>
    {collection.isPending ? <LoadingState /> : collection.isError ? <QueryError onRetry={() => void collection.refetch()} /> : !collection.data ? <EmptyState title="ไม่มีข้อมูลเดือนที่เลือก" description="ไม่มีรายละเอียดในชุดข้อมูลสาธิต เลือกตุลาคม 2569 เพื่อดูข้อมูลที่เตรียมไว้" /> : <Collections key={`${role}-${room}-${month}`} data={collection.data} access={access.data} />}
  </>;
}

function Collections({ data, access }: { data: MonthlyCollection; access: HomeroomAccess }) {
  const { adapter, role } = useApp();
  const client = useQueryClient();
  const debtors = data.students.filter(s => s.outstanding > 0);
  const [selectedId, setSelectedId] = useState(debtors[0]?.id);
  const selected = data.students.find(s => s.id === selectedId);
  const [draft, setDraft] = useState<FollowupNote>(selected ?? { reason: "", solution: "", note: "" });
  const [base, setBase] = useState(selected);
  const [missingOnly, setMissingOnly] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [validated, setValidated] = useState(false);
  const errors = followupErrors(draft);
  const dirty = !!base && (["reason", "solution", "note"] as const).some(k => draft[k] !== base[k]);
  const missing = debtors.filter(missingFollowup).length;
  const rows = missingOnly ? debtors.filter(missingFollowup) : debtors;
  function request(action: () => void) {
    if (saving.current) return;
    if (dirty) setPending(() => action); else action();
  }
  function choose(row: CollectionStudent, mobile: boolean) {
    request(() => {
      setSelectedId(row.id); setBase(row); setDraft(row); setMobileOpen(mobile);
      setError(""); setConflict(false); setValidated(false); setAnnouncement("");
    });
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setValidated(true);
    if (saving.current || !base || !access.editable || data.stale || conflict || Object.keys(errors).length) return;
    saving.current = true; setBusy(true); setError(""); setAnnouncement("");
    try {
      const saved = await adapter.saveFollowup({ room: data.room, month: data.month, studentId: base.id, expectedVersion: base.version, reason: draft.reason, solution: draft.solution, note: draft.note }, role);
      setDraft(saved); setBase(saved);
      await client.invalidateQueries({ queryKey: ["monthly-collections"] });
      setAnnouncement(saved.savedAt ? `บันทึกการติดตามแล้ว · ${dateLabel(saved.savedAt)} ${saved.savedAt.slice(11, 16)} น.` : "บันทึกการติดตามแล้ว");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ไม่สามารถบันทึกได้ กรุณาลองใหม่");
      setConflict(e instanceof DomainError && e.code === "VERSION_CONFLICT");
      if (e instanceof DomainError && e.code === "VERSION_CONFLICT") await client.invalidateQueries({ queryKey: ["monthly-collections"] });
    } finally { saving.current = false; setBusy(false); }
  }
  const editor = selected && base ? <form onSubmit={save} className="space-y-5" noValidate>
    <div><h2>บันทึกการติดตาม</h2><p className="text-sm text-secondary mt-1">{selected.name} · {selected.code}</p></div>
    <div><p className="text-sm text-secondary">ยอดค้างชำระ · อ่านอย่างเดียว</p><p className="text-xl font-semibold"><Money value={selected.outstanding} /></p></div>
    {!access.editable && <Alert>บทบาทนี้ดูข้อมูลได้เท่านั้น</Alert>}
    {([ ["reason", "สาเหตุการค้างชำระ"], ["solution", "แนวทางแก้ไข / ความต้องการผู้ปกครอง"] ] as const).map(([key, label]) => <Field key={key} id={`followup-${key}`} label={label} error={validated ? errors[key] : undefined}>
      <textarea id={`followup-${key}`} rows={4} value={draft[key]} readOnly={!access.editable} disabled={busy} aria-invalid={validated && !!errors[key]} aria-describedby={validated && errors[key] ? `followup-${key}-error` : undefined} onChange={e => { setDraft({ ...draft, [key]: e.target.value }); setAnnouncement(""); }} />
    </Field>)}
    <details><summary>บันทึกเพิ่มเติม (ไม่บังคับ)</summary><div className="mt-3"><Field id="followup-note" label="บันทึกเพิ่มเติม" error={validated ? errors.note : undefined}><textarea id="followup-note" rows={3} value={draft.note} readOnly={!access.editable} disabled={busy} aria-invalid={validated && !!errors.note} aria-describedby={validated && errors.note ? "followup-note-error" : undefined} onChange={e => { setDraft({ ...draft, note: e.target.value }); setAnnouncement(""); }} /></Field></div></details>
    <p className="text-xs text-muted">สาเหตุ / แนวทางแก้ไขไม่เกินช่องละ 1,000 ตัวอักษร บันทึกเพิ่มเติมไม่เกิน 2,000 ตัวอักษร บันทึกฉบับร่างที่ยังกรอกไม่ครบได้</p>
    <p className="text-xs text-muted">ข้อมูลการเงิน ณ {dateLabel(data.asOf)} {data.asOf.slice(11, 16)} น. · ยอดรวมจากบัญชีปัจจุบัน</p>
    {error && <Alert tone="danger">{error}</Alert>}
    {conflict && <Alert title="บันทึกปัจจุบัน"><p>สาเหตุ: {selected.reason || "ยังไม่บันทึก"}</p><p>แนวทางแก้ไข: {selected.solution || "ยังไม่บันทึก"}</p><p>เพิ่มเติม: {selected.note || "ยังไม่บันทึก"}</p><p>ฉบับร่างของคุณยังอยู่ในช่องกรอกด้านบน</p></Alert>}
    {conflict && <Button variant="secondary" onClick={() => request(() => { const current = data.students.find(s => s.id === selectedId); if (current) { setBase(current); setDraft(current); setConflict(false); setError(""); } })}>โหลดบันทึกปัจจุบันแทนฉบับร่าง</Button>}
    <div className="homeroom-save"><Button type="submit" className="w-full" busy={busy} disabled={!access.editable || data.stale || !dirty || conflict}>บันทึกการติดตาม</Button>
      <p className="text-xs text-secondary mt-2" role="status" aria-live="polite">{announcement || (dirty ? "มีการแก้ไขที่ยังไม่บันทึก" : base.savedAt ? `บันทึกแล้ว ${dateLabel(base.savedAt)} · v${base.version}` : "ยังไม่บันทึก")}</p>
    </div>
  </form> : null;
  const status = (row: CollectionStudent) => <Badge tone={missingFollowup(row) ? "warning" : "success"}>{missingFollowup(row) ? "ยังไม่บันทึก" : "บันทึกแล้ว"}</Badge>;
  return <>
    <UnsavedChangesGuard dirty={dirty} locked={busy} protectSearch lockedDescription="กำลังบันทึกการติดตาม กรุณารอผลการบันทึกก่อนเปลี่ยนหน้า" />
    {data.stale && <div className="mb-6"><Alert tone="warning" title="ข้อมูลต้นทางล้าสมัย">ตรวจสอบทะเบียนกับผู้ดูแลระบบก่อนบันทึก ข้อความที่แก้ไขยังอยู่ในหน้านี้</Alert></div>}
    <div className="homeroom-metrics grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6" aria-label="สรุปห้องเรียน">
      <Metric label="นักเรียนทั้งหมด" value={`${data.totals.students} คน`} />
      <Metric label="ชำระครบ" value={`${data.totals.settled} คน`} />
      <Metric label="ค้างชำระ" value={`${data.totals.debtors} คน`} />
      <Metric label="ยอดค้างรวม" value={<Money value={data.totals.outstanding} />} caption="ยอดบัญชีปัจจุบัน · อ่านอย่างเดียว" />
    </div>
    <div className="homeroom-grid">
      <Panel className="min-w-0">
        <SectionTitle title={`นักเรียนค้างชำระ ${debtors.length} คน`} />
        <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="สถานะการติดตาม">
          <Button variant={missingOnly ? "secondary" : "primary"} aria-pressed={!missingOnly} onClick={() => setMissingOnly(false)}>ทั้งหมด {debtors.length}</Button>
          <Button variant={missingOnly ? "primary" : "secondary"} aria-pressed={missingOnly} onClick={() => setMissingOnly(true)}>ยังไม่บันทึก {missing}</Button>
        </div>
        {!rows.length ? <EmptyState title="ไม่มีนักเรียนในตัวกรองนี้" description="เลือกทั้งหมดเพื่อดูรายการค้างชำระ" /> : <>
          <div className="desktop-only"><table className="data-table homeroom-table"><caption className="sr-only">รายชื่อนักเรียนค้างชำระและสถานะการติดตาม</caption><thead><tr><th scope="col">นักเรียน / รหัส</th><th scope="col" className="amount">ยอดค้าง</th><th scope="col">การติดตาม</th><th scope="col">ดำเนินการ</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className={row.id === selectedId ? "selected-row" : undefined}><th scope="row"><span className="font-medium">{row.name}</span><span className="table-sub">{row.code}</span></th><td className="amount"><Money value={row.outstanding} /></td><td>{status(row)}</td><td><Button variant="ghost" aria-label={`ดูบันทึก ${row.name}`} aria-pressed={row.id === selectedId} onClick={() => choose(row, false)}>ดูบันทึก</Button></td></tr>)}</tbody></table></div>
          <div className="mobile-only">{rows.map(row => <article key={row.id} className="fee-mobile-card space-y-3"><div><h3>{row.name}</h3><p className="text-sm text-secondary">{row.code}</p></div><div className="flex items-center justify-between gap-2"><Money value={row.outstanding} />{status(row)}</div><Button variant="secondary" className="w-full" aria-label={`ดูบันทึก ${row.name}`} onClick={() => choose(row, true)}>ดูบันทึก</Button></article>)}</div>
        </>}
        <p className="text-xs text-muted mt-4">ข้อความติดตามหรือคำขอแบ่งชำระไม่มีผลต่อยอดเงิน</p>
      </Panel>
      <Panel className="homeroom-desktop-editor">{!mobileOpen && editor}</Panel>
    </div>
    <Overlay open={mobileOpen} onClose={() => request(() => { setMobileOpen(false); if (base) setDraft(base); })} title="บันทึกการติดตาม" description="แก้ไขเฉพาะข้อมูลการติดตามของครู" drawer busy={busy}>{mobileOpen && editor}</Overlay>
    <Overlay open={!!pending} onClose={() => setPending(null)} title="มีการแก้ไขที่ยังไม่บันทึก" footer={<><Button variant="secondary" onClick={() => setPending(null)}>แก้ไขต่อ</Button><Button variant="danger" onClick={() => { pending?.(); setPending(null); }}>ทิ้งการแก้ไข</Button></>}><p>การเปลี่ยนรายการจะยกเลิกข้อความที่ยังไม่บันทึก</p></Overlay>
  </>;
}
