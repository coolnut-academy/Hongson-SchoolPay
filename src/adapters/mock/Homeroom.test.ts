import { describe, expect, it } from "vitest";
import { MockAdapter } from "./MockAdapter";
import { missingFollowup, satang, type SaveFollowup } from "../../domain/model";

const role = "homeroom_teacher" as const;
const command: SaveFollowup = { room: "ม.2/1", month: "2026-10", studentId: "student-003", expectedVersion: 1, reason: "รอผู้ปกครอง", solution: "นัดติดตาม", note: "" };
describe("scoped monthly collections", () => {
  it("reconciles the approved roster, seven debts and three missing entries", async () => {
    const adapter = new MockAdapter(0);
    const data = (await adapter.monthlyCollections("ม.2/1", "2026-10", role))!;
    expect(data.totals).toEqual({ students: 40, settled: 33, debtors: 7, adjusted: 18000000, paid: 16750000, outstanding: 1250000 });
    expect(data.students.filter(s => s.outstanding).map(s => s.outstanding)).toEqual([150000, 250000, 200000, 100000, 300000, 150000, 100000]);
    expect(data.students.filter(s => s.outstanding && missingFollowup(s))).toHaveLength(3);
    expect(data.students[7]).toMatchObject({ id: "student-008", code: "69108", name: "นักเรียนสาธิต 08", paid: 450000 });
  });
  it("saves versioned human notes, preserves money and rejects conflicts", async () => {
    const adapter = new MockAdapter(0);
    const before = await adapter.read();
    const saved = await adapter.saveFollowup(command, role);
    expect(saved.version).toBe(2);
    expect(await adapter.read()).toEqual(before);
    const data = (await adapter.monthlyCollections(command.room, command.month, role))!;
    expect(data.students[2]).toMatchObject({ reason: command.reason, solution: command.solution, version: 2 });
    expect(data.students.filter(s => s.outstanding && missingFollowup(s))).toHaveLength(2);
    await expect(adapter.saveFollowup(command, role)).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    await adapter.saveFollowup({ ...command, expectedVersion: 2, reason: "", solution: "" }, role);
    expect((await adapter.monthlyCollections(command.room, command.month, role))!.students[2].reason).toBe("");
  });
  it("denies unassigned rooms and read-only roles, and supports empty scopes/months", async () => {
    const adapter = new MockAdapter(0);
    expect((await adapter.homeroomAccess(role)).rooms).toEqual(["ม.2/1"]);
    await expect(adapter.monthlyCollections("ม.2/2", "2026-10", role)).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(adapter.saveFollowup({ ...command, room: "ม.2/2" }, role)).rejects.toMatchObject({ code: "FORBIDDEN" });
    for (const readRole of ["executive", "finance_teacher", "finance_officer"] as const) {
      expect((await adapter.homeroomAccess(readRole)).editable).toBe(false);
      await expect(adapter.saveFollowup(command, readRole)).rejects.toMatchObject({ code: "FORBIDDEN" });
    }
    expect(await adapter.monthlyCollections(command.room, "2026-09", role)).toBeNull();
    adapter.setScenario("no-assigned-rooms");
    expect((await adapter.homeroomAccess(role)).rooms).toEqual([]);
    await expect(adapter.monthlyCollections(command.room, command.month, role)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("validates text limits without truncation and retains state on failed writes", async () => {
    const adapter = new MockAdapter(0);
    for (const [field, limit] of [["reason", 1000], ["solution", 1000], ["note", 2000]] as const) {
      await expect(adapter.saveFollowup({ ...command, [field]: "ก".repeat(limit + 1) }, role)).rejects.toMatchObject({ code: "VALIDATION" });
    }
    await adapter.saveFollowup({ ...command, reason: "ก".repeat(1000), solution: "ข".repeat(1000), note: "ค".repeat(2000) }, role);
    for (const scenario of ["offline", "stale"] as const) {
      adapter.setScenario(scenario);
      await expect(adapter.saveFollowup({ ...command, expectedVersion: 2 }, role)).rejects.toMatchObject({ code: scenario === "offline" ? "OFFLINE" : "SOURCE_STALE" });
    }
    expect((await adapter.monthlyCollections(command.room, command.month, role))!.students[2].version).toBe(2);
    adapter.setScenario("read-error");
    await expect(adapter.monthlyCollections(command.room, command.month, role)).rejects.toMatchObject({ code: "READ_FAILED" });
  });
  it("updates live collection money exactly once after a mock payment", async () => {
    const adapter = new MockAdapter(0);
    const payment = { commandId: "homeroom-payment", obligationId: "obl-001", expectedObligationVersion: 1, bookId: "book-379", pageId: "page-379-13", expectedPageVersion: 1, amount: satang(150000), method: "cash" as const, date: "2026-10-16", note: "", printedNo: "" };
    await adapter.receive(payment, "superadmin");
    await adapter.receive(payment, "superadmin");
    const data = (await adapter.monthlyCollections(command.room, command.month, role))!;
    expect(data.totals).toMatchObject({ settled: 34, debtors: 6, paid: 16900000, outstanding: 1100000 });
    const controller = new AbortController(); controller.abort();
    await expect(adapter.monthlyCollections(command.room, command.month, role, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
  });
});
