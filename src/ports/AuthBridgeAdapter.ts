import type { StaffPrincipal } from "../domain/permissions";
export type FirebaseIdentity = { uid: string; projectId: string };
export type StaffSourceProfile = { staffId: string; fullName: string; position: string; updatedAt: string };
export type BridgeSession =
  | { kind: "signed_out" }
  | { kind: "access_pending"; reason: string }
  | { kind: "unavailable"; reason: string }
  | { kind: "ready"; principal: StaffPrincipal; profile: StaffSourceProfile };
export interface AuthBridgeAdapter {
  resolveSession(): Promise<BridgeSession>;
  signIn(): Promise<BridgeSession>;
  signOut(): Promise<void>;
  subscribe(listener: (session: BridgeSession) => void): () => void;
  dispose(): void;
}
// Bind these to the approved Firebase JS Auth provider/project and authorized
// source transports after G07/G08. No email inference or browser provisioning.
export interface FirebaseAuthDriver {
  useMemoryPersistence(): Promise<void>;
  currentIdentity(): Promise<FirebaseIdentity | null>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  onIdentityChanged(listener: () => void): () => void;
}
export interface SchoolIdentitySource {
  resolveMapping(identity: FirebaseIdentity, signal: AbortSignal): Promise<{ authUid: string; projectId: string; schoolId: string; staffId: string } | null>;
  profile(staffId: string, signal: AbortSignal): Promise<StaffSourceProfile | null>;
  access(staffId: string, signal: AbortSignal): Promise<{ staffId: string; schoolId: string; active: boolean; role: unknown; assignedRoomIds: string[]; capabilities: StaffPrincipal["capabilities"]; scopeVersion: string } | null>;
}
