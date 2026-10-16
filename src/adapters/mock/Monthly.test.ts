import { expect, it } from "vitest";
import { MockAdapter } from "./MockAdapter";
import { financialKey } from "../../domain/workspace";
import { satang } from "../../domain/model";

it("monthly figures stay frozen after a payment; refresh retains notes and history", async () => {
  const adapter = new MockAdapter(0), role = "superadmin";
  const original = (await adapter.monthlyWorkspace("ม.2/1", "2026-10", role))!;
  await adapter.saveMonthlyNote({ room: "ม.2/1", month: "2026-10", revision: 1, studentId: "student-003", expectedVersion: 1, reason: "ทดสอบติดตาม", solution: "", note: "ข้อความฉบับร่าง" }, role);
  await adapter.receive({ commandId: "monthly-pay", obligationId: "obl-001", expectedObligationVersion: 1, bookId: "book-379", pageId: "page-379-13", expectedPageVersion: 1, amount: satang(150000), method: "cash", date: "2026-10-16", note: "", printedNo: "" }, role);
  const changed = (await adapter.monthlyWorkspace("ม.2/1", "2026-10", role))!;
  expect(changed.draft.snapshot.totals.outstanding).toBe(1250000);
  expect(changed.live.totals.outstanding).toBe(1100000);
  await expect(adapter.refreshMonthly("ม.2/1", "2026-10", 1, original.draft.version, financialKey(changed.live), role)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
  await expect(adapter.refreshMonthly("ม.2/1", "2026-10", 1, changed.draft.version, "stale-preview", role)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
  await expect(adapter.refreshMonthly("ม.2/1", "2026-10", 1, changed.draft.version, financialKey(changed.live), "executive")).rejects.toMatchObject({ code: "FORBIDDEN" });
  await adapter.refreshMonthly("ม.2/1", "2026-10", 1, changed.draft.version, financialKey(changed.live), role);
  const final = (await adapter.monthlyWorkspace("ม.2/1", "2026-10", role))!;
  expect(final.draft.revision).toBe(2);
  expect(final.draft.snapshot.totals).toMatchObject({ settled: 34, debtors: 6, outstanding: 1100000 });
  expect(final.draft.snapshot.students[2].reason).toBe("ทดสอบติดตาม");
  expect(final.history[0].snapshot.totals.outstanding).toBe(1250000);
  expect(original.draft.snapshot.students[2].reason).toBe("");
  await expect(adapter.saveMonthlyNote({ room: "ม.2/1", month: "2026-10", revision: 1, studentId: "student-003", expectedVersion: 1, reason: "changed", solution: "", note: "" }, role)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
});
