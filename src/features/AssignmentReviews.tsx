import { useCapability } from "../app/AppProvider";
import { useState } from "react";
import { useScopedQuery as useQuery } from "../app/AppProvider";
import { useApp } from "../app/AppProvider";
import { Alert, Button, DetailList, EmptyState, LoadingState, Money, Overlay, Panel, QueryError } from "../components/ui";
import { ResponsiveRows } from "../components/WorkspaceUI";

export function GenerationReview({ id }: { id: string }) {
  const { adapter, role } = useApp();
  const writable = useCapability("obligation.generate");
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const query = useQuery({ queryKey: ["generation-preview", role, id], queryFn: ({ signal }) => adapter.previewGeneration(id, role, signal), enabled: open });
  async function confirm() { if (busy) return; setBusy(true); try { const result = await adapter.generate(id, role); setMessage(`สร้าง ${result.created} รายการ · ข้าม ${result.skipped} รายการที่มีอยู่แล้ว ไม่มีการรับเงินหรือยกหนี้`); } catch (e) { setMessage(e instanceof Error ? e.message : "สร้างภาระไม่สำเร็จ"); } finally { setBusy(false); } }
  return <><Button variant="secondary" className="mt-4" onClick={() => { setMessage(""); setOpen(true); void query.refetch(); }}>ตรวจสอบการสร้างภาระ</Button>
    <Overlay open={open} onClose={() => setOpen(false)} title="ตรวจสอบขอบเขตก่อนสร้างภาระ" busy={busy}>
      {query.isPending ? <LoadingState /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : query.data && <><DetailList items={[{ label: "ห้อง / เวอร์ชัน", value: `${query.data.room} · v${query.data.version}` }, { label: "จำนวนตามชุดภาระ", value: `${query.data.students} คน` }, { label: "ต่อคน", value: <Money value={query.data.perStudent} /> }, { label: "ประมาณการทั้งห้อง", value: <Money value={query.data.total} /> }, { label: "ภาระเดิมที่จะข้าม", value: `${query.data.existing} คน` }]} />{query.data.issues.map(issue => <div key={issue} className="mt-4"><Alert tone="warning">{issue}</Alert></div>)}<p className="text-sm text-secondary mt-4">การเผยแพร่ไม่สร้างหนี้อัตโนมัติ ข้อมูลต้นทางไม่อนุมานคุณสมบัติรายปี/ครั้งเดียวจากนาฬิกา</p>{message && <p role="status" className="mt-4">{message}</p>}<Button className="mt-4" busy={busy} disabled={!writable || !!query.data.issues.length} onClick={() => void confirm()}>สร้างภาระชำระ</Button></>}
    </Overlay></>;
}
export function LifecycleReviews() {
  const { adapter, role } = useApp();
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ["lifecycle", role], queryFn: ({ signal }) => adapter.lifecycleReviews(role, signal), enabled: open });
  return <Panel className="mt-6"><h2>ทบทวนการเปลี่ยนสถานะจากต้นทาง</h2><p className="text-sm text-secondary my-3">รายการรอตรวจสอบ ไม่เปลี่ยนทะเบียนห้องหรือยอดเงินปัจจุบัน ไม่มีการยกหนี้อัตโนมัติ</p><Button variant="secondary" onClick={() => setOpen(!open)} aria-expanded={open}>ดูรายการทบทวนภาระ</Button>{open && <div className="mt-5">{query.isPending ? <LoadingState /> : query.isError ? <QueryError onRetry={() => void query.refetch()} /> : !query.data.length ? <EmptyState title="ไม่มีรายการรอทบทวน" description="ข้อมูลพร้อมแสดงเฉพาะตามต้นทางที่ตรวจสอบได้" /> : <ResponsiveRows label="การทบทวนภาระ" rows={query.data} rowKey={r => r.id} columns={[{ label: "นักเรียน / ต้นทาง", value: r => `${r.student} · ${r.sourceChange}` }, { label: "ภาระเดิม", value: r => <Money value={r.original} /> }, { label: "ชำระเดิม", value: r => <Money value={r.paid} /> }, { label: "ข้อเสนอเพื่อทบทวน", value: r => r.proposal }, { label: "สถานะ", value: r => <Alert tone="warning">{r.gate} รอยืนยันนโยบาย ไม่มีคำสั่งแก้ไขเงินจากหน้าทบทวน</Alert> }]} />}</div>}</Panel>;
}
