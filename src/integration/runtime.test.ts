import { expect, it } from "vitest";
import { schoolRuntime } from "./runtime";
import { reviewRuntime } from "./review";
import type { PaymentCommand } from "../domain/model";

it("unconfigured production fails closed without granting any role or returning fabricated data", async () => {
  const runtime = schoolRuntime();
  expect(runtime.auth).toBeNull();
  expect(runtime.review).toBeUndefined();
  expect(await runtime.adapter.currentStaff("superadmin")).toBeNull();
  await expect(runtime.adapter.lookup("TEST-STUDENT")).rejects.toThrow();
  await expect(runtime.adapter.read()).rejects.toThrow();
  await expect(runtime.adapter.receive({} as PaymentCommand, "superadmin")).rejects.toThrow();
});

it("review IDs expose empty screens and reject every write, even for admin", async () => {
  const { adapter, review } = reviewRuntime();
  await expect(adapter.read()).rejects.toThrow();
  expect(review!.signIn("__proto__")).toBeNull();
  expect(review!.signIn("TEST-ADMIN")?.role).toBe("superadmin");
  expect(await adapter.currentStaff("finance_officer")).toBeNull();
  expect(await adapter.staffAccess("superadmin")).toEqual([]);
  expect(await adapter.read()).toEqual({ student: null, books: [], fees: [], assignments: [], audit: [] });
  expect((await adapter.dashboard("superadmin")).available).toBe(false);
  await expect(adapter.receive({} as PaymentCommand, "superadmin")).rejects.toThrow();
  await expect(adapter.changeAccess(review!.signIn("TEST-ADMIN")!, 1, "test", "superadmin")).rejects.toThrow();
  review!.signOut();
  expect(await adapter.currentStaff("superadmin")).toBeNull();
  await expect(adapter.read()).rejects.toThrow();
});

it("student review scope contains no school records and expires on exit or failed lookup", async () => {
  const { adapter, review } = reviewRuntime();
  expect(await adapter.lookup("TEST-STUDENT")).toBe(true);
  expect((await adapter.visitorAccount()).student).toBeNull();
  await adapter.endVisitorSession();
  await expect(adapter.visitorAccount()).rejects.toThrow();
  await adapter.lookup("TEST-STUDENT");
  expect(await adapter.lookup("69024")).toBe(false);
  await expect(adapter.visitorAccount()).rejects.toThrow();
  await adapter.lookup("TEST-STUDENT");
  review!.signIn("TEST-TEACHER");
  await expect(adapter.visitorAccount()).rejects.toThrow();
});
