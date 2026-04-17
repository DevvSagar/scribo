import { motion as Motion } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const initialForm = {
  email: "",
  password: "",
};

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, refreshSession } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = location.state?.from || "/app";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!API_BASE_URL) {
      setErrorMessage("Missing API URL configuration.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      if (mode === "signup") {
        const signupResponse = await fetch(`${API_BASE_URL}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(form),
        });

        const signupData = await signupResponse.json();

        if (!signupResponse.ok) {
          throw new Error(signupData.error || "Signup failed.");
        }

        setStatusMessage("Account created. Logging you in...");
      }

      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error || "Login failed.");
      }

      login(loginData.user);
      await refreshSession();
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100svh-81px)] items-center justify-center overflow-hidden px-5 py-12 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_38%)]" />

      <Motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_22px_60px_rgba(0,0,0,0.08)] sm:p-7"
      >
        <div className="rounded-[1.5rem] border border-black/8 bg-[#fafafa] p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                mode === "login" ? "bg-[#1f1f1f] text-white" : "text-[#666666]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                mode === "signup" ? "bg-[#1f1f1f] text-white" : "text-[#666666]"
              }`}
            >
              Signup
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7a7a7a]">
            Account access
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#1f1f1f]">
            {mode === "login" ? "Login to continue" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#5f5f5f]">
            Use your email and password to open Scribo, save chats, and switch between upload and history.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">Email</span>
            <div className="flex items-center gap-3 rounded-[1.2rem] border border-black/10 bg-[#fafafa] px-4 py-3">
              <Mail className="h-4 w-4 text-[#666666]" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-[#1f1f1f] outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#1f1f1f]">Password</span>
            <div className="flex items-center gap-3 rounded-[1.2rem] border border-black/10 bg-[#fafafa] px-4 py-3">
              <LockKeyhole className="h-4 w-4 text-[#666666]" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full bg-transparent text-sm text-[#1f1f1f] outline-none"
              />
            </div>
          </label>

          {errorMessage && (
            <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {statusMessage && (
            <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[#1f1f1f] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Signup"}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </form>
      </Motion.div>
    </section>
  );
};

export default AuthPage;
