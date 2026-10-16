import { expect, it } from "vitest";
import { MockAdapter } from "./MockAdapter";
import { assertBook, assertLedger, satang } from "../../domain/model";
it("signed-out, inactive, changed-role and revoked actors cannot mutate fixture records", async () => {
  const adapter = new MockAdapter(0), command = { commandId: "no-access", identifiers: ["DENIED-BOOK"], quantity: 1, expectedVersion: 1 };
  const before = await adapter.read();
  await adapter.signOutStaffDemo();
  await expect(adapter.receiveStock(command, "superadmin")).rejects.toMatchObject({ code: "FORBIDDEN" });
  await adapter.signInStaffDemo("superadmin");
  const staff = (await adapter.staffAccess("superadmin")).find(s => s.role === "finance_officer")!;
  await adapter.changeAccess({ ...staff, active: false }, staff.version, "ยกเลิกสิทธิ์สาธิต", "superadmin");
  await expect(adapter.receiveStock(command, "finance_officer")).rejects.toMatchObject({ code: "FORBIDDEN" });
  await adapter.changeAccess({ ...staff, role: "executive", active: true }, staff.version + 1, "เปลี่ยนบทบาทสาธิต", "superadmin");
  await expect(adapter.receiveStock(command, "finance_officer")).rejects.toMatchObject({ code: "FORBIDDEN" });
  adapter.setScenario("permission-revoked");
  await expect(adapter.receiveStock(command, "superadmin")).rejects.toMatchObject({ code: "FORBIDDEN" });
  expect((await adapter.read()).books).toEqual(before.books);
});
it("logout during a pending write is checked again at commit", async () => {
  const adapter = new MockAdapter(20);
  const writing = adapter.receiveStock({ commandId: "late-stock", identifiers: ["LATE-BOOK"], quantity: 1, expectedVersion: 1 }, "superadmin");
  const denied = expect(writing).rejects.toMatchObject({ code: "FORBIDDEN" });
  await adapter.signOutStaffDemo(); await denied;
  expect((await adapter.read()).books).toHaveLength(2);
});
it("held loading releases explicitly and aborted reads never return late data", async () => {
  const adapter = new MockAdapter(0); adapter.setScenario("loading");
  const controller = new AbortController(), read = adapter.read(controller.signal);
  const rejected = expect(read).rejects.toMatchObject({ name: "AbortError" }); controller.abort(); await rejected;
  const resumed = adapter.read(); adapter.setScenario("baseline"); expect((await resumed).books).toHaveLength(2);
});
it("balance-changed represents an externally committed full payment, with no duplicate caller commit", async () => {
  const adapter = new MockAdapter(0); adapter.setScenario("balance-changed");
  await expect(adapter.receive({ commandId: "competing-balance", obligationId: "obl-001", expectedObligationVersion: 1, bookId: "book-379", pageId: "page-379-13", expectedPageVersion: 1, amount: satang(150000), method: "cash", date: "2026-10-16", note: "", printedNo: "" }, "superadmin")).rejects.toMatchObject({ code: "BALANCE_CHANGED" });
  const data = await adapter.read();
  expect(data.student.obligations[0].paid).toBe(350000); expect(data.books[0].pages[12].status).toBe("available");
  expect(data.books[1].pages[4].transaction?.amount).toBe(150000); assertLedger(data.books);
  expect(await adapter.outcome("competing-balance")).toBeNull();
});
it("visitor projection excludes staff, fees, stock and audit; explicit grants and revocation resolve in scope", async () => {
  const adapter = new MockAdapter(0), view = await adapter.visitorAccount();
  expect(Object.keys(view).sort()).toEqual(["previousHistory", "student"]);
  adapter.setScenario("empty-valid"); expect((await adapter.visitorAccount()).previousHistory).toEqual([]);
  adapter.setScenario("delegated-finance"); expect((await adapter.currentStaff("finance_teacher"))?.capabilities).toContain("other.receive");
  adapter.setScenario("permission-revoked"); expect((await adapter.currentStaff("finance_teacher"))?.active).toBe(false);
});
it("ledger rejects duplicate physical identities, mismatched references and duplicate transaction links", async () => {
  const data = await new MockAdapter(0).read();
  let books = structuredClone(data.books); books[0].pages[1].id = books[0].pages[0].id; expect(() => assertBook(books[0])).toThrow();
  books = structuredClone(data.books); books[0].pages[0].transaction!.pageNo = 2; expect(() => assertBook(books[0])).toThrow();
  books = structuredClone(data.books); books[1].pages[0].transaction!.id = books[0].pages[0].transaction!.id; expect(() => assertLedger(books)).toThrow();
});
it("generation preview separates publication, existing generation, eligibility and stale source", async () => {
  const adapter = new MockAdapter(0);
  const duplicate = await adapter.previewGeneration("assignment-m2-1", "superadmin"); expect(duplicate.existing).toBe(40); expect(duplicate.issues).toEqual([]);
  const draft = await adapter.previewGeneration("assignment-m2-2", "superadmin"); expect(draft.issues.join()).toContain("ต้องเผยแพร่"); expect(draft.issues.join()).toContain("G05");
  adapter.setScenario("stale"); expect((await adapter.previewGeneration("assignment-m2-1", "superadmin")).issues.join()).toContain("ล้าสมัย");
  await expect(adapter.generate("assignment-m2-1", "superadmin")).rejects.toMatchObject({ code: "SOURCE_STALE" });
});
