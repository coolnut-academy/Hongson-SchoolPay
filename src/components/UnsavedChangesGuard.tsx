import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { Button, Overlay } from "./ui";

/** Only protects local drafts. It is not a payment queue or persistence layer. */
export function UnsavedChangesGuard({
  dirty,
  locked = false,
  protectSearch = false,
  lockedDescription,
}: {
  dirty: boolean;
  locked?: boolean;
  protectSearch?: boolean;
  lockedDescription?: string;
}) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      (dirty || locked) && (currentLocation.pathname !== nextLocation.pathname ||
        (protectSearch && currentLocation.search !== nextLocation.search)),
  );
  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (dirty || locked) event.preventDefault();
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty, locked]);
  return (
    <Overlay
      open={blocker.state === "blocked"}
      onClose={() => blocker.reset?.()}
      title={locked ? "ตรวจสอบผลการบันทึกก่อนออก" : "มีการแก้ไขที่ยังไม่บันทึก"}
      footer={
        <>
          <Button variant="secondary" onClick={() => blocker.reset?.()}>
            อยู่หน้านี้
          </Button>
          {!locked && (
            <Button variant="danger" onClick={() => blocker.proceed?.()}>
              ออกโดยไม่บันทึก
            </Button>
          )}
        </>
      }
    >
      <p className="text-sm text-secondary">
        {locked
          ? lockedDescription ?? "กรุณาตรวจสอบสถานะรายการด้วยรหัสคำสั่งเดิมก่อนเปลี่ยนหน้า เพื่อป้องกันการรับเงินซ้ำ"
          : "แบบร่างนี้เก็บเฉพาะในหน้านี้ การออกจากหน้าจะยกเลิกการแก้ไขที่ยังไม่บันทึก"}
      </p>
    </Overlay>
  );
}
