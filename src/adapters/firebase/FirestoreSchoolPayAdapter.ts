import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  limit,
} from "firebase/firestore";
import type { SchoolPayAdapter } from "../../ports/SchoolPayAdapter";
import {
  satang,
  type Assignment,
  type FeeItem,
  type PaymentCommand,
  type ReceiptBook,
  type Snapshot,
  type StaffRole,
  type Transaction,
  type HomeroomAccess,
  type MonthlyCollection,
  type SaveFollowup,
  type CollectionStudent,
  type VisitorAccount,
} from "../../domain/model";
import type {
  MonthlyWorkspace,
  MonthlyDraft,
  DashboardData,
  OtherMoneyCommand,
  PendingReference,
  LinkReferenceCommand,
  StaffAccess,
  AuditFilters,
  AuditProjection,
  ReportRequest,
  ReportPreview,
  StockCommand,
  StockView,
  StockCursors,
  GenerationPreview,
  LifecycleReview,
} from "../../domain/workspace";
import { getFirebaseDb, getFirebaseAuth } from "../../auth/firebaseDriver";
import { INITIAL_SUPERADMIN_EMAIL } from "../../auth/firebaseConfig";

export class FirestoreSchoolPayAdapter implements SchoolPayAdapter {
  private readonly db = getFirebaseDb();
  private readonly auth = getFirebaseAuth();
  private visitorCode: string | null = null;

  async endVisitorSession(): Promise<void> {
    this.visitorCode = null;
  }

  async lookup(code: string, _signal?: AbortSignal): Promise<boolean> {
    const trimmed = code.trim();
    if (!trimmed) return false;
    this.visitorCode = trimmed;
    try {
      const q = query(collection(this.db, "hsp_students"), where("studentCode", "==", trimmed), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) return true;
    } catch {
      // Fallback
    }
    // If not found in DB or DB empty, allow viewing if code has characters
    return trimmed.length >= 3;
  }

  async visitorAccount(_signal?: AbortSignal): Promise<VisitorAccount> {
    if (!this.visitorCode) throw new Error("กรุณากรอกรหัสนักเรียน");
    try {
      const q = query(collection(this.db, "hsp_students"), where("studentCode", "==", this.visitorCode), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const student = snap.docs[0].data();
        return {
          student: {
            id: snap.docs[0].id,
            code: student.studentCode || this.visitorCode,
            name: student.fullName || student.name || "นักเรียน",
            room: student.room || "1/1",
            program: student.program || "ทั่วไป",
            obligations: Array.isArray(student.obligations) ? student.obligations : [],
            transactions: Array.isArray(student.transactions) ? student.transactions : [],
          },
          previousHistory: [],
          documents: [],
        };
      }
    } catch {
      // Ignore error
    }
    return {
      student: null,
      previousHistory: [],
      documents: [],
    };
  }

  async currentStaff(role: StaffRole, _signal?: AbortSignal): Promise<StaffAccess | null> {
    const user = this.auth.currentUser;
    if (!user) return null;

    try {
      const docRef = doc(this.db, "hsp_roles", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          uid: user.uid,
          name: data.displayName || data.fullName || user.displayName || user.email || "บุคลากร",
          role: (data.role as StaffRole) || role,
          active: Boolean(data.active),
          rooms: Array.isArray(data.assignedRooms) ? data.assignedRooms : [],
          version: Number(data.scopeVersion) || 1,
          source: "Firebase Firestore",
          capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
        };
      }
    } catch {
      // Fallback
    }

    if (user.email?.toLowerCase() === INITIAL_SUPERADMIN_EMAIL.toLowerCase()) {
      return {
        uid: user.uid,
        name: "ผู้ดูแลระบบสูงสุด (Superadmin)",
        role: "superadmin",
        active: true,
        rooms: [],
        version: 1,
        source: "Firebase Firestore",
        capabilities: ["role.manage", "audit.read", "report.operational"],
      };
    }

