import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  setPersistence,
  inMemoryPersistence,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import type {
  FirebaseAuthDriver,
  FirebaseIdentity,
  SchoolIdentitySource,
  SignInOptions,
  StaffSourceProfile,
} from "../ports/AuthBridgeAdapter";
import type { Capability } from "../domain/permissions";
import type { StaffRole } from "../domain/model";
import { isStaffRole } from "../domain/permissions";
import { firebaseConfig, INITIAL_SUPERADMIN_EMAIL, SCHOOL_ID } from "./firebaseConfig";
import { SchoolAuthBridge } from "./SchoolAuthBridge";

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

const SUPERADMIN_CAPABILITIES: Capability[] = [
  "student.read",
  "report.operational",
  "audit.read",
  "payment.receive",
  "receipt.link",
  "memo.generate",
  "other.receive",
  "receipt.voidAvailable",
  "book.issue",
  "book.return",
  "fee.edit",
  "fee.publish",
  "obligation.generate",
  "report.obec",
  "followup.edit",
  "role.manage",
];

export class FirebaseSchoolAuthDriver implements FirebaseAuthDriver {
  private readonly auth = getFirebaseAuth();

  async useMemoryPersistence(): Promise<void> {
    try {
      await setPersistence(this.auth, inMemoryPersistence);
    } catch {
      // Ignored if unsupported
    }
  }

  async currentIdentity(): Promise<FirebaseIdentity | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return {
      uid: user.uid,
      projectId: firebaseConfig.projectId,
      email: user.email,
    };
  }

  async signIn(options?: SignInOptions): Promise<void> {
    await this.useMemoryPersistence();
    if (options?.method === "password") {
      const email = options.email?.trim() ?? "";
      const password = options.password ?? "";
      if (!email || !password) {
        throw new Error("กรุณากรอกอีเมลและรหัสผ่าน");
      }
      try {
        await signInWithEmailAndPassword(this.auth, email, password);
      } catch (err: unknown) {
        const fbErr = err as { code?: string; message?: string };
        // If initial superadmin account not yet created, register it automatically on first attempt
        if (
          (fbErr.code === "auth/user-not-found" || fbErr.code === "auth/invalid-credential") &&
          email.toLowerCase() === INITIAL_SUPERADMIN_EMAIL.toLowerCase()
        ) {
          try {
            await createUserWithEmailAndPassword(this.auth, email, password);
            return;
          } catch (createErr) {
            throw new Error(this.mapAuthError(createErr));
          }
        }
        throw new Error(this.mapAuthError(err));
      }
    } else {
      // Google Sign-In with popup
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        await signInWithPopup(this.auth, provider);
      } catch (err) {
        throw new Error(this.mapAuthError(err));
      }
    }
  }

  async signOut(): Promise<void> {
    await fbSignOut(this.auth);
  }

  onIdentityChanged(listener: () => void): () => void {
    return onAuthStateChanged(this.auth, () => {
      listener();
    });
  }

  private mapAuthError(err: unknown): string {
    const code = (err as { code?: string })?.code ?? "";
    if (code === "auth/popup-closed-by-user") return "ยกเลิกการเข้าสู่ระบบผ่าน Google";
    if (code === "auth/wrong-password" || code === "auth/invalid-credential") return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    if (code === "auth/user-not-found") return "ไม่พบบัญชีผู้ใช้นี้ในระบบ";
    if (code === "auth/invalid-email") return "รูปแบบอีเมลไม่ถูกต้อง";
    if (code === "auth/weak-password") return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    if (code === "auth/email-already-in-use") return "อีเมลนี้มีผู้ใช้งานแล้ว";
    if (code === "auth/operation-not-allowed") return "ระบบยังไม่ได้เปิด Authentication Provider ใน Firebase Console";
    return (err as Error)?.message || "เข้าสู่ระบบไม่สำเร็จ";
  }
}

export class FirestoreSchoolIdentitySource implements SchoolIdentitySource {
  private readonly db = getFirebaseDb();
  private readonly auth = getFirebaseAuth();

