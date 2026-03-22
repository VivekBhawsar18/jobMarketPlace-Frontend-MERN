import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import OauthGoogleRolePage from "./pages/public/OauthGoogleRolePage";
import OauthSuccessPage from "./pages/public/OauthSuccessPage";
import RegisterPage from "./pages/public/RegisterPage";
import JobSeekerDashboard from "./pages/jobseeker/JobSeekerDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth/success" element={<OauthSuccessPage />} />
          <Route path="/oauth/google-role" element={<OauthGoogleRolePage />} />

          <Route
            path="/jobseeker"
            element={
              <ProtectedRoute roles={["jobseeker"]}>
                <JobSeekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer"
            element={
              <ProtectedRoute roles={["employer"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
