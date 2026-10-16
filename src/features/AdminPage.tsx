import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScopedQuery as useQuery } from "../app/AppProvider";
import { useApp } from "../app/AppProvider";
import { Alert, Badge, Button, DetailList, EmptyState, Field, LoadingState, Overlay, PageHeader, Panel, QueryError } from "../components/ui";
import { ResponsiveRows } from "../components/WorkspaceUI";
import { UnsavedChangesGuard } from "../components/UnsavedChangesGuard";
import { ROLE_LABELS, type StaffAccess } from "../domain/workspace";
import type { DemoRole } from "../domain/model";

export default function AdminPage() {
  const { role } = useApp();
  return ["superadmin", "executive"].includes(role) ? <Users /> : <EmptyState title="ไม่มีสิทธิ์ดูข้อมูลผู้ใช้งาน" description="ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์ที่เหมาะสม" />;
}
function Users() {
  const { adapter, role } = useApp(), client = useQueryClient();
  const query = useQuery({ queryKey: ["staff-access", role], queryFn: ({ signal }) => adapter.staffAccess(role, signal) });
  const [search, setSearch] = useState(""), [filterRole, setFilterRole] = useState("all"), [active, setActive] = useState("all"), [applied, setApplied] = useState({ search: "", role: "all", active: "all" });
  const [selected, setSelected] = useState<StaffAccess | null>(null), [draft, setDraft] = useState<StaffAccess | null>(null), [reason, setReason] = useState(""), [review, setReview] = useState(false), [discard, setDiscard] = useState(false), [error, setError] = useState(""), [busy, setBusy] = useState(false), [saved, setSaved] = useState("");
  const writable = role === "superadmin";
  const dirty = !!draft && !!selected && (draft.role !== selected.role || draft.active !== selected.active || draft.rooms.join() !== selected.rooms.join() || !!reason);
  function open(user: StaffAccess) { setSelected(user); setDraft(structuredClone(user)); setReason(""); setError(""); }
  function close() { if (dirty) setDiscard(true); else { setSelected(null); setDraft(null); } }
  function check(event: FormEvent) { event.preventDefault(); if (!reason.trim() || reason.length > 1000) { setError("ระบุเหตุผลการเปลี่ยนสิทธิ์ ไม่เกิน 1,000 ตัวอักษร"); return; } setError(""); setReview(true); }
  async function save() {
    if (!draft || !selected || busy) return;
    setBusy(true); setError("");
    try { await adapter.changeAccess(draft, selected.version, reason, role); setReview(false); setSelected(null); setDraft(null); setSaved("บันทึกสิทธิ์แล้ว · ล้างข้อมูลตามขอบเขตเดิมและตรวจสอบตัวตนอีกครั้ง"); await client.cancelQueries(); client.clear(); }
    catch (e) { setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ"); setReview(false); setBusy(false); await query.refetch(); }
    finally { setBusy(false); }
  }
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <QueryError onRetry={() => void query.refetch()} />;
  const rows = query.data.filter(s => s.name.includes(applied.search) && (applied.role === "all" || s.role === applied.role) && (applied.active === "all" || s.active === (applied.active === "active")));
  const current = query.data.find(s => s.uid === selected?.uid);
  return <>
    <UnsavedChangesGuard dirty={dirty} locked={busy} lockedDescription="กรุณารอผลการเปลี่ยนสิทธิ์ก่อนออก" />
    <PageHeader eyebrow="ACCESS ADMINISTRATION" title="ผู้ใช้งานและสิทธิ์" description="ข้อมูลบุคลากรมาจากระบบต้นทาง · จำลอง T-Folio และ SchoolPay RBAC" />
    <Panel className="mb-6"><form className="homeroom-filters" onSubmit={e => { e.preventDefault(); setApplied({ search, role: filterRole, active }); }}><Field id="users-search" label="ค้นหาชื่อ"><input id="users-search" value={search} onChange={e => setSearch(e.target.value)} /></Field><Field id="users-role" label="บทบาท"><select id="users-role" value={filterRole} onChange={e => setFilterRole(e.target.value)}><option value="all">ทั้งหมด</option>{Object.entries(ROLE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field><Field id="users-active" label="สถานะ"><select id="users-active" value={active} onChange={e => setActive(e.target.value)}><option value="all">ทั้งหมด</option><option value="active">ใช้งาน</option><option value="inactive">ระงับ</option></select></Field><Button type="submit">ค้นหา</Button></form></Panel>
    <p role="status" className="mb-4">{saved}</p>
    {!rows.length ? <EmptyState title="ไม่พบผู้ใช้งานในตัวกรองนี้" description="ปรับชื่อ บทบาท หรือสถานะ แล้วค้นหาอีกครั้ง" /> : <ResponsiveRows label="ผู้ใช้งานและสิทธิ์" rows={rows} rowKey={s => s.uid} columns={[{ label: "ชื่อ", value: s => s.name }, { label: "บทบาท", value: s => ROLE_LABELS[s.role] }, { label: "ห้อง", value: s => s.rooms.join(", ") || "—" }, { label: "สถานะ", value: s => <Badge tone={s.active ? "success" : "warning"}>{s.active ? "ใช้งาน" : "ระงับ"}</Badge> }, { label: "กิจกรรมล่าสุด", value: () => "—" }, { label: "ดำเนินการ", value: s => <Button variant="secondary" onClick={() => open(s)} aria-label={`${writable ? "จัดการสิทธิ์" : "ดูสิทธิ์"} ${s.name}`}>{writable ? "จัดการสิทธิ์" : "ดูสิทธิ์"}</Button> }]} />}
    <Overlay open={!!selected} onClose={close} title={writable ? "จัดการสิทธิ์" : "ดูสิทธิ์"} drawer busy={busy}>
      {draft && selected && <form onSubmit={check} className="space-y-5" noValidate><DetailList items={[{ label: "ชื่อ", value: draft.name }, { label: "ตัวตนต้นทาง", value: draft.uid }, { label: "แหล่งข้อมูล", value: draft.source }, { label: "เวอร์ชัน", value: String(selected.version) }]} />
        <Field id="access-role" label="บทบาทที่กำหนด"><select id="access-role" value={draft.role} disabled={!writable || busy} onChange={e => setDraft({ ...draft, role: e.target.value as DemoRole, rooms: e.target.value === "homeroom_teacher" ? draft.rooms : [] })}>{Object.entries(ROLE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field>
        <label className="flex items-center gap-3 min-h-11"><input type="checkbox" checked={draft.active} disabled={!writable || busy} onChange={e => setDraft({ ...draft, active: e.target.checked })} />เปิดใช้งานบุคลากร</label>
        <fieldset disabled={!writable || busy || draft.role !== "homeroom_teacher"}><legend>ห้องที่รับผิดชอบ</legend><label className="flex items-center gap-3 min-h-11"><input type="checkbox" checked={draft.rooms.includes("ม.2/1")} onChange={e => setDraft({ ...draft, rooms: e.target.checked ? ["ม.2/1"] : [] })} />ม.2/1</label><p className="text-xs text-secondary">ชุดสาธิตมีเฉพาะห้องนี้</p></fieldset>
        <Alert>สิทธิ์เสริมรับเงินอื่น/VOID/ออกเล่ม/ค่าธรรมเนียม และบันทึกขั้นตอนกระดาษ ต้องมีนโยบายรองรับ G06/G12 จึงไม่มีสวิตช์ข้ามนโยบายในหน้านี้</Alert>
        {selected.rooms.some(r => !draft.rooms.includes(r)) && <Alert tone="warning">กำลังนำสิทธิ์ดูห้องเดิมออก ข้อมูลที่เปิดตามสิทธิ์เดิมจะถูกล้าง</Alert>}
        {writable && <Field id="access-reason" label="เหตุผลการเปลี่ยนสิทธิ์" required><textarea id="access-reason" value={reason} maxLength={1000} disabled={busy} onChange={e => setReason(e.target.value)} /></Field>}
        {current && current.version !== selected.version && <Alert tone="warning" title="สิทธิ์ปัจจุบันเปลี่ยนแปลง"><p>{ROLE_LABELS[current.role]} · {current.rooms.join() || "ไม่มีห้อง"} · v{current.version}</p><p>ฉบับร่างยังอยู่ กรุณาโหลดเวอร์ชันปัจจุบันแล้วตรวจสอบใหม่</p><Button variant="secondary" onClick={() => { setSelected(current); setReview(false); setError(""); }}>ใช้เวอร์ชันปัจจุบันเพื่อตรวจสอบใหม่</Button></Alert>}
        {error && <Alert tone="danger">{error}</Alert>}
        {writable && <Button type="submit" disabled={!dirty || busy}>ตรวจสอบการเปลี่ยนสิทธิ์</Button>}
      </form>}
    </Overlay>
    <Overlay open={review} onClose={() => setReview(false)} title="ตรวจสอบส่วนต่างของสิทธิ์" busy={busy} footer={<Button busy={busy} onClick={() => void save()}>ยืนยันเปลี่ยนสิทธิ์</Button>}>
      {selected && draft && <DetailList items={[{ label: "บุคลากร", value: draft.name }, { label: "บทบาทเดิม → ใหม่", value: `${ROLE_LABELS[selected.role]} → ${ROLE_LABELS[draft.role]}` }, { label: "สถานะเดิม → ใหม่", value: `${selected.active ? "ใช้งาน" : "ระงับ"} → ${draft.active ? "ใช้งาน" : "ระงับ"}` }, { label: "ห้องเดิม → ใหม่", value: `${selected.rooms.join() || "—"} → ${draft.rooms.join() || "—"}` }, { label: "จำนวนห้องที่ได้รับผลกระทบ", value: new Set([...selected.rooms, ...draft.rooms]).size }, { label: "เหตุผล", value: reason }]} />}
    </Overlay>
    <Overlay open={discard} onClose={() => setDiscard(false)} title="มีการแก้ไขที่ยังไม่บันทึก" footer={<><Button variant="secondary" onClick={() => setDiscard(false)}>แก้ไขต่อ</Button><Button variant="danger" onClick={() => { setDraft(null); setSelected(null); setDiscard(false); }}>ทิ้งการแก้ไข</Button></>}><p>การปิดจะยกเลิกฉบับร่างการเปลี่ยนสิทธิ์</p></Overlay>
  </>;
}
