import { lazy, Suspense, Component, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  Link,
  useLocation,
} from "react-router-dom";
import { StaffShell, StudentShell } from "../components/Shell";
import { EmptyState, LoadingState } from "../components/ui";
import { useApp } from "./AppProvider";
const Entry = lazy(() => import("../features/EntryPage"));
const Student = lazy(() => import("../features/StudentPage"));
const Finance = lazy(() => import("../features/FinancePage"));
const Ledger = lazy(() => import("../features/LedgerPage"));
const Fees = lazy(() => import("../features/FeesPage"));
const Homeroom = lazy(() => import("../features/HomeroomPage"));
const Monthly = lazy(() => import("../features/MonthlyPage"));
const Dashboard = lazy(() => import("../features/DashboardPage"));
const Room = lazy(() => import("../features/RoomPage"));
const OtherMoney = lazy(() => import("../features/OtherMoneyPage"));
const Admin = lazy(() => import("../features/AdminPage"));
const Audit = lazy(() => import("../features/AuditPage"));
const Reports = lazy(() => import("../features/ReportsPage"));
const Stock = lazy(() => import("../features/StockPage"));
const Development = import.meta.env.DEV
  ? lazy(() => import("../development/Tools"))
  : null;
const Gallery = import.meta.env.DEV ? lazy(() => import("../development/ComponentGallery")) : null;
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <EmptyState
        title="ไม่สามารถแสดงหน้านี้ได้"
        description="กรุณาโหลดหน้าใหม่ ข้อมูลสาธิตที่ยังไม่บันทึกจะเริ่มใหม่"
        action={
          <button
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            โหลดหน้าใหม่
          </button>
        }
      />
    ) : (
      this.props.children
    );
  }
}
function Root() {
  const { role } = useApp();
  return (
    <ErrorBoundary key={role}>
      <Suspense
        fallback={
          <div className="p-8">
            <LoadingState />
          </div>
        }
      >
        <Outlet />
      </Suspense>
      {Development && (
        <Suspense fallback={null}>
          <Development />
        </Suspense>
      )}
    </ErrorBoundary>
  );
}
function VisitorGuard() {
  const { visitor } = useApp();
  const location = useLocation();
  // Back can interrupt an in-flight logout redirect. Each history entry must
  // retry the redirect even when the denied guard remains mounted.
  return visitor ? <StudentShell /> : <Navigate key={location.key} to="/" replace />;
}
function StaffGuard() {
  const { role, adapter } = useApp();
  const location = useLocation();
  const actor = useQuery({ queryKey: ["staff-identity", role], queryFn: ({ signal }) => adapter.currentStaff(role, signal) });
  if (actor.isPending) return <LoadingState />;
  if (actor.isError || !actor.data?.active || actor.data.role !== role) return <Navigate to="/access-pending" replace />;
  return role === "homeroom_teacher" && !["/app/homeroom/collections", "/app/homeroom", "/app/dashboard", "/app/monthly-followup", "/app/memos", "/app/reports", "/app/audit", "/app"].includes(location.pathname) ? (
    <EmptyState
      title="พื้นที่นี้สำหรับงานการเงิน"
      description="บทบาทครูที่ปรึกษาเข้าถึงได้เฉพาะห้องที่รับผิดชอบ"
      action={
        <Link className="btn btn-secondary" to="/app/homeroom/collections">
          ติดตามรายเดือน
        </Link>
      }
    />
  ) : (
    <StaffShell key={`${actor.data.uid}-${actor.data.version}-${actor.data.capabilities?.join(",")}`} />
  );
}
function StaffLanding() {
  return <Navigate to="dashboard" replace />;
}
const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <Entry /> },
      ...(Gallery ? [{ path: "/dev/components", element: <Gallery /> }] : []),
      { path: "/access-pending", element: <EmptyState title="รอยืนยันสิทธิ์บุคลากร" description="ยังไม่มีบทบาทที่ใช้งานได้หรือสิทธิ์เปลี่ยนแปลง กรุณาติดต่อผู้ดูแลระบบ ไม่มีการให้สิทธิ์จากอีเมลหรือสร้างผู้ดูแลระบบในเบราว์เซอร์" action={<Link className="btn btn-secondary" to="/">กลับหน้าสาธิต</Link>} /> },
      { path: "/forbidden", element: <EmptyState title="ไม่มีสิทธิ์เข้าถึง" description="เลือกพื้นที่ที่ได้รับอนุญาต" action={<Link className="btn btn-secondary" to="/app/dashboard">กลับภาพรวม</Link>} /> },
      {
        element: <VisitorGuard />,
        children: [
          { path: "/student", element: <Student /> },
          { path: "/student/history", element: <Student /> },
          { path: "/student/documents", element: <Student /> },
        ],
      },
      {
        path: "/app",
        element: <StaffGuard />,
        children: [
          { index: true, element: <StaffLanding /> },
          { path: "homeroom/collections", element: <Homeroom /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "homeroom", element: <Room /> },
          { path: "finance/other", element: <OtherMoney /> },
          { path: "finance/pending", element: <OtherMoney /> },
          { path: "admin/users", element: <Admin /> },
          { path: "audit", element: <Audit /> },
          { path: "reports", element: <Reports /> },
          { path: "receipts/movements", element: <Stock /> },
          { path: "monthly-followup", element: <Monthly /> },
          { path: "memos", element: <Monthly /> },
          { path: "finance/payments", element: <Finance /> },
          { path: "receipts/books", element: <Ledger /> },
          { path: "receipts/books/:bookId", element: <Ledger /> },
          { path: "receipts/pages", element: <Ledger /> },
          { path: "fees", element: <Fees /> },
          { path: "assignments", element: <Fees /> },
        ],
      },
      {
        path: "*",
        element: (
          <EmptyState
            title="ไม่พบหน้านี้"
            description="เลือกหนึ่งในพื้นที่ทำงานสาธิตที่พร้อมใช้งาน"
            action={
              <Link to="/" className="btn btn-primary">
                กลับหน้าแรก
              </Link>
            }
          />
        ),
      },
    ],
  },
]);
export function AppRouter() {
  return <RouterProvider router={router} />;
}
