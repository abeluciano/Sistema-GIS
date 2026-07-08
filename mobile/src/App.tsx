import { IonApp, IonSpinner } from "@ionic/react";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="screen-center"><IonSpinner name="crescent" /></div>;
  }

  return (
    <BrowserRouter>
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
