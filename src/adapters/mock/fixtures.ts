import {
  satang,
  type Snapshot,
  type ReceiptBook,
  type Transaction,
  type FeeItem,
  type CollectionStudent,
} from "../../domain/model";
// Approved G3 roster. Other students have a synthetic account projection only,
// not fabricated transactions or physical receipt pages.
export function homeroomRoster(): CollectionStudent[] {
  const debtors = [
    ["พิมพ์ชนก ใจมั่น", "69024", 150000, "รอรายได้ผู้ปกครอง", "นัดชำระวันที่ 30 ต.ค. 2569", "ติดตามแล้ว 15 ต.ค."],
    ["กิตติพงษ์ วัฒนกุล", "69025", 250000, "รอรายได้ผู้ปกครอง", "ขอแบ่งชำระตามการพิจารณาของการเงิน", "ติดตามแล้ว 14 ต.ค."],
    ["ณัฐธิดา แก้วคำ", "69026", 200000, "", "", ""],
    ["ธนวัฒน์ อินทร์สุข", "69027", 100000, "รอผู้ปกครองยืนยัน", "นัดติดตาม 20 ต.ค.", "ติดตามแล้ว 15 ต.ค."],
    ["สุภาวดี แสนดี", "69028", 300000, "", "", ""],
    ["ปกรณ์ ศรีดอย", "69029", 150000, "อยู่ระหว่างประสานผู้ปกครอง", "นัดติดตาม 21 ต.ค.", "ติดตามแล้ว 15 ต.ค."],
    ["อรอุมา คำแปง", "69030", 100000, "", "", ""],
  ] as const;
  return Array.from({ length: 40 }, (_, i) => {
    const seed = debtors[i];
    const outstanding = seed?.[2] ?? 0;
    return {
      id: `student-${String(i + 1).padStart(3, "0")}`,
      code: seed?.[1] ?? String(69100 + i + 1),
      name: seed?.[0] ?? `นักเรียนสาธิต ${String(i + 1).padStart(2, "0")}`,
      adjusted: satang(450000), paid: satang(450000 - outstanding), outstanding: satang(outstanding),
      reason: seed?.[3] ?? "", solution: seed?.[4] ?? "", note: seed?.[5] ?? "", version: 1,
      savedAt: seed?.[3] ? `2026-10-${i === 1 ? "14" : "15"}T09:30:00+07:00` : undefined,
    };
  });
}
export function baseline(): Snapshot {
  const obligations = [
    {
      id: "obl-001",
      code: "SPT-111",
      label: "ค่าจ้างครู บุคลากรและครูต่างชาติ",
      group: "เงินบำรุงการศึกษา",
      adjusted: satang(350000),
      paid: satang(200000),
      version: 1,
    },
    {
      id: "obl-002",
      code: "SPT-118",
      label: "เงินประกันอุบัติเหตุ",
      group: "เงินบำรุงการศึกษา",
      adjusted: satang(30000),
      paid: satang(30000),
      version: 1,
    },
    {
      id: "obl-003",
      code: "ASC-220",
      label: "ค่าบำรุงสมาคมรายปี",
      group: "สมาคมผู้ปกครองและครู",
      adjusted: satang(70000),
      paid: satang(70000),
      version: 1,
    },
  ];
  const transactions: Transaction[] = obligations.map((o, i) => ({
    id: `pay-00${9 + i}`,
    type: "student_payment",
    amount: o.paid,
    payer: "เด็กหญิงพิมพ์ชนก ใจมั่น",
    description: o.label,
    receiver: "กมลชนก ใจดี",
    date: "2026-10-10",
    bookNo: "30ก58379",
    pageNo: 9 + i,
    obligationId: o.id,
  }));
  const books: ReceiptBook[] = [379, 380].map((number, index) => ({
    id: `book-${number}`,
    bookNo: `30ก58${number}`,
    holder: index ? "ธนกฤต รุ่งเรือง" : "กมลชนก ใจดี",
    status: "active",
    fiscalYear: 2570,
    version: 1,
    pages: Array.from({ length: 50 }, (_, i) => {
      const pageNo = i + 1,
        used = pageNo <= (index ? 4 : 11),
        isVoid = !index && pageNo === 12;
      const transaction =
        !index && pageNo >= 9 && pageNo <= 11
          ? transactions[pageNo - 9]
          : used
            ? {
                id: `other-${number}-${pageNo}`,
                type: "other_receipt" as const,
                amount: satang(index ? 200000 : 100000),
                payer: `ผู้สนับสนุนสาธิต ${String(index ? pageNo + 8 : pageNo).padStart(2, "0")}`,
                description: "เงินบริจาคเพื่อการศึกษา",
                receiver: index ? "ธนกฤต รุ่งเรือง" : "กมลชนก ใจดี",
                date: "2026-10-05",
                bookNo: `30ก58${number}`,
                pageNo,
              }
            : undefined;
      return {
        id: `page-${number}-${pageNo}`,
        pageNo,
        status: used
          ? ("used" as const)
          : isVoid
            ? ("void" as const)
            : ("available" as const),
        version: 1,
        transaction,
        voidReason: isVoid ? "เขียนข้อมูลผิดก่อนรับเงิน" : undefined,
      };
    }),
  }));
  const feeNames = [
    ["SPT-111", "ค่าจ้างครู บุคลากรและครูต่างชาติ", "term"],
    ["SPT-112", "ห้องเรียนวิทย์พิเศษ ม.ปลาย", "term"],
    ["SPT-113", "ห้องเรียนวิทย์คอม ม.ปลาย", "term"],
    ["SPT-114", "ห้องเรียนวิทย์สุขภาพ ม.ปลาย", "term"],
    ["SPT-115", "ห้องเรียนเตรียมวิทย์ ม.ต้น", "term"],
    ["SPT-116", "ห้องเรียนเตรียมวิทย์คอม ม.ต้น", "term"],
    ["SPT-117", "ห้องเรียนเตรียมวิทย์ภาษา ม.ต้น", "term"],
    ["SPT-118", "เงินประกันอุบัติเหตุ", "annual"],
    ["SPT-120", "เงินระดมทรัพยากร", "term"],
    ["ASC-210", "ค่าสมัครสมาคมผู้ปกครองและครู", "once"],
    ["ASC-220", "ค่าบำรุงสมาคมรายปี", "annual"],
  ];
  const fees: FeeItem[] = feeNames.map(([code, name, frequency]) => ({
    id: code,
    code,
    name,
    frequency: frequency as FeeItem["frequency"],
    active: true,
    category: code.startsWith("ASC") ? "สมาคมฯ" : "เงินบำรุงการศึกษา",
    group: code.startsWith("ASC") ? "association" : "obec",
    kind: "student",
  }));
  fees.push(
    ...["เงินทุนการศึกษา", "เงินบริจาค", "เงินสนับสนุนกิจกรรม"].map(
      (name, i) => ({
        id: `OTHER-0${i + 1}`,
        code: `OTHER-0${i + 1}`,
        name,
        frequency: "once" as const,
        active: true,
        category: "เงินรับประเภทอื่น",
        group: "other",
        kind: "other" as const,
      }),
    ),
  );
  return {
    student: {
      id: "student-001",
      code: "69024",
      name: "พิมพ์ชนก ใจมั่น",
      room: "ม.2/1",
      program: "แผนการเรียนทั่วไป",
      obligations,
      transactions,
    },
    books,
    fees,
    assignments: [
      {
        id: "assignment-m2-1",
        room: "ม.2/1",
        program: "แผนการเรียนทั่วไป",
        studentCount: 40,
        academicYear: 2569,
        term: 1,
        version: 1,
        status: "published",
        generated: true,
        amounts: {
          "SPT-111": satang(350000),
          "SPT-118": satang(30000),
          "ASC-220": satang(70000),
        },
      },
      {
        id: "assignment-m2-2",
        room: "ม.2/2",
        program: "แผนการเรียนทั่วไป",
        studentCount: 38,
        academicYear: 2569,
        term: 1,
        version: 1,
        status: "draft",
        generated: false,
        amounts: {
          "SPT-111": satang(350000),
          "SPT-118": satang(30000),
          "ASC-220": satang(70000),
        },
      },
    ],
    audit: [
      {
        id: "a1",
        title: "บันทึกข้อมูลใบเสร็จจริง",
        detail: "30ก58379 / หน้า 11 · กมลชนก ใจดี",
        at: "10 ต.ค. 2569 · 10:45 น.",
        timestamp: "2026-10-10T10:45:00+07:00",
      },
      {
        id: "a2",
        title: "เปิดใช้งานเล่มใบเสร็จ",
        detail: "30ก58379 และ 30ก58380 · ข้อมูลสาธิต",
        at: "1 ต.ค. 2569 · 08:30 น.",
        timestamp: "2026-10-01T08:30:00+07:00",
      },
    ],
  };
}
