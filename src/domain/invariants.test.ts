import { expect, it } from "vitest";
import { academicYear, fiscalYear, validateAllocations } from "./invariants";
import { satang } from "./model";
it("allocations reject duplicate, mixed-student, mixed-period, overpaid and unequal sums", () => {
  const year = academicYear(2569), targets = [{ id: "a", studentId: "student", year, term: 1, outstanding: satang(150000) }, { id: "b", studentId: "other", year, term: 1, outstanding: satang(100000) }];
  expect(() => validateAllocations(satang(150000), "student", year, 1, [{ obligationId: "a", amount: satang(150000) }], targets)).not.toThrow();
  for (const allocations of [[{ obligationId: "a", amount: satang(100000) }, { obligationId: "a", amount: satang(50000) }], [{ obligationId: "b", amount: satang(150000) }], [{ obligationId: "a", amount: satang(150001) }], [{ obligationId: "a", amount: satang(149999) }]]) expect(() => validateAllocations(satang(150000), "student", year, 1, allocations, targets)).toThrow();
  expect(() => validateAllocations(satang(150000), "student", academicYear(2568), 1, [{ obligationId: "a", amount: satang(150000) }], targets)).toThrow();
  expect(fiscalYear(2570)).toBe(2570);
  expect(() => academicYear(2026)).toThrow();
});
