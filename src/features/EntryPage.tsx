import { useState, useEffect, useRef, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, CreditCard, Eye, EyeOff, GraduationCap, LayoutGrid, Lock, ShieldCheck, Sparkles, User, Wallet } from "lucide-react";
import { useApp } from "../app/AppProvider";
import { ConnectionBanner } from "../components/Shell";
import { Alert, Button, Field } from "../components/ui";

export function SchoolEmblem({ className = "" }: { className?: string }) {
  return (
    <div className={`school-emblem ${className}`} aria-hidden>
      <img
        src="/logo-SchoolPay.png"
        alt="Hongson SchoolPay"
        width={160}
        height={160}
        className="school-emblem-img"
      />
    </div>
  );
}

export default function EntryPage() {
  const { adapter, setVisitor, signInStaff, reviewMode, connected, staffAuthenticated } = useApp();
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<0 | 1>(0);
  const [code, setCode] = useState("");
  const [testId, setTestId] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [staffBusy, setStaffBusy] = useState(false);
  const [error, setError] = useState("");
  const [staffError, setStaffError] = useState("");
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (staffAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [staffAuthenticated, navigate]);

  function scrollToCard(index: 0 | 1) {
    setActiveCard(index);
    if (!trackRef.current) return;
    isProgrammaticScroll.current = true;
    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    const cards = trackRef.current.querySelectorAll<HTMLElement>(".login-card");
    if (cards[index]) {
      trackRef.current.scrollTo({
        left: cards[index].offsetLeft,
        behavior: "smooth",
      });
    }
    scrollTimeout.current = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 450);
  }

  function handleTrackScroll() {
    if (!trackRef.current || isProgrammaticScroll.current) return;
    const scrollLeft = trackRef.current.scrollLeft;
    const width = trackRef.current.clientWidth;
    const newIndex = scrollLeft > width * 0.45 ? 1 : 0;
    if (newIndex !== activeCard) {
      setActiveCard(newIndex);
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (diff > 40) scrollToCard(1);
    else if (diff < -40) scrollToCard(0);
    touchStartRef.current = null;
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") scrollToCard(0);
      if (e.key === "ArrowRight") scrollToCard(1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function lookup(event: FormEvent) {
    event.preventDefault();
    setError("");
    setVisitor(false);
    if (!code.trim()) {
      setError("กรุณากรอกรหัสนักเรียน");
      return;
    }
    setBusy(true);
    try {
      await adapter.endVisitorSession();
      if (await adapter.lookup(code.trim())) {
        flushSync(() => setVisitor(true));
        navigate("/student");
      } else {
        setError("ไม่พบข้อมูลที่แสดงได้ กรุณาตรวจสอบรหัสหรือติดต่อโรงเรียน");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ไม่สามารถตรวจสอบข้อมูลได้ กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  }

  async function staffLogin(e?: FormEvent) {
    if (e) e.preventDefault();
    if (reviewMode && testId.trim() && !staffEmail.trim()) {
      return staffReviewLogin(testId.trim());
    }
    if (!staffEmail.trim() || !staffPassword) {
      setStaffError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setStaffBusy(true);
    setStaffError("");
    try {
      await signInStaff({ method: "password", email: staffEmail.trim(), password: staffPassword });
      navigate("/app/dashboard");
    } catch (err) {
      setStaffError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setStaffBusy(false);
    }
  }

  async function staffReviewLogin(id: string) {
    setStaffBusy(true);
    setStaffError("");
    try {
      await signInStaff(id);
      navigate("/app/dashboard");
    } catch (err) {
      setStaffError(err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setStaffBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-mesh" aria-hidden="true" />
      <ConnectionBanner />

      <main className="login-main" data-testid="entry-page">
        {/* Portal Header */}
        <header className="login-header">
          <SchoolEmblem />
          <h1 className="sr-only">Hongson SchoolPay</h1>
        </header>

        {/* Tactile Role Selector Bar */}
        <div className="role-selector-bar" role="tablist" aria-label="เลือกบทบาทเข้าใช้งาน">
          <button
            type="button"
            role="tab"
            aria-selected={activeCard === 0}
            className={`role-tab ${activeCard === 0 ? "active" : ""}`}
            onClick={() => scrollToCard(0)}
          >
            <GraduationCap size={17} aria-hidden />
            <span>นักเรียน</span>
            <span className="role-tag">STUDENT</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCard === 1}
            className={`role-tab ${activeCard === 1 ? "active" : ""}`}
            onClick={() => scrollToCard(1)}
          >
            <ShieldCheck size={17} aria-hidden />
            <span>บุคลากร</span>
            <span className="role-tag">STAFF</span>
          </button>
        </div>

        {/* Carousel Deck Viewport */}
        <div className="deck-viewport">
          <button
            type="button"
            className="deck-nav-btn prev"
            disabled={activeCard === 0}
            onClick={() => scrollToCard(0)}
            aria-label="เปลี่ยนเป็นการ์ดนักเรียน"
          >
            <ChevronLeft size={22} aria-hidden />
          </button>
          <button
            type="button"
            className="deck-nav-btn next"
            disabled={activeCard === 1}
            onClick={() => scrollToCard(1)}
            aria-label="เปลี่ยนเป็นการ์ดบุคลากร"
          >
            <ChevronRight size={22} aria-hidden />
          </button>

          {/* Swipeable Track */}
          <div
            ref={trackRef}
            className="deck-track"
            onScroll={handleTrackScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* CARD 1: Student & Parent Card */}
            <div
              className={`login-card card-student ${activeCard === 0 ? "is-active" : "is-inactive"}`}
              onClick={() => activeCard !== 0 && scrollToCard(0)}
            >
              <div className="login-card-accent" aria-hidden="true" />
              <div className="card-badge student-badge">
                <GraduationCap size={13} aria-hidden />
                <span>STUDENT & PARENT PORTAL</span>
              </div>
              <div className="card-identity">
                <h2 className="card-title">นักเรียน / ผู้ปกครอง</h2>
                <p className="card-desc">ตรวจสอบภาระชำระ ประวัติย้อนหลัง และข้อมูลอ้างอิงใบเสร็จจริง</p>
              </div>

              <section className="login-section" aria-label="เข้าสู่ระบบนักเรียนและผู้ปกครอง">
                <form onSubmit={lookup} className="space-y-4">
                  <Field
                    id="student-code"
                    label="รหัสนักเรียน"
                    required
                    hint={
                      import.meta.env.DEV && reviewMode
                        ? "Test ID: TEST-STUDENT · สำหรับตรวจหน้าจอว่าง"
                        : "ใช้รหัสประจำตัวนักเรียนที่โรงเรียนกำหนด"
                    }
                    error={error}
                  >
                    <div className="input-with-icon">
                      <span className="input-icon-left" aria-hidden>
                        <GraduationCap size={18} />
                      </span>
                      <input
                        id="student-code"
                        data-testid="student-id-input"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        maxLength={64}
                        placeholder="กรอกรหัสนักเรียน"
                        autoComplete="off"
                        aria-invalid={!!error}
                        aria-describedby={error ? "student-code-error" : "student-code-hint"}
                        className="login-input"
                      />
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    busy={busy}
                    disabled={!reviewMode && !connected}
                    className="w-full btn-login-primary"
                    data-testid="student-login"
                  >
                    ตรวจสอบข้อมูลการชำระเงิน <ArrowRight size={17} aria-hidden />
                  </Button>
                </form>
              </section>

              <div className="system-info-card mt-5">
                <div className="system-info-header">
                  <span className="system-info-team">
                    <ShieldCheck size={14} aria-hidden /> VERIFIED LEDGER
                  </span>
                  <span className="system-info-dev">Read-Only Access</span>
                </div>
                <div className="system-info-body">
                  <div className="system-info-row">
                    <span className="info-label">กลุ่มงาน:</span>
                    <span className="info-value">งานการเงินและบัญชี โรงเรียนห้องสอนศึกษา</span>
                  </div>
                  <div className="system-info-row">
                    <span className="info-label">ใบเสร็จจริง:</span>
                    <span className="info-value">อ้างอิงเล่มและหน้าเขียนมือ ไม่มีการพิมพ์ซ้ำ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Staff Workspace Card */}
            <div
              className={`login-card card-staff ${activeCard === 1 ? "is-active" : "is-inactive"}`}
              onClick={() => activeCard !== 1 && scrollToCard(1)}
            >
              <div className="login-card-accent staff-accent" aria-hidden="true" />
              <div className="card-badge staff-badge">
                <ShieldCheck size={13} aria-hidden />
                <span>OFFICIAL STAFF WORKSPACE</span>
              </div>
              <div className="card-identity">
                <h2 className="card-title">บุคลากรทางการศึกษา</h2>
                <p className="card-desc">เข้าถึงแดชบอร์ด ทะเบียนคุมใบเสร็จ และระบบติดตามรายห้องตามสิทธิ์</p>
              </div>

              <section className="login-staff-section" aria-label="เข้าสู่ระบบบุคลากร">
                {staffError && (
                  <div className="mb-4">
                    <Alert tone="danger">{staffError}</Alert>
                  </div>
                )}

                <form onSubmit={staffLogin} className="space-y-4">
                  <Field
                    id="staff-email"
                    label="อีเมลบุคลากร"
                    required
                    hint={
                      import.meta.env.DEV && reviewMode
                        ? "Superadmin: superadmin@hongsonschoolpay.com หรือเลือกบทบาทตรวจหน้าจอด้านล่าง"
                        : "ใช้อีเมลบุคลากรที่ลงทะเบียนไว้กับโรงเรียน"
                    }
                  >
                    <div className="input-with-icon">
                      <span className="input-icon-left" aria-hidden>
                        <User size={18} />
                      </span>
                      <input
                        id="staff-email"
                        type="email"
                        value={staffEmail}
                        onChange={e => setStaffEmail(e.target.value)}
                        placeholder="superadmin@hongsonschoolpay.com"
                        className="login-input"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </Field>

                  <Field id="staff-password" label="รหัสผ่าน" required>
                    <div className="input-with-icon">
                      <span className="input-icon-left" aria-hidden>
                        <Lock size={18} />
                      </span>
                      <input
                        id="staff-password"
                        type={showPassword ? "text" : "password"}
                        value={staffPassword}
                        onChange={e => setStaffPassword(e.target.value)}
                        placeholder="••••••••"
                        className="login-input"
                        style={{ paddingRight: "44px" }}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="input-icon-right"
                        aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </Field>

                  <Button
                    type="submit"
                    busy={staffBusy}
                    disabled={!reviewMode && !connected}
                    className="w-full btn-staff-login"
                    data-testid="staff-login"
                  >
                    <Lock size={16} aria-hidden /> เข้าสู่ระบบบุคลากร <ArrowRight size={17} aria-hidden />
                  </Button>
                </form>

                {import.meta.env.DEV && reviewMode && (
                  <div className="review-accounts-box" data-testid="review-accounts">
                    <p className="review-accounts-caption">
                      <Sparkles size={13} aria-hidden className="inline mr-1" />
                      เลือกบทบาทตรวจหน้าจอ (Quick Role Switcher)
                    </p>
                    <div className="entry-options">
                      {[
                        ["TEST-TEACHER", "ครูที่ปรึกษา", GraduationCap] as const,
                        ["TEST-FINANCE", "เจ้าหน้าที่การเงิน", CreditCard] as const,
                        ["TEST-ADMIN", "ผู้ดูแลระบบ", ShieldCheck] as const,
                        ["TEST-FINANCE-TEACHER", "ครูการเงิน", Wallet] as const,
                        ["TEST-EXECUTIVE", "ผู้บริหาร", LayoutGrid] as const,
                      ].map(([id, label, Icon]) => (
                        <button
                          key={id}
                          type="button"
                          className="entry-option text-left"
                          disabled={staffBusy}
                          data-testid={id.toLowerCase()}
                          onClick={() => {
                            setTestId(id);
                            void staffReviewLogin(id);
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="entry-role-icon" aria-hidden>
                              <Icon size={16} />
                            </span>
                            <div>
                              <strong>{label}</strong>
                              <p>{id}</p>
                            </div>
                          </div>
                          <ArrowRight size={14} aria-hidden />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <div className="system-info-card mt-5">
                <div className="system-info-header">
                  <span className="system-info-team">
                    <ShieldCheck size={14} aria-hidden /> SCHOOLPAY AUTH BRIDGE
                  </span>
                  <span className="system-info-dev">Zero-Trust RBAC</span>
                </div>
                <div className="system-info-body">
                  <div className="system-info-row">
                    <span className="info-label">ความปลอดภัย:</span>
                    <span className="info-value">SSO เข้ารหัสตามสิทธิ์และขอบเขตห้องเรียน</span>
                  </div>
                  <div className="system-info-row">
                    <span className="info-label">ระบบตรวจสอบ:</span>
                    <span className="info-value">Audit Trail ตรวจสอบย้อนหลังได้ตามระเบียบราชการ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="deck-pagination" role="group" aria-label="สลับการ์ด">
          <button
            type="button"
            className={`deck-dot ${activeCard === 0 ? "active" : ""}`}
            onClick={() => scrollToCard(0)}
            aria-label="การ์ด 1: นักเรียนและผู้ปกครอง"
          >
            <span />
            <em>1. นักเรียน</em>
          </button>
          <button
            type="button"
            className={`deck-dot ${activeCard === 1 ? "active" : ""}`}
            onClick={() => scrollToCard(1)}
            aria-label="การ์ด 2: บุคลากรทางการศึกษา"
          >
            <span />
            <em>2. บุคลากร</em>
          </button>
        </div>
      </main>

      <footer className="login-footer">
        <span>© Hongson SchoolPay · งานการเงิน โรงเรียนห้องสอนศึกษา</span>
        <span>กดปุ่มลูกศร ← → หรือแตะแท็บเพื่อสลับโหมดเข้าใช้งาน</span>
      </footer>
    </div>
  );
}
