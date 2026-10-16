import { useState } from "react";
import { useScopedQuery as useQuery } from "../app/AppProvider";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../app/AppProvider";
import { Alert, Badge, Button, DetailList, EmptyState, Field, LoadingState, Money, Overlay, PageHeader, Panel, QueryError } from "../components/ui";
import { ResponsiveRows, RoomMetrics } from "../components/WorkspaceUI";
import type { CollectionStudent } from "../domain/model";
export default function RoomPage() {
  const { adapter, role } = useApp();
  const [params, setParams] = useSearchParams();
  const room = params.get("room") ?? "ม.2/1", filter = params.get("status") ?? "all";
  const [selected, setSelected] = useState<CollectionStudent | null>(null);
  const access = useQuery({ queryKey: ["homeroom-access", role], queryFn: ({ signal }) => adapter.homeroomAccess(role, signal) });
  const query = useQuery({ queryKey: ["monthly-collections", role, room, "2026-10"], queryFn: ({ signal }) => adapter.monthlyCollections(room, "2026-10", role, signal), enabled: !!access.data?.rooms.includes(room) });
  if (access.isPending) return <LoadingState />;
  if (access.isError) return <QueryError onRetry={() => void access.refetch()} />;
  if (!access.data.rooms.includes(room)) return <EmptyState title={access.data.rooms.length ? "ไม่มีสิทธิ์ดูข้อมูลห้องนี้" : "ยังไม่ได้รับมอบหมายห้อง"} description="กรุณาติดต่อผู้ดูแลระบบโรงเรียน" />;
  return <><PageHeader eyebrow="ASSIGNED ROOMS" title="ห้องที่รับผิดชอบ" description="ภาคเรียน 1 / ปีการศึกษา 2569 · ข้อมูลบัญชีปัจจุบัน" action={<Link className="btn btn-primary" to={`/app/monthly-followup?room=${encodeURIComponent(room)}&month=2026-10`}>ติดตามรายเดือน</Link>} />
    <Panel className="mb-6"><div className="homeroom-filters"><Field id="roster-room" label="ห้องที่รับผิดชอบ"><select id="roster-room" value={room} onChange={e => setParams({ room: e.target.value, status: filter })}>{access.data.rooms.map(r => <option key={r}>{r}</option>)}</select></Field><Field id="roster-filter" label="สถานะชำระ"><select id="roster-filter" value={filter} onChange={e => setParams({ room, status: e.target.value })}><option value="all">ทั้งหมด</option><option value="owing">ค้างชำระ</option><option value="settled">ชำระครบ</option></select></Field></div></Panel>
    {query.isPending ? <LoadingState /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : query.data ? <>{query.data.stale && <Alert tone="warning">ข้อมูลต้นทางล้าสมัย</Alert>}<RoomMetrics data={query.data} /><ResponsiveRows label="รายชื่อนักเรียนในห้อง" rows={query.data.students.filter(s => filter === "all" || (filter === "owing" ? s.outstanding > 0 : s.outstanding === 0))} rowKey={s => s.id} columns={[{ label: "รหัส / ชื่อ", value: s => <>{s.code}<div>{s.name}</div></> }, { label: "ชำระแล้ว", value: s => <Money value={s.paid} /> }, { label: "คงค้าง", value: s => <Money value={s.outstanding} /> }, { label: "สถานะ", value: s => <Badge tone={s.outstanding ? "warning" : "success"}>{s.outstanding ? "ค้างชำระ" : "ชำระครบ"}</Badge> }, { label: "รายละเอียด", value: s => <Button variant="secondary" onClick={() => setSelected(s)} aria-label={`ดูข้อมูล ${s.name}`}>ดูข้อมูล</Button> }]} /><p className="text-sm text-secondary mt-3">แสดงเฉพาะรายห้อง สูงสุด 40 คน · ข้อมูล ณ {query.data.asOf}</p></> : <EmptyState title="ไม่มีรายชื่อในชุดสาธิต" description="ไม่มีข้อมูลที่พร้อมแสดง" />}
    <Overlay open={!!selected} onClose={() => setSelected(null)} title="ข้อมูลนักเรียน · อ่านอย่างเดียว" drawer>{selected && <><DetailList items={[{ label: "ชื่อ", value: selected.name }, { label: "รหัส", value: selected.code }, { label: "ห้อง", value: room }, { label: "ภาระ", value: <Money value={selected.adjusted} /> }, { label: "ชำระแล้ว", value: <Money value={selected.paid} /> }, { label: "คงค้าง", value: <Money value={selected.outstanding} /> }]} /><Alert>ข้อมูลบัญชีสังเคราะห์เฉพาะรายห้อง ประวัติเล่ม/หน้าที่ไม่ได้เตรียมไว้ไม่พร้อมแสดง ไม่มีการแก้ไขทะเบียนหรือรายการชำระ</Alert></>}</Overlay>
  </>;
}
