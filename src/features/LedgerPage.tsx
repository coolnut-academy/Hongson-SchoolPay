import { useCapability } from "../app/AppProvider";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Check,
  Circle,
  ClipboardCheck,
  History,
  Minus,
  Search,
} from "lucide-react";
import { useApp, useRefresh, useSnapshot } from "../app/AppProvider";
import { counts, type ReceiptPage } from "../domain/model";
import {
  Alert,
  Badge,
  Button,
  DetailList,
  EmptyState,
  Field,
  LoadingState,
  Metric,
  Overlay,
  PageBadge,
  PageHeader,
  Panel,
  QueryError,
  ReceiptNotice,
  ReceiptReferenceView,
  SectionTitle,
  Tabs,
} from "../components/ui";

export default function LedgerPage() {
  const query = useSnapshot(),
    refresh = useRefresh(),
    { adapter, role } = useApp(),
    params = useParams(),
    location = useLocation(),
    navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(""),
    [holder, setHolder] = useState("all"),
    [status, setStatus] = useState("all"),
    [tab, setTab] = useState("pages"),
    [page, setPage] = useState<ReceiptPage | null>(null),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState(""),
    [noMatch, setNoMatch] = useState(false),
    [ambiguous, setAmbiguous] = useState(false),
    [reconcile, setReconcile] = useState(false),
    [physical, setPhysical] = useState({
      used: "",
      void: "",
      available: "",
    }),
    [issues, setIssues] = useState<string[] | null>(null);
  const canVoid = useCapability("receipt.voidAvailable");
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <QueryError onRetry={() => void query.refetch()} />;
  if (!query.data.books.length) return <><PageHeader eyebrow="PHYSICAL RECEIPT CONTROL" title={location.pathname.endsWith("/pages") ? "ตรวจสอบใบเสร็จรายหน้า" : params.bookId ? "รายละเอียดเล่มใบเสร็จ" : "ทะเบียนคุมใบเสร็จ"} description="ตรวจสอบเล่มและหน้าของใบเสร็จจากทะเบียนโรงเรียน" /><EmptyState title="ยังไม่มีเล่มใบเสร็จ" description="ข้อมูลจะแสดงหลังเชื่อมต่อทะเบียนเล่มใบเสร็จของโรงเรียน" /></>;
  if (params.bookId && !query.data.books.some((b) => b.id === params.bookId))
    return (
      <Panel>
        <EmptyState
          title="ไม่พบเล่มใบเสร็จนี้"
          description="รหัสเล่มไม่อยู่ในข้อมูลต้นทาง กรุณากลับไปเลือกเล่มที่มี"
          action={
            <Button onClick={() => navigate("/app/receipts/books")}>
              เลือกเล่มใบเสร็จ
            </Button>
          }
        />
      </Panel>
    );
  const { books, audit } = query.data,
    book =
      books.find((b) => b.id === (params.bookId ?? selectedId)) ?? books[0],
    c = counts(book),
    filtered = books.filter((b) => holder === "all" || b.holder === holder),
    pageSearch = location.pathname.endsWith("/pages");
  const visiblePages = book.pages.filter(
    (p) => status === "all" || p.status === status,
  );
  function choose(id: string) {
    setSelectedId(id);
    setStatus("all");
    setNoMatch(false);
    setAmbiguous(false);
    if (params.bookId) navigate(`/app/receipts/books/${id}`);
  }
  function inspect(p: ReceiptPage) {
    setPage(p);
    setReason("");
    setError("");
  }
  function searchPage(e: FormEvent) {
    e.preventDefault();
    const value = search.trim(),
      matches = book.pages.filter(
        (p) =>
          String(p.pageNo) === value ||
          (!!p.transaction?.printedNo && p.transaction.printedNo === value),
      );
    setNoMatch(!matches.length);
    setAmbiguous(matches.length > 1);
    if (matches.length === 1) inspect(matches[0]);
  }
  async function voidPage() {
    if (!page) return;
    setBusy(true);
    setError("");
    try {
      await adapter.voidPage(book.id, page.id, page.version, reason, role);
      setPage(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  async function checkReturn() {
    setBusy(true);
    try {
      setIssues(
        await adapter.reconcile(book, {
          used: Number(physical.used),
          void: Number(physical.void),
          available: Number(physical.available),
        }),
      );
    } catch (e) {
      setIssues([e instanceof Error ? e.message : "ตรวจสอบไม่สำเร็จ"]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="PHYSICAL RECEIPT CONTROL"
        title={pageSearch ? "ตรวจสอบรายหน้า" : "ทะเบียนคุมใบเสร็จ"}
        description="ติดตามเล่มและหน้าของใบเสร็จจริงแบบเขียนมือ ตรวจสอบย้อนหลังได้ทุกขั้นตอน"
        action={<Badge tone="info">ทะเบียนจากต้นทาง</Badge>}
      />
      <div className="metrics">
        <Metric
          label="ยอดยกมาที่ได้รับยืนยัน"
          value="—"
          caption="รอข้อมูลยกมาจากต้นทาง"
          icon={<Archive size={18} />}
        />
        <Metric
          label="รับเพิ่มในปีงบประมาณ"
          value="—"
          caption="ดูรายการรับเข้าสต็อก"
          icon={<BookOpen size={18} />}
        />
        <Metric
          label="รวมตามข้อมูลต้นทาง"
          value={books.length}
          caption="จำนวนเล่มในขอบเขตที่แสดง"
          icon={<ClipboardCheck size={18} />}
        />
        <Metric
          label="เล่มเปิดใช้จากระบบโรงเรียน"
          value={books.filter(b => b.status === "active").length}
          caption="เปิดใช้พร้อมกันได้หลายเล่ม"
          icon={<Circle size={18} />}
        />
      </div>
      <div className="mb-6">
        <Alert tone="warning" title="รายการยกมาอยู่ระหว่างตรวจสอบ">
          ตรวจสอบยอดยกมากับทะเบียนจริงก่อนยืนยันข้อมูล
        </Alert>
      </div>
      <div className="filter-row">
        <Field id="ledger-year" label="ปีงบประมาณ">
          <select id="ledger-year" disabled><option>ตามขอบเขตทะเบียน</option></select>
        </Field>
        <Field id="ledger-holder" label="ผู้ถือครอง">
          <select
            id="ledger-holder"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
          >
            <option value="all">ผู้ถือครองทั้งหมด</option>
            {books.map((b) => (
              <option key={b.id}>{b.holder}</option>
            ))}
          </select>
        </Field>
        <div className="field">
          <label htmlFor="ledger-status">สถานะเล่ม</label>
          <select id="ledger-status" defaultValue="active">
            <option value="active">เปิดใช้งาน</option>
          </select>
        </div>
      </div>
      <div className="book-selector-cards">
        {filtered.map((b) => {
          const count = counts(b);
          return (
            <button
              key={b.id}
              className={`book-card ${book.id === b.id ? "selected" : ""}`}
              onClick={() => choose(b.id)}
              aria-pressed={book.id === b.id}
            >
              <div className="book-card-title">
                <div className="flex gap-3 items-center">
                  <span className="icon-tile">
                    <BookOpen size={22} />
                  </span>
                  <div>
                    <p className="text-xs text-secondary">เล่มใบเสร็จจริง</p>
                    <h3>{b.bookNo}</h3>
                  </div>
                </div>
                <Badge tone="success">เปิดใช้</Badge>
              </div>
              <p className="text-xs text-secondary mt-4">
                ผู้ถือครอง · {b.holder}
              </p>
              <div className="book-progress" aria-hidden>
                <span
                  className="used"
                  style={{ width: `${count.used * 2}%` }}
                />
                <span
                  className="void"
                  style={{ width: `${count.void * 2}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-secondary">
                <span>
                  ใช้แล้ว {count.used} · ยกเลิก {count.void}
                </span>
                <strong className="text-primary">
                  ว่าง {count.available} / 50
                </strong>
              </div>
            </button>
          );
        })}
      </div>
      <div className="work-split">
        <Panel>
          <SectionTitle
            title={`เล่ม ${book.bookNo}`}
            subtitle={`${book.holder} · 50 หน้า · ปีงบประมาณ ${book.fiscalYear}`}
            action={<Badge tone={book.status === "active" ? "success" : "neutral"}>{book.status.toUpperCase()}</Badge>}
          />
          <Tabs id="ledger-view" label="มุมมองเล่มใบเสร็จ" tabs={[{ id: "pages", label: "สถานะรายหน้า" }, { id: "history", label: "ประวัติการเคลื่อนไหว" }]} value={tab} onChange={setTab}>
          {tab === "history" ? (
            <>
              <h3>เหตุการณ์จากระบบโรงเรียน</h3>
              <div className="timeline">
                {audit
                  .filter((a) => a.detail.includes(book.bookNo))
                  .map((a) => (
                    <div key={a.id} className="timeline-item">
                      <p className="font-medium">{a.title}</p>
                      <p className="text-xs text-secondary mt-1">{a.detail}</p>
                      <small>{a.at}</small>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <>
              <form onSubmit={searchPage} className="flex items-end gap-3 mb-6">
                <div className="flex-1">
                  <Field
                    id="page-search"
                    label="ค้นหาหน้า / เลขที่พิมพ์บนใบเสร็จ"
                  >
                    <input
                      id="page-search"
                      inputMode="numeric"
                      maxLength={50}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="เช่น 9"
                    />
                  </Field>
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  aria-label="ค้นหาหน้าใบเสร็จ"
                >
                  <Search size={17} />
                  <span className="hidden sm:inline">ค้นหา</span>
                </Button>
              </form>
              {noMatch && (
                <div className="mb-5">
                  <Alert tone="warning">
                    ไม่พบหน้าหรือเลขที่พิมพ์บนใบเสร็จในเล่มนี้
                  </Alert>
                </div>
              )}
              {ambiguous && <div className="mb-5"><Alert tone="warning">พบเลขอ้างอิงตรงกันหลายหน้า กรุณาตรวจสอบทั้งเล่มและเลือกหน้าที่ถูกต้อง ไม่เปิดรายการแรกโดยอัตโนมัติ</Alert></div>}
              <div className="flex flex-wrap justify-between gap-3 items-center mb-5">
                <h3 className="text-sm">ภาพรวมทั้งเล่ม</h3>
                <label className="flex items-center gap-2 text-xs text-secondary">
                  แสดง
                  <select
                    className="!min-h-9 !py-1 !text-xs !w-auto"
                    aria-label="กรองสถานะหน้า"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="all">ทุกสถานะ · 50 หน้า</option>
                    <option value="available">ว่าง · {c.available}</option>
                    <option value="used">ใช้แล้ว · {c.used}</option>
                    <option value="void">ยกเลิก · {c.void}</option>
                  </select>
                </label>
              </div>
              {visiblePages.length ? (
                <div className="page-grid">
                  {visiblePages.map((p) => (
                    <button
                      key={p.id}
                      className={`page-cell ${p.status}`}
                      onClick={() => inspect(p)}
                      aria-label={`เล่ม ${book.bookNo} หน้า ${p.pageNo} ${p.status}`}
                    >
                      <span>{String(p.pageNo).padStart(2, "0")}</span>
                      {p.status === "used" ? (
                        <Check size={12} aria-hidden />
                      ) : p.status === "void" ? (
                        <Minus size={12} aria-hidden />
                      ) : (
                        <span aria-hidden className="h-3 text-[8px] leading-3">
                          ว่าง
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="ไม่มีหน้าสถานะนี้"
                  description="ลองเปลี่ยนตัวกรองเพื่อดูหน้าอื่นในเล่ม"
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => setStatus("all")}
                    >
                      แสดงทุกหน้า
                    </Button>
                  }
                />
              )}
              <div className="legend">
                <span>
                  <i className="legend-dot used" />
                  ใช้แล้ว {c.used}
                </span>
                <span>
                  <i className="legend-dot void" />
                  ยกเลิก {c.void}
                </span>
                <span>
                  <i className="legend-dot" />
                  ว่าง {c.available}
                </span>
              </div>
              <p className="text-xs text-muted mt-4">
                เลือกหน้าเพื่อดูข้อมูลอ้างอิงและประวัติ ·
                หน้าที่ใช้แล้วหรือยกเลิกไม่สามารถนำกลับมาใช้ได้
              </p>
            </>
          )}
          </Tabs><ReceiptNotice />
        </Panel>
        <aside className="work-aside">
          <Panel>
            <SectionTitle title="ตรวจสอบความครบถ้วน" />
            <div className="flex gap-3 items-center mb-5">
              <span className="icon-tile">
                <ClipboardCheck size={24} />
              </span>
              <div>
                <strong className="text-2xl money">50 / 50</strong>
                <p className="text-xs text-secondary">
                  หน้าที่อยู่ในทะเบียน
                </p>
              </div>
            </div>
            <DetailList
              items={[
                { label: "ใช้รับเงินแล้ว", value: `${c.used} หน้า` },
                { label: "ยกเลิกพร้อมเหตุผล", value: `${c.void} หน้า` },
                { label: "ยังว่าง", value: `${c.available} หน้า` },
              ]}
            />
            <Alert tone="success">
              มีข้อมูลรายหน้าครบ 50 หน้า ตรวจสอบกับเล่มจริงก่อนคืนเล่ม
            </Alert>
            <Button
              variant="secondary"
              className="w-full mt-5"
              onClick={() => {
                setPhysical({
                  used: String(c.used),
                  void: String(c.void),
                  available: String(c.available),
                });
                setIssues(null);
                setReconcile(true);
              }}
            >
              ตรวจนับ / คืนเล่ม
              <ArrowRight size={16} />
            </Button>
          </Panel>
          <Panel>
            <SectionTitle
              title="กิจกรรมล่าสุด"
              action={<History size={18} className="text-muted" />}
            />
            <div className="timeline">
              {audit.slice(0, 3).map((a) => (
                <div key={a.id} className="timeline-item">
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-secondary mt-1">{a.detail}</p>
                  <small>{a.at}</small>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
      <Overlay
        open={!!page}
        onClose={() => setPage(null)}
        title={`เล่ม ${book.bookNo} / หน้า ${page?.pageNo ?? ""}`}
        description="ทะเบียนอ้างอิงใบเสร็จจริง · ข้อมูลต้นทาง"
        drawer
        busy={busy}
      >
        {page?.transaction ? (
          <><ReceiptReferenceView transaction={page.transaction} /><div className="mt-5"><Alert tone="warning">G02 การแก้ไขอ้างอิง ย้อนรายการรับเงิน หรือยกเลิกหน้าที่ใช้แล้ว ต้องมีขั้นตอนที่อนุมัติ ไม่มีการลบหรือคืนหน้ากลับมาใช้ซ้ำจากหน้านี้</Alert></div><Button className="mt-4" disabled>แก้ไขรายการใช้แล้ว · รอยืนยันนโยบาย</Button></>
        ) : page ? (
          <>
            <PageBadge status={page.status} />
            <DetailList
              items={[
                { label: "เล่ม", value: book.bookNo },
                { label: "หน้า", value: `${page.pageNo} / 50` },
                { label: "ผู้ถือครอง", value: book.holder },
                {
                  label: "สถานะ",
                  value:
                    page.status === "available"
                      ? "ยังไม่มีรายการรับเงิน"
                      : "ยกเลิกแล้ว",
                },
              ]}
            />
            {page.voidReason && (
              <Alert tone="danger" title="เหตุผลการยกเลิก">
                {page.voidReason}
              </Alert>
            )}
            {page.status === "available" && book.status === "active" && canVoid && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="mb-3">ยกเลิกหน้าว่าง</h3>
                <p className="text-sm text-secondary mb-4">
                  ใช้เมื่อเขียนผิดหรือชำรุดก่อนรับเงิน
                  การยกเลิกไม่ใช่การลบและไม่สามารถนำหน้านี้กลับมาใช้ได้
                </p>
                <Field
                  id="void-reason"
                  label="เหตุผลการยกเลิก"
                  required
                  error={error}
                >
                  <textarea
                    id="void-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={1000}
                    aria-invalid={!!error}
                  />
                </Field>
                <Button
                  variant="danger"
                  busy={busy}
                  onClick={voidPage}
                  className="mt-4"
                >
                  ยืนยันยกเลิกหน้าว่าง
                </Button>
              </div>
            )}
            <ReceiptNotice />
          </>
        ) : null}
      </Overlay>
      <Overlay
        open={reconcile}
        onClose={() => setReconcile(false)}
        title="ตรวจนับ / คืนเล่มใบเสร็จ"
        description={`เล่ม ${book.bookNo} · ตรวจเทียบกับทะเบียนและเอกสารจริง`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReconcile(false)}>
              ปิด
            </Button>
            <Button busy={busy} onClick={checkReturn}>
              ตรวจสอบยอดตรวจนับ
            </Button>
          </>
        }
      >
        <DetailList
          items={[
            { label: "ผู้ถือครอง", value: book.holder },
            { label: "ปีงบประมาณ", value: String(book.fiscalYear) },
          ]}
        />
        <div className="grid grid-cols-3 gap-3 mb-5">
          {(["used", "void", "available"] as const).map((key) => (
            <Field
              key={key}
              id={`count-${key}`}
              label={
                { used: "ใช้แล้ว", void: "ยกเลิก", available: "ว่าง" }[key]
              }
            >
              <input
                id={`count-${key}`}
                type="number"
                min="0"
                max="50"
                step="1"
                value={physical[key]}
                onChange={(e) => {
                  setPhysical({ ...physical, [key]: e.target.value });
                  setIssues(null);
                }}
              />
            </Field>
          ))}
        </div>
        {issues &&
          (issues.length ? (
            <Alert tone="danger">
              <ul>
                {issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </Alert>
          ) : (
            <Alert tone="success">จำนวนตรวจนับตรงกับทะเบียนทั้ง 50 หน้า</Alert>
          ))}
        <div className="mt-5">
          <Alert tone="warning">
            มีหน้าว่าง {c.available} หน้า · รอยืนยันนโยบายคืนเล่มบางส่วน
            จึงยังไม่เปิดการยืนยันคืนเล่มใน Stage B
          </Alert>
        </div>
      </Overlay>
    </>
  );
}
