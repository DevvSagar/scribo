import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Result from "./pages/Result";
import PolicyPage from "./pages/PolicyPage";
import AuthPage from "./pages/AuthPage";
import Workspace from "./pages/Workspace";
import ScheduleDashboard from "./pages/ScheduleDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            }
          />
          <Route path="/result" element={<Result />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route path="/services" element={<Navigate to="/" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PolicyPage />} />
          <Route path="/sign-in" element={<AuthPage />} />
          <Route
            path="/dashboard/schedule"
            element={
              <ProtectedRoute>
                <ScheduleDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/get-a-demo" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
