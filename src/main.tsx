import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/fonts.css";
import "./styles/global.css";
import "./styles/refresh.css";
import { AppProvider } from "./app/AppProvider";
import { AppRouter } from "./app/router";
import { schoolRuntime } from "./integration/runtime";
const runtime = import.meta.env.DEV && import.meta.env.VITE_REVIEW_MODE !== "false"
  ? (await import("./integration/review")).reviewRuntime()
  : schoolRuntime();
createRoot(document.getElementById("root")!).render(<StrictMode><AppProvider runtime={runtime}><AppRouter /></AppProvider></StrictMode>);
