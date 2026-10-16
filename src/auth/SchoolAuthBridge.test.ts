import { expect, it } from "vitest";
import { SchoolAuthBridge } from "./SchoolAuthBridge";
import type { FirebaseAuthDriver, SchoolIdentitySource } from "../ports/AuthBridgeAdapter";
const fixture = () => {
  let signedIn = true, memoryCalls = 0;
  const auth: FirebaseAuthDriver = { useMemoryPersistence: async () => { memoryCalls++; }, currentIdentity: async () => signedIn ? { uid: "auth-fixture", projectId: "demo-fixture" } : null, signIn: async () => { signedIn = true; }, signOut: async () => { signedIn = false; }, onIdentityChanged: () => () => undefined };
  const source: SchoolIdentitySource = { resolveMapping: async () => ({ authUid: "auth-fixture", projectId: "demo-fixture", schoolId: "fictional-school", staffId: "folio-staff-different-uid" }), profile: async staffId => ({ staffId, fullName: "บุคลากรสาธิต", position: "ครู", updatedAt: "2026-10-16" }), access: async staffId => ({ staffId, schoolId: "fictional-school", active: true, role: "homeroom_teacher", assignedRoomIds: ["ม.2/1"], capabilities: [], scopeVersion: "scope-1" }) };
  return { auth, source, memoryCalls: () => memoryCalls };
};
it("bridge requires explicit cross-system mapping, uses memory and resolves login/logout", async () => {
  const f = fixture(), bridge = new SchoolAuthBridge(f.auth, f.source, { projectId: "demo-fixture", schoolId: "fictional-school" });
  const session = await bridge.signIn(); expect(session.kind).toBe("ready");
  if (session.kind === "ready") { expect(session.profile.staffId).toBe("folio-staff-different-uid"); expect(session.principal.uid).toBe("auth-fixture"); expect(session.principal.assignedRoomIds).toEqual(["ม.2/1"]); }
  await bridge.signOut(); expect((await bridge.resolveSession()).kind).toBe("signed_out"); expect(f.memoryCalls()).toBeGreaterThan(0); bridge.dispose();
});
it("unknown mapping, inactive/unknown roles and wrong projects never obtain a ready session", async () => {
  for (const variant of ["missing", "inactive", "unknown-role", "wrong-project"] as const) {
    const f = fixture();
    if (variant === "missing") f.source.resolveMapping = async () => null;
    if (variant === "wrong-project") f.auth.currentIdentity = async () => ({ uid: "auth-fixture", projectId: "unapproved" });
    if (variant === "inactive" || variant === "unknown-role") f.source.access = async staffId => ({ staffId, schoolId: "fictional-school", active: variant !== "inactive", role: variant === "inactive" ? "homeroom_teacher" : "unknown-role", assignedRoomIds: [], capabilities: [], scopeVersion: "scope-1" });
    const bridge = new SchoolAuthBridge(f.auth, f.source, { projectId: "demo-fixture", schoolId: "fictional-school" });
    expect((await bridge.resolveSession()).kind).toBe("access_pending"); bridge.dispose();
  }
});
it("late profile responses after logout cannot restore a previous protected session", async () => {
  const f = fixture(); let release: (() => void) | undefined, started: (() => void) | undefined;
  const waitStarted = new Promise<void>(resolve => { started = resolve; });
  f.source.profile = async staffId => { started?.(); await new Promise<void>(resolve => { release = resolve; }); return { staffId, fullName: "สาธิต", position: "ครู", updatedAt: "2026-10-16" }; };
  const bridge = new SchoolAuthBridge(f.auth, f.source, { projectId: "demo-fixture", schoolId: "fictional-school" });
  const pending = bridge.resolveSession(); await waitStarted; await bridge.signOut(); release?.(); expect((await pending).kind).toBe("signed_out"); bridge.dispose();
});
