export type Satang = number & { readonly __satang: unique symbol };
export function satang(value: number): Satang {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new Error("จำนวนเงินไม่ถูกต้อง");
  return value as Satang;
}
export function parseMoney(value: string): Satang {
  if (!/^\d+(\.\d{1,2})?$/.test(value))
    throw new Error("กรอกจำนวนเงินไม่เกิน 2 ตำแหน่งทศนิยม");
  const [whole, decimal = ""] = value.split(".");
  return satang(Number(whole) * 100 + Number(decimal.padEnd(2, "0")));
}
export const money = (value: number, currency = true) =>
  `${currency ? "฿" : ""}${(value / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const CURRENT_MONTH = TODAY.slice(0, 7);
// Calendar defaults for input controls; academic periods must come from the school.
export const CALENDAR_YEAR = Number(TODAY.slice(0, 4)) + 543;
export const FISCAL_YEAR = CALENDAR_YEAR + (Number(TODAY.slice(5, 7)) >= 10 ? 1 : 0);
export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("th-TH-u-nu-latn", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
export const RECEIPT_NOTICE =
  "ข้อมูลอ้างอิงใบเสร็จจริงแบบเขียนมือ ไม่มีการพิมพ์ใบเสร็จจากระบบ";
export type PageStatus = "available" | "used" | "void";
export type StaffRole =
  | "finance_officer"
  | "superadmin"
  | "executive"
  | "homeroom_teacher"
  | "finance_teacher";
export type FollowupNote = { reason: string; solution: string; note: string };
export type CollectionStudent = FollowupNote & {
  id: string; code: string; name: string;
  adjusted: Satang; paid: Satang; outstanding: Satang;
  version: number; savedAt?: string;
};
export type HomeroomAccess = { rooms: string[]; teacher: string; editable: boolean };
export type MonthlyCollection = {
  room: string; month: string; academicYear: number; term: number;
  asOf: string; stale: boolean; students: CollectionStudent[];
  totals: { students: number; settled: number; debtors: number; adjusted: Satang; paid: Satang; outstanding: Satang };
};
export type SaveFollowup = FollowupNote & {
  room: string; month: string; studentId: string; expectedVersion: number;
};
export const missingFollowup = (row: FollowupNote) => !row.reason.trim() || !row.solution.trim();
export function followupErrors(value: FollowupNote) {
  const errors: Partial<Record<keyof FollowupNote, string>> = {};
  for (const [key, limit] of [["reason", 1000], ["solution", 1000], ["note", 2000]] as const)
    if (value[key].length > limit) errors[key] = `กรอกได้ไม่เกิน ${limit.toLocaleString("en-US")} ตัวอักษร`;
  return errors;
}
export type Obligation = {
  id: string;
  code: string;
  label: string;
  group: string;
  adjusted: Satang;
  paid: Satang;
  version: number;
};
export type Transaction = {
  id: string;
  type: "student_payment" | "other_receipt";
  amount: Satang;
  payer: string;
  description: string;
  receiver: string;
  date: string;
  bookNo: string;
  pageNo: number;
  printedNo?: string;
  obligationId?: string;
  categoryId?: string;
  reportNote?: string;
};
export type ReceiptPage = {
  id: string;
  pageNo: number;
  status: PageStatus;
  version: number;
  transaction?: Transaction;
  voidReason?: string;
};
export type ReceiptBook = {
  id: string;
  bookNo: string;
  holder: string;
  status: "stock" | "active" | "returned" | "closed";
  fiscalYear: number;
  version: number;
  pages: ReceiptPage[];
};
export type StudentAccount = {
  id: string;
  code: string;
  name: string;
  room: string;
  program: string;
  obligations: Obligation[];
  transactions: Transaction[];
};
export type VisitorAccount = { student: StudentAccount | null; previousHistory: Transaction[]; asOf?: string; periodLabel?: string; documents?: { id: string; title: string; url: string; publishedAt: string }[] };
export type FeeItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  group: string;
  frequency: "term" | "annual" | "once";
  active: boolean;
  kind: "student" | "other";
};
export type Assignment = {
  id: string;
  room: string;
  program: string;
  studentCount: number;
  academicYear: number;
  term: number;
  version: number;
  status: "draft" | "published";
  amounts: Record<string, Satang>;
  generated: boolean;
};
export type AuditEvent = {
  id: string;
  title: string;
  detail: string;
  at: string;
  actorUid?: string;
  module?: string;
  entityId?: string;
  commandId?: string;
  timestamp?: string;
};
export type Snapshot = {
  student: StudentAccount | null;
  books: ReceiptBook[];
  fees: FeeItem[];
  assignments: Assignment[];
  audit: AuditEvent[];
};
export type PaymentCommand = {
  commandId: string;
  obligationId: string;
  expectedObligationVersion: number;
  bookId: string;
  pageId: string;
  expectedPageVersion: number;
  amount: Satang;
  method: "cash" | "transfer" | "other";
  date: string;
  note: string;
  printedNo: string;
};
export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}
export function counts(book: ReceiptBook) {
  return {
    used: book.pages.filter((p) => p.status === "used").length,
    void: book.pages.filter((p) => p.status === "void").length,
    available: book.pages.filter((p) => p.status === "available").length,
  };
}
export function assertBook(book: ReceiptBook) {
  if (
    book.pages.length !== 50 ||
    new Set(book.pages.map(p => p.id)).size !== 50 ||
    new Set(book.pages.map((p) => p.pageNo)).size !== 50 ||
    book.pages.some(
      (p) =>
        p.pageNo < 1 ||
        p.pageNo > 50 ||
        !Number.isInteger(p.pageNo) ||
        !["available", "used", "void"].includes(p.status) ||
        (p.status !== "used" && !!p.transaction) ||
        (!!p.transaction && (p.transaction.bookNo !== book.bookNo || p.transaction.pageNo !== p.pageNo || !Number.isSafeInteger(p.transaction.amount) || p.transaction.amount <= 0)) ||
        (p.status === "used" && !p.transaction) ||
        (p.status === "void" && !p.voidReason),
    )
  )
    throw new DomainError("RECONCILIATION", "ข้อมูลรายหน้าไม่ครบถ้วน");
}
export function assertLedger(books: ReceiptBook[]) {
  books.forEach(assertBook);
  const transactions = books.flatMap(b => b.pages.flatMap(p => p.transaction ? [p.transaction.id] : []));
  if (new Set(books.map(b => b.id)).size !== books.length || new Set(books.map(b => b.bookNo)).size !== books.length || new Set(transactions).size !== transactions.length) throw new DomainError("RECONCILIATION", "เลขเล่มหรือรายการเชื่อมโยงซ้ำในทะเบียน");
}
export function canReceive(role: StaffRole) {
  return ["superadmin", "finance_officer", "finance_teacher"].includes(role);
}
export function canEditFees(role: StaffRole) {
  return ["superadmin", "finance_officer"].includes(role);
}
