import { motion as Motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy-policy", label: "Privacy" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const centerLinks = isAuthenticated
    ? [{ to: "/app", label: "Workspace" }]
    : navLinks;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-black/8 bg-white/82 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="grid min-h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-3 justify-self-start">
            <img
              src="/scribo-logo.png"
              alt="Scribo logo"
              className="h-10 w-10 rounded-2xl object-cover object-top ring-1 ring-black/8"
            />
            <div className="min-w-0">
              <p className="text-base font-semibold tracking-[0.01em] text-[#1f1f1f] sm:text-[1.05rem]">Scribo</p>
              <p className="hidden text-[0.68rem] uppercase tracking-[0.22em] text-[#8a8a8a] sm:block">
                AI Meeting Workspace
              </p>
            </div>
          </Link>

          <div className="hidden items-center justify-center justify-self-center lg:flex">
            <div className="flex items-center gap-8">
              {centerLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="group relative py-2 text-sm font-medium tracking-[0.01em] xl:text-[0.95rem]"
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          "transition-all duration-300",
                          isActive ? "text-[#1f1f1f]" : "text-[#666666] group-hover:text-[#1f1f1f]",
                        ].join(" ")}
                      >
                        {link.label}
                      </span>
                      <span
                        className={[
                          "absolute -bottom-1 left-0 h-0.5 rounded-full bg-[#1f1f1f] transition-all duration-300",
                          isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
                        ].join(" ")}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2.5 justify-self-end md:flex">
            {isAuthenticated ? (
              <>
                <span className="max-w-[260px] truncate rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#1f1f1f]">
                  {user?.email || ""}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#1f1f1f] transition duration-300 hover:-translate-y-0.5 hover:border-black/16 hover:bg-[#fafafa]"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/sign-in"
                className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black"
              >
                Sign in
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </NavLink>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            className="inline-flex rounded-2xl border border-black/10 bg-white p-3 text-[#1f1f1f] md:hidden"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X className="h-5 w-5" strokeWidth={2.1} /> : <Menu className="h-5 w-5" strokeWidth={2.1} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <Motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="border-t border-black/8 bg-white/94 px-5 py-4 backdrop-blur-xl md:hidden"
        >
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 sm:px-3">
            {centerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    "rounded-2xl border px-4 py-3 text-sm font-medium tracking-wide transition-all duration-300",
                    isActive
                      ? "border-black/10 bg-[#f6f4ee] text-[#1f1f1f]"
                      : "border-transparent bg-transparent text-[#666666] hover:border-black/8 hover:bg-[#faf9f5] hover:text-[#1f1f1f]",
                  ].join(" ")
                }
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center text-sm font-medium text-[#1f1f1f]">
                  {user?.email || ""}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-[#1f1f1f] transition duration-300 hover:bg-[#fafafa]"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/sign-in"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f1f1f] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-black"
                onClick={() => setIsOpen(false)}
              >
                Sign in
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </NavLink>
            )}
          </div>
        </Motion.div>
      )}
    </nav>
  );
};

export default Navbar;
