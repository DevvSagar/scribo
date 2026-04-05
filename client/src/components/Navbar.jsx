import { motion as Motion } from "framer-motion";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/features", label: "Features" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-black/8 bg-white/90 backdrop-blur-xl">
      <div className="grid w-full grid-cols-[auto_1fr] items-center gap-6 px-5 py-4 sm:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex items-center gap-4 xl:gap-5">
          <img
            src="/scribo-logo.png"
            alt="Scribo logo"
            className="h-12 w-12 rounded-2xl object-cover object-top ring-1 ring-black/8 xl:h-14 xl:w-14"
          />
          <div>
            <p className="text-lg font-semibold tracking-wide text-[#1f1f1f] xl:text-xl">
              Scribo
            </p>
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[#7a7a7a] xl:text-[0.72rem]">
              AI meeting notes
            </p>
          </div>
        </div>

        <div className="hidden items-center justify-self-end md:flex">
          <div className="flex items-center gap-7 lg:gap-8 xl:gap-10">
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
                        isActive ? "text-[#1f1f1f]" : "text-[#666666] group-hover:text-[#1f1f1f] group-hover:-translate-y-0.5",
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

        <button
          type="button"
          aria-label="Toggle navigation"
          className="inline-flex justify-self-end rounded-xl border border-black/10 bg-[#fafafa] p-3 text-[#1f1f1f] md:hidden"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="text-lg leading-none">{isOpen ? "✕" : "☰"}</span>
        </button>
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
          </div>
        </Motion.div>
      )}
    </nav>
  );
};

export default Navbar;
