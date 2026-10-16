import { expect, it } from "vitest";
import { MockAdapter } from "./MockAdapter";
import { satang } from "../../domain/model";
import { REPORT_KINDS, type ReportRequest } from "../../domain/workspace";
it("25-book receives remain reachable through bounded independent book and movement cursors", async () => {
  const adapter = new MockAdapter(0);
  await adapter.receiveStock({ commandId: "stock-25", identifiers: Array.from({ length: 25 }, (_, i) => `DEMO-PAGED-${i + 1}`), quantity: 25, expectedVersion: 1 }, "superadmin");
  const first = await adapter.stock("superadmin");
  expect(first.books).toHaveLength(25); expect(first.nextBookCursor).toBe("25"); expect(first.movements).toHaveLength(25);
  const next = await adapter.stock("superadmin", undefined, { bookCursor: first.nextBookCursor });
  expect(next.books.map(b => b.bookNo)).toEqual(["DEMO-PAGED-24", "DEMO-PAGED-25"]); expect(next.nextBookCursor).toBeUndefined();
  const book = next.books[1]; await adapter.issueBook(book.id, book.version, "ผู้ถือสาธิต", "superadmin");
  const moved = await adapter.stock("superadmin"); expect(moved.nextMovementCursor).toBe("25");
  const older = await adapter.stock("superadmin", undefined, { movementCursor: moved.nextMovementCursor });
  expect(older.movements).toHaveLength(1); expect(older.nextMovementCursor).toBeUndefined(); expect(older.books).toHaveLength(25);
  for (const cursor of ["-1", "NaN", "0.5", "9007199254740992"]) await expect(adapter.stock("superadmin", undefined, { bookCursor: cursor })).rejects.toMatchObject({ code: "VALIDATION" });
});
it("stock validates explicit unique identifiers, quantity and version; opening 6+80 stays 86", async () => {
  const adapter = new MockAdapter(0), command = { commandId: "receive-stock", identifiers: ["DEMO-NEW-001"], quantity: 1, expectedVersion: 1 };
  await expect(adapter.receiveStock({ ...command, quantity: 2 }, "superadmin")).rejects.toMatchObject({ code: "VALIDATION" });
  await adapter.receiveStock(command, "superadmin"); await adapter.receiveStock(command, "superadmin");
  const stock = await adapter.stock("superadmin");
  expect(stock.opening).toEqual({ carryForward: 6, received: 80, total: 86, finalized: false });
  const book = stock.books.find(b => b.bookNo === "DEMO-NEW-001")!;
  expect(book.pages).toHaveLength(50); expect(new Set(book.pages.map(p => p.id)).size).toBe(50);
  await expect(adapter.issueBook(book.id, book.version, "", "superadmin")).rejects.toMatchObject({ code: "VALIDATION" });
  await adapter.issueBook(book.id, book.version, "ผู้ถือเล่มสาธิต", "superadmin");
  await expect(adapter.issueBook(book.id, book.version, "ผู้ถือเล่มซ้ำ", "superadmin")).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
});
it("partial and 49-page returns fail; a fully linked 50-page book returns without recycling", async () => {
  const adapter = new MockAdapter(0);
  await expect(adapter.returnBook("book-379", 1, { used: 11, void: 1, available: 37 }, "ผู้รับคืน", "superadmin")).rejects.toMatchObject({ code: "RECONCILIATION" });
  await expect(adapter.returnBook("book-379", 1, { used: 11, void: 1, available: 38 }, "ผู้รับคืน", "superadmin")).rejects.toMatchObject({ code: "POLICY_REQUIRED" });
  await adapter.receiveStock({ commandId: "stock-complete", identifiers: ["DEMO-COMPLETE"], quantity: 1, expectedVersion: 1 }, "superadmin");
  let book = (await adapter.stock("superadmin")).books.find(b => b.bookNo === "DEMO-COMPLETE")!;
  await adapter.issueBook(book.id, book.version, "ผู้ถือเล่มสาธิต", "superadmin");
  book = (await adapter.stock("superadmin")).books.find(b => b.id === book.id)!;
  for (const page of book.pages) await adapter.receiveOther({ commandId: `complete-${page.id}`, categoryId: "OTHER-02", date: "2026-10-16", fiscalYear: 2570, payer: "ผู้สนับสนุนสาธิต", description: "รายการสาธิตครบเล่ม", amount: satang(100), note: "", bookId: book.id, pageId: page.id, expectedPageVersion: page.version, printedNo: "" }, "superadmin");
  book = (await adapter.stock("superadmin")).books.find(b => b.id === book.id)!;
  await adapter.returnBook(book.id, book.version, { used: 50, void: 0, available: 0 }, "ผู้รับคืนสาธิต", "superadmin");
  const returned = (await adapter.stock("superadmin")).books.find(b => b.id === book.id)!;
  expect(returned.status).toBe("returned"); expect(returned.pages.every(p => p.status === "used" && !!p.transaction)).toBe(true);
  await expect(adapter.issueBook(returned.id, returned.version, "นำกลับใช้", "superadmin")).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
});
it("all report families are bounded, templates stay blocked, invalid ledger links are detected", async () => {
  const adapter = new MockAdapter(0);
  for (const kind of REPORT_KINDS) {
    const academic = ["monthly_memo", "student_collections", "student_outstanding"].includes(kind);
    const result = await adapter.previewReport({ kind, room: "ม.2/1", month: "2026-10", grade: "all", year: academic ? 2569 : 2570 }, "superadmin");
    expect(result.rows.length).toBeLessThanOrEqual(100); expect(result.template.status).toBe("missing"); expect(result.issues.some(i => i.message.includes("G04"))).toBe(true);
  }
  await expect(adapter.previewReport({ kind: "official_receipt" } as unknown as ReportRequest, "superadmin")).rejects.toMatchObject({ code: "FORBIDDEN" });
  await expect(adapter.previewReport({ kind: "other_money", room: "ม.2/1", month: "2026-10", grade: "all", year: 2570 }, "homeroom_teacher")).rejects.toMatchObject({ code: "FORBIDDEN" });
  adapter.setScenario("report-invalid");
  const report = await adapter.previewReport({ kind: "receipt_ledger", room: "ม.2/1", month: "2026-10", grade: "all", year: 2570 }, "superadmin");
  expect(report.issues.some(i => i.message.includes("USED ไม่มีรายการเชื่อมโยง"))).toBe(true);
  expect((await adapter.read()).books[0].pages[8].transaction).toBeDefined();
});
it("homeroom audit contains only its own events, redacted and capped to 25", async () => {
  const adapter = new MockAdapter(0);
  await adapter.monthlyWorkspace("ม.2/1", "2026-10", "homeroom_teacher");
  await adapter.saveMonthlyNote({ room: "ม.2/1", month: "2026-10", revision: 1, studentId: "student-003", expectedVersion: 1, reason: "ข้อมูลส่วนบุคคลสาธิต", solution: "", note: "" }, "homeroom_teacher");
  const audit = await adapter.auditEvents({ search: "", module: "all" }, "homeroom_teacher");
  expect(audit.items).toHaveLength(1); expect(audit.items[0].actorUid).toBe("staff-homeroom-01"); expect(audit.items[0].detail).not.toContain("ข้อมูลส่วนบุคคลสาธิต");
});
