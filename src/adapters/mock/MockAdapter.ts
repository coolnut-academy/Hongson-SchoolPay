import { baseline, homeroomRoster } from "./fixtures";
import {
  assertBook,
  canEditFees,
  canReceive,
  counts,
  DomainError,
  satang,
  TODAY,
  type Assignment,
  type DemoRole,
  type FeeItem,
  type PaymentCommand,
  type ReceiptBook,
  type Scenario,
  type Transaction,
  type SaveFollowup,
  type MonthlyCollection,
  followupErrors,
} from "../../domain/model";
import type { SchoolPayAdapter } from "../../ports/SchoolPayAdapter";
import type { AuditFilters, AuditProjection, ReportRequest } from "../../domain/workspace";
import { REPORT_KINDS } from "../../domain/workspace";
import { previewMockReport } from "./reports";
import { academicYear, validateAllocations } from "../../domain/invariants";
import type { BookMovement, StockCommand, StockCursors } from "../../domain/workspace";
import { debtorRows, financialKey, STAFF, type MonthlyDraft, type DashboardData, type OtherMoneyCommand, type LinkReferenceCommand, type PendingReference, type StaffAccess } from "../../domain/workspace";

export class MockAdapter implements SchoolPayAdapter {
  private state = baseline();
  private roster = homeroomRoster();
  private monthlyDrafts: MonthlyDraft[] = [];
  // Baseline previews intentionally begin with the selected fictional persona.
  private staffSignedIn = true;
  async signInStaffDemo(role: DemoRole) {
    await this.wait();
    if (this.scenario === "offline" || this.scenario === "read-error") throw new DomainError("AUTH_UNAVAILABLE", "การเข้าสู่ระบบสาธิตยังไม่พร้อม กรุณาลองใหม่");
    const uid = STAFF.find(s => s.role === role)?.uid, staff = this.staff.find(s => s.uid === uid);
    if (!staff?.active || staff.role !== role) throw new DomainError("ACCESS_PENDING", "รอยืนยันสิทธิ์บุคลากร");
    this.staffSignedIn = true;
  }
  async signOutStaffDemo() { this.staffSignedIn = false; }
  private canEditFees(role: DemoRole) { return canEditFees(role) || (role === "finance_teacher" && this.scenario === "delegated-finance"); }
  private actorName(role: DemoRole) {
    const uid = STAFF.find(s => s.role === role)?.uid;
    return this.staff.find(s => s.uid === uid)?.name.replace(/^(?:นางสาว|นาง|นาย)/, "") ?? "ไม่มีข้อมูลบุคลากร";
  }
  async visitorAccount(signal?: AbortSignal) {
    await this.wait(signal);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "ไม่สามารถโหลดข้อมูลนักเรียนได้");
    // Minimal fixture projection: no ledger inventory, fees, staff access or audit.
    return structuredClone({ student: this.state.student, previousHistory: this.scenario === "empty-valid" ? [] : [{ id: "pay-history-001", type: "student_payment" as const, amount: satang(400000), payer: `เด็กหญิง${this.state.student.name}`, description: "ภาระชำระ ภาคเรียนที่ 1/2568", receiver: "กมลชนก ใจดี", date: "2025-06-10", bookNo: "27ก70110", pageNo: 21 }] });
  }
  async previewGeneration(id: string, role: DemoRole, signal?: AbortSignal) {
    if (role === "homeroom_teacher") throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์ตรวจสอบชุดภาระ");
    await this.wait(signal);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "ตรวจสอบชุดภาระไม่สำเร็จ");
    const assignment = this.state.assignments.find(a => a.id === id);
    if (!assignment) throw new DomainError("NOT_FOUND", "ไม่พบชุดภาระ");
    const perStudent = satang(Object.values(assignment.amounts).reduce((sum, value) => sum + value, 0)), issues: string[] = [];
    if (assignment.status !== "published") issues.push("ต้องเผยแพร่เวอร์ชันก่อนสร้างภาระ");
    if (!assignment.generated) issues.push("G05 ยังไม่มีรายชื่อที่ยืนยันและนโยบายความถี่/คุณสมบัติของขอบเขตใหม่ จึงสร้างหนี้ใหม่ไม่ได้");
    if (this.scenario === "stale") issues.push("ข้อมูลต้นทางล้าสมัย");
    if (this.state.assignments.some(a => a.id !== id && a.status === "published" && a.room === assignment.room && a.academicYear === assignment.academicYear && a.term === assignment.term)) issues.push("ขอบเขตซ้อนทับ ต้องยืนยันนโยบายก่อน");
    return { assignmentId: id, version: assignment.version, room: assignment.room, students: assignment.studentCount, perStudent, total: satang(perStudent * assignment.studentCount), existing: assignment.generated ? assignment.studentCount : 0, issues };
  }
  async lifecycleReviews(role: DemoRole, signal?: AbortSignal) {
    if (role === "homeroom_teacher") throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์ดูการทบทวนภาระ");
    await this.wait(signal);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "โหลดข้อมูลทบทวนไม่สำเร็จ");
    return [
      { id: "lifecycle-transfer-demo", student: "นักเรียนสาธิต 08", sourceChange: "ตัวอย่างย้ายห้อง ม.2/1 → ม.2/2 · รอทบทวน", original: satang(450000), paid: satang(450000), proposal: "รักษาการชำระเดิม ทบทวนเฉพาะภาระใหม่ตามนโยบาย ไม่มีการสร้างรายการเพิ่มอัตโนมัติ", gate: "G05" as const },
      { id: "lifecycle-withdraw-demo", student: "นักเรียนสาธิต 09", sourceChange: "ตัวอย่างถอนชื่อ · รอทบทวน", original: satang(450000), paid: satang(450000), proposal: "หยุดภาระในอนาคต ส่งภาระเดิมให้พิจารณา ไม่ลบการชำระหรือยกหนี้อัตโนมัติ", gate: "G05" as const },
    ];
  }
  private stockVersion = 1;
  private stockCommands = new Map<string, string>();
  private movements: BookMovement[] = [];
  async stock(role: DemoRole, signal?: AbortSignal, cursors: StockCursors = {}) {
    if (role === "homeroom_teacher") throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์ดูสต็อก");
    await this.wait(signal);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "โหลดสต็อกไม่สำเร็จ");
    const bookOffset = Number(cursors.bookCursor ?? "0"), movementOffset = Number(cursors.movementCursor ?? "0");
    if ([bookOffset, movementOffset].some(offset => !Number.isSafeInteger(offset) || offset < 0)) throw new DomainError("VALIDATION", "ตัวแบ่งหน้าข้อมูลไม่ถูกต้อง");
    return structuredClone({ version: this.stockVersion, opening: { carryForward: 6 as const, received: 80 as const, total: 86 as const, finalized: false as const }, books: this.state.books.slice(bookOffset, bookOffset + 25), movements: this.movements.slice(movementOffset, movementOffset + 25), nextBookCursor: this.state.books.length > bookOffset + 25 ? String(bookOffset + 25) : undefined, nextMovementCursor: this.movements.length > movementOffset + 25 ? String(movementOffset + 25) : undefined });
  }
  async receiveStock(command: StockCommand, role: DemoRole) {
    await this.wait(); this.writable(role);
    if (!this.canEditFees(role)) throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์รับสต็อก");
    const prior = this.stockCommands.get(command.commandId);
    if (prior) { if (prior !== JSON.stringify(command)) throw new DomainError("IDEMPOTENCY", "รหัสคำสั่งถูกใช้กับข้อมูลอื่นแล้ว"); return; }
    if (command.expectedVersion !== this.stockVersion) throw new DomainError("VERSION_CONFLICT", "สต็อกเปลี่ยนแปลง กรุณาตรวจสอบใหม่");
    const identifiers = command.identifiers.map(s => s.trim());
    if (!Number.isSafeInteger(command.quantity) || command.quantity < 1 || command.quantity > 25 || command.quantity !== identifiers.length || new Set(identifiers).size !== identifiers.length || identifiers.some(s => !s || s.length > 64 || this.state.books.some(b => b.bookNo === s))) throw new DomainError("VALIDATION", "จำนวนต้องตรงกับเลขเล่มที่ไม่ซ้ำ 1–25 เล่ม ห้ามสร้างเลขจากช่วงยกมาที่ไม่ยืนยัน");
    const newBooks: ReceiptBook[] = identifiers.map((bookNo, i) => ({ id: `stock-${this.stockVersion}-${i + 1}`, bookNo, holder: "ยังไม่เปิดใช้", fiscalYear: 2570, status: "stock", version: 1, pages: Array.from({ length: 50 }, (_, index) => ({ id: `stock-page-${this.stockVersion}-${i + 1}-${index + 1}`, pageNo: index + 1, status: "available", version: 1 })) }));
    newBooks.forEach(assertBook);
    for (const book of newBooks) { this.state.books.push(book); this.movements.unshift({ id: `movement-${this.movements.length + 1}`, at: TODAY, action: "รับเพิ่มหลังยอดตั้งต้น · สาธิต", bookId: book.id, holder: book.holder, received: 1, issued: 0, balance: 86 + this.state.books.length - 2 }); }
    this.stockCommands.set(command.commandId, JSON.stringify(command)); this.stockVersion++;
    this.audit("รับสต็อกเพิ่ม (สาธิต)", identifiers.join(", "), role);
  }
  async issueBook(id: string, expectedVersion: number, holder: string, role: DemoRole) {
    await this.wait(); this.writable(role);
    if (!this.canEditFees(role)) throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์เปิดใช้เล่ม");
    const book = this.state.books.find(b => b.id === id);
    if (!book || book.version !== expectedVersion || book.status !== "stock") throw new DomainError("VERSION_CONFLICT", "เปิดใช้ได้เฉพาะเล่มในสต็อกที่เวอร์ชันตรงกัน");
    if (!holder.trim() || holder.length > 200) throw new DomainError("VALIDATION", "ระบุผู้ถือเล่ม ไม่เกิน 200 ตัวอักษร");
    assertBook(book); book.status = "active"; book.holder = holder.trim(); book.version++; this.stockVersion++;
    this.movements.unshift({ id: `movement-${this.movements.length + 1}`, at: TODAY, action: "เปิดใช้ (สาธิต)", bookId: id, holder: book.holder, received: 0, issued: 1, balance: 86 + this.state.books.length - 2 });
    this.audit("เปิดใช้เล่ม (สาธิต)", `${book.bookNo} · ${book.holder}`, role);
  }
  async returnBook(id: string, expectedVersion: number, physical: { used: number; void: number; available: number }, receiver: string, role: DemoRole) {
    await this.wait(); this.writable(role);
    if (!this.canEditFees(role)) throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์รับคืนเล่ม");
    const book = this.state.books.find(b => b.id === id);
    if (!book || book.version !== expectedVersion || book.status !== "active") throw new DomainError("VERSION_CONFLICT", "เล่มเปลี่ยนแปลงหรือไม่อยู่ในสถานะเปิดใช้");
    const issues = await this.reconcile(book, physical);
    // Recheck after the asynchronous read/preview. No partial-return policy is assumed.
    if (book.version !== expectedVersion) throw new DomainError("VERSION_CONFLICT", "มีรายการใหม่ระหว่างตรวจนับ กรุณาตรวจสอบใหม่");
    this.writable(role);
    if (issues.length) throw new DomainError("RECONCILIATION", issues.join("; "));
    if (physical.available) throw new DomainError("POLICY_REQUIRED", "G03 ยังไม่ยืนยันนโยบายคืนเล่มบางส่วน");
    if (!receiver.trim() || receiver.length > 200) throw new DomainError("VALIDATION", "ระบุผู้รับคืน");
    book.status = "returned"; book.version++; this.stockVersion++;
    this.movements.unshift({ id: `movement-${this.movements.length + 1}`, at: TODAY, action: "รับคืนครบ 50 หน้า (สาธิต)", bookId: id, holder: receiver.trim(), received: 0, issued: 0, balance: 86 + this.state.books.length - 2 });
    this.audit("รับคืนเล่ม (สาธิต)", `${book.bookNo} · ${receiver.trim()}`, role);
  }
  async currentStaff(role: DemoRole, signal?: AbortSignal) {
    await this.wait(signal);
    if (!this.staffSignedIn) return null;
    const uid = STAFF.find(s => s.role === role)?.uid;
    const staff = this.staff.find(s => s.uid === uid);
    return staff ? structuredClone({ ...staff, active: staff.active && this.scenario !== "permission-revoked", capabilities: this.scenario === "delegated-finance" && role === "finance_teacher" ? ["other.receive", "receipt.voidAvailable", "book.issue", "book.return", "fee.edit", "fee.publish", "obligation.generate"] as import("../../domain/permissions").Capability[] : [] }) : null;
  }
  async auditEvents(filters: AuditFilters, role: DemoRole, signal?: AbortSignal) {
    await this.wait(signal);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "บันทึกการดำเนินงานยังไม่พร้อมแสดง");
    const uid = STAFF.find(s => s.role === role)?.uid, offset = Number(filters.cursor ?? "0");
    if (!Number.isSafeInteger(offset) || offset < 0) throw new DomainError("VALIDATION", "ตัวแบ่งหน้าข้อมูลไม่ถูกต้อง");
    const events = this.state.audit.filter(e => (role !== "homeroom_teacher" || e.actorUid === uid) && (!filters.date || e.timestamp?.slice(0, 10) === filters.date)).map((e): AuditProjection => ({ id: e.id, title: e.title, at: e.at, actorUid: e.actorUid ?? "source-import", module: e.module ?? "source", entityId: e.entityId ?? "mock-source", commandId: e.commandId, detail: role === "superadmin" || role === "finance_officer" ? e.detail : "รายละเอียดถูกจำกัดตามสิทธิ์ ไม่มีข้อมูลก่อน/หลังแบบดิบ" })).filter(e => (filters.module === "all" || filters.module === e.module) && (!filters.search || `${e.title} ${e.entityId} ${e.actorUid}`.includes(filters.search)) && (!filters.actor || e.actorUid.includes(filters.actor)) && (!filters.action || e.title.includes(filters.action)) && (!filters.entity || e.entityId.includes(filters.entity)));
    return { items: structuredClone(events.slice(offset, offset + 25)), nextCursor: events.length > offset + 25 ? String(offset + 25) : undefined };
  }
  async previewReport(filters: ReportRequest, role: DemoRole, signal?: AbortSignal) {
    if (!REPORT_KINDS.includes(filters.kind)) throw new DomainError("FORBIDDEN", "ประเภทเอกสารไม่อยู่ในรายการที่อนุญาต");
    if (role === "homeroom_teacher" && !["monthly_memo", "student_collections", "student_outstanding"].includes(filters.kind)) throw new DomainError("FORBIDDEN", "ดูได้เฉพาะรายงานห้องที่รับผิดชอบ");
    if (["monthly_memo", "student_collections", "student_outstanding"].includes(filters.kind)) this.assertRoom(filters.room, role);
    const state = await this.read(signal);
    if (this.scenario === "report-invalid") state.books[0].pages[8].transaction = undefined;
    return previewMockReport(filters, role, state, this.scenario, {
      room: () => this.monthlyCollections(filters.room, filters.month, role, signal),
      monthly: () => this.monthlyWorkspace(filters.room, filters.month, role, signal),
      dashboard: () => this.dashboard(role, signal),
    });
  }
  private staff = structuredClone(STAFF);
  private otherDelta: Record<string, number> = {};
  private pending: PendingReference[] = [{ id: "pending-other-001", version: 1, type: "other_receipt", categoryId: "OTHER-01", amount: satang(40000), payer: "ผู้สนับสนุนสาธิต · รายการรออ้างอิง", description: "เงินทุนการศึกษาที่รับแล้ว · รวมในยอดสรุปเดิม", receiver: "กมลชนก ใจดี", date: "2026-10-15" }];
  async dashboard(_role: DemoRole, signal?: AbortSignal): Promise<DashboardData> {
    if (_role === "homeroom_teacher") throw new DomainError("FORBIDDEN", "ครูที่ปรึกษาดูได้เฉพาะห้องที่รับผิดชอบ");
    await this.wait(signal);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "ไม่สามารถโหลดข้อมูลได้");
    const delta = this.state.student.obligations.reduce((sum, o) => sum + o.paid, 0) - 300000;
    const baseline = [
      ["ม.1", 180, 90000000, 81000000], ["ม.2", 178, 85000000, 76500000], ["ม.3", 176, 80000000, 72000000],
      ["ม.4", 175, 95000000, 85500000], ["ม.5", 174, 90000000, 81000000], ["ม.6", 167, 100000000, 84000000],
    ] as const;
    return { grades: baseline.map(([grade, settled, adjusted, paid]) => ({ grade, students: 200, settled: settled + (grade === "ม.2" && delta === 150000 ? 1 : 0), adjusted: satang(adjusted), paid: satang(paid + (grade === "ม.2" ? delta : 0)), outstanding: satang(adjusted - paid - (grade === "ม.2" ? delta : 0)) })), other: [
      { id: "OTHER-01", name: "เงินทุนการศึกษา", amount: satang(5000000 + (this.otherDelta["OTHER-01"] ?? 0)) },
      { id: "OTHER-02", name: "เงินบริจาค", amount: satang(1600000 + (this.otherDelta["OTHER-02"] ?? 0)) },
      { id: "OTHER-03", name: "เงินสนับสนุนกิจกรรม", amount: satang(1200000 + (this.otherDelta["OTHER-03"] ?? 0)) },
      ...this.state.fees.filter(f => f.kind === "other" && !["OTHER-01", "OTHER-02", "OTHER-03"].includes(f.id)).map(f => ({ id: f.id, name: f.name, amount: satang(this.otherDelta[f.id] ?? 0) })),
    ], asOf: delta > 0 || Object.values(this.otherDelta).some(x => x > 0) ? "2026-10-16T09:30:00+07:00" : "2026-10-16T09:25:00+07:00", stale: this.scenario === "stale" };
  }
  private reference(command: { bookId: string; pageId: string; expectedPageVersion: number; printedNo: string }) {
    const book = this.state.books.find(b => b.id === command.bookId), page = book?.pages.find(p => p.id === command.pageId);
    if (!book || !page || book.status !== "active" || page.status !== "available" || page.version !== command.expectedPageVersion) throw new DomainError("PAGE_UNAVAILABLE", "หน้านี้ไม่ว่างแล้ว กรุณาเลือกและตรวจสอบใหม่");
    assertBook(book);
    if (command.printedNo.length > 64) throw new DomainError("VALIDATION", "เลขที่พิมพ์บนใบเสร็จยาวเกินกำหนด");
    if (this.scenario === "page-conflict") throw new DomainError("PAGE_UNAVAILABLE", "หน้าใบเสร็จถูกใช้งานระหว่างบันทึก กรุณาเลือกใหม่");
    return { book, page };
  }
  private cached(command: { commandId: string }) {
    const cached = this.results.get(command.commandId);
    if (cached && cached.fingerprint !== JSON.stringify(command)) throw new DomainError("IDEMPOTENCY", "รหัสคำสั่งถูกใช้กับข้อมูลอื่นแล้ว");
    return cached?.transaction;
  }
  private commitReference(command: { commandId: string; bookId: string; pageId: string; expectedPageVersion: number; printedNo: string }, transaction: Transaction, role: DemoRole) {
    const { book, page } = this.reference(command);
    page.status = "used"; page.transaction = transaction; page.version++; book.version++;
    this.results.set(command.commandId, { fingerprint: JSON.stringify(command), transaction: structuredClone(transaction) });
    this.audit("บันทึกอ้างอิงรายการ (สาธิต)", `${book.bookNo} / ${page.pageNo} · ${transaction.id}`, role, command.commandId);
  }
  async receiveOther(command: OtherMoneyCommand, role: DemoRole) {
    await this.wait(); this.writable(role);
    if (!this.canEditFees(role)) throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์รับเงินประเภทอื่น");
    const cached = this.cached(command); if (cached) return structuredClone(cached);
    const category = this.state.fees.find(f => f.id === command.categoryId && f.kind === "other" && f.active);
    if (!category || command.date !== TODAY || command.fiscalYear !== 2570 || !command.payer.trim() || command.payer.length > 200 || !command.description.trim() || command.description.length > 1000 || command.note.length > 2000 || command.amount <= 0 || "studentId" in command || "allocations" in command || "obligationId" in command) throw new DomainError("VALIDATION", "ตรวจสอบหมวด ผู้ชำระ รายละเอียด วันที่ ปีงบประมาณ และจำนวนเงิน");
    satang(command.amount);
    const { book, page } = this.reference(command);
    const nextDelta = satang((this.otherDelta[category.id] ?? 0) + command.amount);
    satang(7800000 + Object.values(this.otherDelta).reduce((sum, x) => sum + x, 0) + command.amount);
    const transaction: Transaction = { id: `demo-other-${this.results.size + 1}`, type: "other_receipt", categoryId: category.id, reportNote: command.note.trim(), amount: command.amount, payer: command.payer.trim(), description: command.description.trim(), date: command.date, receiver: this.actorName(role), bookNo: book.bookNo, pageNo: page.pageNo, printedNo: command.printedNo || undefined };
    this.commitReference(command, transaction, role); this.otherDelta[category.id] = nextDelta;
    if (this.scenario === "unknown-outcome") { this.scenario = "baseline"; throw new DomainError("OUTCOME_UNKNOWN", "ตรวจสอบผลด้วยรหัสคำสั่งเดิมก่อนทำรายการต่อ"); }
    return structuredClone(transaction);
  }
  async pendingReferences(role: DemoRole, signal?: AbortSignal) {
    if (!canReceive(role)) throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์ดูรายการรออ้างอิง");
    await this.wait(signal);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "โหลดรายการรออ้างอิงไม่สำเร็จ");
    return structuredClone(this.pending.slice(0, 25));
  }
  async linkReference(command: LinkReferenceCommand, role: DemoRole) {
    await this.wait(); this.writable(role);
    if (!canReceive(role)) throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์ผูกอ้างอิง");
    const cached = this.cached(command); if (cached) return structuredClone(cached);
    const pending = this.pending.find(p => p.id === command.transactionId);
    if (!pending || pending.version !== command.expectedTransactionVersion) throw new DomainError("VERSION_CONFLICT", "รายการนี้เปลี่ยนแปลงหรือผูกอ้างอิงแล้ว");
    const { book, page } = this.reference(command);
    const { version: _version, ...base } = pending;
    const transaction = { ...base, bookNo: book.bookNo, pageNo: page.pageNo, printedNo: command.printedNo || undefined };
    this.commitReference(command, transaction, role); this.pending = this.pending.filter(p => p.id !== pending.id);
    if (this.scenario === "unknown-outcome") { this.scenario = "baseline"; throw new DomainError("OUTCOME_UNKNOWN", "ตรวจสอบผลด้วยรหัสคำสั่งเดิม"); }
    return structuredClone(transaction);
  }
  async staffAccess(role: DemoRole, signal?: AbortSignal) {
    if (!["superadmin", "executive"].includes(role)) throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์ดูข้อมูลสิทธิ์บุคลากร");
    await this.wait(signal);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "ไม่สามารถโหลดข้อมูลได้");
    return structuredClone(this.staff.slice(0, 25));
  }
  async changeAccess(value: StaffAccess, expectedVersion: number, reason: string, role: DemoRole) {
    await this.wait(); this.writable(role);
    if (role !== "superadmin") throw new DomainError("FORBIDDEN", "เฉพาะผู้ดูแลระบบเท่านั้น");
    const current = this.staff.find(s => s.uid === value.uid);
    if (!current || current.version !== expectedVersion) throw new DomainError("VERSION_CONFLICT", "สิทธิ์เปลี่ยนแปลง กรุณาโหลดข้อมูลปัจจุบันและตรวจสอบใหม่");
    if (!reason.trim() || reason.length > 1000 || !["homeroom_teacher", "finance_teacher", "finance_officer", "executive", "superadmin"].includes(value.role) || value.rooms.some(r => r !== "ม.2/1") || (value.role !== "homeroom_teacher" && value.rooms.length) || value.name !== current.name || value.source !== current.source) throw new DomainError("VALIDATION", "ตรวจสอบบทบาท ห้อง และเหตุผล โดยแก้ไขข้อมูลต้นทางไม่ได้");
    if (current.active && current.role === "superadmin" && (!value.active || value.role !== "superadmin") && this.staff.filter(s => s.active && s.role === "superadmin").length === 1) throw new DomainError("FINAL_ADMIN", "ไม่สามารถถอดสิทธิ์ผู้ดูแลระบบคนสุดท้ายได้");
    Object.assign(current, { role: value.role, active: value.active, rooms: [...value.rooms], version: current.version + 1 });
    this.audit("เปลี่ยนสิทธิ์บุคลากร (สาธิต)", `${current.uid} · ${reason.trim()}`, role);
  }
  async monthlyWorkspace(room: string, month: string, role: DemoRole, signal?: AbortSignal) {
    const live = await this.monthlyCollections(room, month, role, signal);
    if (!live) return null;
    if (!this.monthlyDrafts.length) {
      const students = homeroomRoster();
      this.monthlyDrafts.push({ id: "followup-2569-1-2026-10-m2-1", revision: 1, version: 1, teacher: this.roomAccess(role).teacher, status: "draft", snapshot: { ...structuredClone(live), asOf: "2026-10-16T09:25:00+07:00", students, totals: { students: 40, settled: 33, debtors: 7, adjusted: satang(18000000), paid: satang(16750000), outstanding: satang(1250000) } } });
    }
    return structuredClone({ draft: this.monthlyDrafts[this.monthlyDrafts.length - 1], live, history: this.monthlyDrafts.slice(0, -1) });
  }
  async saveMonthlyNote(command: SaveFollowup & { revision: number }, role: DemoRole) {
    this.assertRoom(command.room, role);
    await this.wait(); this.writable(role); this.assertRoom(command.room, role);
    if (!this.roomAccess(role).editable) throw new DomainError("FORBIDDEN", "ดูข้อมูลได้เท่านั้น");
    const draft = this.monthlyDrafts.at(-1);
    const row = draft?.snapshot.students.find(s => s.id === command.studentId);
    if (!draft || command.month !== draft.snapshot.month || draft.revision !== command.revision || !row || row.version !== command.expectedVersion || !["draft", "ready"].includes(draft.status)) throw new DomainError("VERSION_CONFLICT", "ฉบับร่างเปลี่ยนแปลง กรุณาโหลดข้อมูลปัจจุบันก่อนตรวจสอบอีกครั้ง");
    if (Object.keys(followupErrors(command)).length) throw new DomainError("VALIDATION", "ข้อความเกินจำนวนตัวอักษรที่กำหนด");
    Object.assign(row, { reason: command.reason.trim(), solution: command.solution.trim(), note: command.note.trim(), savedAt: "2026-10-16T09:30:00+07:00", version: row.version + 1 });
    draft.version++;
    this.audit("บันทึกการติดตามรายเดือน (สาธิต)", `${draft.id} · ${row.id}`, role);
    return structuredClone(row);
  }
  async refreshMonthly(room: string, month: string, revision: number, version: number, liveKey: string, role: DemoRole) {
    this.writable(role);
    if (!this.roomAccess(role).editable) throw new DomainError("FORBIDDEN", "ดูข้อมูลได้เท่านั้น");
    const live = await this.monthlyCollections(room, month, role);
    this.writable(role);
    const before = this.monthlyDrafts.at(-1);
    if (!live || !before || before.revision !== revision || before.version !== version || financialKey(live) !== liveKey || !["draft", "ready"].includes(before.status)) throw new DomainError("VERSION_CONFLICT", "ข้อมูลเปลี่ยนแปลง กรุณาตรวจสอบส่วนต่างใหม่ก่อนยืนยัน");
    if (financialKey(before.snapshot) === liveKey) throw new DomainError("VALIDATION", "ไม่มีข้อมูลการเงินใหม่");
    const snapshot = structuredClone(live);
    for (const row of snapshot.students) {
      const prior = before.snapshot.students.find(s => s.id === row.id);
      if (prior) Object.assign(row, { reason: prior.reason, solution: prior.solution, note: prior.note, version: prior.version, savedAt: prior.savedAt });
    }
    const next: MonthlyDraft = { ...structuredClone(before), revision: before.revision + 1, version: 1, status: "draft", snapshot };
    this.monthlyDrafts.push(next);
    this.audit("ปรับฉบับร่างรายเดือน (สาธิต)", `${next.id} · v${next.revision} · ${debtorRows(snapshot).length} คน`, role);
    return structuredClone(next);
  }
  private roomAccess(role: DemoRole) {
    const staff = this.staff.find(s => s.uid === STAFF.find(s => s.role === role)?.uid);
    return {
      rooms: this.scenario === "no-assigned-rooms" || !staff?.active ? [] : role === "homeroom_teacher" ? [...staff.rooms] : ["ม.2/1"],
      teacher: "นางสาวศิริพร แสงทอง",
      editable: role === "homeroom_teacher" || role === "superadmin",
    };
  }
  private assertRoom(room: string, role: DemoRole) {
    if (!this.roomAccess(role).rooms.includes(room))
      throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์ดูข้อมูลห้องนี้");
  }
  async homeroomAccess(role: DemoRole, signal?: AbortSignal) {
    await this.wait(signal);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "ไม่สามารถโหลดข้อมูลได้");
    return this.roomAccess(role);
  }
  async monthlyCollections(room: string, month: string, role: DemoRole, signal?: AbortSignal): Promise<MonthlyCollection | null> {
    this.assertRoom(room, role);
    await this.wait(signal);
    this.assertRoom(room, role);
    if (this.scenario === "read-error") throw new DomainError("READ_FAILED", "ไม่สามารถโหลดข้อมูลได้");
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new DomainError("VALIDATION", "เลือกเดือนให้ถูกต้อง");
    if (month !== "2026-10") return null;
    const students = structuredClone(this.roster);
    const account = this.state.student;
    students[0].adjusted = satang(account.obligations.reduce((sum, o) => sum + o.adjusted, 0));
    students[0].paid = satang(account.obligations.reduce((sum, o) => sum + o.paid, 0));
    students[0].outstanding = satang(students[0].adjusted - students[0].paid);
    return {
      room, month, academicYear: 2569, term: 1, asOf: account.obligations.some(o => o.version > 1) ? "2026-10-16T09:30:00+07:00" : "2026-10-16T09:25:00+07:00",
      stale: this.scenario === "stale", students,
      totals: {
        students: students.length, settled: students.filter(s => !s.outstanding).length,
        debtors: students.filter(s => s.outstanding > 0).length,
        adjusted: satang(students.reduce((sum, s) => sum + s.adjusted, 0)),
        paid: satang(students.reduce((sum, s) => sum + s.paid, 0)),
        outstanding: satang(students.reduce((sum, s) => sum + s.outstanding, 0)),
      },
    };
  }
  async saveFollowup(command: SaveFollowup, role: DemoRole) {
    this.assertRoom(command.room, role);
    await this.wait();
    this.assertRoom(command.room, role);
    this.writable(role);
    if (!this.roomAccess(role).editable) throw new DomainError("FORBIDDEN", "บทบาทนี้ดูข้อมูลได้เท่านั้น");
    const row = this.roster.find(s => s.id === command.studentId);
    if (command.month !== "2026-10" || !row) throw new DomainError("NOT_FOUND", "ไม่มีข้อมูลในชุดสาธิต");
    if (Object.keys(followupErrors(command)).length) throw new DomainError("VALIDATION", "ข้อความยาวเกินกำหนด กรุณาตรวจสอบช่องกรอก");
    if (row.version !== command.expectedVersion) throw new DomainError("VERSION_CONFLICT", "ข้อมูลถูกแก้ไขแล้ว กรุณาตรวจสอบข้อมูลปัจจุบันก่อนบันทึกอีกครั้ง");
    Object.assign(row, { reason: command.reason.trim(), solution: command.solution.trim(), note: command.note.trim(), version: row.version + 1, savedAt: "2026-10-16T09:30:00+07:00" });
    return structuredClone(row);
  }
  private scenario: Scenario = "baseline";
  private heldReads = new Set<() => void>();
  private results = new Map<
    string,
    { fingerprint: string; transaction: Transaction }
  >();
  constructor(private delay = 300) {}
  private async wait(signal?: AbortSignal) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (this.scenario === "loading") await new Promise<void>((resolve, reject) => {
      const release = () => { this.heldReads.delete(release); signal?.removeEventListener("abort", abort); resolve(); };
      const abort = () => { this.heldReads.delete(release); reject(new DOMException("Aborted", "AbortError")); };
      this.heldReads.add(release); signal?.addEventListener("abort", abort, { once: true });
    });
    if (!this.delay) return;
    await new Promise<void>((resolve, reject) => {
      const done = () => {
        signal?.removeEventListener("abort", abort);
        resolve();
      };
      const timer = setTimeout(done, this.delay);
      const abort = () => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
        reject(new DOMException("Aborted", "AbortError"));
      };
      signal?.addEventListener("abort", abort, { once: true });
    });
  }
  private writable(role: DemoRole) {
    const uid = STAFF.find(staff => staff.role === role)?.uid;
    const actor = this.staff.find(staff => staff.uid === uid);
    if (!this.staffSignedIn || !actor?.active || actor.role !== role || this.scenario === "permission-revoked")
      throw new DomainError("FORBIDDEN", "สิทธิ์บุคลากรเปลี่ยนแปลง กรุณาเข้าสู่ระบบและตรวจสอบสิทธิ์ใหม่");
    if (this.scenario === "offline")
      throw new DomainError(
        "OFFLINE",
        "เชื่อมต่ออินเทอร์เน็ตเพื่อบันทึก ไม่มีการส่งรายการอัตโนมัติ",
      );
    if (this.scenario === "stale")
      throw new DomainError(
        "SOURCE_STALE",
        "ข้อมูลทะเบียนยังไม่เป็นปัจจุบัน กรุณาตรวจสอบข้อมูลใหม่",
      );
  }
  private audit(title: string, detail: string, role: DemoRole = "finance_officer", commandId?: string) {
    this.state.audit.unshift({
      id: `audit-${this.state.audit.length + 1}`,
      title,
      detail,
      at: "16 ต.ค. 2569 · 09:30 น.",
      timestamp: "2026-10-16T09:30:00+07:00",
      actorUid: STAFF.find(s => s.role === role)?.uid,
      module: title.includes("สิทธิ์") ? "access" : title.includes("รายเดือน") ? "followup" : "finance",
      entityId: detail.split(" · ")[0],
      commandId,
    });
  }
  async read(signal?: AbortSignal) {
    await this.wait(signal);
    if (this.scenario === "read-error")
      throw new DomainError(
        "READ_FAILED",
        "ไม่สามารถโหลดข้อมูลสาธิตได้ กรุณาลองใหม่",
      );
    return structuredClone(this.state);
  }
  async lookup(code: string, signal?: AbortSignal) {
    await this.wait(signal);
    return (
      code.trim() === this.state.student.code ||
      code.trim() === this.state.student.name
    );
  }
  async receive(command: PaymentCommand, role: DemoRole) {
    await this.wait();
    this.writable(role);
    if (!canReceive(role))
      throw new DomainError("FORBIDDEN", "บทบาทนี้ไม่สามารถบันทึกรับชำระได้");
    const fingerprint = JSON.stringify(command),
      cached = this.results.get(command.commandId);
    if (cached) {
      if (cached.fingerprint !== fingerprint)
        throw new DomainError(
          "IDEMPOTENCY",
          "รหัสคำสั่งนี้ถูกใช้กับข้อมูลอื่นแล้ว",
        );
      return structuredClone(cached.transaction);
    }
    if (this.scenario === "balance-changed") {
      this.scenario = "baseline";
      const obligation = this.state.student.obligations.find(o => o.id === command.obligationId);
      const otherBook = this.state.books.find(b => b.status === "active" && b.id !== command.bookId);
      const otherPage = otherBook?.pages.find(p => p.status === "available");
      if (obligation && otherBook && otherPage && obligation.adjusted > obligation.paid) await this.receive({ ...command, commandId: `external-${command.commandId}`, amount: satang(obligation.adjusted - obligation.paid), expectedObligationVersion: obligation.version, bookId: otherBook.id, pageId: otherPage.id, expectedPageVersion: otherPage.version, method: "cash", date: TODAY, note: "สถานการณ์สาธิต: เจ้าหน้าที่อีกคนรับยอดเต็มก่อนยืนยัน", printedNo: "" }, "finance_officer");
      throw new DomainError("BALANCE_CHANGED", "ยอดชำระเปลี่ยนแปลงจากรายการของเจ้าหน้าที่อีกคน กรุณาตรวจสอบยอดปัจจุบัน ไม่มีการรับเงินซ้ำ");
    }
    const o = this.state.student.obligations.find(
        (x) => x.id === command.obligationId,
      ),
      book = this.state.books.find((x) => x.id === command.bookId),
      page = book?.pages.find((x) => x.id === command.pageId);
    if (
      !book ||
      !page ||
      book.status !== "active" ||
      page.status !== "available" ||
      page.version !== command.expectedPageVersion
    )
      throw new DomainError(
        "PAGE_UNAVAILABLE",
        "หน้านี้ไม่ว่างแล้ว กรุณาตรวจสอบและเลือกหน้าอื่น",
      );
    if (this.scenario === "page-conflict") {
      this.scenario = "baseline";
      page.status = "void";
      page.voidReason = "สถานการณ์สาธิต: ผู้ใช้อื่นยกเลิกหน้าก่อนบันทึก";
      page.version++;
      book.version++;
      this.audit("หน้าที่เลือกไม่ว่างแล้ว", `${book.bookNo} / ${page.pageNo}`);
      throw new DomainError(
        "PAGE_UNAVAILABLE",
        "หน้านี้ไม่ว่างแล้ว กรุณาตรวจสอบและเลือกหน้าอื่น",
      );
    }
    if (
      !o ||
      o.version !== command.expectedObligationVersion ||
      command.amount <= 0 ||
      command.amount !== o.adjusted - o.paid
    )
      throw new DomainError(
        "BALANCE_CHANGED",
        "ยอดชำระเปลี่ยนแปลง กรุณาตรวจสอบยอดใหม่",
      );
    satang(command.amount);
    if (
      command.date !== TODAY ||
      !["cash", "transfer", "other"].includes(command.method) ||
      command.note.length > 2000 ||
      (command.method === "other" && !command.note.trim())
    )
      throw new DomainError(
        "VALIDATION",
        "ตรวจสอบวันที่และรายละเอียดวิธีรับเงิน",
      );
    validateAllocations(command.amount, this.state.student.id, academicYear(2569), 1, [{ obligationId: o.id, amount: command.amount }], [{ id: o.id, studentId: this.state.student.id, year: academicYear(2569), term: 1, outstanding: satang(o.adjusted - o.paid) }]);
    const transaction: Transaction = {
      id: `demo-payment-${this.results.size + 1}`,
      type: "student_payment",
      amount: command.amount,
      payer: `เด็กหญิง${this.state.student.name}`,
      description: o.label,
      receiver: this.actorName(role),
      date: command.date,
      bookNo: book.bookNo,
      pageNo: page.pageNo,
      printedNo: command.printedNo || undefined,
      obligationId: o.id,
    };
    // All validation completes before the synchronous in-memory commit. This is NOT backend security.
    o.paid = satang(o.paid + command.amount);
    o.version++;
    page.status = "used";
    page.transaction = transaction;
    page.version++;
    book.version++;
    this.state.student.transactions.unshift(transaction);
    this.audit(
      "บันทึกรับชำระ (สาธิต)",
      `${book.bookNo} / หน้า ${page.pageNo} · ${this.state.student.name}`,
      role,
      command.commandId,
    );
    this.results.set(command.commandId, {
      fingerprint,
      transaction: structuredClone(transaction),
    });
    if (this.scenario === "unknown-outcome") {
      this.scenario = "baseline";
      throw new DomainError(
        "OUTCOME_UNKNOWN",
        "ยังไม่ได้รับผลยืนยัน กรุณาตรวจสอบสถานะก่อนทำรายการต่อ",
      );
    }
    return structuredClone(transaction);
  }
  async outcome(id: string) {
    await this.wait();
    return structuredClone(this.results.get(id)?.transaction ?? null);
  }
  async voidPage(
    bookId: string,
    pageId: string,
    version: number,
    reason: string,
    role: DemoRole,
  ) {
    await this.wait();
    this.writable(role);
    if (!this.canEditFees(role))
      throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์ยกเลิกหน้า");
    const book = this.state.books.find((b) => b.id === bookId),
      page = book?.pages.find((p) => p.id === pageId);
    if (
      !page ||
      !book ||
      page.status !== "available" ||
      book.status !== "active" ||
      page.version !== version
    )
      throw new DomainError(
        "PAGE_UNAVAILABLE",
        "ยกเลิกได้เฉพาะหน้าว่างที่ข้อมูลยังตรงกัน",
      );
    if (!reason.trim() || reason.length > 1000)
      throw new DomainError(
        "VALIDATION",
        "กรุณาระบุเหตุผล ไม่เกิน 1,000 ตัวอักษร",
      );
    page.status = "void";
    page.voidReason = reason.trim();
    page.version++;
    book.version++;
    this.audit(
      "ยกเลิกหน้าว่าง (สาธิต)",
      `${book.bookNo} / ${page.pageNo} · ${reason.trim()}`,
    );
  }
  async saveFee(item: FeeItem, role: DemoRole) {
    await this.wait();
    this.writable(role);
    if (!this.canEditFees(role))
      throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์แก้ไขรายการเงิน");
    if (
      !item.name.trim() ||
      !item.code.trim() ||
      item.name.length > 200 ||
      item.code.length > 32
    )
      throw new DomainError("VALIDATION", "กรอกชื่อและรหัสรายการให้ครบถ้วน");
    if (
      this.state.fees.some(
        (f) =>
          f.id !== item.id && f.code.toUpperCase() === item.code.toUpperCase(),
      )
    )
      throw new DomainError("DUPLICATE", "รหัสรายการนี้มีอยู่แล้ว");
    const existing = this.state.fees.find((f) => f.id === item.id);
    if (existing) {
      if (item.kind !== existing.kind || item.code !== existing.code)
        throw new DomainError(
          "IMMUTABLE",
          "รหัสและประเภทของรายการเดิมเปลี่ยนไม่ได้",
        );
      Object.assign(existing, item);
    } else this.state.fees.push(structuredClone(item));
    this.audit("บันทึกรายการเงิน (สาธิต)", item.name);
  }
  async saveAssignment(value: Assignment, version: number, role: DemoRole) {
    await this.wait();
    this.writable(role);
    if (!this.canEditFees(role))
      throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์แก้ไข");
    const current = this.state.assignments.find((a) => a.id === value.id);
    if (!current || current.status !== "draft" || current.version !== version)
      throw new DomainError(
        "VERSION_CONFLICT",
        "เวอร์ชันเปลี่ยนไปหรือเผยแพร่แล้ว กรุณาโหลดข้อมูลใหม่",
      );
    if (
      value.room !== current.room ||
      value.academicYear !== current.academicYear ||
      value.term !== current.term ||
      value.status !== "draft"
    )
      throw new DomainError("VALIDATION", "เปลี่ยนขอบเขตของฉบับร่างนี้ไม่ได้");
    for (const [id, amount] of Object.entries(value.amounts)) {
      satang(amount);
      if (
        !this.state.fees.some(
          (f) => f.id === id && f.active && f.kind === "student",
        )
      )
        throw new DomainError(
          "VALIDATION",
          "ใช้ได้เฉพาะรายการภาระนักเรียนที่เปิดใช้งาน",
        );
    }
    const total = satang(
      Object.values(value.amounts).reduce((sum, amount) => sum + amount, 0),
    );
    satang(total * current.studentCount);
    current.amounts = structuredClone(value.amounts);
    current.version++;
    this.audit("บันทึกอัตราฉบับร่าง (สาธิต)", current.room);
  }
  async publishAssignment(id: string, version: number, role: DemoRole) {
    await this.wait();
    this.writable(role);
    if (!this.canEditFees(role))
      throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์เผยแพร่");
    const a = this.state.assignments.find((x) => x.id === id);
    if (!a || a.status !== "draft" || a.version !== version)
      throw new DomainError(
        "VERSION_CONFLICT",
        "ฉบับร่างเปลี่ยนแปลง กรุณาตรวจสอบอีกครั้ง",
      );
    if (!Object.keys(a.amounts).length)
      throw new DomainError("VALIDATION", "เลือกอย่างน้อยหนึ่งรายการ");
    if (
      this.state.assignments.some(
        (x) =>
          x.id !== id &&
          x.status === "published" &&
          x.room === a.room &&
          x.academicYear === a.academicYear &&
          x.term === a.term,
      )
    )
      throw new DomainError(
        "OVERLAP",
        "มีเวอร์ชันเผยแพร่ในขอบเขตนี้แล้ว ต้องยืนยันนโยบายการแทนที่ก่อน",
      );
    a.status = "published";
    a.version++;
    this.audit("เผยแพร่ชุดภาระ (สาธิต)", `${a.room} · v${a.version}`);
  }
  async copyAssignment(id: string, role: DemoRole) {
    await this.wait();
    this.writable(role);
    if (!this.canEditFees(role))
      throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์คัดลอก");
    const a = this.state.assignments.find((x) => x.id === id);
    if (!a) throw new DomainError("NOT_FOUND", "ไม่พบชุดภาระ");
    this.state.assignments.push({
      ...structuredClone(a),
      id: `assignment-copy-${this.state.assignments.length + 1}`,
      academicYear: a.academicYear + 1,
      status: "draft",
      generated: false,
      version: 1,
    });
    this.audit("คัดลอกชุดภาระ (สาธิต)", `${a.room} · ปี ${a.academicYear + 1}`);
  }
  async generate(id: string, role: DemoRole) {
    await this.wait();
    this.writable(role);
    if (!this.canEditFees(role))
      throw new DomainError("FORBIDDEN", "ไม่มีสิทธิ์สร้างภาระ");
    const a = this.state.assignments.find((x) => x.id === id);
    if (!a || a.status !== "published")
      throw new DomainError("VALIDATION", "ต้องเผยแพร่ก่อนสร้างภาระ");
    if (a.generated) return { created: 0, skipped: a.studentCount };
    throw new DomainError(
      "POLICY_REQUIRED",
      "การสร้างภาระสำหรับห้องใหม่ยังไม่เปิดใน Stage B ต้องยืนยันรายชื่อและนโยบายการสร้างภาระก่อน",
    );
  }
  async reconcile(
    book: ReceiptBook,
    physical: { used: number; void: number; available: number },
  ) {
    await this.wait();
    assertBook(book);
    const expected = counts(book),
      issues: string[] = [];
    if (
      Object.values(physical).some(
        (v) => !Number.isInteger(v) || v < 0 || v > 50,
      )
    )
      issues.push("กรอกจำนวนเต็มระหว่าง 0–50");
    if (physical.used + physical.void + physical.available !== 50)
      issues.push("จำนวนตรวจนับไม่ครบ 50 หน้า");
    if (
      Object.keys(expected).some(
        (k) =>
          expected[k as keyof typeof expected] !==
          physical[k as keyof typeof physical],
      )
    )
      issues.push("จำนวนตรวจนับไม่ตรงกับทะเบียนรายหน้า");
    return issues;
  }
  setScenario(value: Scenario) {
    this.scenario = value;
    if (value !== "loading") for (const release of [...this.heldReads]) release();
  }
  reset() {
    this.setScenario("baseline");
    this.state = baseline();
    this.roster = homeroomRoster();
    this.monthlyDrafts = [];
    this.staffSignedIn = true;
    this.stockVersion = 1;
    this.stockCommands.clear();
    this.movements = [];
    this.staff = structuredClone(STAFF);
    this.otherDelta = {};
    this.pending = [{ id: "pending-other-001", version: 1, type: "other_receipt", categoryId: "OTHER-01", amount: satang(40000), payer: "ผู้สนับสนุนสาธิต · รายการรออ้างอิง", description: "เงินทุนการศึกษาที่รับแล้ว · รวมในยอดสรุปเดิม", receiver: "กมลชนก ใจดี", date: "2026-10-15" }];
    this.results.clear();
    this.scenario = "baseline";
  }
}
