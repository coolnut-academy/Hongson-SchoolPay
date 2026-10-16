import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { useApp, useVisitorAccount } from "../app/AppProvider";
import {
  AS_OF,
  dateLabel,
  type Obligation,
  type Transaction,
} from "../domain/model";
import {
  Alert,
  Badge,
  Button,
  DetailList,
  EmptyState,
  Field,
  LoadingState,
  Money,
  Overlay,
  PageHeader,
  Panel,
  QueryError,
  ReceiptNotice,
  ReceiptReferenceView,
} from "../components/ui";
export default function StudentPage() {
  const query = useVisitorAccount(),
    { scenario } = useApp(),
    location = useLocation();
  const [year, setYear] = useState("2569"),
    [detail, setDetail] = useState<Obligation | null>(null),
    [transaction, setTransaction] = useState<Transaction | null>(null),
    [fileError, setFileError] = useState(false);
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <QueryError onRetry={() => void query.refetch()} />;
  const student = query.data.student,
    total = student.obligations.reduce((n, o) => n + o.adjusted, 0),
    paid = student.obligations.reduce((n, o) => n + o.paid, 0),
    remaining = total - paid;
  const history = location.pathname.endsWith("/history"),
    documents = location.pathname.endsWith("/documents");
  return (
    <>
      <PageHeader
        eyebrow={
          documents
            ? "ANNOUNCEMENTS"
            : history
              ? "PAYMENT HISTORY"
              : "STUDENT & PARENT PORTAL"
        }
        title={
          documents
            ? "ประกาศและเอกสาร"
            : history
              ? "ประวัติการชำระ"
              : student.name
        }
        description={`${student.code} · ${student.room} · ${student.program}`}
        action={
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary" />
            <span className="text-sm text-secondary">ปีการศึกษา 2569</span>
          </div>
        }
      />
      {scenario === "stale" && (
        <div className="mb-5">
          <Alert tone="warning">
            ข้อมูลจากทะเบียนยังไม่เป็นปัจจุบัน ยอดนี้เป็นข้อมูลล่าสุดที่มี
            กรุณาติดต่อโรงเรียนเพื่อตรวจสอบ
          </Alert>
        </div>
      )}
      {documents ? (
        <Panel>
          <div className="flex items-start gap-4">
            <span className="icon-tile">
              <FileText size={22} />
            </span>
            <div className="flex-1">
              <Badge tone="success">ประกาศที่อนุมัติแล้ว · สาธิต</Badge>
              <h2 className="mt-3">
                ประกาศการเรียกเก็บเงิน ภาคเรียนที่ 1/2569
              </h2>
              <p className="text-sm text-secondary mt-2">
                เผยแพร่ 1 พ.ค. 2569 · ระดับชั้น ม.2
              </p>
              <p className="text-xs text-muted mt-2">
                PDF · 248 KB · เอกสารประกาศ ไม่ใช่ใบเสร็จ
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <Button variant="secondary" onClick={() => setFileError(true)}>
                  เปิดเอกสาร
                </Button>
                <Button variant="ghost" onClick={() => setFileError(true)}>
                  ดาวน์โหลดประกาศ
                </Button>
              </div>
            </div>
          </div>
          {fileError && (
            <div className="mt-5">
              <Alert tone="warning">
                ยังไม่มีไฟล์ประกาศในชุดข้อมูลสาธิต
                ไม่มีการดาวน์โหลดไฟล์จำลองแทนเอกสารจริง
              </Alert>
            </div>
          )}
        </Panel>
      ) : history ? (
        <>
          <div className="max-w-xs mb-6">
            <Field id="history-year" label="ปีการศึกษา">
              <select
                id="history-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="2569">ปีการศึกษา 2569</option>
                <option value="2568">ปีการศึกษา 2568</option>
              </select>
            </Field>
          </div>
          <Panel>
            <h2>รายการรับชำระ · {year}</h2>
            <p className="text-sm text-secondary mt-1 mb-5">
              ภาคเรียนที่ 1 · ดูรายละเอียดอ้างอิงใบเสร็จจริง
            </p>
            {year === "2568" && !query.data.previousHistory.length && <EmptyState title="ไม่มีรายการในปีที่เลือก" description="ไม่มีประวัติการชำระในขอบเขตนี้" />}
            {(year === "2568" ? query.data.previousHistory : student.transactions).map((t) => (
              <div className="history-row" key={t.id}>
                <div className="flex gap-3 items-start">
                  <span className="icon-tile">
                    <CheckCircle2 size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm">{t.description}</h3>
                    <p className="text-xs text-muted mt-1">
                      {dateLabel(t.date)} · เล่ม {t.bookNo} / หน้า {t.pageNo}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-4">
                  <strong>
                    <Money value={t.amount} />
                  </strong>
                  <Button variant="ghost" onClick={() => setTransaction(t)}>
                    ดูรายละเอียด
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <ReceiptNotice />
          </Panel>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>ภาคเรียนที่ 1 / 2569</span>
            </div>
            <Badge tone={remaining ? "warning" : "success"}>
              {remaining ? "ชำระบางส่วน" : "ไม่มีภาระคงค้าง"}
            </Badge>
          </div>
          <div className="student-layout">
            <aside className="space-y-4">
              <section className={`balance-hero ${remaining ? "" : "settled"}`}>
                <div className="flex items-center justify-between">
                  <p>{remaining ? "ยอดค้างชำระ" : "ไม่มีภาระคงค้าง"}</p>
                  <ShieldCheck size={22} aria-hidden />
                </div>
                <div className="balance-value">
                  <Money value={remaining} />
                </div>
                <span className="hero-status">
                  {remaining ? "ชำระบางส่วน" : "ชำระครบแล้ว"}
                </span>
                <div className="balance-split">
                  <div>
                    <small>ภาระทั้งหมด</small>
                    <strong>
                      <Money value={total} />
                    </strong>
                  </div>
                  <div>
                    <small>ชำระแล้ว</small>
                    <strong>
                      <Money value={paid} />
                    </strong>
                  </div>
                </div>
              </section>
              <p className="source-caption">
                <Clock3 size={14} className="mt-0.5" />
                ข้อมูลการเงิน ณ {AS_OF}
              </p>
              <Panel>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={18} className="text-primary" />
                  <h3 className="text-sm">ข้อมูลจากทะเบียนนักเรียน</h3>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  อัปเดต 16 ต.ค. 2569 · 09:00 น.
                  <br />
                  หากข้อมูลไม่ถูกต้อง กรุณาติดต่อเจ้าหน้าที่การเงินของโรงเรียน
                </p>
              </Panel>
            </aside>
            <section>
              <div className="flex justify-between items-center">
                <h2>รายการภาระชำระ</h2>
                <span className="text-xs text-muted">3 รายการ</span>
              </div>
              <p className="text-sm text-secondary mt-1 mb-4">
                รายละเอียดประจำภาคเรียนที่ 1 / 2569
              </p>
              {student.obligations.map((o) => (
                <article className="charge-card" key={o.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">{o.code}</p>
                      <h3>{o.label}</h3>
                      <p className="text-xs text-muted mt-1">{o.group}</p>
                    </div>
                    <Badge tone={o.adjusted === o.paid ? "success" : "warning"}>
                      {o.adjusted === o.paid ? "ชำระครบ" : "ชำระบางส่วน"}
                    </Badge>
                  </div>
                  <div className="charge-card-footer">
                    <div>
                      <p className="text-xs text-muted">
                        {o.adjusted === o.paid ? "ชำระแล้ว" : "คงเหลือ"}
                      </p>
                      <strong className="text-lg">
                        <Money
                          value={
                            o.adjusted === o.paid ? o.paid : o.adjusted - o.paid
                          }
                        />
                      </strong>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (o.adjusted === o.paid)
                          setTransaction(
                            student.transactions.find(
                              (t) => t.obligationId === o.id,
                            ) ?? null,
                          );
                        else setDetail(o);
                      }}
                    >
                      {o.adjusted === o.paid
                        ? "ดูรายละเอียดใบเสร็จ"
                        : "ดูรายละเอียด"}
                      <ArrowRight size={15} />
                    </Button>
                  </div>
                </article>
              ))}
              <ReceiptNotice />
            </section>
          </div>
        </>
      )}
      <Overlay
        open={!!detail || !!transaction}
        onClose={() => {
          setDetail(null);
          setTransaction(null);
        }}
        title={
          transaction ? "รายละเอียดอ้างอิงใบเสร็จจริง" : "รายละเอียดภาระชำระ"
        }
        drawer
        description="ข้อมูลอ่านอย่างเดียว · ไม่ใช่ใบเสร็จจากระบบ"
      >
        {transaction ? (
          <ReceiptReferenceView transaction={transaction} />
        ) : detail ? (
          <>
            <Badge tone="warning">ชำระบางส่วน</Badge>
            <h2 className="mt-4">{detail.label}</h2>
            <DetailList
              items={[
                { label: "ภาระชำระ", value: <Money value={detail.adjusted} /> },
                { label: "ชำระแล้ว", value: <Money value={detail.paid} /> },
                {
                  label: "คงเหลือ",
                  value: <Money value={detail.adjusted - detail.paid} />,
                },
                { label: "ภาคเรียน", value: "1 / 2569" },
              ]}
            />
            <h3 className="mt-6 mb-3">ประวัติรายการนี้</h3>
            {student.transactions
              .filter((t) => t.obligationId === detail.id)
              .map((t) => (
                <Button
                  className="w-full justify-between mb-2"
                  variant="secondary"
                  key={t.id}
                  onClick={() => setTransaction(t)}
                >
                  {t.date}
                  <Money value={t.amount} />
                  <ArrowRight size={16} />
                </Button>
              ))}
            <ReceiptNotice />
          </>
        ) : null}
      </Overlay>
    </>
  );
}
