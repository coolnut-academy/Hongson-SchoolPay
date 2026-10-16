import type { ReactNode } from "react";
import { Button, EmptyState, Metric, Money, Panel } from "./ui";
import type { MonthlyCollection } from "../domain/model";

export function CursorPagination({ label, canPrevious, nextCursor, onPrevious, onNext }: {
  label: string; canPrevious: boolean; nextCursor?: string; onPrevious: () => void; onNext: (cursor: string) => void;
}) {
  return <nav aria-label={label} className="flex flex-wrap gap-3 my-4"><Button variant="secondary" disabled={!canPrevious} onClick={onPrevious}>ก่อนหน้า</Button><Button variant="secondary" disabled={!nextCursor} onClick={() => { if (nextCursor) onNext(nextCursor); }}>ถัดไป</Button></nav>;
}

export function RoomMetrics({ data }: { data: MonthlyCollection }) {
  return <div className="homeroom-metrics grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
    <Metric label="นักเรียนทั้งหมด" value={`${data.totals.students} คน`} />
    <Metric label="ชำระครบ" value={`${data.totals.settled} คน`} />
    <Metric label="ค้างชำระ" value={`${data.totals.debtors} คน`} />
    <Metric label="ยอดค้างรวม" value={<Money value={data.totals.outstanding} />} />
  </div>;
}
export function ResponsiveRows<T>({ label, rows, rowKey, columns }: {
  label: string; rows: T[]; rowKey: (row: T) => string;
  columns: { label: string; value: (row: T) => ReactNode }[];
}) {
  if (!rows.length) return <Panel><EmptyState title={`ยังไม่มีข้อมูล${label}`} description="ข้อมูลจะแสดงเมื่อมีรายการจากระบบโรงเรียนในขอบเขตที่คุณมีสิทธิ์" /></Panel>;
  return <>
    <div className="desktop-only data-table-wrap" role="region" aria-label={label} tabIndex={0}>
      <table className="data-table"><caption className="sr-only">{label}</caption><thead><tr>{columns.map(c => <th scope="col" key={c.label}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={rowKey(row)}>{columns.map((c, i) => i === 0 ? <th scope="row" key={c.label}>{c.value(row)}</th> : <td key={c.label}>{c.value(row)}</td>)}</tr>)}</tbody>
      </table>
    </div>
    <div className="mobile-only space-y-4">{rows.map(row => <Panel key={rowKey(row)}><dl className="space-y-3">{columns.map(c => <div key={c.label}><dt className="text-xs text-secondary">{c.label}</dt><dd className="mt-1 break-words">{c.value(row)}</dd></div>)}</dl></Panel>)}</div>
  </>;
}
