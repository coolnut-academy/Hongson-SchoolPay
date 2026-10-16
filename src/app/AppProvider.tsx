import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import type { SchoolPayAdapter } from "../ports/SchoolPayAdapter";
import type { StaffRole } from "../domain/model";
import { hasCapability, type Capability } from "../domain/permissions";
import type { Runtime } from "../integration/runtime";
const client = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: true }, mutations: { retry: false } } });
type AppContextType = {
  adapter: SchoolPayAdapter; role: StaffRole; visitor: boolean; visitorSession: string;
  setVisitor: (value: boolean) => void; signInStaff: (id?: string) => Promise<void>;
  logoutStaff: () => Promise<void>; reviewMode: boolean; connected: boolean; staffAuthenticated: boolean;
};
const AppContext = createContext<AppContextType | null>(null);
function Context({ children, runtime }: { children: ReactNode; runtime: Runtime }) {
  const [staffAuthenticated, setStaffAuthenticated] = useState(false);
  const [role, setRole] = useState<StaffRole>("homeroom_teacher");
  const [visitor, updateVisitor] = useState(false), [visitorSession, setVisitorSession] = useState("");
  const query = useQueryClient();
  function clearScope() { setStaffAuthenticated(false); void query.cancelQueries(); query.clear(); updateVisitor(false); setVisitorSession(""); }
  useEffect(() => {
    if (!runtime.auth) return;
    const stop = runtime.auth.subscribe(session => {
      void query.cancelQueries(); query.clear(); updateVisitor(false); setVisitorSession("");
      setStaffAuthenticated(session.kind === "ready");
      if (session.kind === "ready") setRole(session.principal.role);
    });
    void runtime.auth.resolveSession();
    return stop;
  }, [runtime, query]);
  const setVisitor = (value: boolean) => {
    clearScope(); updateVisitor(value); setVisitorSession(value ? crypto.randomUUID() : "");
  };
  async function signInStaff(id = "") {
    clearScope();
    await runtime.adapter.endVisitorSession();
    if (runtime.review) {
      const staff = runtime.review.signIn(id.trim().toUpperCase());
      if (!staff) throw new Error("Test ID ไม่ถูกต้อง กรุณาเลือกบัญชีตรวจหน้าจอด้านล่าง");
      setRole(staff.role); setStaffAuthenticated(true); return;
    }
    if (!runtime.auth) throw new Error("ยังไม่ได้เชื่อมต่อระบบเข้าสู่ระบบของโรงเรียน");
    const session = await runtime.auth.signIn();
    if (session.kind !== "ready") throw new Error("ยังไม่ได้รับสิทธิ์ใช้งาน กรุณาติดต่อผู้ดูแลระบบ");
    setRole(session.principal.role);
  }
  async function logoutStaff() {
    clearScope(); runtime.review?.signOut();
    await runtime.auth?.signOut();
    await runtime.adapter.endVisitorSession();
  }
  return <AppContext.Provider value={{ adapter: runtime.adapter, role, visitor, visitorSession, setVisitor, signInStaff, logoutStaff, reviewMode: !!runtime.review, staffAuthenticated, connected: !!runtime.auth }}>{children}</AppContext.Provider>;
}
export function AppProvider({ children, runtime }: { children: ReactNode; runtime: Runtime }) { return <QueryClientProvider client={client}><Context runtime={runtime}>{children}</Context></QueryClientProvider>; }
export function useApp() { const value = useContext(AppContext); if (!value) throw new Error("AppProvider is required"); return value; }
export function useCurrentStaff() { const { adapter, role, staffAuthenticated } = useApp(); return useQuery({ enabled: staffAuthenticated, queryKey: ["staff-identity", role], queryFn: ({ signal }) => adapter.currentStaff(role, signal) }); }
export function useScopedQuery<T>(options: UseQueryOptions<T, Error, T, readonly unknown[]>) {
  const { role } = useApp(); const identity = useCurrentStaff();
  return useQuery({ ...options, queryKey: [options.queryKey[0], identity.data?.uid ?? "unresolved", String(identity.data?.version ?? "unresolved"), identity.data?.capabilities?.join(","), ...options.queryKey.slice(1)], enabled: !!identity.data?.active && identity.data.role === role && options.enabled !== false });
}
export function useSnapshot(studentCode?: string) { const { adapter, role } = useApp(); return useScopedQuery({ queryKey: ["snapshot", role, studentCode], queryFn: ({ signal }) => adapter.read(signal, studentCode) }); }
export function useCapability(capability: Capability, scope?: string) {
  const { role, reviewMode } = useApp(); const { data: staff } = useCurrentStaff();
  return !reviewMode && !!staff && staff.role === role && hasCapability({ kind: "staff", uid: staff.uid, role: staff.role, active: staff.active, assignedRoomIds: staff.rooms, capabilities: staff.capabilities ?? [], scopeVersion: String(staff.version) }, capability, scope);
}
export function useVisitorAccount() { const { adapter, visitor, visitorSession } = useApp(); return useQuery({ queryKey: ["visitor-account", visitorSession], queryFn: ({ signal }) => adapter.visitorAccount(signal), enabled: visitor && !!visitorSession }); }
export function useRefresh() { const query = useQueryClient(); return () => query.invalidateQueries(); }
