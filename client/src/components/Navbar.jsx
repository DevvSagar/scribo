import { motion as Motion } from "framer-motion";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy-policy", label: "Privacy" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-black/8 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="relative flex items-center justify-between gap-6 py-4">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img
              src="/scribo-logo.png"
              alt="Scribo logo"
              className="h-11 w-11 rounded-2xl object-cover object-top ring-1 ring-black/8 xl:h-12 xl:w-12"
            />
            <p className="text-lg font-semibold tracking-wide text-[#1f1f1f] xl:text-[1.1rem]">
              Scribo
            </p>
          </Link>

          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex">
            <div className="flex items-center gap-7 xl:gap-9">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="group relative text-sm font-medium tracking-wide xl:text-[0.95rem]"
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
                          "absolute -bottom-2 left-0 h-0.5 rounded-full bg-[#1f1f1f] transition-all duration-300",
                          isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100",
                        ].join(" ")}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2.5 md:flex">
            <NavLink
              to="/sign-in"
              className="inline-flex items-center rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#1f1f1f] transition duration-300 hover:border-black/18 hover:bg-[#fafafa]"
            >
              Sign in
            </NavLink>
            <NavLink
              to="/get-a-demo"
              className="inline-flex items-center rounded-xl bg-[#1f1f1f] px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black"
            >
              Get a demo
            </NavLink>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            className="inline-flex rounded-xl border border-black/10 bg-[#fafafa] p-3 text-[#1f1f1f] md:hidden"
            onClick={() => setIsOpen((open) => !open)}
          >
            <span className="text-lg leading-none">{isOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <Motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="border-t border-black/8 px-5 py-4 md:hidden"
        >
          <div className="flex w-full flex-col gap-4 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    "text-sm font-medium tracking-wide transition-colors duration-300",
                    isActive ? "text-[#1f1f1f]" : "text-[#666666] hover:text-[#1f1f1f]",
                  ].join(" ")
                }
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            <NavLink
              to="/sign-in"
              className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-medium text-[#1f1f1f] transition duration-300 hover:bg-[#fafafa]"
              onClick={() => setIsOpen(false)}
            >
              Sign in
            </NavLink>
            <NavLink
              to="/get-a-demo"
              className="inline-flex items-center justify-center rounded-xl bg-[#1f1f1f] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-black"
              onClick={() => setIsOpen(false)}
            >
              Get a demo
            </NavLink>
          </div>
        </Motion.div>
      )}
    </nav>
  );
};

export default Navbar;
