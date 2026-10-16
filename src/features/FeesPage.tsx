import { useCapability } from "../app/AppProvider";
import { useEffect, useState, type FormEvent } from "react";
import { UnsavedChangesGuard } from "../components/UnsavedChangesGuard";
import { NavLink, useLocation } from "react-router-dom";
import { GenerationReview, LifecycleReviews } from "./AssignmentReviews";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Layers3,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useApp, useRefresh, useSnapshot } from "../app/AppProvider";
import {
  money,
  parseMoney,
  type Assignment,
  type FeeItem,
} from "../domain/model";
import {
  Alert,
  Badge,
  Button,
  DetailList,
  EmptyState,
  Field,
  LoadingState,
  Metric,
  Money,
  Overlay,
  PageHeader,
  Panel,
  QueryError,
  SectionTitle,
} from "../components/ui";
const frequency = { term: "รายภาคเรียน", annual: "รายปี", once: "ครั้งเดียว" };
export default function FeesPage() {
  const query = useSnapshot(),
    location = useLocation();
  if (query.isPending) return <LoadingState />;
  if (query.isError) return <QueryError onRetry={() => void query.refetch()} />;
  const assignment = location.pathname.endsWith("/assignments");
  return (
    <>
      <PageHeader
        eyebrow="SUPERADMIN · FEE CONFIGURATION"
        title={assignment ? "กำหนดภาระรายห้อง" : "รายการเงิน"}
        description={
          assignment
            ? "จัดชุดภาระให้ตรงกับห้องและแผนการเรียน ตรวจสอบอัตราก่อนเผยแพร่"
            : "จัดการรายการภาระนักเรียนและหมวดรับเงินอื่นอย่างเป็นระบบ"
        }
        action={<Badge tone="info">ข้อมูลและอัตราเรียกเก็บ</Badge>}
      />
      <div className="tab-row">
        <NavLink to="/app/fees">รายการเงิน</NavLink>
        <NavLink to="/app/assignments">กำหนดภาระรายห้อง</NavLink>
      </div>
      {assignment ? <>
        <Assignments
          assignments={query.data.assignments}
          fees={query.data.fees}
        />
        <LifecycleReviews />
      </> : (
        <FeeMaster fees={query.data.fees} />
      )}
    </>
  );
}
function FeeMaster({ fees }: { fees: FeeItem[] }) {
  const { role, adapter } = useApp(),
    refresh = useRefresh();
  const [kind, setKind] = useState<"student" | "other">("student"),
    [search, setSearch] = useState(""),
    [active, setActive] = useState("all"),
    [editor, setEditor] = useState<FeeItem | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(""),
    [initialEditor, setInitialEditor] = useState(""),
    [discard, setDiscard] = useState(false);
  const editorDirty = !!editor && JSON.stringify(editor) !== initialEditor;
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (editorDirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [editorDirty]);
  function closeEditor() {
    if (editorDirty) setDiscard(true);
    else setEditor(null);
  }
  const writable = useCapability("fee.edit");
  const filtered = fees.filter(
    (f) =>
      f.kind === kind &&
      (active === "all" || f.active === (active === "active")) &&
      `${f.code} ${f.name}`.toLowerCase().includes(search.toLowerCase()),
  );
  function edit(item?: FeeItem) {
    setError("");
    const next: FeeItem = item
      ? structuredClone(item)
      : {
          id: crypto.randomUUID(),
          code: "",
          name: "",
          category:
            kind === "other" ? "เงินรับประเภทอื่น" : "เงินบำรุงการศึกษา",
          group: kind === "other" ? "other" : "obec",
          frequency: "term",
          active: true,
          kind,
        };
    setInitialEditor(JSON.stringify(next));
    setDiscard(false);
    setEditor(next);
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editor) return;
    setBusy(true);
    setError("");
    try {
      await adapter.saveFee(
        {
          ...editor,
          code: editor.code.trim().toUpperCase(),
          name: editor.name.trim(),
        },
        role,
      );
      setSaved(`บันทึกรายการ ${editor.name} แล้ว`);
      setEditor(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="metrics">
        <Metric
          label="รายการภาระนักเรียน"
          value={fees.filter((f) => f.kind === "student").length}
          caption="กำหนดอัตราผ่านชุดภาระรายห้อง"
          icon={<Layers3 size={18} />}
        />
        <Metric
          label="หมวดรับเงินประเภทอื่น"
          value={fees.filter((f) => f.kind === "other").length}
          caption="ไม่สร้างภาระให้นักเรียน"
          icon={<Layers3 size={18} />}
        />
        <Metric
          label="รายการเปิดใช้งาน"
          value={fees.filter((f) => f.active).length}
          caption="พร้อมใช้ในชุดภาระที่เหมาะสม"
          icon={<CheckCircle2 size={18} />}
        />
        <Metric
          label="การกำหนดอัตรา"
          value="รายห้อง"
          caption="จัดการอัตราแยกตามปี / ภาคเรียน"
        />
      </div>
      {saved && (
        <div className="mb-5">
          <Alert tone="success">{saved}</Alert>
        </div>
      )}
      <Panel>
        <SectionTitle
          title="ทะเบียนรายการเงิน"
          subtitle="รายการเงินและหมวดรับเงินอื่นแยกจากกันอย่างชัดเจน"
          action={
            writable ? (
              <Button onClick={() => edit()}>
                <Plus size={17} />
                เพิ่มรายการ
              </Button>
            ) : (
              <Badge>อ่านอย่างเดียว</Badge>
            )
          }
        />
        <div
          className="flex flex-wrap gap-2 mb-6"
          role="group"
          aria-label="ประเภทรายการเงิน"
        >
          <Button
            variant={kind === "student" ? "primary" : "secondary"}
            onClick={() => setKind("student")}
            aria-pressed={kind === "student"}
          >
            ภาระนักเรียน
          </Button>
          <Button
            variant={kind === "other" ? "primary" : "secondary"}
            onClick={() => setKind("other")}
            aria-pressed={kind === "other"}
          >
            หมวดรับเงินอื่น
          </Button>
        </div>
        {kind === "other" && (
          <div className="mb-5">
            <Alert>
              หมวดรับเงินอื่นใช้จำแนกทุน เงินบริจาค และเงินสนับสนุนเท่านั้น
              ไม่สร้างภาระชำระให้นักเรียน
            </Alert>
          </div>
        )}
        <div className="filter-row">
          <div className="field search-field">
            <label htmlFor="fee-search">ค้นหารายการ</label>
            <div className="search-input">
              <Search size={18} aria-hidden />
              <input
                id="fee-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาจากชื่อหรือรหัสรายการ"
              />
            </div>
          </div>
          <Field id="fee-active" label="สถานะ">
            <select
              id="fee-active"
              value={active}
              onChange={(e) => setActive(e.target.value)}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">เปิดใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
            </select>
          </Field>
        </div>
        {filtered.length ? (
          <>
            <div className="data-table-wrap desktop-only">
              <table className="data-table">
                <caption className="sr-only">ทะเบียนรายการเงิน</caption>
                <thead>
                  <tr>
                    <th scope="col">รหัส / รายการเงิน</th>
                    <th scope="col">หมวด</th>
                    <th scope="col">ความถี่</th>
                    <th scope="col">สถานะ</th>
                    <th scope="col">
                      <span className="sr-only">การดำเนินการ</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <p className="text-[11px] text-muted mb-1">{f.code}</p>
                        <p className="font-medium">{f.name}</p>
                      </td>
                      <td className="text-secondary text-xs">{f.category}</td>
                      <td>
                        <span className="frequency">
                          {kind === "other"
                            ? "ตามรายการรับ"
                            : frequency[f.frequency]}
                        </span>
                      </td>
                      <td>
                        <Badge tone={f.active ? "success" : "neutral"}>
                          {f.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </td>
                      <td>
                        <button
                          className="icon-button text-primary"
                          onClick={() => edit(f)}
                          aria-label={`${writable ? "แก้ไข" : "ดู"} ${f.code}`}
                        >
                          <Pencil size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-only">
              {filtered.map((f) => (
                <article className="fee-mobile-card" key={f.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">{f.code}</p>
                      <h3 className="text-sm">{f.name}</h3>
                    </div>
                    <button
                      className="icon-button text-primary"
                      onClick={() => edit(f)}
                      aria-label={`${writable ? "แก้ไข" : "ดู"} ${f.code}`}
                    >
                      <Pencil size={17} />
                    </button>
                  </div>
                  <div className="flex justify-between gap-3 mt-3">
                    <span className="text-xs text-secondary">
                      {kind === "other"
                        ? "ตามรายการรับ"
                        : frequency[f.frequency]}
                    </span>
                    <Badge tone={f.active ? "success" : "neutral"}>
                      {f.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </Badge>
                  </div>
                </article>
              ))}
            </div>
            <p className="text-xs text-muted mt-4">
              แสดง {filtered.length} รายการ · ราคากำหนดแยกในชุดภาระรายห้อง
            </p>
          </>
        ) : (
          <EmptyState
            title={fees.length ? "ไม่พบรายการที่ตรงกับตัวกรอง" : "ยังไม่มีรายการเงิน"}
            description={fees.length ? "ลองค้นหาด้วยชื่อหรือรหัสอื่น หรือแสดงรายการทุกสถานะ" : "รายการและอัตราเรียกเก็บจะแสดงเมื่อได้รับข้อมูลจากโรงเรียน"}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setActive("all");
                }}
              >
                ล้างตัวกรอง
              </Button>
            }
          />
        )}
      </Panel>
      <Overlay
        open={!!editor}
        onClose={closeEditor}
        title={
          editor && fees.some((f) => f.id === editor.id)
            ? "รายละเอียดรายการเงิน"
            : "เพิ่มรายการเงิน"
        }
        description={
          kind === "student"
            ? "รายการภาระนักเรียน · อัตรากำหนดแยกตามห้อง"
            : "หมวดรับเงินอื่น · ไม่ใช้สร้างภาระนักเรียน"
        }
        drawer
        busy={busy}
        footer={
          discard ? (
            <>
              <Button variant="secondary" onClick={() => setDiscard(false)}>
                กลับไปแก้ไข
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setDiscard(false);
                  setEditor(null);
                }}
              >
                ยกเลิกแบบร่าง
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" disabled={busy} onClick={closeEditor}>
                ยกเลิก
              </Button>
              {writable && (
                <Button type="submit" form="fee-editor" busy={busy}>
                  บันทึกรายการ
                </Button>
              )}
            </>
          )
        }
      >
        {discard && (
          <Alert tone="warning" title="มีการแก้ไขที่ยังไม่บันทึก">
            ยกเลิกแบบร่างเพื่อออก หรือกลับไปแก้ไขและบันทึกรายการ
          </Alert>
        )}
        {editor && !discard && (
          <form id="fee-editor" onSubmit={save} className="space-y-5">
            {error && <Alert tone="danger">{error}</Alert>}
            <fieldset disabled={!writable || busy} className="space-y-5">
              <Field
                id="fee-code"
                label="รหัสรายการ"
                required
                hint="รหัสของรายการเดิมแก้ไขไม่ได้"
              >
                <input
                  id="fee-code"
                  value={editor.code}
                  readOnly={fees.some((f) => f.id === editor.id)}
                  maxLength={32}
                  onChange={(e) =>
                    setEditor({ ...editor, code: e.target.value })
                  }
                />
              </Field>
              <Field id="fee-name" label="ชื่อรายการ" required>
                <input
                  id="fee-name"
                  value={editor.name}
                  maxLength={200}
                  onChange={(e) =>
                    setEditor({ ...editor, name: e.target.value })
                  }
                />
              </Field>
              <Field id="fee-category" label="หมวดรายการ">
                <select
                  id="fee-category"
                  value={editor.category}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      category: e.target.value,
                      group:
                        e.target.value === "สมาคมฯ"
                          ? "association"
                          : editor.kind === "other"
                            ? "other"
                            : "obec",
                    })
                  }
                >
                  {editor.kind === "student" ? (
                    <>
                      <option>เงินบำรุงการศึกษา</option>
                      <option>สมาคมฯ</option>
                    </>
                  ) : (
                    <option>เงินรับประเภทอื่น</option>
                  )}
                </select>
              </Field>
              {editor.kind === "student" && (
                <Field id="fee-frequency" label="ความถี่การเรียกเก็บ">
                  <select
                    id="fee-frequency"
                    value={editor.frequency}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        frequency: e.target.value as FeeItem["frequency"],
                      })
                    }
                  >
                    {Object.entries(frequency).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <label className="choice">
                <input
                  type="checkbox"
                  checked={editor.active}
                  onChange={(e) =>
                    setEditor({ ...editor, active: e.target.checked })
                  }
                />
                เปิดใช้งานรายการนี้
              </label>
              {!editor.active && (
                <Alert tone="warning">
                  การปิดใช้งานไม่ลบประวัติหรือภาระเดิม
                  รายการนี้จะใช้สร้างชุดภาระใหม่ไม่ได้
                </Alert>
              )}
            </fieldset>
          </form>
        )}
      </Overlay>
    </>
  );
}
function Assignments({
  assignments,
  fees,
}: {
  assignments: Assignment[];
  fees: FeeItem[];
}) {
  const [selectedId, setSelectedId] = useState(assignments[0]?.id ?? ""),
    [year, setYear] = useState("all"),
    [term, setTerm] = useState("all"),
    [roomFilter, setRoomFilter] = useState("all"),
    [draftDirty, setDraftDirty] = useState(false);
  const filtered = assignments.filter(
    (a) =>
      (year === "all" || String(a.academicYear) === year) &&
      (term === "all" || String(a.term) === term) &&
      (roomFilter === "all" || a.room === roomFilter),
  );
  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0];
  return (
    <>
      <div className="filter-row">
        <Field id="assignment-year" label="ปีการศึกษา">
          <select
            id="assignment-year"
            disabled={draftDirty}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="all">ทุกปีการศึกษา</option>
            {Array.from(new Set(assignments.map((a) => a.academicYear)))
              .sort()
              .map((y) => (
                <option key={y}>{y}</option>
              ))}
          </select>
        </Field>
        <Field id="assignment-term" label="ภาคเรียน">
          <select id="assignment-term" value={term} disabled={draftDirty} onChange={e => setTerm(e.target.value)}><option value="all">ทุกภาคเรียน</option>{[...new Set(assignments.map(a => a.term))].sort().map(t => <option key={t} value={t}>ภาคเรียนที่ {t}</option>)}</select>
        </Field>
        <Field id="assignment-room" label="ห้องเรียน">
          <select
            id="assignment-room"
            disabled={draftDirty}
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
          >
            <option value="all">ทุกห้องจากระบบโรงเรียน</option>
            {[...new Set(assignments.map(a => a.room))].map(room => <option key={room}>{room}</option>)}
          </select>
        </Field>
      </div>
      <div className="assignment-layout">
        <aside>
          <div className="flex justify-between items-center mb-3">
            <h2 className="!text-sm">ชุดภาระรายห้อง</h2>
            <Badge>{filtered.length}</Badge>
          </div>
          <div className="assignment-list">
            {filtered.map((a) => (
              <button
                key={a.id}
                disabled={draftDirty}
                onClick={() => setSelectedId(a.id)}
                className={`assignment-item ${selected?.id === a.id ? "selected" : ""}`}
                aria-pressed={selected?.id === a.id}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <strong>{a.room}</strong>
                  <span className="text-xs text-muted">v{a.version}</span>
                </div>
                <p className="text-xs text-secondary mb-3">
                  {a.program} · {a.studentCount} คน
                </p>
                <Badge tone={a.status === "published" ? "success" : "warning"}>
                  {a.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                </Badge>
              </button>
            ))}
          </div>
          <div className="mt-5">
            <Alert>
              ตรวจสอบอัตราก่อนเผยแพร่รายการเรียกเก็บ
            </Alert>
          </div>
        </aside>
        {selected ? (
          <AssignmentEditor
            key={`${selected.id}-${selected.version}`}
            assignment={selected}
            onDirty={setDraftDirty}
            fees={fees}
            onCopy={(y) => {
              setYear(String(y));
              setRoomFilter("all");
            }}
          />
        ) : (
          <Panel>
            <EmptyState
              title="ยังไม่มีชุดภาระในช่วงที่เลือก"
              description="เปลี่ยนตัวกรองเพื่อเลือกชุดภาระที่มีในข้อมูลต้นทาง"
            />
          </Panel>
        )}
      </div>
    </>
  );
}
function AssignmentEditor({
  assignment,
  fees,
  onCopy,
  onDirty,
}: {
  assignment: Assignment;
  fees: FeeItem[];
  onCopy: (year: number) => void;
  onDirty: (dirty: boolean) => void;
}) {
  const { role, adapter } = useApp(),
    refresh = useRefresh();
  const [amounts, setAmounts] = useState<Record<string, string>>(
      Object.fromEntries(
        Object.entries(assignment.amounts).map(([id, value]) => [
          id,
          (value / 100).toFixed(2),
        ]),
      ),
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [review, setReview] = useState(false),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  const writable = useCapability("fee.edit"),
    editable = writable && assignment.status === "draft",
    total = Object.values(amounts).reduce((sum, value) => {
      try {
        return sum + parseMoney(value);
      } catch {
        return sum;
      }
    }, 0),
    validAmounts =
      Number.isSafeInteger(total * assignment.studentCount) &&
      Object.values(amounts).every((value) => {
        try {
          parseMoney(value);
          return true;
        } catch {
          return false;
        }
      }),
    selectedFees = fees.filter((f) => f.kind === "student" && f.id in amounts);
  async function save() {
    setBusy(true);
    setError("");
    try {
      const parsed = Object.fromEntries(
        Object.entries(amounts).map(([id, value]) => [id, parseMoney(value)]),
      );
      await adapter.saveAssignment(
        { ...assignment, amounts: parsed },
        assignment.version,
        role,
      );
      setDirty(false);
      setMessage("บันทึกอัตราฉบับร่างแล้ว");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    setBusy(true);
    setError("");
    try {
      await adapter.publishAssignment(assignment.id, assignment.version, role);
      setReview(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "เผยแพร่ไม่สำเร็จ");
      setReview(false);
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    setBusy(true);
    setError("");
    try {
      await adapter.copyAssignment(assignment.id, role);
      await refresh();
      onCopy(assignment.academicYear + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "คัดลอกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  async function generate() {
    setBusy(true);
    setError("");
    try {
      const result = await adapter.generate(assignment.id, role);
      setMessage(
        `ข้าม ${result.skipped} รายการที่มีอยู่แล้ว · ไม่สร้างภาระซ้ำ`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "ตรวจสอบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <UnsavedChangesGuard dirty={dirty} locked={busy} />
      <Panel>
        <SectionTitle
          title={`ชุดภาระชำระ ${assignment.room}`}
          subtitle={`${assignment.program} · ภาคเรียน 1/${assignment.academicYear} · เวอร์ชัน ${assignment.version}`}
          action={
            <Badge
              tone={assignment.status === "published" ? "success" : "warning"}
            >
              {assignment.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
            </Badge>
          }
        />
        {error && (
          <div className="mb-5">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}
        {message && (
          <div className="mb-5">
            <Alert tone="success">{message}</Alert>
          </div>
        )}
        {assignment.status === "published" ? (
          <div className="mb-6">
            <Alert>
              ชุดภาระที่เผยแพร่แล้วอ่านอย่างเดียว การแก้ไขต้องสร้างฉบับร่างใหม่
              ไม่เปลี่ยนภาระหรือประวัติการชำระเดิม
            </Alert>
          </div>
        ) : (
          <div className="mb-6">
            <Alert tone="warning">
              ฉบับร่างนี้ยังไม่สร้างภาระให้นักเรียน
              บันทึกอัตราและตรวจสอบก่อนเผยแพร่
            </Alert>
          </div>
        )}
        <div className="flex items-center gap-2 mb-4">
          <Layers3 size={18} className="text-primary" />
          <h3 className="text-sm">รายการภาระประจำภาคเรียน</h3>
        </div>
        {selectedFees.map((f) => (
          <div className="assignment-line" key={f.id}>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted mb-1">
                {f.code} · {f.category}
              </p>
              <h3>{f.name}</h3>
              <p className="text-xs text-secondary mt-1">
                {frequency[f.frequency]}
              </p>
            </div>
            {editable ? (
              <Field id={`amount-${f.id}`} label="อัตรา (บาท)">
                <input
                  id={`amount-${f.id}`}
                  inputMode="decimal"
                  value={amounts[f.id]}
                  onChange={(e) => {
                    setAmounts({ ...amounts, [f.id]: e.target.value });
                    setDirty(true);
                  }}
                />
              </Field>
            ) : (
              <strong className="money text-lg">
                {money(assignment.amounts[f.id])}
              </strong>
            )}
          </div>
        ))}
        {editable && (
          <div className="mt-5">
            <Field id="assignment-add" label="เพิ่มรายการภาระนักเรียน">
              <select
                id="assignment-add"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    setAmounts({ ...amounts, [e.target.value]: "0.00" });
                    setDirty(true);
                  }
                }}
              >
                <option value="">เลือกรายการที่เปิดใช้งาน</option>
                {fees
                  .filter(
                    (f) =>
                      f.kind === "student" && f.active && !(f.id in amounts),
                  )
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.code} · {f.name}
                    </option>
                  ))}
              </select>
            </Field>
          </div>
        )}
        <div className="assignment-summary">
          <div>
            <small>ภาระต่อคน</small>
            <strong>
              {validAmounts ? <Money value={total} /> : "ตรวจสอบอัตรา"}
            </strong>
          </div>
          <div>
            <small>นักเรียนในขอบเขต</small>
            <strong>{assignment.studentCount} คน</strong>
          </div>
          <div>
            <small>ประมาณการทั้งห้อง</small>
            <strong className="text-primary">
              {validAmounts ? (
                <Money value={total * assignment.studentCount} />
              ) : (
                "—"
              )}
            </strong>
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          รายชื่อและอัตราจากต้นทาง · ค่าประมาณไม่ใช่ยอดที่เรียกเก็บจริง
        </p>
        <div className="flex flex-wrap justify-end gap-3 pt-6 mt-6 border-t border-border">
          {writable && (
            <Button
              variant="secondary"
              busy={busy}
              disabled={dirty}
              onClick={copy}
            >
              <Copy size={16} />
              คัดลอกปีถัดไป
            </Button>
          )}
          {editable && (
            <>
              {dirty && (
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setAmounts(
                      Object.fromEntries(
                        Object.entries(assignment.amounts).map(
                          ([id, value]) => [id, (value / 100).toFixed(2)],
                        ),
                      ),
                    );
                    setDirty(false);
                    setError("");
                  }}
                >
                  ยกเลิกการแก้ไข
                </Button>
              )}
              <Button
                variant="secondary"
                busy={busy}
                disabled={!dirty}
                onClick={save}
              >
                บันทึกฉบับร่าง
              </Button>
              <Button
                disabled={dirty || busy}
                onClick={() => setReview(true)}
              >
                ตรวจสอบก่อนเผยแพร่
                <ArrowRight size={16} />
              </Button>
            </>
          )}
        </div>
        {dirty && (
          <p className="text-sm text-secondary mt-3">
            มีการแก้ไขที่ยังไม่บันทึก กรุณาบันทึกฉบับร่างก่อนเผยแพร่
          </p>
        )}
      </Panel>
      <Panel>
        <SectionTitle
          title="การสร้างภาระนักเรียน"
          subtitle="การเผยแพร่ชุดอัตราและการสร้างภาระเป็นคนละขั้นตอน"
          action={<Users size={20} className="text-muted" />}
        />
        {assignment.generated ? (
          <>
            <Alert tone="success">
              ชุดภาระนี้สร้างไว้แล้วสำหรับนักเรียน {assignment.studentCount}{" "}
              คนในข้อมูลต้นทาง
            </Alert>
            {writable && (
              <Button
                variant="secondary"
                className="mt-4"
                busy={busy}
                onClick={generate}
              >
                ตรวจสอบการสร้างซ้ำ
              </Button>
            )}
          </>
        ) : (
          <Alert tone="warning">
            ยังไม่เปิดสร้างภาระสำหรับห้องใหม่ใน Stage B ต้องยืนยันรายชื่อ
            ความถี่ และนโยบายการสร้างภาระก่อน
            ไม่มีการสร้างหนี้อัตโนมัติจากการเผยแพร่
          </Alert>
        )}
        <GenerationReview id={assignment.id} />
      </Panel>
      <Overlay
        open={review}
        onClose={() => setReview(false)}
        title="ตรวจสอบก่อนเผยแพร่"
        description="ตรวจสอบขอบเขตและอัตราเรียกเก็บ การเผยแพร่ยังไม่สร้างภาระนักเรียน"
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
            <Button busy={busy} onClick={publish}>
              เผยแพร่เวอร์ชัน
            </Button>
          </>
        }
      >
        <DetailList
          items={[
            {
              label: "ห้อง / แผน",
              value: `${assignment.room} · ${assignment.program}`,
            },
            {
              label: "ปี / ภาคเรียน",
              value: `${assignment.academicYear} / ${assignment.term}`,
            },
            { label: "เวอร์ชันฉบับร่าง", value: assignment.version },
            { label: "จำนวนนักเรียน", value: assignment.studentCount },
            { label: "ภาระต่อคน", value: <Money value={total} /> },
            {
              label: "ประมาณการทั้งห้อง",
              value: <Money value={total * assignment.studentCount} />,
            },
          ]}
        />
        <Alert tone="warning">
          หลังเผยแพร่จะเปลี่ยนอัตราของเวอร์ชันนี้โดยตรงไม่ได้
          ตรวจสอบข้อมูลให้ครบถ้วนก่อนยืนยัน
        </Alert>
      </Overlay>
    </div>
  );
}