  async resolveMapping(identity: FirebaseIdentity, _signal: AbortSignal) {
    if (!identity.uid) return null;
    return {
      authUid: identity.uid,
      projectId: firebaseConfig.projectId,
      schoolId: SCHOOL_ID,
      staffId: identity.uid,
    };
  }

  async profile(staffId: string, _signal: AbortSignal): Promise<StaffSourceProfile | null> {
    const currentUser = this.auth.currentUser;
    const isInitialSuperadmin = currentUser?.email?.toLowerCase() === INITIAL_SUPERADMIN_EMAIL.toLowerCase();

    try {
      const docRef = doc(this.db, "hsp_roles", staffId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        return {
          staffId,
          fullName: data.displayName || data.fullName || currentUser?.displayName || currentUser?.email || "บุคลากร",
          position: data.position || "เจ้าหน้าที่",
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      }

      if (isInitialSuperadmin) {
        const bootstrapProfile: StaffSourceProfile = {
          staffId,
          fullName: "ผู้ดูแลระบบสูงสุด (Superadmin)",
          position: "ผู้ดูแลระบบ",
          updatedAt: new Date().toISOString(),
        };
        // Auto-bootstrap role document in Firestore for superadmin
        await setDoc(docRef, {
          uid: staffId,
          email: INITIAL_SUPERADMIN_EMAIL,
          displayName: bootstrapProfile.fullName,
          position: bootstrapProfile.position,
          role: "superadmin",
          assignedRooms: [],
          active: true,
          capabilities: SUPERADMIN_CAPABILITIES,
          scopeVersion: "1",
          createdAt: new Date().toISOString(),
          updatedAt: bootstrapProfile.updatedAt,
          updatedBy: "SYSTEM_BOOTSTRAP",
        });
        return bootstrapProfile;
      }

      return {
        staffId,
        fullName: currentUser?.displayName || currentUser?.email || "ผู้ใช้งานใหม่",
        position: "รออนุมัติสิทธิ์",
        updatedAt: new Date().toISOString(),
      };
    } catch {
      if (isInitialSuperadmin) {
        return {
          staffId,
          fullName: "ผู้ดูแลระบบสูงสุด (Superadmin)",
          position: "ผู้ดูแลระบบ",
          updatedAt: new Date().toISOString(),
        };
      }
      return null;
    }
  }

  async access(staffId: string, _signal: AbortSignal) {
    const currentUser = this.auth.currentUser;
    const isInitialSuperadmin = currentUser?.email?.toLowerCase() === INITIAL_SUPERADMIN_EMAIL.toLowerCase();

    try {
      const docRef = doc(this.db, "hsp_roles", staffId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        const role = data.role as StaffRole;
        if (!isStaffRole(role)) return null;

        const assignedRooms = Array.isArray(data.assignedRooms)
          ? data.assignedRooms.filter((r: unknown) => typeof r === "string" && r.trim().length > 0)
          : [];

        return {
          staffId,
          schoolId: SCHOOL_ID,
          active: Boolean(data.active),
          role,
          assignedRoomIds: assignedRooms,
          capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
          scopeVersion: String(data.scopeVersion || "1"),
        };
      }

      if (isInitialSuperadmin) {
        return {
          staffId,
          schoolId: SCHOOL_ID,
          active: true,
          role: "superadmin" as const,
          assignedRoomIds: [],
          capabilities: SUPERADMIN_CAPABILITIES,
          scopeVersion: "1",
        };
      }

      // Not recognized yet -> access pending
      return null;
    } catch {
      if (isInitialSuperadmin) {
        return {
          staffId,
          schoolId: SCHOOL_ID,
          active: true,
          role: "superadmin" as const,
          assignedRoomIds: [],
          capabilities: SUPERADMIN_CAPABILITIES,
          scopeVersion: "1",
        };
      }
      return null;
    }
  }
}

export function createFirebaseSchoolAuthBridge(): SchoolAuthBridge {
  const driver = new FirebaseSchoolAuthDriver();
  const source = new FirestoreSchoolIdentitySource();
  return new SchoolAuthBridge(driver, source, {
    projectId: firebaseConfig.projectId,
    schoolId: SCHOOL_ID,
  });
}
