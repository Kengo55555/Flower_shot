import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CaptureProvider } from "./hooks/useCapture";
import AuthGuard from "./components/common/AuthGuard";
import AdminGuard from "./components/common/AdminGuard";
import BottomNav from "./components/common/BottomNav";
import LoginPage from "./pages/LoginPage";
import TutorialPage from "./pages/TutorialPage";
import HomePage from "./pages/HomePage";
import CameraPage from "./pages/CameraPage";
import ResultPage from "./pages/ResultPage";
import DetailPage from "./pages/DetailPage";
import CollectionPage from "./pages/CollectionPage";
import MapPage from "./pages/MapPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRecords from "./pages/admin/AdminRecords";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CaptureProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/tutorial" element={<TutorialPage />} />

            {/* Protected */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <AppLayout>
                    <HomePage />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/camera"
              element={
                <AuthGuard>
                  <CameraPage />
                </AuthGuard>
              }
            />
            <Route
              path="/result"
              element={
                <AuthGuard>
                  <ResultPage />
                </AuthGuard>
              }
            />
            <Route
              path="/detail/:recordId"
              element={
                <AuthGuard>
                  <DetailPage />
                </AuthGuard>
              }
            />
            <Route
              path="/collection"
              element={
                <AuthGuard>
                  <AppLayout>
                    <CollectionPage />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/map"
              element={
                <AuthGuard>
                  <AppLayout>
                    <MapPage />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </AuthGuard>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AuthGuard>
                  <AdminGuard>
                    <AdminDashboard />
                  </AdminGuard>
                </AuthGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AuthGuard>
                  <AdminGuard>
                    <AdminUsers />
                  </AdminGuard>
                </AuthGuard>
              }
            />
            <Route
              path="/admin/records"
              element={
                <AuthGuard>
                  <AdminGuard>
                    <AdminRecords />
                  </AdminGuard>
                </AuthGuard>
              }
            />
          </Routes>
        </CaptureProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
