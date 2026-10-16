import { FISCAL_YEAR } from "../domain/model";
import { useCapability } from "../app/AppProvider";
import { useRef, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useScopedQuery as useQuery } from "../app/AppProvider";
import { useApp, useCurrentStaff, useRefresh, useSnapshot } from "../app/AppProvider";
import { Alert, Button, DetailList, EmptyState, Field, LoadingState, Money, Overlay, PageHeader, PageState, Panel, QueryError, ReceiptNotice, ReceiptReferenceView } from "../components/ui";
import { EMPTY_REFERENCE, ReceiptFields, type ReceiptDraft } from "../components/ReceiptFields";
import { UnsavedChangesGuard } from "../components/UnsavedChangesGuard";
import { canReceive, DomainError, parseMoney, TODAY, type Transaction } from "../domain/model";
import type { LinkReferenceCommand, OtherMoneyCommand } from "../domain/workspace";

export default function OtherMoneyPage() {
  const { role } = useApp();
  const pending = useLocation().pathname.endsWith("pending");
  const otherAllowed = useCapability("other.receive");
  const allowed = pending ? canReceive(role) : otherAllowed;
  return allowed ? <Workspace key={pending ? "pending" : "other"} pending={pending} /> : <PageState kind="access" eyebrow="FINANCE WORKSPACE" pageTitle={pending ? "รายการรอผูกอ้างอิง" : "รับเงินประเภทอื่น"} description="จัดการรายการรับเงินและข้อมูลอ้างอิงใบเสร็จจริง" title="ไม่มีสิทธิ์ทำรายการนี้" message="สิทธิ์รับเงินประเภทอื่นต้องได้รับการมอบหมายโดยผู้มีอำนาจ" />;
}
function Workspace({ pending }: { pending: boolean }) {
  const identity = useCurrentStaff();
  const { adapter, role } = useApp();
  const query = useSnapshot(), refresh = useRefresh(), client = useQueryClient();
  const pendingQuery = useQuery({ queryKey: ["pending-references", role], queryFn: ({ signal }) => adapter.pendingReferences(role, signal), enabled: pending });
  const [selected, setSelected] = useState("");
  const [category, setCategory] = useState(""), [payer, setPayer] = useState(""), [description, setDescription] = useState(""), [amount, setAmount] = useState(""), [note, setNote] = useState("");
  const [reference, setReference] = useState<ReceiptDraft>(EMPTY_REFERENCE);
  const [review, setReview] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(""), [unknown, setUnknown] = useState(false), [result, setResult] = useState<Transaction | null>(null);
  const command = useRef<OtherMoneyCommand | LinkReferenceCommand | null>(null);
  const pendingItem = pendingQuery.data?.find(p => p.id === selected);
  const dirty = !result && (!!reference.bookId || !!reference.printedNo || !!note || !!selected || payer !== "" || amount !== "" || description !== "" || category !== "");
  if (query.isPending || (pending && pendingQuery.isPending)) return <LoadingState />;
  if (query.isError || (pending && pendingQuery.isError)) return <QueryError onRetry={() => { void query.refetch(); if (pending) void pendingQuery.refetch(); }} />;
  const books = query.data.books, book = books.find(b => b.id === reference.bookId), page = book?.pages.find(p => p.id === reference.pageId);
  const categoryItem = query.data.fees.find(f => f.id === category && f.kind === "other" && f.active);
  function validate(event: FormEvent) {
    event.preventDefault(); setError("");
    try {
      if (!book || !page || page.status !== "available") throw new Error("เลือกเล่มและหน้าว่างให้ครบถ้วน");
      if (!navigator.onLine) throw new Error("เชื่อมต่ออินเทอร์เน็ตเพื่อบันทึก ไม่มีการส่งรายการอัตโนมัติ");
      const base = { ...reference, expectedPageVersion: page.version, commandId: crypto.randomUUID() };
      if (pending) {
        if (!pendingItem) throw new Error("เลือกรายการที่รับเงินแล้วและรอผูกอ้างอิง");
        command.current = { ...base, transactionId: pendingItem.id, expectedTransactionVersion: pendingItem.version };
      } else {
        const parsed = parseMoney(amount);
        if (parsed <= 0 || !categoryItem || !payer.trim() || payer.length > 200 || !description.trim() || description.length > 1000 || note.length > 2000) throw new Error("ระบุหมวด ผู้ชำระ รายละเอียด และจำนวนเงินมากกว่าศูนย์ให้ครบถ้วน");
        command.current = { ...base, categoryId: category, date: TODAY, fiscalYear: FISCAL_YEAR, payer, description, amount: parsed, note };
      }
      setReview(true);
    } catch (e) { setError(e instanceof Error ? e.message : "กรุณาตรวจสอบข้อมูล"); }
  }
  async function submit() {
    if (!command.current || busy) return;
    setBusy(true); setError("");
    try {
      const value = "transactionId" in command.current ? await adapter.linkReference(command.current, role) : await adapter.receiveOther(command.current, role);
      setResult(value); setReview(false); await refresh(); await client.invalidateQueries({ queryKey: ["pending-references"] }); await client.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (e) {
      if (e instanceof DomainError && e.code === "OUTCOME_UNKNOWN") { setUnknown(true); setReview(false); }
      else { setError(e instanceof Error ? e.message : "ไม่สามารถบันทึกได้"); setReview(false); if (e instanceof DomainError && ["PAGE_UNAVAILABLE", "VERSION_CONFLICT"].includes(e.code)) { setReference({ ...reference, pageId: "" }); await refresh(); await pendingQuery.refetch(); } }
    } finally { setBusy(false); }
  }
  async function resolve() {
    if (!command.current || busy) return;
    setBusy(true);
    try { const value = await adapter.outcome(command.current.commandId); if (value) { setResult(value); setUnknown(false); await refresh(); await client.invalidateQueries(); } else setError("ยังไม่ได้รับผลยืนยัน เก็บรหัสคำสั่งเดิมและตรวจสอบอีกครั้ง"); }
    catch { setError("ตรวจสอบผลไม่สำเร็จ กรุณาลองใหม่ด้วยรหัสเดิม"); }
    finally { setBusy(false); }
  }
  return <>
    <UnsavedChangesGuard dirty={dirty} locked={(busy && !result) || unknown} lockedDescription="กรุณารอหรือตรวจสอบผลด้วยรหัสคำสั่งเดิมก่อนออก" />
    <PageHeader eyebrow="FINANCE WORKSPACE" title={pending ? "รายการรอผูกอ้างอิง" : "รับเงินประเภทอื่น"} description={pending ? "ผูกเล่มและหน้าให้รายการที่รับเงินแล้ว โดยไม่เพิ่มยอดรับซ้ำ" : "บันทึกเงินรับประเภทอื่น ไม่สร้างภาระหนี้นักเรียน"} />
    {result ? <Panel><h2>{pending ? "ผูกอ้างอิงแล้ว" : "บันทึกรับเงินอื่นแล้ว"}</h2><ReceiptReferenceView transaction={result} /><Button className="mt-5" onClick={() => { setResult(null); setReference(EMPTY_REFERENCE); setNote(""); setSelected(""); command.current = null; }}>รายการถัดไป</Button></Panel> : unknown ? <Panel><h2>กำลังตรวจสอบผลการบันทึก</h2><p className="my-4">ห้ามส่งรายการใหม่จนกว่าจะทราบผลคำสั่งเดิม</p><Button busy={busy} onClick={() => void resolve()}>ตรวจสอบสถานะ</Button></Panel> : <form onSubmit={validate} className="work-split" noValidate>
      <Panel><div className="space-y-5">
        {pending ? <><Field id="pending-transaction" label="รายการรับเงินแล้ว" required><select id="pending-transaction" value={selected} onChange={e => setSelected(e.target.value)}><option value="">เลือกรายการ</option>{pendingQuery.data?.map(p => <option key={p.id} value={p.id}>{p.payer} · {p.id}</option>)}</select></Field>{pendingItem && <DetailList items={[{ label: "จำนวนเงินเดิม", value: <Money value={pendingItem.amount} /> }, { label: "รายละเอียด", value: pendingItem.description }]} />}{!pendingQuery.data?.length && <EmptyState title="ไม่มีรายการรอผูกอ้างอิง" description="รายการที่ผูกสำเร็จจะไม่แสดงซ้ำ" />}</> : <>
          <Field id="other-category" label="หมวดรับเงินอื่น" required><select id="other-category" value={category} onChange={e => setCategory(e.target.value)}>{query.data.fees.filter(f => f.kind === "other" && f.active).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></Field>
          <DetailList items={[{ label: "วันที่รับเงิน", value: TODAY }, { label: "ปีงบประมาณ", value: String(FISCAL_YEAR) }, { label: "ผู้รับเงิน", value: identity.data?.name ?? "—" }]} />
          <Field id="other-payer" label="ผู้ชำระ / แหล่งเงิน" required><input id="other-payer" value={payer} maxLength={200} onChange={e => setPayer(e.target.value)} /></Field>
          <Field id="other-description" label="รายละเอียด" required><textarea id="other-description" value={description} maxLength={1000} onChange={e => setDescription(e.target.value)} /></Field>
          <Field id="other-amount" label="จำนวนเงิน (บาท)" required><input id="other-amount" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /></Field>
          <Field id="other-note" label="หมายเหตุสำหรับรายงาน"><textarea id="other-note" value={note} maxLength={2000} onChange={e => setNote(e.target.value)} /></Field>
          <Alert>การจับคู่ช่องในรายงานจริงยังรอแม่แบบ G04 ไม่รวมยอดนี้กับเงินชำระนักเรียน</Alert>
        </>}
      </div></Panel>
      <Panel><h2 className="mb-5">ข้อมูลอ้างอิงเล่ม / หน้า</h2><ReceiptFields books={books} value={reference} onChange={setReference} /><div className="mt-5">{error && <Alert tone="danger">{error}</Alert>}<Button type="submit" className="w-full mt-5">{pending ? "ตรวจสอบการผูกอ้างอิง" : "ตรวจสอบรายการรับเงินอื่น"}</Button><ReceiptNotice /></div></Panel>
    </form>}
    {error && unknown && <Alert tone="danger">{error}</Alert>}
    <Overlay open={review} onClose={() => setReview(false)} busy={busy} title={pending ? "ตรวจสอบการผูกอ้างอิง" : "ตรวจสอบรายการรับเงินอื่น"} footer={<Button busy={busy} onClick={() => void submit()}>{pending ? "ยืนยันผูกอ้างอิง" : "บันทึกรายการรับเงินอื่น"}</Button>}>
      <DetailList items={[{ label: "ผู้ชำระ", value: pendingItem?.payer ?? payer }, { label: "จำนวนเงิน", value: command.current && "amount" in command.current ? <Money value={command.current.amount} /> : pendingItem ? <Money value={pendingItem.amount} /> : "ข้อมูลไม่พร้อม" }, { label: "เล่ม / หน้า", value: `${book?.bookNo} / ${page?.pageNo}` }, { label: "ผลการบันทึก", value: pending ? "เพิ่มอ้างอิงเท่านั้น ไม่รับเงินซ้ำ" : "รับเงินอื่นแยกจากภาระนักเรียน" }]} />
    </Overlay>
  </>;
}
