import { assertBook, assertLedger, counts, DomainError, satang, type DemoRole, type Scenario, type Snapshot, type MonthlyCollection } from "../../domain/model";
import { debtorRows, REPORT_KINDS, type MonthlyWorkspace, type ReportRequest, type ReportPreview, type DashboardData } from "../../domain/workspace";

export async function previewMockReport(filters: ReportRequest, role: DemoRole, state: Snapshot, scenario: Scenario, sources: {
  room: () => Promise<MonthlyCollection | null>;
  monthly: () => Promise<MonthlyWorkspace | null>;
  dashboard: () => Promise<DashboardData>;
}): Promise<ReportPreview> {
  if (!REPORT_KINDS.includes(filters.kind)) throw new DomainError("FORBIDDEN", "ประเภทเอกสารนี้ไม่อยู่ในรายการที่อนุญาต");
  const academic = ["monthly_memo", "student_collections", "student_outstanding"].includes(filters.kind);
  if (role === "homeroom_teacher" && (!academic || filters.room !== "ม.2/1")) throw new DomainError("FORBIDDEN", "ครูที่ปรึกษาดูรายงานได้เฉพาะห้องที่ได้รับมอบหมาย");
  const rows: ReportPreview["rows"] = [], issues: ReportPreview["issues"] = [];
  let source = academic ? "room-live-2569-1" : "ledger-fiscal-2570", revision = academic ? `account-${state.student.obligations.map(o => o.version).join("-")}` : `books-${state.books.map(b => `${b.id}@${b.version}`).join(",")}`;
  let asOf = state.books.some(b => b.pages.some(p => p.transaction?.date === "2026-10-16")) ? "2026-10-16T09:30:00+07:00" : "2026-10-16T09:25:00+07:00";
  if (academic && filters.grade !== "all" && filters.room.split("/")[0] !== filters.grade) issues.push({ severity: "error", message: "ไม่มีรายละเอียดห้องในระดับชั้นที่เลือกในชุดสาธิต" });
  else if (filters.year !== (academic ? 2569 : 2570)) issues.push({ severity: "warning", message: "ไม่มีข้อมูลช่วงเวลานี้ในชุดสาธิต" });
  else if (filters.kind === "monthly_memo") {
    const data = await sources.monthly();
    if (!data) issues.push({ severity: "error", message: "ไม่มีข้อมูลเดือนที่เลือก" });
    else {
      source = data.draft.id; revision = `v${data.draft.revision} / notes-${data.draft.version}`;
      asOf = data.draft.snapshot.asOf;
      for (const row of debtorRows(data.draft.snapshot)) {
        rows.push({ id: row.id, label: row.name, amount: row.outstanding, detail: `${row.reason || "ยังไม่บันทึก"} / ${row.solution || "ยังไม่บันทึก"}` });
        if (!row.reason.trim() || !row.solution.trim()) issues.push({ severity: "error", message: `${row.name}: ยังไม่บันทึกสาเหตุหรือแนวทางแก้ไข` });
      }
    }
  } else if (academic) {
    const collection = await sources.room();
    if (collection) for (const row of collection.students.filter(s => filters.kind !== "student_outstanding" || s.outstanding > 0)) rows.push({ id: row.id, label: row.name, amount: filters.kind === "student_outstanding" ? row.outstanding : row.paid, detail: `${row.code} · ${filters.room}` });
    else issues.push({ severity: "warning", message: "ไม่มีข้อมูลเดือนที่เลือกในชุดสาธิต" });
  } else if (filters.kind === "other_money") {
    const summary = await sources.dashboard();
    rows.push(...summary.other.map(x => ({ id: x.id, label: x.name, amount: x.amount, detail: "ไม่รวมภาระนักเรียน" })));
  } else {
    try { assertLedger(state.books); } catch { issues.push({ severity: "error", message: "ทะเบียนรายหน้าหรือรายการเชื่อมโยงไม่ผ่านการกระทบยอด" }); }
    for (const book of state.books.slice(0, 25)) {
      try { assertBook(book); } catch { issues.push({ severity: "error", message: `${book.bookNo}: รายหน้าไม่ครบหรือ USED ไม่มีรายการเชื่อมโยง` }); }
      const count = counts(book);
      rows.push({ id: book.id, label: book.bookNo, amount: satang(book.pages.reduce((sum, p) => sum + (p.transaction?.amount ?? 0), 0)), detail: `ใช้แล้ว ${count.used} / ยกเลิก ${count.void} / ว่าง ${count.available}` });
      if (filters.kind === "book_return" && count.available) issues.push({ severity: "error", message: `${book.bookNo}: ยังมีหน้าว่าง ต้องยืนยันนโยบาย G03 ก่อนคืนเล่มบางส่วน` });
    }
  }
  if (scenario === "stale") issues.push({ severity: "error", message: "ข้อมูลต้นทางล้าสมัย กรุณาตรวจสอบใหม่" });
  if (scenario === "report-invalid") issues.push({ severity: "error", message: "ชุดทดสอบเสียหาย: USED page ไม่มีรายการเชื่อมโยง ไม่ผ่านการกระทบยอด" });
  issues.push({ severity: "error", message: "G04 ยังไม่มีแม่แบบจริง เวอร์ชันหรือ checksum ที่อนุมัติ จึงสร้างไฟล์ไม่ได้" });
  return structuredClone({ kind: filters.kind, source, revision, asOf, rows: rows.slice(0, 100), issues, template: { status: "missing", version: null, checksum: null }, ...(academic ? { academicYear: filters.year } : { fiscalYear: filters.year }) });
}
