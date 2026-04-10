import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Result from "./pages/Result";
import Upload from "./pages/Upload";
import PolicyPage from "./pages/PolicyPage";
import UnderDevelopmentPage from "./pages/UnderDevelopmentPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<Upload />} />
          <Route path="/result" element={<Result />} />
          <Route path="/result-preview" element={<Result preview />} />
          <Route path="/about" element={<Navigate to="/" replace />} />
          <Route
            path="/features"
            element={<UnderDevelopmentPage badge="Features" title="Features page is under development." />}
          />
          <Route path="/services" element={<Navigate to="/" replace />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PolicyPage />} />
          <Route
            path="/sign-in"
            element={<UnderDevelopmentPage badge="Sign In" title="Sign in is under development." />}
          />
          <Route
            path="/get-a-demo"
            element={<UnderDevelopmentPage badge="Get A Demo" title="Get a demo is under development." />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
