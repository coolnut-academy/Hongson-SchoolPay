import { DomainError, satang, type Satang } from "./model";
export type AcademicYearBE = number & { readonly __academicYear: unique symbol };
export type FiscalYearBE = number & { readonly __fiscalYear: unique symbol };
function validYear(value: number) {
  if (!Number.isSafeInteger(value) || value < 2400 || value > 3000) throw new DomainError("VALIDATION", "ปีพุทธศักราชไม่ถูกต้อง");
  return value;
}
export const academicYear = (value: number) => validYear(value) as AcademicYearBE;
export const fiscalYear = (value: number) => validYear(value) as FiscalYearBE;
export type AllocationTarget = { id: string; studentId: string; year: AcademicYearBE; term: number; outstanding: Satang };
export function validateAllocations(amount: Satang, studentId: string, year: AcademicYearBE, term: number, allocations: { obligationId: string; amount: Satang }[], targets: AllocationTarget[]) {
  satang(amount);
  if (amount <= 0 || !allocations.length || new Set(allocations.map(a => a.obligationId)).size !== allocations.length) throw new DomainError("VALIDATION", "จำนวนเงินและรายการจัดสรรไม่ถูกต้อง");
  let total = 0;
  for (const allocation of allocations) {
    satang(allocation.amount);
    const target = targets.find(t => t.id === allocation.obligationId);
    if (!target || target.studentId !== studentId || target.year !== year || target.term !== term || allocation.amount <= 0 || allocation.amount > target.outstanding) throw new DomainError("VALIDATION", "จัดสรรได้เฉพาะภาระของนักเรียนในช่วงที่เลือกและไม่เกินยอดคงค้าง");
    total = satang(total + allocation.amount);
  }
  if (total !== amount) throw new DomainError("VALIDATION", "ผลรวมจัดสรรไม่เท่ากับจำนวนเงินรับ");
}
