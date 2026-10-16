import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useVisitorAccount } from "../app/AppProvider";
import { dateLabel, type Obligation, type Transaction } from "../domain/model";
import { Badge, Button, DetailList, EmptyState, Field, LoadingState, Metric, Money, Overlay, PageHeader, Panel, QueryError, ReceiptNotice, ReceiptReferenceView } from "../components/ui";
function safeDocumentUrl(value: string) { try { const url = new URL(value, window.location.origin); return url.protocol === "https:" || (url.origin === window.location.origin && url.protocol === window.location.protocol) ? url.href : null; } catch { return null; } }
export default function StudentPage() {
  const query = useVisitorAccount(), location = useLocation();
  const [year, setYear] = useState("all"), [detail, setDetail] = useState<Obligation | null>(null), [transaction, setTransaction] = useState<Transaction | null>(null);
  const history = location.pathname.endsWith("/history"), documents = location.pathname.endsWith("/documents");
  const title = documents ? "ประกาศและเอกสาร" : history ? "ประวัติการชำระ" : "ข้อมูลการชำระเงินนักเรียน";
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <QueryError onRetry={() => void query.refetch()} />;
  const student = query.data.student;
  const transactions = [...(student?.transactions ?? []), ...query.data.previousHistory];
  const years = [...new Set(transactions.map(t => String(Number(t.date.slice(0, 4)) + 543)))].sort().reverse();
  const filtered = transactions.filter(t => year === "all" || String(Number(t.date.slice(0, 4)) + 543) === year).sort((a,b) => b.date.localeCompare(a.date));
  const obligations = student?.obligations ?? [];
  const total = obligations.reduce((n,o) => n + o.adjusted, 0), paid = obligations.reduce((n,o) => n + o.paid, 0);
  return <div data-testid="student-page">
    <PageHeader eyebrow="STUDENT & PARENT PORTAL" title={title} description={student ? [student.name, student.code, student.room, student.program].filter(Boolean).join(" · ") : "ตรวจสอบยอดชำระ ประวัติ และเอกสารของคุณ"} />
    {documents ? <Panel><h2>เอกสารจากโรงเรียน</h2>{query.data.documents?.length ? query.data.documents.map(doc => <article className="history-row" key={doc.id}><div><h3>{doc.title}</h3><p className="text-sm text-secondary">{dateLabel(doc.publishedAt)}</p></div>{safeDocumentUrl(doc.url) ? <a className="btn btn-secondary" href={safeDocumentUrl(doc.url)!} target="_blank" rel="noopener noreferrer">เปิดเอกสาร</a> : <span>เอกสารยังไม่พร้อมเปิด</span>}</article>) : <EmptyState title="ยังไม่มีเอกสารเผยแพร่" description="ประกาศที่ได้รับอนุมัติจากโรงเรียนจะแสดงที่นี่" />}</Panel>
    : history ? <Panel><Field id="history-year" label="ปีที่รับชำระ"><select id="history-year" value={year} onChange={e => setYear(e.target.value)}><option value="all">ทุกปี</option>{years.map(y => <option key={y}>{y}</option>)}</select></Field>{filtered.length ? filtered.map(t => <article className="history-row" key={t.id}><div><h3>{t.description}</h3><p className="text-sm text-secondary">{dateLabel(t.date)} · เล่ม {t.bookNo} / หน้า {t.pageNo}</p></div><Money value={t.amount} /><Button variant="secondary" onClick={() => setTransaction(t)}>ดูรายละเอียด</Button></article>) : <EmptyState title="ยังไม่มีประวัติการชำระ" description="รายการที่เจ้าหน้าที่บันทึกและตรวจสอบแล้วจะแสดงที่นี่" />}</Panel>
    : <>
      <div className="metrics" data-testid="student-balances"><Metric label="ภาระทั้งหมด" value={student ? <Money value={total} /> : "—"} /><Metric label="ชำระแล้ว" value={student ? <Money value={paid} /> : "—"} /><Metric label="ยอดค้างชำระ" value={student ? <Money value={total-paid} /> : "—"} /></div>
      <Panel><div className="flex justify-between items-center"><h2>รายการภาระชำระ</h2><Badge>{student ? obligations.length + " รายการ" : "รอข้อมูล"}</Badge></div>{query.data.periodLabel && <p className="text-secondary mt-2">{query.data.periodLabel}</p>}
        {!obligations.length ? <EmptyState title={student ? "ยังไม่มีรายการภาระชำระ" : "ยังไม่มีข้อมูลนักเรียน"} description={student ? "เมื่อโรงเรียนเผยแพร่รายการเรียกเก็บ ข้อมูลจะแสดงที่นี่" : "รอเชื่อมต่อทะเบียนนักเรียนและข้อมูลการเงินจากโรงเรียน"} /> : obligations.map(o => <article className="charge-card" key={o.id}><div className="flex justify-between gap-3"><div><p className="eyebrow">{o.code}</p><h3>{o.label}</h3><p className="text-secondary">{o.group}</p></div><Badge tone={o.adjusted === o.paid ? "success" : "warning"}>{o.adjusted === o.paid ? "ชำระครบ" : o.paid > 0 ? "ชำระบางส่วน" : "ยังไม่ชำระ"}</Badge></div><div className="charge-card-footer"><div><p>คงเหลือ</p><Money value={o.adjusted-o.paid} /></div><Button variant="secondary" onClick={() => setDetail(o)}>ดูรายละเอียด</Button></div></article>)}
      </Panel>
      <p className="source-caption mt-4">{query.data.asOf ? "ข้อมูล ณ " + dateLabel(query.data.asOf) : "ยังไม่มีวันอัปเดตจากต้นทาง"} · หากข้อมูลไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่การเงิน</p>
    </>}
    <ReceiptNotice />
    <Overlay open={!!detail || !!transaction} onClose={() => { setDetail(null); setTransaction(null); }} title={transaction ? "รายละเอียดอ้างอิงใบเสร็จจริง" : "รายละเอียดภาระชำระ"} drawer>
      {transaction ? <ReceiptReferenceView transaction={transaction} /> : detail && <><h2>{detail.label}</h2><DetailList items={[{ label: "ภาระชำระ", value: <Money value={detail.adjusted} /> }, { label: "ชำระแล้ว", value: <Money value={detail.paid} /> }, { label: "คงเหลือ", value: <Money value={detail.adjusted-detail.paid} /> }]} /><h3 className="mt-6">ประวัติรายการนี้</h3>{transactions.filter(t => t.obligationId === detail.id).map(t => <Button className="mt-3" variant="secondary" key={t.id} onClick={() => setTransaction(t)}>{dateLabel(t.date)} · <Money value={t.amount} /></Button>)}</>}
    </Overlay>
  </div>;
}
