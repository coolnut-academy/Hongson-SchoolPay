import { describe, it, expect } from "vitest";
import { MockAdapter } from "./MockAdapter";
import {
  assertBook,
  counts,
  dateLabel,
  parseMoney,
  satang,
  type PaymentCommand,
} from "../../domain/model";
it("formats an instant in Bangkok with Buddhist year and Arabic digits", () => {
  expect(dateLabel("2026-10-15T18:00:00Z")).toBe("16 ต.ค. 2569");
});
const command = (id = "cmd-1"): PaymentCommand => ({
  commandId: id,
  obligationId: "obl-001",
  expectedObligationVersion: 1,
  bookId: "book-379",
  pageId: "page-379-13",
  expectedPageVersion: 1,
  amount: satang(150000),
  method: "cash",
  date: "2026-10-16",
  note: "",
  printedNo: "",
});
describe("money and physical ledger invariants", () => {
  it("parses satang exactly and rejects unsafe inputs", () => {
    expect(parseMoney("1500.01")).toBe(150001);
    expect(parseMoney("0")).toBe(0);
    for (const value of [
      "1.001",
      "-1",
      "1e3",
      "NaN",
      "1,500",
      "90071992547409999",
    ])
      expect(() => parseMoney(value)).toThrow();
  });
  it("has 50 unique pages per book and all used pages have a transaction", async () => {
    const s = await new MockAdapter(0).read();
    s.books.forEach(assertBook);
    expect(counts(s.books[0])).toEqual({ used: 11, void: 1, available: 38 });
    expect(
      s.student.obligations.reduce((n, o) => n + o.adjusted - o.paid, 0),
    ).toBe(150000);
  });
  it("commits once and duplicate command returns original result", async () => {
    const a = new MockAdapter(0);
    const first = await a.receive(command(), "superadmin");
    expect(await a.receive(command(), "superadmin")).toEqual(first);
    const s = await a.read();
    expect(s.student.obligations[0].paid).toBe(350000);
    expect(s.student.transactions).toHaveLength(4);
    expect(counts(s.books[0])).toEqual({ used: 12, void: 1, available: 37 });
    await expect(
      a.receive({ ...command(), note: "different" }, "superadmin"),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY" });
  });
  it("two clients competing for a page produce one payment", async () => {
    const a = new MockAdapter(0),
      r = await Promise.allSettled([
        a.receive(command("a"), "superadmin"),
        a.receive(command("b"), "superadmin"),
      ]);
    expect(r.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    expect((await a.read()).student.transactions).toHaveLength(4);
  });
  it("rejects invalid amount, version, date, role without changing state", async () => {
    for (const cmd of [
      { ...command(), amount: satang(150001) },
      { ...command(), expectedObligationVersion: 9 },
      { ...command(), date: "2025-01-01" },
    ]) {
      const a = new MockAdapter(0),
        before = await a.read();
      await expect(a.receive(cmd, "superadmin")).rejects.toThrow();
      expect(await a.read()).toEqual(before);
    }
    const a = new MockAdapter(0);
    await expect(a.receive(command(), "executive")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
  it("unknown outcome recovers original committed result", async () => {
    const a = new MockAdapter(0);
    a.setScenario("unknown-outcome");
    await expect(a.receive(command(), "superadmin")).rejects.toMatchObject({
      code: "OUTCOME_UNKNOWN",
    });
    expect((await a.outcome("cmd-1"))?.pageNo).toBe(13);
    expect((await a.read()).student.transactions).toHaveLength(4);
  });
  it("offline and stale simulations do not write", async () => {
    for (const scenario of ["offline", "stale"] as const) {
      const a = new MockAdapter(0),
        before = await a.read();
      a.setScenario(scenario);
      await expect(a.receive(command(), "superadmin")).rejects.toThrow();
      expect(await a.read()).toEqual(before);
    }
  });
  it("page conflict changes no student balance", async () => {
    const a = new MockAdapter(0);
    a.setScenario("page-conflict");
    await expect(a.receive(command(), "superadmin")).rejects.toMatchObject({
      code: "PAGE_UNAVAILABLE",
    });
    const s = await a.read();
    expect(s.student.obligations[0].paid).toBe(200000);
    expect(s.student.transactions).toHaveLength(3);
    s.books.forEach(assertBook);
  });
  it("void requires reason and cannot recycle used or void pages", async () => {
    const a = new MockAdapter(0);
    await expect(
      a.voidPage("book-379", "page-379-13", 1, "", "superadmin"),
    ).rejects.toThrow();
    await expect(
      a.voidPage("book-379", "page-379-9", 1, "wrong", "superadmin"),
    ).rejects.toThrow();
    await a.voidPage(
      "book-379",
      "page-379-13",
      1,
      "ชำรุดก่อนรับเงิน",
      "superadmin",
    );
    await expect(a.receive(command(), "superadmin")).rejects.toMatchObject({
      code: "PAGE_UNAVAILABLE",
    });
  });
  it("reconciliation validates membership, counts and physical mismatch", async () => {
    const a = new MockAdapter(0),
      b = (await a.read()).books[0];
    expect(await a.reconcile(b, { used: 11, void: 1, available: 38 })).toEqual(
      [],
    );
    expect(
      await a.reconcile(b, { used: 11, void: 1, available: 37 }),
    ).toHaveLength(2);
    b.pages[49].pageNo = 1;
    await expect(
      a.reconcile(b, { used: 11, void: 1, available: 38 }),
    ).rejects.toThrow();
  });
});
describe("fee boundaries", () => {
  it("published assignments are immutable and stale drafts rejected", async () => {
    const a = new MockAdapter(0),
      s = await a.read();
    await expect(
      a.saveAssignment(s.assignments[0], 1, "superadmin"),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    await expect(
      a.saveAssignment(s.assignments[1], 9, "superadmin"),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
  });
  it("other categories cannot be assigned as student charges", async () => {
    const a = new MockAdapter(0),
      draft = (await a.read()).assignments[1];
    draft.amounts["OTHER-01"] = satang(50000);
    await expect(a.saveAssignment(draft, 1, "superadmin")).rejects.toThrow();
  });
  it("saving and publishing a draft never changes existing obligations", async () => {
    const a = new MockAdapter(0),
      s = await a.read(),
      draft = s.assignments[1];
    draft.amounts["SPT-111"] = satang(360000);
    await a.saveAssignment(draft, 1, "superadmin");
    await a.publishAssignment(draft.id, 2, "superadmin");
    const after = await a.read();
    expect(after.student).toEqual(s.student);
    expect(after.assignments[1].status).toBe("published");
    expect(after.assignments[1].generated).toBe(false);
  });
  it("copy to next year preserves source and duplicate generation skips", async () => {
    const a = new MockAdapter(0);
    await a.copyAssignment("assignment-m2-1", "superadmin");
    const s = await a.read();
    expect(s.assignments[0].academicYear).toBe(2569);
    expect(s.assignments[2]).toMatchObject({
      academicYear: 2570,
      status: "draft",
      generated: false,
    });
    expect(await a.generate("assignment-m2-1", "superadmin")).toEqual({
      created: 0,
      skipped: 40,
    });
  });
  it("lookup is exact and abortable", async () => {
    const a = new MockAdapter(0);
    expect(await a.lookup("69024")).toBe(true);
    expect(await a.lookup("690")).toBe(false);
    const c = new AbortController();
    c.abort();
    await expect(a.read(c.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});
