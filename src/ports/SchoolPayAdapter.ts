import type {
  Assignment,
  DemoRole,
  FeeItem,
  PaymentCommand,
  ReceiptBook,
  Scenario,
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
// UI simulation seam only. Future services must independently authorize every operation.
export interface SchoolPayAdapter {
  signInStaffDemo(role: DemoRole): Promise<void>;
  signOutStaffDemo(): Promise<void>;
  visitorAccount(signal?: AbortSignal): Promise<VisitorAccount>;
  previewGeneration(id: string, role: DemoRole, signal?: AbortSignal): Promise<GenerationPreview>;
  lifecycleReviews(role: DemoRole, signal?: AbortSignal): Promise<LifecycleReview[]>;
  stock(role: DemoRole, signal?: AbortSignal, cursors?: StockCursors): Promise<StockView>;
  receiveStock(command: StockCommand, role: DemoRole): Promise<void>;
  issueBook(id: string, expectedVersion: number, holder: string, role: DemoRole): Promise<void>;
  returnBook(id: string, expectedVersion: number, physical: { used: number; void: number; available: number }, receiver: string, role: DemoRole): Promise<void>;
  currentStaff(role: DemoRole, signal?: AbortSignal): Promise<StaffAccess | null>;
  auditEvents(filters: AuditFilters, role: DemoRole, signal?: AbortSignal): Promise<{ items: AuditProjection[]; nextCursor?: string }>;
  previewReport(filters: ReportRequest, role: DemoRole, signal?: AbortSignal): Promise<ReportPreview>;
  dashboard(role: DemoRole, signal?: AbortSignal): Promise<DashboardData>;
  receiveOther(command: OtherMoneyCommand, role: DemoRole): Promise<Transaction>;
  pendingReferences(role: DemoRole, signal?: AbortSignal): Promise<PendingReference[]>;
  linkReference(command: LinkReferenceCommand, role: DemoRole): Promise<Transaction>;
  staffAccess(role: DemoRole, signal?: AbortSignal): Promise<StaffAccess[]>;
  changeAccess(value: StaffAccess, expectedVersion: number, reason: string, role: DemoRole): Promise<void>;
  monthlyWorkspace(room: string, month: string, role: DemoRole, signal?: AbortSignal): Promise<MonthlyWorkspace | null>;
  saveMonthlyNote(command: SaveFollowup & { revision: number }, role: DemoRole): Promise<CollectionStudent>;
  refreshMonthly(room: string, month: string, revision: number, version: number, liveKey: string, role: DemoRole): Promise<MonthlyDraft>;
  homeroomAccess(role: DemoRole, signal?: AbortSignal): Promise<HomeroomAccess>;
  monthlyCollections(room: string, month: string, role: DemoRole, signal?: AbortSignal): Promise<MonthlyCollection | null>;
  saveFollowup(command: SaveFollowup, role: DemoRole): Promise<CollectionStudent>;
  read(signal?: AbortSignal): Promise<Snapshot>;
  lookup(code: string, signal?: AbortSignal): Promise<boolean>;
  receive(command: PaymentCommand, role: DemoRole): Promise<Transaction>;
  outcome(commandId: string): Promise<Transaction | null>;
  voidPage(
    bookId: string,
    pageId: string,
    version: number,
    reason: string,
    role: DemoRole,
  ): Promise<void>;
  saveFee(item: FeeItem, role: DemoRole): Promise<void>;
  saveAssignment(
    assignment: Assignment,
    expectedVersion: number,
    role: DemoRole,
  ): Promise<void>;
  publishAssignment(
    id: string,
    expectedVersion: number,
    role: DemoRole,
  ): Promise<void>;
  copyAssignment(id: string, role: DemoRole): Promise<void>;
  generate(
    id: string,
    role: DemoRole,
  ): Promise<{ created: number; skipped: number }>;
  reconcile(
    book: ReceiptBook,
    physical: { used: number; void: number; available: number },
  ): Promise<string[]>;
  setScenario(scenario: Scenario): void;
  reset(): void;
}
