import { useState, useEffect, useRef, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, GraduationCap, Lock, ShieldCheck, User } from "lucide-react";
import { useApp } from "../app/AppProvider";
import { ConnectionBanner } from "../components/Shell";
import { Alert, Button, Field } from "../components/ui";

export function SchoolEmblem({ className = "" }: { className?: string }) {
  return (
    <div className={`school-emblem ${className}`} aria-hidden>
      <svg viewBox="0 0 72 72" fill="none" className="emblem-svg">
        <circle cx="36" cy="36" r="34" fill="#ffffff" stroke="var(--brand)" strokeWidth="2.5" />
        <circle cx="36" cy="36" r="30" fill="var(--brand-subtle)" stroke="var(--brand-bright)" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="36" cy="36" r="23" fill="var(--brand)" />
        <path d="M36 17 L38.5 23 L43 25.5 L38.5 28 L36 34 L33.5 28 L29 25.5 L33.5 23 Z" fill="var(--brand-bright)" />
        <path d="M26 36.5 Q36 32 46 36.5 L46 45 Q36 40.5 26 45 Z" fill="#ffffff" />
        <path d="M36 34.5 V43" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M28 47.5 Q36 45 44 47.5" stroke="var(--brand-bright)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function EntryPage() {
  const { adapter, setVisitor, signInStaff, reviewMode, connected, staffAuthenticated } = useApp();
  const navigate = useNavigate();
  const [activeCard, setActiveCard] = useState<0 | 1>(0);
  const [code, setCode] = useState("");
  const [testId, setTestId] = useState("");
  const [busy, setBusy] = useState(false);
  const [staffBusy, setStaffBusy] = useState(false);
  const [error, setError] = useState("");
  const [staffError, setStaffError] = useState("");
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (staffAuthenticated) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [staffAuthenticated, navigate]);

  function scrollToCard(index: 0 | 1) {
    setActiveCard(index);
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll<HTMLElement>(".login-card");
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }

  function handleTrackScroll() {
    if (!trackRef.current) return;
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

  async function staffLogin(id = testId) {
    setStaffBusy(true);
    setStaffError("");
    try {
      await signInStaff(id);
      navigate("/app/dashboard");
    } catch (e) {
      setStaffError(e instanceof Error ? e.message : "เข้าสู่ระบบไม่สำเร็จ");
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
          <h1 className="login-title">Hongson SchoolPay</h1>
          <p className="login-subtitle">ระบบติดตามการชำระและค้างชำระเงินบำรุงการศึกษา</p>
        </header>

        {/* Game-style Character / Role Selector Bar */}
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
          {/* Floating Navigation Controls */}
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
              onFocusCapture={() => activeCard !== 0 && scrollToCard(0)}
            >
              <div className="login-card-accent" aria-hidden="true" />
              <div className="card-badge student-badge">
                <GraduationCap size={13} aria-hidden />
                <span>STUDENT & PARENT</span>
              </div>
              <div className="card-identity">
                <h2 className="card-title">นักเรียน / ผู้ปกครอง</h2>
                <p className="card-desc">เริ่มต้นตรวจสอบข้อมูลการชำระเงินของคุณ</p>
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
                        : "ใช้รหัสที่โรงเรียนกำหนด"
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
                    <ShieldCheck size={14} aria-hidden /> SCHOOLPAY SYSTEM
                  </span>
                  <span className="system-info-dev">Hongson Dev</span>
                </div>
                <div className="system-info-body">
                  <div className="system-info-row">
                    <span className="info-label">กลุ่มงาน:</span>
                    <span className="info-value">งานการเงินและบัญชี โรงเรียนห้องสอนศึกษา</span>
                  </div>
                  <div className="system-info-row">
                    <span className="info-label">ระบบตรวจสอบ:</span>
                    <span className="info-value">ความถูกต้อง โปร่งใส ตรวจสอบได้ 100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Staff Workspace Card */}
            <div
              className={`login-card card-staff ${activeCard === 1 ? "is-active" : "is-inactive"}`}
              onClick={() => activeCard !== 1 && scrollToCard(1)}
              onFocusCapture={() => activeCard !== 1 && scrollToCard(1)}
            >
              <div className="login-card-accent staff-accent" aria-hidden="true" />
              <div className="card-badge staff-badge">
                <ShieldCheck size={13} aria-hidden />
                <span>OFFICIAL STAFF</span>
              </div>
              <div className="card-identity">
                <h2 className="card-title">บุคลากรทางการศึกษา</h2>
                <p className="card-desc">เข้าถึงข้อมูลและเครื่องมือตามสิทธิ์ที่โรงเรียนมอบหมาย</p>
              </div>

              <section className="login-staff-section" aria-label="เข้าสู่ระบบบุคลากร">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    void staffLogin();
                  }}
                  className="space-y-4"
                >
                  {import.meta.env.DEV && reviewMode && (
                    <Field
                      id="staff-test-id"
                      label="Test ID บุคลากร"
                      hint="เลือกปุ่มด้านล่าง หรือกรอก Test ID"
                    >
                      <div className="input-with-icon">
                        <span className="input-icon-left" aria-hidden>
                          <User size={18} />
                        </span>
                        <input
                          id="staff-test-id"
                          data-testid="staff-id-input"
                          value={testId}
                          onChange={e => setTestId(e.target.value)}
                          autoComplete="off"
                          placeholder="กรอก Test ID บุคลากร"
                          className="login-input"
                        />
                      </div>
                    </Field>
                  )}

                  {staffError && <Alert tone="danger">{staffError}</Alert>}

                  <Button
                    type="submit"
                    busy={staffBusy}
                    disabled={!reviewMode && !connected}
                    className="w-full btn-staff-login"
                    data-testid="staff-login"
                  >
                    <Lock size={16} aria-hidden /> เข้าสู่ระบบบุคลากร (Staff SSO){" "}
                    <ArrowRight size={17} aria-hidden />
                  </Button>
                </form>

                {import.meta.env.DEV && reviewMode && (
                  <div className="review-accounts-box" data-testid="review-accounts">
                    <p className="review-accounts-caption">เลือกตัวละคร / บัญชีตรวจหน้าจอ (Quick Role)</p>
                    <div className="entry-options">
                      {[
                        ["TEST-TEACHER", "ครูที่ปรึกษา"],
                        ["TEST-FINANCE", "เจ้าหน้าที่การเงิน"],
                        ["TEST-ADMIN", "ผู้ดูแลระบบ"],
                        ["TEST-FINANCE-TEACHER", "ครูการเงิน"],
                        ["TEST-EXECUTIVE", "ผู้บริหาร"],
                      ].map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          className="entry-option text-left"
                          disabled={staffBusy}
                          data-testid={id.toLowerCase()}
                          onClick={() => {
                            setTestId(id);
                            void staffLogin(id);
                          }}
                        >
                          <div>
                            <strong>{label}</strong>
                            <p>{id}</p>
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
                    <ShieldCheck size={14} aria-hidden /> SCHOOLPAY AUTH
                  </span>
                  <span className="system-info-dev">Hongson Dev</span>
                </div>
                <div className="system-info-body">
                  <div className="system-info-row">
                    <span className="info-label">ความปลอดภัย:</span>
                    <span className="info-value">SSO เข้ารหัสตามสิทธิ์โรงเรียน</span>
                  </div>
                  <div className="system-info-row">
                    <span className="info-label">ระบบตรวจสอบ:</span>
                    <span className="info-value">ตรวจสอบย้อนหลังได้ตามระเบียบงานราชการ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Pagination Level Dots */}
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
        <span>Swipe หรือแตะแท็บเพื่อสลับการ์ดเข้าใช้งาน</span>
      </footer>
    </div>
  );
}
