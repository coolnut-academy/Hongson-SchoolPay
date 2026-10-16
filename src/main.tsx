import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/noto-sans-thai";
import "./styles/global.css";
import { AppProvider } from "./app/AppProvider";
import { AppRouter } from "./app/router";
const root = createRoot(document.getElementById("root")!);
if (import.meta.env.VITE_DATA_MODE && import.meta.env.VITE_DATA_MODE !== "mock")
  root.render(
    <main className="p-8">
      <h1>ยังไม่เปิดการเชื่อมต่อระบบจริง</h1>
      <p>
        Stage B รองรับข้อมูลสาธิตเท่านั้น ไม่มีการใช้ mock
        แทนระบบจริงโดยอัตโนมัติ
      </p>
    </main>,
  );
else
  root.render(
    <StrictMode>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </StrictMode>,
  );
