import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { IonApp, IonSpinner } from "@ionic/react";
import { useEffect, useRef, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { DetailReportPage } from "./pages/DetailReportPage";
import { EmergencyPage } from "./pages/EmergencyPage";
import { HomePage } from "./pages/HomePage";
import { MyReportsPage } from "./pages/MyReportsPage";
import { NewReportPage } from "./pages/NewReportPage";
import { WelcomePage } from "./pages/WelcomePage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate replace to="/welcome" />;
}

function AndroidBackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);

  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;

    let disposed = false;
    let listener: { remove: () => Promise<void> } | undefined;
    void CapacitorApp.addListener("backButton", () => {
      const pathname = pathnameRef.current;
      if (pathname === "/home" || pathname === "/welcome") {
        void CapacitorApp.exitApp();
        return;
      }
      if (pathname.startsWith("/mis-reportes/")) {
        navigate("/mis-reportes", { replace: true });
        return;
      }
      navigate("/home", { replace: true });
    }).then((handle) => {
      if (disposed) {
        void handle.remove();
        return;
      }
      listener = handle;
    });

    return () => {
      disposed = true;
      void listener?.remove();
    };
  }, [navigate]);

  return null;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="screen-center"><IonSpinner name="crescent" /></div>;
  }

  return (
    <BrowserRouter>
      <AndroidBackButtonHandler />
      <Routes>
        <Route path="/welcome" element={user ? <Navigate replace to="/home" /> : <WelcomePage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/nuevo-reporte" element={<ProtectedRoute><NewReportPage /></ProtectedRoute>} />
        <Route path="/mis-reportes" element={<ProtectedRoute><MyReportsPage /></ProtectedRoute>} />
        <Route path="/mis-reportes/:id" element={<ProtectedRoute><DetailReportPage /></ProtectedRoute>} />
        <Route path="/emergencia" element={<ProtectedRoute><EmergencyPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate replace to={user ? "/home" : "/welcome"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <IonApp>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </IonApp>
  );
}
