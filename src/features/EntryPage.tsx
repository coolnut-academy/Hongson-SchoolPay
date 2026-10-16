import { useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  GraduationCap,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../app/AppProvider";
import { useQueryClient } from "@tanstack/react-query";
import { Brand, DemoBanner } from "../components/Shell";
import {
  Alert,
  Badge,
  Button,
  Field,
  Panel,
  ReceiptNotice,
} from "../components/ui";
export default function EntryPage() {
  const { adapter, setVisitor, role } = useApp(),
    navigate = useNavigate();
  const client = useQueryClient();
  const [staffBusy, setStaffBusy] = useState(false), [staffError, setStaffError] = useState("");
  async function signInStaff() {
    setStaffBusy(true); setStaffError("");
    try { await adapter.signInStaffDemo(role); await client.cancelQueries(); client.clear(); navigate("/app/dashboard"); }
    catch (e) { setStaffError(e instanceof Error ? e.message : "เข้าสู่ระบบไม่สำเร็จ"); }
    finally { setStaffBusy(false); }
  }
  const [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function lookup(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!code.trim()) {
      setError("กรุณากรอกรหัสนักเรียน");
      return;
    }
    setBusy(true);
    try {
      if (await adapter.lookup(code)) {
        // Commit the local demo lookup before the router evaluates its visitor guard.
        flushSync(() => setVisitor(true));
        navigate("/student");
      } else
        setError("ไม่พบข้อมูลที่แสดงได้ กรุณาตรวจสอบรหัสหรือติดต่อโรงเรียน");
    } catch {
      setError("ไม่สามารถตรวจสอบข้อมูลได้ กรุณาลองใหม่");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="entry-header">
        <Brand />
        <Badge>ระบบการเงินโรงเรียน · สาธิต</Badge>
      </header>
      <DemoBanner />
      <main className="entry-main">
        <div className="entry-intro">
          <p className="eyebrow">HONGSON SCHOOL · FINANCIAL SERVICES</p>
          <h1>
            ทุกข้อมูลการชำระ
            <br />
            <span className="text-primary">ชัดเจนในที่เดียว</span>
          </h1>
          <p className="text-secondary mt-4">
            ตรวจสอบภาระชำระ ติดตามประวัติ และจัดการงานการเงิน
            <br className="hidden sm:block" />
            ในพื้นที่เดียวที่เรียบง่ายและตรวจสอบได้
          </p>
        </div>
        <Panel className="entry-student">
          <div className="flex items-center gap-3 mb-6">
            <span className="icon-tile">
              <GraduationCap size={24} />
            </span>
            <div>
              <h2>นักเรียน / ผู้ปกครอง</h2>
              <p className="text-sm text-secondary">
                ตรวจสอบข้อมูลการชำระเงิน
              </p>
            </div>
          </div>
          <form onSubmit={lookup} className="space-y-5">
            <Field
              id="student-code"
              label="รหัสนักเรียน"
              required
              hint="ข้อมูลสาธิต: ใช้รหัส 69024"
              error={error}
            >
              <input
                id="student-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={32}
                placeholder="กรอกรหัสนักเรียน"
                inputMode="numeric"
                aria-invalid={!!error}
                aria-describedby={
                  error ? "student-code-error" : "student-code-hint"
                }
                autoComplete="off"
              />
            </Field>
            <Button type="submit" busy={busy} className="w-full">
              ตรวจสอบข้อมูลการชำระเงิน
              <ArrowRight size={17} />
            </Button>
          </form>
          <div className="mt-6">
            <Alert>
              ข้อมูลของคุณใช้เพื่อการตรวจสอบเท่านั้น
              ไม่มีการชำระเงินออนไลน์ในหน้านี้
            </Alert>
          </div>
          <ReceiptNotice />
        </Panel>
        <section className="entry-staff" aria-labelledby="staff-heading">
          <div className="entry-staff-header">
            <div>
              <p className="eyebrow">STAFF WORKSPACE</p>
              <h2 id="staff-heading">พื้นที่ทำงานบุคลากร</h2>
              <p className="text-sm text-secondary mt-2">
                เลือกชมหน้าสาธิต ข้อมูลและการบันทึกทั้งหมดเป็นข้อมูลจำลอง
              </p>
            </div>
            <Button variant="secondary" busy={staffBusy} onClick={() => void signInStaff()}>
              เข้าสู่ระบบบุคลากร · สาธิต<ArrowRight size={17} aria-hidden />
            </Button>
          </div>
          {staffError && <div className="mb-4"><Alert tone="danger">{staffError}</Alert></div>}
          <div className="entry-options">
          {[
            {
              to: "/app/homeroom/collections",
              icon: GraduationCap,
              title: "ติดตามการชำระรายเดือน",
              description: "ดูยอดรายห้องและบันทึกการติดตาม",
            },
            {
              to: "/app/finance/payments",
              icon: CreditCard,
              title: "รับชำระนักเรียน",
              description: "ตรวจสอบยอดและบันทึกอ้างอิงเล่ม / หน้า",
            },
            {
              to: "/app/receipts/books",
              icon: BookOpen,
              title: "ทะเบียนคุมใบเสร็จ",
              description: "ตรวจสอบสถานะทั้ง 50 หน้าในแต่ละเล่ม",
            },
            {
              to: "/app/assignments",
              icon: Layers3,
              title: "รายการเงินและภาระรายห้อง",
              description: "จัดการอัตราและตรวจสอบก่อนเผยแพร่",
            },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="entry-option">
              <span className="icon-tile">
                <item.icon size={21} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
              <ArrowRight size={18} />
            </Link>
          ))}
          </div>
          <p className="receipt-notice">
            <ShieldCheck size={16} />
            ไม่มีการเข้าสู่ระบบจริงหรือการเชื่อมต่อข้อมูลโรงเรียน
          </p>
        </section>
      </main>
    </>
  );
}
