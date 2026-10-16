import type { CollectionStudent, DemoRole, MonthlyCollection, Satang, Transaction } from "./model";

export const PAPER_STAGES = ["ครูที่ปรึกษา", "งานการเงินและบัญชี", "หัวหน้ากลุ่มบริหารงานงบประมาณ", "รองผู้อำนวยการกลุ่มบริหารงานงบประมาณ", "ผู้อำนวยการ"] as const;
export type MonthlyDraft = {
  id: string;
  revision: number;
  version: number;
  teacher: string;
  status: "draft" | "ready" | "memo_generated" | "submitted";
  snapshot: MonthlyCollection;
};
export type MonthlyWorkspace = { draft: MonthlyDraft; live: MonthlyCollection; history: MonthlyDraft[] };
export const financialKey = (data: MonthlyCollection) => JSON.stringify(data.students.map(s => [s.id, s.adjusted, s.paid, s.outstanding]));
export const debtorRows = (data: MonthlyCollection): CollectionStudent[] => data.students.filter(s => s.outstanding > 0);

export type GradeSummary = { grade: string; students: number; settled: number; adjusted: Satang; paid: Satang; outstanding: Satang };
export type DashboardData = { grades: GradeSummary[]; other: { id: string; name: string; amount: Satang }[]; asOf: string; stale: boolean };
export type ReferenceSelection = { bookId: string; pageId: string; expectedPageVersion: number; printedNo: string };
export type OtherMoneyCommand = ReferenceSelection & { commandId: string; categoryId: string; date: string; fiscalYear: number; payer: string; description: string; amount: Satang; note: string };
export type PendingReference = Omit<Transaction, "bookNo" | "pageNo"> & { version: number };
export type LinkReferenceCommand = ReferenceSelection & { commandId: string; transactionId: string; expectedTransactionVersion: number };
export type StaffAccess = { uid: string; name: string; source: "T-Folio · สาธิต"; role: DemoRole; active: boolean; rooms: string[]; version: number; capabilities?: import("./permissions").Capability[] };
export type AuditFilters = { search: string; module: string; cursor?: string; date?: string; actor?: string; action?: string; entity?: string };
export type AuditProjection = { id: string; title: string; at: string; actorUid: string; module: string; entityId: string; commandId?: string; detail: string };
export const REPORT_KINDS = ["monthly_memo", "receipt_ledger", "obec_inspection", "annual_usage", "book_return", "student_collections", "student_outstanding", "other_money"] as const;
export type ReportKind = typeof REPORT_KINDS[number];
export const REPORT_LABELS: Record<ReportKind, string> = { monthly_memo: "บันทึกข้อความรายเดือน", receipt_ledger: "ทะเบียนคุมใบเสร็จ", obec_inspection: "รายงานตรวจสอบแบบ สพฐ.", annual_usage: "สรุปการใช้ใบเสร็จรายปี", book_return: "รายงานคืนเล่ม", student_collections: "รายงานเงินชำระนักเรียน", student_outstanding: "รายงานยอดค้างชำระนักเรียน", other_money: "รายงานเงินรับประเภทอื่น" };
export type ReportRequest = { kind: ReportKind; room: string; month: string; year: number; grade: string };
export type BookMovement = { id: string; at: string; action: string; bookId: string; holder: string; received: number; issued: number; balance: number };
export type StockCommand = { commandId: string; identifiers: string[]; quantity: number; expectedVersion: number };
export type StockCursors = { bookCursor?: string; movementCursor?: string };
export type StockView = { version: number; opening: { carryForward: 6; received: 80; total: 86; finalized: false }; books: import("./model").ReceiptBook[]; movements: BookMovement[]; nextBookCursor?: string; nextMovementCursor?: string };
export type GenerationPreview = { assignmentId: string; version: number; room: string; students: number; perStudent: Satang; total: Satang; existing: number; issues: string[] };
export type LifecycleReview = { id: string; student: string; sourceChange: string; original: Satang; paid: Satang; proposal: string; gate: "G05" };
export type ReportPreview = { kind: ReportKind; source: string; revision: string; asOf: string; rows: { id: string; label: string; amount: Satang; detail: string }[]; issues: { severity: "error" | "warning"; message: string }[]; template: { status: "missing"; version: null; checksum: null }; academicYear?: number; fiscalYear?: number };
export const ROLE_LABELS: Record<DemoRole, string> = { homeroom_teacher: "ครูที่ปรึกษา", finance_teacher: "ครูการเงิน", finance_officer: "เจ้าหน้าที่การเงิน", executive: "ผู้บริหาร", superadmin: "ผู้ดูแลระบบ" };
export const STAFF: StaffAccess[] = [
  { uid: "staff-finance-01", name: "นางสาวกมลชนก ใจดี", role: "finance_officer", rooms: [] },
  { uid: "staff-finance-02", name: "นายธนกฤต รุ่งเรือง", role: "finance_teacher", rooms: [] },
  { uid: "staff-homeroom-01", name: "นางสาวศิริพร แสงทอง", role: "homeroom_teacher", rooms: ["ม.2/1"] },
  { uid: "staff-executive-01", name: "นายวรวิทย์ ธรรมรักษ์", role: "executive", rooms: [] },
  { uid: "staff-admin-01", name: "นางสาวปิยาภรณ์ สุขใจ", role: "superadmin", rooms: [] },
].map(s => ({ ...s, source: "T-Folio · สาธิต", active: true, version: 1 })) as StaffAccess[];
