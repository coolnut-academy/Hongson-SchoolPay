import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { UnsavedChangesGuard } from "../components/UnsavedChangesGuard";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  CheckCircle2,
  CircleCheck,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useApp, useCurrentStaff, useRefresh, useSnapshot } from "../app/AppProvider";
import {
  canReceive,
  counts,
  DomainError,
  satang,
  TODAY,
  type PaymentCommand,
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
  SectionTitle,
} from "../components/ui";

export default function FinancePage() {
  const { role } = useApp();
  return canReceive(role) ? (
    <Workspace />
  ) : (
    <Panel>
      <EmptyState
        title="หน้านี้สำหรับผู้มีสิทธิ์รับชำระ"
        description="บทบาทผู้บริหารสามารถตรวจสอบข้อมูลได้ แต่ไม่บันทึกรับเงิน"
        action={
          <Link className="btn btn-secondary" to="/app/receipts/books">
            ดูทะเบียนคุมใบเสร็จ
          </Link>
        }
      />
    </Panel>
  );
}
function Workspace() {
  const identity = useCurrentStaff();
  const [appliedSearch, setAppliedSearch] = useState("");
  const query = useSnapshot(appliedSearch),
    refresh = useRefresh(),
    { adapter, role } = useApp();
  const [search, setSearch] = useState(""),

    [searchError, setSearchError] = useState(""),
    [selected, setSelected] = useState(false),
    [allocated, setAllocated] = useState(true);
  const [bookId, setBookId] = useState(""),
    [pageId, setPageId] = useState(""),
    [printedNo, setPrintedNo] = useState(""),
    [method, setMethod] = useState<PaymentCommand["method"]>("cash"),
    [note, setNote] = useState("");
  const [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [errors, setErrors] = useState<string[]>([]),
    [result, setResult] = useState<Transaction | null>(null),
    [unknown, setUnknown] = useState(false),
    [showResult, setShowResult] = useState(false),
    [online, setOnline] = useState(navigator.onLine);
  const command = useRef<PaymentCommand | null>(null),
    errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if (errors.length) errorRef.current?.focus();
  }, [errors]);
  useEffect(() => {
    const protect = (e: BeforeUnloadEvent) => {
      if ((bookId || note) && !result) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [bookId, note, result]);
  function findStudent(e: FormEvent) {
    e.preventDefault();
    if (!search.trim()) { setSearchError("กรุณากรอกรหัสนักเรียน"); return; }
    setSearchError(""); setAppliedSearch(search.trim()); setSelected(true);
    setBookId(""); setPageId(""); setResult(null);
    if (search.trim() === appliedSearch) void query.refetch();
  }
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <QueryError onRetry={() => void query.refetch()} />;
  if (!query.data.student) return <><PageHeader eyebrow="FINANCE" title="รับชำระนักเรียน" description="ค้นหาข้อมูลนักเรียนจากทะเบียนโรงเรียน" /><Panel className="payment-lookup"><SectionTitle number={1} title="ค้นหานักเรียน" subtitle="ตรวจสอบข้อมูลนักเรียนก่อนเริ่มรับชำระ" /><form onSubmit={findStudent} className="lookup-form"><Field id="payment-search" label="รหัสนักเรียน" error={searchError}><div className="search-input"><Search size={18} aria-hidden /><input id="payment-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="กรอกรหัสนักเรียน" aria-invalid={!!searchError} aria-describedby={searchError ? "payment-search-error" : undefined} /></div></Field><Button type="submit">ค้นหา<ArrowRight size={16} aria-hidden /></Button></form><div className="lookup-result"><EmptyState kind="people" title="ยังไม่มีข้อมูลนักเรียน" description="รอเชื่อมต่อทะเบียนและข้อมูลการเงินก่อนบันทึกรับชำระ" /></div></Panel></>;
  const { student, books } = query.data,
    obligation = student.obligations.find((o) => o.adjusted > o.paid),
    amount =
      selected && allocated && obligation
        ? obligation.adjusted - obligation.paid
        : 0;
  const book = books.find((b) => b.id === bookId),
    page = book?.pages.find((p) => p.id === pageId),
    receiver = identity.data?.name.replace(/^(?:นางสาว|นาง|นาย)/, "") ?? "ยังไม่มีข้อมูลบุคลากร";
  const blocked = !online;
  function resetForm() {
    setSelected(false);
    setSearch("");
    setBookId("");
    setPageId("");
    setNote("");
    setPrintedNo("");
    setResult(null);
    setErrors([]);
    setAllocated(true);
    setUnknown(false);
    command.current = null;
  }
  function startReview() {
    const issues: string[] = [];
    if (!selected || !obligation || !amount)
      issues.push("เลือกรายการภาระที่ยังมียอดค้าง");
    if (!book) issues.push("เลือกเล่มใบเสร็จจริงที่เปิดใช้งาน");
    if (!page || page.status !== "available")
      issues.push("เลือกหน้าใบเสร็จที่ว่าง");
    if (method === "other" && !note.trim())
      issues.push("ระบุรายละเอียดวิธีรับเงินอื่น ๆ ในหมายเหตุ");
    if (blocked)
      issues.push(
        "ข้อมูลยังไม่พร้อมสำหรับบันทึก กรุณาตรวจสอบการเชื่อมต่อและข้อมูลต้นทาง",
      );
    setErrors(issues);
    if (issues.length || !obligation || !book || !page) return;
    command.current = {
      commandId: crypto.randomUUID(),
      obligationId: obligation.id,
      expectedObligationVersion: obligation.version,
      bookId: book.id,
      pageId: page.id,
      expectedPageVersion: page.version,
      amount: satang(amount),
      method,
      date: TODAY,
      note,
      printedNo,
    };
    setReview(true);
  }
  async function confirm() {
    if (!command.current || busy) return;
    setBusy(true);
    try {
      const saved = await adapter.receive(command.current, role);
      setResult(saved);
      setReview(false);
      setErrors([]);
      await refresh();
    } catch (e) {
      setReview(false);
      if (e instanceof DomainError && e.code === "OUTCOME_UNKNOWN") {
        setUnknown(true);
      } else {
        setErrors([e instanceof Error ? e.message : "ไม่สามารถบันทึกได้"]);
        if (e instanceof DomainError && e.code === "PAGE_UNAVAILABLE")
          setPageId("");
        command.current = null;
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }
  async function resolve() {
    if (!command.current) return;
    setBusy(true);
    try {
      const saved = await adapter.outcome(command.current.commandId);
      if (saved) {
        setResult(saved);
        setUnknown(false);
        setErrors([]);
        await refresh();
      } else
        setErrors([
          "ยังไม่สามารถยืนยันผลได้ กรุณาตรวจสอบสถานะอีกครั้ง ไม่ต้องบันทึกซ้ำ",
        ]);
    } catch {
      setErrors(["ตรวจสอบผลไม่สำเร็จ กรุณาลองตรวจสอบสถานะอีกครั้ง"]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <UnsavedChangesGuard
        dirty={!!(bookId || note || printedNo) && !result}
        locked={unknown}
      />
      <PageHeader
        eyebrow="FINANCE WORKSPACE"
        title="รับชำระนักเรียน"
        description="ตรวจสอบภาระ รับเงิน และบันทึกเล่ม / หน้าใบเสร็จจริง"
        action={<Badge tone="info">ข้อมูลตามทะเบียน</Badge>}
      />
      {blocked && (
        <div className="mb-5">
          <Alert tone="warning">
            ออฟไลน์ · เก็บแบบร่างไว้ในหน้านี้ ไม่มีการส่งรายการอัตโนมัติ
          </Alert>
        </div>
      )}
      {!!errors.length && (
        <div ref={errorRef} tabIndex={-1} className="mb-5">
          <Alert tone="danger" title="กรุณาตรวจสอบก่อนดำเนินการ">
            <ul className="list-disc pl-5">
              {errors.map((e) => (
                <li key={e}><button type="button" className="underline text-left" onClick={() => {
                  const id = e.includes("เล่ม") ? "receipt-book" : e.includes("หน้า") ? "receipt-page" : e.includes("หมายเหตุ") ? "payment-note" : "payment-search";
                  document.getElementById(id)?.focus();
                }}>{e}</button></li>
              ))}
            </ul>
          </Alert>
        </div>
      )}
      <Panel className="mb-6">
        <SectionTitle
          number={1}
          title="ค้นหานักเรียน"
          subtitle="ค้นหาด้วยรหัสหรือชื่อ แล้วตรวจสอบข้อมูลก่อนรับชำระ"
        />
        <div className="grid md:grid-cols-2 gap-5 items-end">
          <form onSubmit={findStudent} className="flex items-start gap-2">
            <div className="flex-1">
              <Field
                id="payment-search"
                label="รหัส / ชื่อนักเรียน"
                error={searchError}
              >
                <input
                  id="payment-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="กรอกรหัสนักเรียน"
                  disabled={!!result || unknown}
                  maxLength={32}
                  aria-invalid={!!searchError}
                />
              </Field>
            </div>
            <Button
              className="mt-[29px]"
              type="submit"
              busy={query.isFetching}
              disabled={!!result || unknown}
            >
              <Search size={17} />
              <span>ค้นหา</span>
            </Button>
          </form>
          {selected ? (
            <div className="selected-student">
              <span className="avatar">
                <UserRound size={22} />
              </span>
              <div>
                <strong className="text-sm">เด็กหญิง{student.name}</strong>
                <p className="text-xs text-secondary mt-1">
                  {student.code} · {student.room} · {student.program}
                </p>
                <p className="text-[11px] text-muted mt-1">
                  ข้อมูลจากทะเบียนนักเรียน
                </p>
              </div>
              <CircleCheck className="text-primary ml-auto" size={18} />
            </div>
          ) : (
            <div className="text-sm text-muted p-4 border border-dashed border-border rounded-lg">
              ข้อมูลนักเรียนจะแสดงหลังค้นหา
            </div>
          )}
        </div>
      </Panel>
      <div className="work-split">
        <div className="work-main">
          <Panel>
            <SectionTitle
              number={2}
              title="เลือกภาระที่รับชำระ"
              action={<span className="text-xs text-muted">หน่วย: บาท</span>}
            />
            {selected ? (
              <>
                <div className="data-table-wrap desktop-only">
                  <table className="data-table">
                    <caption className="sr-only">
                      ภาระชำระของ {student.name}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">
                          <span className="sr-only">เลือก</span>
                        </th>
                        <th scope="col">รายการภาระชำระ</th>
                        <th scope="col" className="amount">
                          คงเหลือ
                        </th>
                        <th scope="col" className="amount">
                          รับครั้งนี้
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.obligations.map((o) => (
                        <tr
                          key={o.id}
                          className={
                            o.adjusted > o.paid && allocated
                              ? "selected-row"
                              : ""
                          }
                        >
                          <td>
                            <label className="inline-flex items-center justify-center min-w-11 min-h-11">
                              <input
                                type="checkbox"
                                aria-label={`เลือก ${o.label}`}
                                checked={o.adjusted > o.paid && allocated}
                                disabled={
                                  o.adjusted === o.paid || !!result || unknown
                                }
                                onChange={(e) => setAllocated(e.target.checked)}
                              />
                            </label>
                          </td>
                          <td>
                            <p className="font-medium">{o.label}</p>
                            <p className="table-sub">
                              {o.code} · {o.group}
                            </p>
                          </td>
                          <td className="amount">
                            <Money
                              currency={false}
                              value={o.adjusted - o.paid}
                            />
                          </td>
                          <td className="amount">
                            {o.adjusted === o.paid ? (
                              <Badge tone="success">ชำระครบ</Badge>
                            ) : (
                              <strong>
                                <Money
                                  currency={false}
                                  value={allocated ? o.adjusted - o.paid : 0}
                                />
                              </strong>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mobile-only">
                  {student.obligations.map((o) => (
                    <div key={o.id} className="finance-mobile-row">
                      <label className="flex items-start gap-3 min-h-11">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={o.adjusted > o.paid && allocated}
                          disabled={
                            o.adjusted === o.paid || !!result || unknown
                          }
                          onChange={(e) => setAllocated(e.target.checked)}
                        />
                        <span className="text-sm font-medium">{o.label}</span>
                      </label>
                      <div className="flex justify-between mt-2">
                        <Badge
                          tone={o.adjusted === o.paid ? "success" : "warning"}
                        >
                          {o.adjusted === o.paid ? "ชำระครบ" : "คงเหลือ"}
                        </Badge>
                        <Money value={o.adjusted - o.paid} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center gap-3 mt-5 pt-4 border-t border-border">
                  <p className="text-sm">รับชำระครั้งนี้</p>
                  <strong className="text-xl text-primary">
                    <Money value={amount} />
                  </strong>
                </div>
              </>
            ) : (
              <EmptyState
                title="เลือกนักเรียนก่อน"
                description="ค้นหานักเรียนเพื่อดูภาระที่ยังเปิดอยู่"
              />
            )}
          </Panel>
          <Panel>
            <SectionTitle number={3} title="รายละเอียดรับเงิน" />
            <fieldset disabled={!!result || unknown}>
              <legend className="text-sm font-medium mb-3">วิธีรับเงิน</legend>
              <div className="choice-row mb-5">
                {(
                  [
                    ["cash", "เงินสด"],
                    ["transfer", "โอนเงิน"],
                    ["other", "อื่น ๆ"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`choice ${method === value ? "selected" : ""}`}
                  >
                    <input
                      name="method"
                      type="radio"
                      value={value}
                      checked={method === value}
                      onChange={() => setMethod(value)}
                    />
                    {value === "cash" && <Banknote size={16} aria-hidden />}
                    {label}
                  </label>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field id="payment-date" label="วันที่รับเงิน">
                  <input id="payment-date" value={TODAY} readOnly />
                </Field>
                <Field id="payment-receiver" label="ผู้รับเงิน">
                  <input id="payment-receiver" value={receiver} readOnly />
                </Field>
              </div>
              <details className="mt-4" open={method === "other" || undefined}>
                <summary className="text-sm text-primary min-h-11 flex items-center">
                  หมายเหตุ / รายละเอียดวิธีรับเงิน
                </summary>
                <Field
                  id="payment-note"
                  label="หมายเหตุ"
                  required={method === "other"}
                >
                  <textarea
                    id="payment-note"
                    value={note}
                    maxLength={2000}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                  />
                </Field>
              </details>
            </fieldset>
          </Panel>
          <Panel>
            <SectionTitle
              number={4}
              title="บันทึกข้อมูลใบเสร็จจริง"
              subtitle="เลือกให้ตรงกับเล่มและหน้าที่เขียนแล้วเท่านั้น"
            />
            <fieldset
              disabled={!!result || unknown}
              className="grid sm:grid-cols-[1fr_120px] gap-4"
            >
              <Field id="receipt-book" label="เล่มใบเสร็จที่เปิดใช้" required>
                <select
                  id="receipt-book"
                  value={bookId}
                  onChange={(e) => {
                    setBookId(e.target.value);
                    setPageId("");
                  }}
                >
                  <option value="">เลือกเล่มใบเสร็จ</option>
                  {books.filter(b => b.status === "active").map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bookNo} · {b.holder} · ว่าง {counts(b).available} หน้า
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="receipt-page" label="หน้า" required>
                <select
                  id="receipt-page"
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  disabled={!bookId || !!result || unknown}
                >
                  <option value="">เลือกหน้า</option>
                  {book?.pages
                    .filter((p) => p.status === "available")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.pageNo}
                      </option>
                    ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field
                  id="printed-number"
                  label="เลขที่พิมพ์บนใบเสร็จ (ถ้ามี)"
                  hint="กรอกจากเอกสารจริง ระบบไม่สร้างเลขที่ใบเสร็จ"
                >
                  <input
                    id="printed-number"
                    maxLength={50}
                    value={printedNo}
                    onChange={(e) => setPrintedNo(e.target.value)}
                    placeholder="ไม่ได้ระบุ"
                  />
                </Field>
              </div>
            </fieldset>
            {page?.status === "available" && (
              <div className="mt-4">
                <Alert tone="success">
                  หน้า {page.pageNo} ว่าง ณ เวลาตรวจสอบ
                  ระบบจะตรวจสอบอีกครั้งเมื่อบันทึก
                </Alert>
              </div>
            )}
          </Panel>
        </div>
        <aside className="work-aside">
          <Panel>
            {unknown ? (
              <>
                <h2>กำลังตรวจสอบผลการบันทึก</h2>
                <div className="my-5">
                  <Alert tone="warning">
                    ยังไม่ทราบผลยืนยัน ห้ามทำรายการซ้ำ
                    กรุณาตรวจสอบด้วยรหัสคำสั่งเดิม
                  </Alert>
                </div>
                <Button onClick={resolve} busy={busy} className="w-full">
                  ตรวจสอบสถานะ
                </Button>
              </>
            ) : result ? (
              <>
                <div className="text-primary mb-3">
                  <CheckCircle2 size={30} />
                </div>
                <h2>บันทึกรับชำระแล้ว</h2>
                <p className="text-sm text-secondary mt-2">
                  บันทึกในหน่วยความจำของหน้านี้เท่านั้น
                </p>
                <div className="summary-total">
                  <span>รับชำระเรียบร้อย</span>
                  <strong>
                    <Money value={result.amount} />
                  </strong>
                </div>
                <DetailList
                  items={[
                    {
                      label: "เล่ม / หน้า",
                      value: `${result.bookNo} / ${result.pageNo}`,
                    },
                    { label: "รหัสรายการ", value: result.id },
                  ]}
                />
                <Button
                  className="w-full mb-2"
                  variant="secondary"
                  onClick={() => setShowResult(true)}
                >
                  ดูรายการ
                </Button>
                <Button className="w-full" onClick={resetForm}>
                  รับชำระคนถัดไป
                  <ArrowRight size={16} />
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2>ตรวจสอบก่อนบันทึก</h2>
                  <ShieldCheck size={20} className="text-primary" />
                </div>
                <p className="text-sm text-secondary mt-2">
                  {selected ? student.name : "ยังไม่ได้เลือกนักเรียน"}
                </p>
                <p className="text-xs text-muted">
                  {selected
                    ? `${student.code} · ${student.room}`
                    : "ค้นหานักเรียนเพื่อเริ่มรายการ"}
                </p>
                <div className="summary-total">
                  <span>ยอดรับชำระครั้งนี้</span>
                  <strong>
                    <Money value={amount} />
                  </strong>
                  <p className="text-xs text-secondary">
                    คงเหลือหลังบันทึก{" "}
                    <Money
                      value={
                        student.obligations.reduce(
                          (n, o) => n + o.adjusted - o.paid,
                          0,
                        ) - amount
                      }
                    />
                  </p>
                </div>
                <DetailList
                  items={[
                    {
                      label: "วิธีรับเงิน",
                      value: {
                        cash: "เงินสด",
                        transfer: "โอนเงิน",
                        other: "อื่น ๆ",
                      }[method],
                    },
                    { label: "วันที่รับเงิน", value: TODAY },
                    {
                      label: "เล่ม / หน้า",
                      value:
                        book && page
                          ? `${book.bookNo} / ${page.pageNo}`
                          : "ยังไม่ได้เลือก",
                    },
                    { label: "ผู้รับเงิน", value: receiver },
                  ]}
                />
                <Button
                  className="w-full"
                  onClick={startReview}
                  disabled={blocked}
                >
                  ตรวจสอบรายการ
                  <ArrowRight size={17} />
                </Button>
              </>
            )}
            <ReceiptNotice />
          </Panel>
          <Panel>
            <SectionTitle
              title="เล่มที่เปิดใช้"
              action={<Badge>{books.filter(b => b.status === "active").length} เล่ม</Badge>}
            />
            {books.filter(b => b.status === "active").map((b) => (
              <div className="active-book-row" key={b.id}>
                <div className="flex gap-2 items-center">
                  <BookOpen size={18} className="text-primary" />
                  <div>
                    <strong className="text-sm">{b.bookNo}</strong>
                    <p>
                      {b.holder} · ว่าง {counts(b).available}/50
                    </p>
                  </div>
                </div>
                <Link className="text-link" to={`/app/receipts/books/${b.id}`}>
                  ดูเล่ม
                  <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </Panel>
        </aside>
      </div>
      <Overlay
        open={review}
        onClose={() => setReview(false)}
        title="ยืนยันบันทึกรับชำระ"
        description="ตรวจสอบให้ตรงกับใบเสร็จจริงที่เขียนแล้ว · รายการรับชำระ"
        busy={busy}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setReview(false)}
            >
              กลับไปแก้ไข
            </Button>
            <Button busy={busy} onClick={confirm}>
              ยืนยันบันทึก
            </Button>
          </>
        }
      >
        <div className="reference-amount">
          <p>ยอดรับชำระ</p>
          <Money value={command.current?.amount ?? 0} />
        </div>
        <DetailList
          items={[
            { label: "นักเรียน", value: `${student.name} · ${student.code}` },
            { label: "รายการ", value: obligation?.label ?? "—" },
            {
              label: "วิธีรับเงิน",
              value: { cash: "เงินสด", transfer: "โอนเงิน", other: "อื่น ๆ" }[
                method
              ],
            },
            {
              label: "เล่ม / หน้า",
              value: `${book?.bookNo ?? "—"} / ${page?.pageNo ?? "—"}`,
            },
            { label: "ผู้รับเงิน", value: receiver },
          ]}
        />
        <Alert>
          ตรวจสอบข้อมูลให้ตรงกับใบเสร็จจริงก่อนบันทึก
        </Alert>
      </Overlay>
      <Overlay
        open={showResult}
        onClose={() => setShowResult(false)}
        title="รายละเอียดอ้างอิงใบเสร็จจริง"
        drawer
      >
        {result && <ReceiptReferenceView transaction={result} />}
      </Overlay>
    </>
  );
}
