import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Info,
  LoaderCircle,
  Minus,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  dateLabel,
  money,
  RECEIPT_NOTICE,
  type Transaction,
} from "../domain/model";
// One visible modal across drawers, confirmations and navigation guards.
// Remember triggers because WebKit can focus a button's landmark ancestor.
// Click capture runs after native pointer focus but before the open handler.
const overlayRequests: string[] = [];
const overlayListeners = new Set<() => void>();
let pointerTrigger: HTMLElement | null = null;
const rememberPointer = (event: Event) => {
  pointerTrigger = event.target instanceof Element ? event.target.closest<HTMLElement>('button,a[href],input,select,textarea,[tabindex]') : null;
};
const rememberKeyboard = () => { pointerTrigger = null; };
function subscribeOverlay(listener: () => void) {
  if (!overlayListeners.size) { document.addEventListener("pointerdown", rememberPointer, true); document.addEventListener("click", rememberPointer, true); document.addEventListener("keydown", rememberKeyboard, true); document.addEventListener("focusin", rememberKeyboard, true); }
  overlayListeners.add(listener);
  return () => {
    overlayListeners.delete(listener);
    if (!overlayListeners.size) { document.removeEventListener("pointerdown", rememberPointer, true); document.removeEventListener("click", rememberPointer, true); document.removeEventListener("keydown", rememberKeyboard, true); document.removeEventListener("focusin", rememberKeyboard, true); pointerTrigger = null; }
  };
}
const activeOverlay = () => overlayRequests.at(-1) ?? null;
function requestOverlay(id: string) {
  overlayRequests.push(id); for (const listener of overlayListeners) listener();
  return () => { const index = overlayRequests.indexOf(id); if (index >= 0) overlayRequests.splice(index, 1); for (const listener of overlayListeners) listener(); };
}
export function Button({
  variant = "primary",
  busy = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  busy?: boolean;
}) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={props.disabled || busy}
      className={`btn btn-${variant} ${className}`}
      aria-busy={busy || undefined}
    >
      {busy && (
        <LoaderCircle
          size={18}
          className="motion-safe:animate-spin"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  const Icon =
    tone === "success"
      ? Check
      : tone === "warning"
        ? Clock3
        : tone === "danger"
          ? Minus
          : Circle;
  return (
    <span className={`badge badge-${tone}`}>
      <Icon size={13} aria-hidden />
      {children}
    </span>
  );
}
export function PageBadge({
  status,
}: {
  status: "available" | "used" | "void";
}) {
  return (
    <Badge
      tone={
        status === "used" ? "success" : status === "void" ? "danger" : "neutral"
      }
    >
      {
        {
          available: "ว่าง · AVAILABLE",
          used: "ใช้แล้ว · USED",
          void: "ยกเลิก · VOID",
        }[status]
      }
    </Badge>
  );
}
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`panel ${className}`}>{children}</section>;
}
export function SectionTitle({
  number,
  title,
  subtitle,
  action,
}: {
  number?: number;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div className="flex items-start gap-3">
        {number && <span className="step-number">{number}</span>}
        <div>
          <h2>{title}</h2>
          {subtitle && (
            <p className="text-sm text-secondary mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    document.title = `${title} · Hongson-SchoolPay`;
    ref.current?.focus({ preventScroll: true });
  }, [title]);
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 tabIndex={-1} ref={ref}>
          {title}
        </h1>
        <p className="text-secondary mt-2">{description}</p>
      </div>
      {action && <div className="page-header-actions">{action}</div>}
    </header>
  );
}
export function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="text-muted text-xs ml-2">จำเป็น</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
export function Alert({
  children,
  tone = "info",
  title,
}: {
  children: ReactNode;
  tone?: "info" | "warning" | "danger" | "success";
  title?: string;
}) {
  const Icon =
    tone === "success" ? CheckCircle2 : tone === "danger" ? AlertCircle : Info;
  return (
    <div
      className={`alert alert-${tone}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      <Icon size={19} aria-hidden className="shrink-0 mt-0.5" />
      <div>
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Info size={24} aria-hidden />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function LoadingState() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">กำลังโหลดข้อมูล</span>
      <div className="skeleton h-20 w-2/3" />
      <div className="grid grid-cols-2 gap-4">
        <div className="skeleton h-28" />
        <div className="skeleton h-28" />
      </div>
      <div className="skeleton h-80" />
    </div>
  );
}
export function QueryError({ onRetry }: { onRetry: () => void }) {
  return (
    <Panel>
      <EmptyState
        title="ไม่สามารถโหลดข้อมูลได้"
        description="ข้อมูลยังไม่พร้อมแสดง กรุณาลองใหม่ โดยยอดที่ไม่พร้อมจะไม่ถูกแทนด้วยศูนย์"
        action={<Button onClick={onRetry}>ลองอีกครั้ง</Button>}
      />
    </Panel>
  );
}
export function Metric({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: ReactNode;
  caption?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="metric">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-secondary">{label}</p>
        <span className="text-muted">{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      {caption && <p className="text-xs text-muted mt-1">{caption}</p>}
    </div>
  );
}
export function Overlay({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  drawer = false,
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  drawer?: boolean;
  busy?: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null),
    previousFocus = useRef<HTMLElement | null>(null);
  const id = useId();
  const active = useSyncExternalStore(subscribeOverlay, activeOverlay);
  useEffect(() => {
    if (!open) return;
    previousFocus.current = pointerTrigger?.isConnected ? pointerTrigger : document.activeElement as HTMLElement;
    return requestOverlay(id);
  }, [id, open]);
  return (
    <Dialog.Root
      open={open && active === id}
      onOpenChange={(v) => {
        if (!v && !busy) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className={drawer ? "drawer-content" : "dialog-content"}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            heading.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (previousFocus.current?.isConnected && previousFocus.current !== document.body) previousFocus.current.focus();
            else (document.querySelector("main h1") as HTMLElement | null)?.focus();
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <header className="overlay-header">
            <div>
              <Dialog.Title ref={heading} tabIndex={-1}>
                {title}
              </Dialog.Title>
              <Dialog.Description>
                {description ?? "ข้อมูลสาธิตสำหรับตรวจสอบรายการ"}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className="icon-button"
                disabled={busy}
                aria-label="ปิดหน้าต่าง"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </header>
          <div className="overlay-body">{children}</div>
          {footer && <footer className="overlay-footer">{footer}</footer>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Money({
  value,
  currency = true,
}: {
  value: number;
  currency?: boolean;
}) {
  return <span className="money">{money(value, currency)}</span>;
}
export function DetailList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="detail-list">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function ReceiptReferenceView({
  transaction,
}: {
  transaction: Transaction;
}) {
  return (
    <>
      <div className="reference-heading">
        <span className="icon-tile">
          <ShieldCheck size={24} aria-hidden />
        </span>
        <div>
          <p className="eyebrow">ข้อมูลอ้างอิงเท่านั้น</p>
          <h3>
            เล่ม {transaction.bookNo} / หน้า {transaction.pageNo}
          </h3>
        </div>
      </div>
      <div className="reference-amount">
        <p>จำนวนเงินที่บันทึก</p>
        <Money value={transaction.amount} />
        <PageBadge status="used" />
      </div>
      <DetailList
        items={[
          { label: "วันที่รับเงิน", value: dateLabel(transaction.date) },
          { label: "รายการ", value: transaction.description },
          { label: "ผู้ชำระ / แหล่งเงิน", value: transaction.payer },
          { label: "ผู้รับเงิน", value: transaction.receiver },
          { label: "เล่มใบเสร็จจริง", value: transaction.bookNo },
          { label: "หน้า", value: `${transaction.pageNo} / 50` },
          {
            label: "เลขที่พิมพ์บนใบเสร็จ",
            value: transaction.printedNo || "ไม่ได้ระบุ",
          },
        ]}
      />
      <Alert>{RECEIPT_NOTICE}</Alert>
    </>
  );
}
export function ReceiptNotice() {
  return (
    <p className="receipt-notice">
      <ShieldCheck size={16} aria-hidden />
      {RECEIPT_NOTICE}
    </p>
  );
}
export function TextLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="text-link" onClick={onClick}>
      {children}
      <ArrowRight size={15} aria-hidden />
    </button>
  );
}
export function Tabs({ id, label, tabs, value, onChange, children }: {
  id: string; label: string; tabs: { id: string; label: string; disabled?: boolean }[];
  value: string; onChange: (value: string) => void; children: ReactNode;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <><div className="tab-row" role="tablist" aria-label={label}>
    {tabs.map((tab, index) => <button key={tab.id} ref={node => { buttons.current[index] = node; }} id={`${id}-${tab.id}`} role="tab" type="button" disabled={tab.disabled} tabIndex={value === tab.id ? 0 : -1} aria-selected={value === tab.id} aria-controls={`${id}-panel`} className={value === tab.id ? "active" : ""} onClick={() => onChange(tab.id)} onKeyDown={event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const enabled = tabs.flatMap((item, i) => item.disabled ? [] : [i]);
      const at = enabled.indexOf(index), next = event.key === "Home" ? enabled[0] : event.key === "End" ? enabled.at(-1) : enabled[(at + (event.key === "ArrowRight" ? 1 : -1) + enabled.length) % enabled.length];
      if (next !== undefined) buttons.current[next]?.focus();
    }}>{tab.label}</button>)}
  </div><div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${value}`}>{children}</div></>;
}
