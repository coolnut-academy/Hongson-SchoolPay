import { createContext, useContext, useState, type ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { MockAdapter } from "../adapters/mock/MockAdapter";
import type { SchoolPayAdapter } from "../ports/SchoolPayAdapter";
import type { DemoRole, Scenario } from "../domain/model";
import { hasCapability, type Capability } from "../domain/permissions";
const adapter: SchoolPayAdapter = new MockAdapter();
const client = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});
type AppContextType = {
  adapter: SchoolPayAdapter;
  role: DemoRole;
  setRole: (r: DemoRole) => void;
  visitor: boolean;
  visitorSession: string;
  setVisitor: (v: boolean) => void;
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  reset: () => void;
  logoutStaff: () => void;
};
const AppContext = createContext<AppContextType | null>(null);
function Context({ children }: { children: ReactNode }) {
  const [role, updateRole] = useState<DemoRole>("superadmin"),
    [visitor, updateVisitor] = useState(false),
    [visitorSession, setVisitorSession] = useState(""),
    [scenario, updateScenario] = useState<Scenario>("baseline");
  const query = useQueryClient();
  const setVisitor = (value: boolean) => {
    void query.cancelQueries(); query.clear();
    setVisitorSession(value ? crypto.randomUUID() : "");
    updateVisitor(value);
  };
  const setRole = (value: DemoRole) => {
    void query.cancelQueries();
    query.clear();
    setVisitor(false);
    updateRole(value);
  };
  const setScenario = (value: Scenario) => {
    adapter.setScenario(value);
    updateScenario(value);
    if (value === "permission-revoked") { void query.cancelQueries(); query.clear(); }
    else if (value === "loading") void query.resetQueries();
    else void query.invalidateQueries();
  };
  const reset = () => {
    adapter.reset();
    updateScenario("baseline");
    void query.cancelQueries();
    query.clear();
  };
  const logoutStaff = () => {
    void adapter.signOutStaffDemo();
    void query.cancelQueries(); query.clear();
    updateVisitor(false); setVisitorSession("");
  };
  return (
    <AppContext.Provider
      value={{
        adapter,
        role,
        setRole,
        visitor,
        visitorSession,
        setVisitor,
        scenario,
        setScenario,
        reset,
        logoutStaff,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={client}>
      <Context>{children}</Context>
    </QueryClientProvider>
  );
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppProvider is required");
  return value;
}
export function useSnapshot() {
  const { adapter, role } = useApp();
  return useScopedQuery({
    queryKey: ["mock-snapshot", role],
    queryFn: ({ signal }) => adapter.read(signal),
  });
}
export function useScopedQuery<T>(options: UseQueryOptions<T, Error, T, readonly unknown[]>) {
  const { adapter, role } = useApp();
  const identity = useQuery({ queryKey: ["staff-identity", role], queryFn: ({ signal }) => adapter.currentStaff(role, signal) });
  const enabled = options.enabled === undefined ? true : options.enabled;
  return useQuery({ ...options, queryKey: [options.queryKey[0], identity.data?.uid ?? "unresolved", `${identity.data?.version ?? "unresolved"}:${identity.data?.capabilities?.join(",") ?? "default"}`, ...options.queryKey.slice(1)], enabled: !!identity.data?.active && identity.data.role === role && enabled !== false });
}
export function useCurrentStaff() {
  const { adapter, role } = useApp();
  return useQuery({ queryKey: ["staff-identity", role], queryFn: ({ signal }) => adapter.currentStaff(role, signal) });
}
export function useCapability(capability: Capability, scope?: string) {
  const { adapter, role } = useApp();
  const identity = useQuery({ queryKey: ["staff-identity", role], queryFn: ({ signal }) => adapter.currentStaff(role, signal) });
  const staff = identity.data;
  return !!staff && staff.role === role && hasCapability({ kind: "staff", uid: staff.uid, role: staff.role, active: staff.active, assignedRoomIds: staff.rooms, capabilities: staff.capabilities ?? [], scopeVersion: String(staff.version) }, capability, scope);
}
export function useVisitorAccount() {
  const { adapter, visitor, visitorSession } = useApp();
  return useQuery({ queryKey: ["visitor-account", visitorSession], queryFn: ({ signal }) => adapter.visitorAccount(signal), enabled: visitor && !!visitorSession });
}
export function useRefresh() {
  const client = useQueryClient();
  return () => Promise.all([
    client.invalidateQueries({ queryKey: ["mock-snapshot"] }),
    client.invalidateQueries({ queryKey: ["monthly-collections"] }),
    client.invalidateQueries({ queryKey: ["monthly-workspace"] }),
    client.invalidateQueries({ queryKey: ["dashboard"] }),
    client.invalidateQueries({ queryKey: ["stock"] }),
    client.invalidateQueries({ queryKey: ["audit"] }),
    client.invalidateQueries({ queryKey: ["report-preview"] }),
    client.invalidateQueries({ queryKey: ["visitor-account"] }),
  ]);
}
