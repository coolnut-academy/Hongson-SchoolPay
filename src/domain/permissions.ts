import type { StaffRole } from "./model";
export type Capability = "student.read" | "payment.receive" | "other.receive" | "receipt.link" | "receipt.voidAvailable" | "book.issue" | "book.return" | "followup.edit" | "memo.generate" | "memo.stageRecord" | "fee.edit" | "fee.publish" | "obligation.generate" | "report.operational" | "report.obec" | "role.manage" | "audit.read";
export type StaffPrincipal = { kind: "staff"; uid: string; role: StaffRole; active: boolean; assignedRoomIds: readonly string[]; capabilities: readonly Capability[]; scopeVersion: string };
export type Principal = StaffPrincipal | { kind: "visitor"; sessionId: string; studentScope: string } | { kind: "anonymous" };
const common: Capability[] = ["student.read", "report.operational", "audit.read"];
const finance: Capability[] = [...common, "payment.receive", "receipt.link", "memo.generate"];
const officer: Capability[] = [...finance, "other.receive", "receipt.voidAvailable", "book.issue", "book.return", "fee.edit", "fee.publish", "obligation.generate", "report.obec"];
const defaults: Record<StaffRole, readonly Capability[]> = { homeroom_teacher: [...common, "followup.edit", "memo.generate"], finance_teacher: finance, finance_officer: officer, executive: [...common, "report.obec"], superadmin: [...officer, "followup.edit", "role.manage"] };
const optionalFinance: readonly Capability[] = ["other.receive", "receipt.voidAvailable", "book.issue", "book.return", "fee.edit", "fee.publish", "obligation.generate"];
export function isStaffRole(value: unknown): value is StaffRole { return typeof value === "string" && Object.prototype.hasOwnProperty.call(defaults, value); }
export function hasRoleCapability(role: StaffRole, capability: Capability) { return isStaffRole(role) && defaults[role].includes(capability); }
export function hasCapability(principal: Principal, capability: Capability, scope?: string) {
  if (principal.kind === "anonymous") return false;
  if (principal.kind === "visitor") return capability === "student.read" && !!principal.sessionId && scope === principal.studentScope;
  if (!principal.active || !principal.uid || !principal.scopeVersion || !isStaffRole(principal.role)) return false;
  if (principal.role === "homeroom_teacher" && ["student.read", "followup.edit", "memo.generate", "report.operational"].includes(capability) && (!scope || !principal.assignedRoomIds.includes(scope))) return false;
  return hasRoleCapability(principal.role, capability) || (principal.role === "finance_teacher" && optionalFinance.includes(capability) && principal.capabilities.includes(capability));
}
