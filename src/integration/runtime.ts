import type { SchoolPayAdapter } from "../ports/SchoolPayAdapter";
import type { AuthBridgeAdapter } from "../ports/AuthBridgeAdapter";
import type { StaffAccess } from "../domain/workspace";

export interface Runtime {
  adapter: SchoolPayAdapter;
  auth: AuthBridgeAdapter | null;
  review?: { signIn(id: string): StaffAccess | null; signOut(): void };
}

export function unavailableAdapter(): SchoolPayAdapter {
  return new Proxy({} as SchoolPayAdapter, {
    get(_target, method) {
      if (method === "then") return undefined;
      if (method === "currentStaff") return async () => null;
      if (method === "endVisitorSession") return async () => {};
      return async () => { throw new Error("ยังไม่ได้เชื่อมต่อข้อมูลโรงเรียน กรุณาติดต่อผู้ดูแลระบบ"); };
    },
  });
}

// Bind the approved SchoolAuthBridge and authorized data adapter here when supplied.
// Do not infer roles from email, URL parameters, or browser storage.
export function schoolRuntime(): Runtime {
  return { adapter: unavailableAdapter(), auth: null };
}
