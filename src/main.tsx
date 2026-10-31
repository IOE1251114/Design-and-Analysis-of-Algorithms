import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { LandingPage } from "./pages/LandingPage";
import { SignInPage } from "./pages/SignInPage";
import "./styles/index.css";

// Each lab (its visualizers and charts) is downloaded only when someone opens it,
// so the landing page stays light.
const DaaLab = lazy(() => import("./pages/DaaLab"));
const DsLab = lazy(() => import("./pages/DsLab"));
const LaLab = lazy(() => import("./pages/LaLab"));

/** Old "/lab?topic=…" links keep working. */
function LegacyLabRedirect() {
  const { search } = useLocation();
  return <Navigate to={`/algorithms${search}`} replace />;
}

const loading = <div className="page-loading">Loading lab…</div>;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route
            path="/algorithms"
            element={
              <Suspense fallback={loading}>
                <DaaLab />
              </Suspense>
            }
          />
          <Route
            path="/data-structures"
            element={
              <Suspense fallback={loading}>
                <DsLab />
              </Suspense>
            }
          />
          <Route
            path="/linear-algebra"
            element={
              <Suspense fallback={loading}>
                <LaLab />
              </Suspense>
            }
          />
          <Route path="/lab" element={<LegacyLabRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
