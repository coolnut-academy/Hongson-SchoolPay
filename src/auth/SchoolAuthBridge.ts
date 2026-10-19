import { isStaffRole } from "../domain/permissions";
import type { AuthBridgeAdapter, BridgeSession, FirebaseAuthDriver, SchoolIdentitySource, SignInOptions } from "../ports/AuthBridgeAdapter";

/** Integration orchestration, not a configured school Firebase connection.
 * The host must supply an approved SDK driver and authorized source transport.
 * The SPA composition root deliberately keeps live mode unavailable meanwhile.
 */
export class SchoolAuthBridge implements AuthBridgeAdapter {
  private state: BridgeSession = { kind: "signed_out" };
  private listeners = new Set<(session: BridgeSession) => void>();
  private epoch = 0;
  private controller?: AbortController;
  private readonly stop: () => void;
  private disposed = false;
  constructor(private readonly auth: FirebaseAuthDriver, private readonly source: SchoolIdentitySource, private readonly contract: { projectId: string; schoolId: string }) {
    if (!contract.projectId.trim() || !contract.schoolId.trim()) throw new Error("Approved project and school identity contracts are required");
    this.stop = auth.onIdentityChanged(() => { void this.resolveSession(); });
  }
  private publish(session: BridgeSession) { this.state = session; for (const listener of this.listeners) listener(session); }
  async resolveSession(): Promise<BridgeSession> {
    if (this.disposed) return { kind: "unavailable", reason: "bridge_disposed" };
    const epoch = ++this.epoch;
    this.controller?.abort();
    const controller = new AbortController(); this.controller = controller;
    // Clear previous protected identity before an asynchronous revalidation.
    this.publish({ kind: "access_pending", reason: "revalidating_identity" });
    let session: BridgeSession;
    try {
      await this.auth.useMemoryPersistence();
      const identity = await this.auth.currentIdentity();
      if (!identity) session = { kind: "signed_out" };
      else if (identity.projectId !== this.contract.projectId || !identity.uid) session = { kind: "access_pending", reason: "unapproved_identity_project" };
      else {
        const mapping = await this.source.resolveMapping(identity, controller.signal);
        if (!mapping || mapping.authUid !== identity.uid || mapping.projectId !== identity.projectId || mapping.schoolId !== this.contract.schoolId || !mapping.staffId) session = { kind: "access_pending", reason: "authoritative_mapping_missing" };
        else {
          const [profile, access] = await Promise.all([this.source.profile(mapping.staffId, controller.signal), this.source.access(mapping.staffId, controller.signal)]);
          if (!profile || profile.staffId !== mapping.staffId || !access || access.staffId !== mapping.staffId || access.schoolId !== this.contract.schoolId || !access.active || !isStaffRole(access.role) || !access.scopeVersion || access.assignedRoomIds.some(room => typeof room !== "string" || !room.trim())) session = { kind: "access_pending", reason: "active_role_or_source_profile_missing" };
          else session = { kind: "ready", profile: structuredClone(profile), principal: { kind: "staff", uid: identity.uid, role: access.role, active: true, assignedRoomIds: [...access.assignedRoomIds], capabilities: [...access.capabilities], scopeVersion: access.scopeVersion } };
        }
      }
    } catch { session = { kind: "unavailable", reason: "identity_source_unavailable" }; }
    if (epoch === this.epoch && !controller.signal.aborted && !this.disposed) this.publish(session);
    return this.state;
  }
  async signIn(options?: SignInOptions) { await this.auth.useMemoryPersistence(); await this.auth.signIn(options); return this.resolveSession(); }
  async signOut() { ++this.epoch; this.controller?.abort(); this.publish({ kind: "signed_out" }); await this.auth.signOut(); }
  subscribe(listener: (session: BridgeSession) => void) { this.listeners.add(listener); listener(this.state); return () => { this.listeners.delete(listener); }; }
  dispose() { this.disposed = true; ++this.epoch; this.controller?.abort(); this.stop(); this.publish({ kind: "signed_out" }); this.listeners.clear(); }
}