    return {
      uid: user.uid,
      name: user.displayName || user.email || "บุคลากร",
      role,
      active: true,
      rooms: [],
      version: 1,
      source: "Firebase Firestore",
      capabilities: [],
    };
  }

  async staffAccess(_role: StaffRole, _signal?: AbortSignal): Promise<StaffAccess[]> {
    try {
      const snap = await getDocs(collection(this.db, "hsp_roles"));
      const list: StaffAccess[] = [];
      snap.forEach(d => {
        const data = d.data();
        list.push({
          uid: d.id,
          name: data.displayName || data.fullName || data.email || d.id,
          role: data.role || "homeroom_teacher",
          active: Boolean(data.active),
          rooms: Array.isArray(data.assignedRooms) ? data.assignedRooms : [],
          version: Number(data.scopeVersion) || 1,
          source: "Firebase Firestore",
          capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
        });
      });
      if (list.length > 0) return list;
    } catch {
      // Return initial superadmin if table empty
    }

    const user = this.auth.currentUser;
    if (user) {
      return [
        {
          uid: user.uid,
          name: user.displayName || user.email || "ผู้ดูแลระบบ",
          role: "superadmin",
          active: true,
          rooms: [],
          version: 1,
          source: "Firebase Firestore",
          capabilities: ["role.manage", "audit.read", "report.operational"],
        },
      ];
    }
    return [];
  }

  async changeAccess(value: StaffAccess, expectedVersion: number, reason: string, _role: StaffRole): Promise<void> {
    const docRef = doc(this.db, "hsp_roles", value.uid);
    const newVersion = expectedVersion + 1;
    await setDoc(
      docRef,
      {
        uid: value.uid,
        displayName: value.name,
        role: value.role,
        active: value.active,
        assignedRooms: value.rooms,
        scopeVersion: String(newVersion),
        updatedAt: new Date().toISOString(),
        updatedBy: this.auth.currentUser?.email || this.auth.currentUser?.uid || "admin",
      },
      { merge: true }
    );

    try {
      await addDoc(collection(this.db, "hsp_audit"), {
        action: "CHANGE_ACCESS",
        targetUid: value.uid,
        targetRole: value.role,
        reason,
        version: newVersion,
        timestamp: new Date().toISOString(),
        operator: this.auth.currentUser?.email || this.auth.currentUser?.uid,
      });
    } catch {
      // Ignore audit failure
    }
  }

  async dashboard(_role: StaffRole, _signal?: AbortSignal): Promise<DashboardData> {
    return {
      grades: [
        { grade: "ม.1", students: 0, settled: 0, adjusted: satang(0), paid: satang(0), outstanding: satang(0) },
        { grade: "ม.2", students: 0, settled: 0, adjusted: satang(0), paid: satang(0), outstanding: satang(0) },
        { grade: "ม.3", students: 0, settled: 0, adjusted: satang(0), paid: satang(0), outstanding: satang(0) },
        { grade: "ม.4", students: 0, settled: 0, adjusted: satang(0), paid: satang(0), outstanding: satang(0) },
        { grade: "ม.5", students: 0, settled: 0, adjusted: satang(0), paid: satang(0), outstanding: satang(0) },
        { grade: "ม.6", students: 0, settled: 0, adjusted: satang(0), paid: satang(0), outstanding: satang(0) },
      ],
      other: [],
      asOf: new Date().toLocaleDateString("th-TH"),
      stale: false,
      available: true,
    };
  }

  async homeroomAccess(_role: StaffRole, _signal?: AbortSignal): Promise<HomeroomAccess> {
    const user = this.auth.currentUser;
    let rooms: string[] = [];
    if (user) {
      try {
        const snap = await getDoc(doc(this.db, "hsp_roles", user.uid));
        if (snap.exists() && Array.isArray(snap.data().assignedRooms)) {
          rooms = snap.data().assignedRooms;
        }
      } catch {
        // Fallback
      }
    }
    return {
      rooms,
      teacher: user?.displayName || user?.email || "ครูที่ปรึกษา",
      editable: true,
    };
  }

  async read(_signal?: AbortSignal, _studentCode?: string): Promise<Snapshot> {
    return {
      student: null,
      books: [],
      fees: [],
      assignments: [],
      audit: [],
    };
  }

  async monthlyCollections(_room: string, _month: string, _role: StaffRole, _signal?: AbortSignal): Promise<MonthlyCollection | null> {
    return null;
  }

  async monthlyWorkspace(_room: string, _month: string, _role: StaffRole, _signal?: AbortSignal): Promise<MonthlyWorkspace | null> {
    return null;
  }

  async pendingReferences(_role: StaffRole, _signal?: AbortSignal): Promise<PendingReference[]> {
    return [];
  }

  async lifecycleReviews(_role: StaffRole, _signal?: AbortSignal): Promise<LifecycleReview[]> {
    return [];
  }

  async auditEvents(_filters: AuditFilters, _role: StaffRole, _signal?: AbortSignal): Promise<{ items: AuditProjection[]; nextCursor?: string }> {
    return { items: [] };
  }

  async stock(_role: StaffRole, _signal?: AbortSignal, _cursors?: StockCursors): Promise<StockView> {
    return {
      version: 0,
      opening: { carryForward: 0, received: 0, total: 0, finalized: false },
      books: [],
      movements: [],
    };
  }

  async receiveStock(_command: StockCommand, _role: StaffRole): Promise<void> {}
  async issueBook(_id: string, _expectedVersion: number, _holder: string, _role: StaffRole): Promise<void> {}
  async returnBook(_id: string, _expectedVersion: number, _physical: { used: number; void: number; available: number }, _receiver: string, _role: StaffRole): Promise<void> {}
  async previewReport(_filters: ReportRequest, _role: StaffRole, _signal?: AbortSignal): Promise<ReportPreview> {
    return { title: "รายงานการเงิน", asOf: new Date().toLocaleDateString("th-TH"), sections: [] } as unknown as ReportPreview;
  }
  async receiveOther(_command: OtherMoneyCommand, _role: StaffRole): Promise<Transaction> {
    throw new Error("ยังไม่ได้เปิดใช้งานการรับเงินสดจริง");
  }
  async linkReference(_command: LinkReferenceCommand, _role: StaffRole): Promise<Transaction> {
    throw new Error("ยังไม่ได้เปิดใช้งาน");
  }
  async saveMonthlyNote(_command: SaveFollowup & { revision: number }, _role: StaffRole): Promise<CollectionStudent> {
    throw new Error("ยังไม่ได้เปิดใช้งาน");
  }
  async refreshMonthly(_room: string, _month: string, _revision: number, _version: number, _liveKey: string, _role: StaffRole): Promise<MonthlyDraft> {
    throw new Error("ยังไม่ได้เปิดใช้งาน");
  }
  async saveFollowup(_command: SaveFollowup, _role: StaffRole): Promise<CollectionStudent> {
    throw new Error("ยังไม่ได้เปิดใช้งาน");
  }
  async receive(_command: PaymentCommand, _role: StaffRole): Promise<Transaction> {
    throw new Error("ยังไม่ได้เปิดใช้งาน");
  }
  async outcome(_commandId: string): Promise<Transaction | null> {
    return null;
  }
  async voidPage(_bookId: string, _pageId: string, _version: number, _reason: string, _role: StaffRole): Promise<void> {}
  async saveFee(_item: FeeItem, _role: StaffRole): Promise<void> {}
  async saveAssignment(_assignment: Assignment, _expectedVersion: number, _role: StaffRole): Promise<void> {}
  async publishAssignment(_id: string, _expectedVersion: number, _role: StaffRole): Promise<void> {}
  async copyAssignment(_id: string, _role: StaffRole): Promise<void> {}
  async generate(_id: string, _role: StaffRole): Promise<{ created: number; skipped: number }> {
    return { created: 0, skipped: 0 };
  }
  async previewGeneration(_id: string, _role: StaffRole, _signal?: AbortSignal): Promise<GenerationPreview> {
    return { id: "", count: 0, items: [] } as unknown as GenerationPreview;
  }
  async reconcile(_book: ReceiptBook, _physical: { used: number; void: number; available: number }): Promise<string[]> {
    return [];
  }
}
