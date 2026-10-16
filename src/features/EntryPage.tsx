import { useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { SchoolArtwork } from "../components/SchoolArtwork";
import { useApp } from "../app/AppProvider";
import { Brand, ConnectionBanner } from "../components/Shell";
import { Alert, Badge, Button, Field, Panel, ReceiptNotice } from "../components/ui";
export default function EntryPage() {
  const { adapter, setVisitor, signInStaff, reviewMode, connected } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState(""), [testId, setTestId] = useState("");
  const [busy, setBusy] = useState(false), [staffBusy, setStaffBusy] = useState(false);
  const [error, setError] = useState(""), [staffError, setStaffError] = useState("");
  async function lookup(event: FormEvent) {
    event.preventDefault(); setError(""); setVisitor(false);
    if (!code.trim()) { setError("กรุณากรอกรหัสนักเรียน"); return; }
    setBusy(true);
    try {
      await adapter.endVisitorSession();
      if (await adapter.lookup(code.trim())) { flushSync(() => setVisitor(true)); navigate("/student"); }
      else setError("ไม่พบข้อมูลที่แสดงได้ กรุณาตรวจสอบรหัสหรือติดต่อโรงเรียน");
    } catch (e) { setError(e instanceof Error ? e.message : "ไม่สามารถตรวจสอบข้อมูลได้ กรุณาลองใหม่"); }
    finally { setBusy(false); }
  }
  async function staffLogin(id = testId) {
    setStaffBusy(true); setStaffError("");
    try { await signInStaff(id); navigate("/app/dashboard"); }
    catch (e) { setStaffError(e instanceof Error ? e.message : "เข้าสู่ระบบไม่สำเร็จ"); }
    finally { setStaffBusy(false); }
  }
  return <div className="entry-page">
    <header className="entry-header"><Brand /><div className="entry-header-right"><a href="#staff-heading" className="text-link">สำหรับบุคลากร <ArrowRight size={15} aria-hidden /></a><Badge>ระบบการเงินโรงเรียน</Badge></div></header>
    <ConnectionBanner />
    <main className="entry-main" data-testid="entry-page">
      <div className="entry-intro"><p className="eyebrow"><span className="sidebar-dot" /> HONGSON SCHOOL · FINANCIAL SERVICES</p><h1>ทุกข้อมูลการชำระ<br /><span className="text-primary">ชัดเจนในที่เดียว</span></h1><p className="text-secondary mt-4">ตรวจสอบภาระชำระ ติดตามประวัติ และจัดการงานการเงิน<br className="hidden sm:block" />ในพื้นที่เดียวที่เรียบง่ายและตรวจสอบได้</p>
        <div className="entry-benefits"><span><Check size={15} aria-hidden />ข้อมูลเป็นระเบียบ</span><span><Check size={15} aria-hidden />เข้าถึงตามสิทธิ์</span><span><Check size={15} aria-hidden />ตรวจสอบย้อนหลัง</span></div>
        <div className="entry-service-card"><SchoolArtwork /><div><span className="eyebrow">MADE FOR YOUR SCHOOL</span><strong>เรื่องการเงินโรงเรียน<br />ให้ง่ายขึ้นทุกวัน</strong><p>เชื่อมการดูแลนักเรียน<br />และงานการเงินไว้ด้วยกัน</p></div></div>
      </div>
      <Panel className="entry-student">
        <div className="student-lookup-heading"><span className="icon-tile"><GraduationCap size={26} /></span><p className="eyebrow">STUDENT & PARENT</p><h2>นักเรียน / ผู้ปกครอง</h2><p className="text-sm text-secondary">เริ่มต้นตรวจสอบข้อมูลการชำระเงินของคุณ</p></div>
        <form onSubmit={lookup} className="space-y-5">
          <Field id="student-code" label="รหัสนักเรียน" required hint={import.meta.env.DEV && reviewMode ? "Test ID: TEST-STUDENT · สำหรับตรวจหน้าจอว่าง" : "ใช้รหัสที่โรงเรียนกำหนด"} error={error}>
            <input id="student-code" data-testid="student-id-input" value={code} onChange={e => setCode(e.target.value)} maxLength={64} placeholder="กรอกรหัสนักเรียน" autoComplete="off" aria-invalid={!!error} aria-describedby={error ? "student-code-error" : "student-code-hint"} />
          </Field>
          <Button type="submit" busy={busy} disabled={!reviewMode && !connected} className="w-full" data-testid="student-login">ตรวจสอบข้อมูลการชำระเงิน<ArrowRight size={17} /></Button>
        </form>
        <div className="mt-6"><Alert>ข้อมูลของคุณใช้เพื่อการตรวจสอบเท่านั้น ไม่มีการชำระเงินออนไลน์ในหน้านี้</Alert></div><ReceiptNotice />
      </Panel>
      <section className="entry-staff" aria-labelledby="staff-heading">
        <div className="entry-staff-header"><div><p className="eyebrow">STAFF WORKSPACE</p><h2 id="staff-heading">ครู / การเงิน / ผู้ดูแลระบบ</h2><p className="text-sm text-secondary mt-2">เข้าถึงข้อมูลและเครื่องมือตามสิทธิ์ที่โรงเรียนมอบหมาย</p></div><span className="icon-tile"><Users size={24} /></span></div>
        <form onSubmit={e => { e.preventDefault(); void staffLogin(); }} className="space-y-4">
          {import.meta.env.DEV && reviewMode && <Field id="staff-test-id" label="Test ID บุคลากร" hint="เลือกปุ่มด้านล่าง หรือกรอก Test ID"><input id="staff-test-id" data-testid="staff-id-input" value={testId} onChange={e => setTestId(e.target.value)} autoComplete="off" /></Field>}
          {staffError && <Alert tone="danger">{staffError}</Alert>}
          <Button type="submit" busy={staffBusy} disabled={!reviewMode && !connected} data-testid="staff-login">เข้าสู่ระบบบุคลากร<ArrowRight size={17} /></Button>
        </form>
        {import.meta.env.DEV && reviewMode && <div className="entry-options mt-6" data-testid="review-accounts">{[
          ["TEST-TEACHER", "ครูที่ปรึกษา"], ["TEST-FINANCE", "เจ้าหน้าที่การเงิน"], ["TEST-ADMIN", "ผู้ดูแลระบบ"], ["TEST-FINANCE-TEACHER", "ครูการเงิน"], ["TEST-EXECUTIVE", "ผู้บริหาร"],
        ].map(([id, label]) => <button key={id} className="entry-option text-left" disabled={staffBusy} data-testid={id.toLowerCase()} onClick={() => { setTestId(id); void staffLogin(id); }}><div><strong>{label}</strong><p>{id}</p></div><ArrowRight size={18} /></button>)}</div>}
        <p className="receipt-notice"><ShieldCheck size={16} />ข้อมูลแสดงตามสิทธิ์ของผู้ใช้งาน กรุณาออกจากระบบเมื่อใช้งานเสร็จ</p>
      </section>
    </main>
    <footer className="entry-footer"><span>© Hongson-SchoolPay</span><span><ShieldCheck size={14} aria-hidden />ความถูกต้อง โปร่งใส ตรวจสอบได้</span></footer>
  </div>;
}
