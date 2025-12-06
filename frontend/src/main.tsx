import App from "./App.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./features/auth";
import { ToastProvider } from "./components";

import "./style/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <ToastProvider />
    </AuthProvider>
  </StrictMode>
);
