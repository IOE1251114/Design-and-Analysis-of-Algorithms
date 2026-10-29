import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import "./styles/index.css";

// The lab (all visualizers and charts) is loaded only when someone opens it,
// so the landing page stays light.
const LabPage = lazy(() =>
  import("./pages/LabPage").then((m) => ({ default: m.LabPage })),
);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/lab"
          element={
            <Suspense
              fallback={<div className="page-loading">Loading lab…</div>}
            >
              <LabPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
