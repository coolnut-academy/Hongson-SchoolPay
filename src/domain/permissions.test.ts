import { expect, it } from "vitest";
import { hasCapability, isStaffRole, type StaffPrincipal } from "./permissions";
const principal: StaffPrincipal = { kind: "staff", uid: "synthetic-uid", active: true, role: "homeroom_teacher", assignedRoomIds: ["ม.2/1"], capabilities: [], scopeVersion: "v1" };
it("five roles, visitors, inactive and unknown principals fail closed by capability and scope", () => {
  expect(hasCapability(principal, "followup.edit", "ม.2/1")).toBe(true);
  expect(hasCapability(principal, "followup.edit", "ม.2/2")).toBe(false);
  expect(hasCapability({ ...principal, active: false }, "student.read", "ม.2/1")).toBe(false);
  expect(hasCapability({ ...principal, role: "executive" }, "payment.receive")).toBe(false);
  expect(hasCapability({ ...principal, role: "executive" }, "role.manage")).toBe(false);
  expect(hasCapability({ ...principal, role: "finance_teacher" }, "other.receive")).toBe(false);
  expect(hasCapability({ ...principal, role: "finance_teacher", capabilities: ["other.receive"] }, "other.receive")).toBe(true);
  expect(hasCapability({ ...principal, role: "finance_officer" }, "payment.receive")).toBe(true);
  expect(hasCapability({ ...principal, role: "superadmin" }, "role.manage")).toBe(true);
  expect(hasCapability({ ...principal, role: "superadmin" }, "memo.stageRecord")).toBe(false);
  expect(isStaffRole("__proto__")).toBe(false); expect(isStaffRole("student")).toBe(false);
  expect(hasCapability({ ...principal, role: "unknown" as StaffPrincipal["role"] }, "role.manage")).toBe(false);
  expect(hasCapability({ kind: "anonymous" }, "student.read", "student-001")).toBe(false);
  expect(hasCapability({ kind: "visitor", sessionId: "opaque", studentScope: "student-001" }, "student.read", "student-002")).toBe(false);
});
