import type { StaffRole } from "../domain/model";
import type { StaffAccess } from "../domain/workspace";
import { ROLE_LABELS } from "../domain/workspace";
import type { SchoolPayAdapter } from "../ports/SchoolPayAdapter";
import type { Runtime } from "./runtime";

// Imported only by the development build. These IDs select empty screen layouts;
// they are not school accounts and cannot access or mutate any school records.
export const REVIEW_IDS: Record<string, StaffRole> = {
  "TEST-ADMIN": "superadmin",
  "TEST-FINANCE": "finance_officer",
  "TEST-TEACHER": "homeroom_teacher",
  "TEST-FINANCE-TEACHER": "finance_teacher",
  "TEST-EXECUTIVE": "executive",
};

export function reviewRuntime(): Runtime {
  let staff: StaffAccess | null = null;
  let studentSession = false;
  const reads: Partial<SchoolPayAdapter> = {
    currentStaff: async role => staff?.role === role ? structuredClone(staff) : null,
    endVisitorSession: async () => { studentSession = false; },
    lookup: async code => { staff = null; studentSession = code.trim().toUpperCase() === "TEST-STUDENT"; return studentSession; },
    visitorAccount: async () => {
      if (!studentSession) throw new Error("กรุณาเข้าสู่ระบบใหม่");
      return { student: null, previousHistory: [], documents: [] };
    },
    read: async () => ({ student: null, books: [], fees: [], assignments: [], audit: [] }),
    dashboard: async () => ({ grades: [], other: [], asOf: "", stale: false, available: false }),
    staffAccess: async () => [],
    homeroomAccess: async () => ({ rooms: [], teacher: staff?.name ?? "", editable: false }),
    monthlyCollections: async () => null,
    monthlyWorkspace: async () => null,
    pendingReferences: async () => [],
    lifecycleReviews: async () => [],
    auditEvents: async () => ({ items: [] }),
    stock: async () => ({ version: 0, opening: { carryForward: 0, received: 0, total: 0, finalized: false }, books: [], movements: [] }),
  };
  const adapter = new Proxy(reads as SchoolPayAdapter, {
    get(target, key: keyof SchoolPayAdapter) {
      const read = target[key];
      return async (...args: unknown[]) => {
        if (!["lookup", "visitorAccount", "endVisitorSession", "currentStaff"].includes(key) && !staff) throw new Error("กรุณาเข้าสู่ระบบใหม่");
        if (!read) throw new Error("โหมดตรวจหน้าจอไม่บันทึกข้อมูล กรุณาเชื่อมต่อระบบโรงเรียนก่อนใช้งาน");
        return (read as (...values: unknown[]) => unknown)(...args);
      };
    },
  });
  return { adapter, auth: null, review: {
    signIn(id) {
      const role = Object.hasOwn(REVIEW_IDS, id) ? REVIEW_IDS[id] : undefined;
      studentSession = false;
      staff = role ? { uid: id, name: ROLE_LABELS[role], role, active: true, rooms: [], version: 1, source: "ตรวจหน้าจอ", capabilities: [] } : null;
      return staff;
    },
    signOut() { staff = null; studentSession = false; },
  } };
}
