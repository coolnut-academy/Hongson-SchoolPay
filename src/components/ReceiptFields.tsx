import type { ReceiptBook } from "../domain/model";
import { counts } from "../domain/model";
import { Field } from "./ui";
export type ReceiptDraft = { bookId: string; pageId: string; printedNo: string };
export const EMPTY_REFERENCE: ReceiptDraft = { bookId: "", pageId: "", printedNo: "" };
export function ReceiptFields({ books, value, onChange, disabled = false }: { books: ReceiptBook[]; value: ReceiptDraft; onChange: (value: ReceiptDraft) => void; disabled?: boolean }) {
  const book = books.find(b => b.id === value.bookId);
  return <div className="space-y-5">
    <Field id="workspace-book" label="เล่มใบเสร็จที่เปิดใช้" required><select id="workspace-book" value={value.bookId} disabled={disabled} onChange={e => onChange({ ...value, bookId: e.target.value, pageId: "" })}><option value="">เลือกเล่ม</option>{books.filter(b => b.status === "active").map(b => <option key={b.id} value={b.id}>{b.bookNo} · {b.holder} · ว่าง {counts(b).available} หน้า</option>)}</select></Field>
    <Field id="workspace-page" label="หน้าใบเสร็จ" required hint="การเลือกไม่ใช่การจองหน้า ระบบตรวจสอบอีกครั้งเมื่อยืนยัน"><select id="workspace-page" value={value.pageId} disabled={disabled || !book} onChange={e => onChange({ ...value, pageId: e.target.value })}><option value="">เลือกหน้าว่าง</option>{book?.pages.filter(p => p.status === "available").map(p => <option key={p.id} value={p.id}>หน้า {p.pageNo}</option>)}</select></Field>
    <Field id="workspace-printed" label="เลขที่พิมพ์บนใบเสร็จ (ถ้ามี)"><input id="workspace-printed" value={value.printedNo} maxLength={64} disabled={disabled} onChange={e => onChange({ ...value, printedNo: e.target.value })} /></Field>
  </div>;
}
