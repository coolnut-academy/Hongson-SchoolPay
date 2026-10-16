import type {
  Assignment,
  StaffRole,
  FeeItem,
  PaymentCommand,
  ReceiptBook,
  Snapshot,
  Transaction,
  HomeroomAccess,
  MonthlyCollection,
  SaveFollowup,
  CollectionStudent,
  VisitorAccount,
} from "../domain/model";
import type { MonthlyWorkspace, MonthlyDraft, DashboardData, OtherMoneyCommand, PendingReference, LinkReferenceCommand, StaffAccess, AuditFilters, AuditProjection, ReportRequest, ReportPreview } from "../domain/workspace";
import type { StockCommand, StockView, StockCursors } from "../domain/workspace";
import type { GenerationPreview, LifecycleReview } from "../domain/workspace";
// The data service must authorize every operation and scope from the verified session.
export interface SchoolPayAdapter {
  endVisitorSession(): Promise<void>;
  visitorAccount(signal?: AbortSignal): Promise<VisitorAccount>;
  previewGeneration(id: string, role: StaffRole, signal?: AbortSignal): Promise<GenerationPreview>;
  lifecycleReviews(role: StaffRole, signal?: AbortSignal): Promise<LifecycleReview[]>;
  stock(role: StaffRole, signal?: AbortSignal, cursors?: StockCursors): Promise<StockView>;
  receiveStock(command: StockCommand, role: StaffRole): Promise<void>;
  issueBook(id: string, expectedVersion: number, holder: string, role: StaffRole): Promise<void>;
  returnBook(id: string, expectedVersion: number, physical: { used: number; void: number; available: number }, receiver: string, role: StaffRole): Promise<void>;
  currentStaff(role: StaffRole, signal?: AbortSignal): Promise<StaffAccess | null>;
  auditEvents(filters: AuditFilters, role: StaffRole, signal?: AbortSignal): Promise<{ items: AuditProjection[]; nextCursor?: string }>;
  previewReport(filters: ReportRequest, role: StaffRole, signal?: AbortSignal): Promise<ReportPreview>;
  dashboard(role: StaffRole, signal?: AbortSignal): Promise<DashboardData>;
  receiveOther(command: OtherMoneyCommand, role: StaffRole): Promise<Transaction>;
  pendingReferences(role: StaffRole, signal?: AbortSignal): Promise<PendingReference[]>;
  linkReference(command: LinkReferenceCommand, role: StaffRole): Promise<Transaction>;
  staffAccess(role: StaffRole, signal?: AbortSignal): Promise<StaffAccess[]>;
  changeAccess(value: StaffAccess, expectedVersion: number, reason: string, role: StaffRole): Promise<void>;
  monthlyWorkspace(room: string, month: string, role: StaffRole, signal?: AbortSignal): Promise<MonthlyWorkspace | null>;
  saveMonthlyNote(command: SaveFollowup & { revision: number }, role: StaffRole): Promise<CollectionStudent>;
  refreshMonthly(room: string, month: string, revision: number, version: number, liveKey: string, role: StaffRole): Promise<MonthlyDraft>;
  homeroomAccess(role: StaffRole, signal?: AbortSignal): Promise<HomeroomAccess>;
  monthlyCollections(room: string, month: string, role: StaffRole, signal?: AbortSignal): Promise<MonthlyCollection | null>;
  saveFollowup(command: SaveFollowup, role: StaffRole): Promise<CollectionStudent>;
  read(signal?: AbortSignal, studentCode?: string): Promise<Snapshot>;
  lookup(code: string, signal?: AbortSignal): Promise<boolean>;
  receive(command: PaymentCommand, role: StaffRole): Promise<Transaction>;
  outcome(commandId: string): Promise<Transaction | null>;
  voidPage(
    bookId: string,
    pageId: string,
    version: number,
    reason: string,
    role: StaffRole,
  ): Promise<void>;
  saveFee(item: FeeItem, role: StaffRole): Promise<void>;
  saveAssignment(
    assignment: Assignment,
    expectedVersion: number,
    role: StaffRole,
  ): Promise<void>;
  publishAssignment(
    id: string,
    expectedVersion: number,
    role: StaffRole,
  ): Promise<void>;
  copyAssignment(id: string, role: StaffRole): Promise<void>;
  generate(
    id: string,
    role: StaffRole,
  ): Promise<{ created: number; skipped: number }>;
  reconcile(
    book: ReceiptBook,
    physical: { used: number; void: number; available: number },
  ): Promise<string[]>;
}
