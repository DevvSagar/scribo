import { motion as Motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";
import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SUBMIT_COOLDOWN_MS = 8000;

const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className ?? "h-5 w-5 fill-current"}>
    <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.3L1 2h6.3l4.3 5.8L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6Z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className ?? "h-5 w-5 fill-none stroke-current"}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
    <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className ?? "h-5 w-5 fill-current"}>
    <path d="M4.98 3.5a2.49 2.49 0 1 0 0 4.98 2.49 2.49 0 0 0 0-4.98ZM3 8.98h3.96V21H3zM10.2 8.98h3.8v1.64h.05c.53-1 1.82-2.06 3.74-2.06 4 0 4.74 2.63 4.74 6.06V21h-3.96v-5.69c0-1.36-.02-3.1-1.89-3.1-1.9 0-2.2 1.48-2.2 3V21H10.2z" />
  </svg>
);

const DiscordIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className ?? "h-5 w-5 fill-current"}>
    <path d="M20.3 4.4A16.7 16.7 0 0 0 16.2 3l-.2.4c1.7.4 2.4 1 2.4 1a10 10 0 0 0-3-.9 10.2 10.2 0 0 0-6.8 0 10 10 0 0 0-3 .9s.7-.6 2.4-1L7.8 3a16.7 16.7 0 0 0-4.1 1.4C1 8.5.3 12.5.6 16.4a16.9 16.9 0 0 0 5.1 2.6l1.1-1.7c-.6-.2-1.1-.5-1.6-.8.1.1.3.2.4.3 2.5 1.2 5.3 1.2 7.8 0 .1-.1.3-.2.4-.3-.5.3-1 .6-1.6.8l1.1 1.7a16.9 16.9 0 0 0 5.1-2.6c.4-4.5-.7-8.5-3.1-12Zm-9.7 9.6c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm5.8 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
  </svg>
);

const socialLinks = [
  {
    label: "Twitter / X",
    value: "@DevvSagar",
    href: "https://x.com/DevvSagar",
    note: "Quick product talk, updates, and direct messages.",
    icon: XIcon,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/devvsag",
    href: "https://www.linkedin.com/in/devvsag/",
    note: "Professional contact and collaboration chats.",
    icon: LinkedinIcon,
  },
  {
    label: "Instagram",
    value: "@sagarssinghh",
    href: "https://www.instagram.com/sagarssinghh?utm_source=qr",
    note: "Reach out casually and stay connected there too.",
    icon: InstagramIcon,
  },
  {
    label: "Discord",
    value: "devvx.",
    href: "https://discord.com/app",
    note: "Open Discord and message me there using this username.",
    icon: DiscordIcon,
  },
  {
    label: "Email",
    value: "Deevvxxx@gmail.com",
    href: "mailto:Deevvxxx@gmail.com",
    note: "This opens your mail app or email website directly.",
    icon: Mail,
  },
];

const Contact = () => {
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState(0);
  const [toast, setToast] = useState({ type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast({ type: "", message: "" }), 3200);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      message: "",
      company: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.company.trim()) {
      resetForm();
      showToast("success", "Thanks, your message has been received.");
      return;
    }

    if (!API_BASE_URL) {
      showToast("error", "Contact form is not configured yet.");
      return;
    }

    if (isSubmitting) return;

    const now = Date.now();
    if (now - lastSubmittedAt < SUBMIT_COOLDOWN_MS) {
      showToast("error", "Please wait a few seconds before sending another message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to send your message right now.");
      }

      setLastSubmittedAt(Date.now());
      resetForm();
      showToast("success", data.message || "Message sent successfully.");
    } catch (error) {
      showToast("error", error.message || "Unable to send your message right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-14 sm:px-8 lg:px-10 lg:pb-24 lg:pt-18 xl:px-12 2xl:px-16">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#f6f4ef_0%,#fbfbf8_34%,#ffffff_70%,#f1f3ed_100%)]" />
      <Motion.div
        aria-hidden="true"
        className="absolute left-[-8rem] top-[-4rem] -z-10 h-[24rem] w-[24rem] rounded-full bg-[#e4efe6]/75 blur-3xl"
        animate={prefersReducedMotion ? undefined : { x: [0, 20, 0], y: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <Motion.div
        aria-hidden="true"
        className="absolute right-[-7rem] top-24 -z-10 h-[24rem] w-[24rem] rounded-full bg-[#efe0c9]/70 blur-3xl"
        animate={prefersReducedMotion ? undefined : { x: [0, -24, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(24,24,24,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,24,0.03)_1px,transparent_1px)] bg-[size:74px_74px] opacity-45" />

      <div className="mx-auto max-w-[1100px]">
        <Motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#1f1f1f] sm:text-5xl lg:text-[4rem]">
            Contact our team
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#5b5b5b] sm:text-lg">
            Got any questions about the product or scaling on our platform? We&rsquo;re here to help. Chat to us on
            your preferred platform or send a message directly from the form.
          </p>
        </Motion.div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.1fr_0.72fr] lg:items-start">
          <Motion.form
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            onSubmit={handleSubmit}
            className="flex h-full flex-col"
          >
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#3f3f3f]">First name</span>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                minLength={2}
                required
                className="mt-2 w-full rounded-[0.9rem] border border-black/12 bg-white px-4 py-3 text-[#1f1f1f] outline-none transition placeholder:text-[#9d9d9d] focus:border-black/20"
                placeholder="First name"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#3f3f3f]">Last name</span>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                minLength={2}
                required
                className="mt-2 w-full rounded-[0.9rem] border border-black/12 bg-white px-4 py-3 text-[#1f1f1f] outline-none transition placeholder:text-[#9d9d9d] focus:border-black/20"
                placeholder="Last name"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#3f3f3f]">Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-2 w-full rounded-[0.9rem] border border-black/12 bg-white px-4 py-3 text-[#1f1f1f] outline-none transition placeholder:text-[#9d9d9d] focus:border-black/20"
              placeholder="you@company.com"
            />
          </label>

          <label className="mt-4 block flex-1">
            <span className="text-sm font-medium text-[#3f3f3f]">Message</span>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              minLength={10}
              required
              className="mt-2 min-h-[12rem] w-full rounded-[0.9rem] border border-black/12 bg-white px-4 py-3 text-[#1f1f1f] outline-none transition placeholder:text-[#9d9d9d] focus:border-black/20"
              placeholder="Leave us a message..."
            />
          </label>

          <Motion.button
            type="submit"
            whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.01 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
            disabled={isSubmitting}
            className="mt-6 inline-flex min-w-[220px] items-center justify-center gap-2 self-start rounded-[0.9rem] bg-[#1f1f1f] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-65"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Motion.button>
          </Motion.form>

          <Motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="pt-1"
          >
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#1f1f1f]">Chat with us</h2>
              <p className="mt-2 max-w-sm text-base leading-7 text-[#5c5c5c]">
                Speak to us on the platform you use most or open your email app directly.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {socialLinks.map((item, index) => {
                const Icon = item.icon;
                const isEmail = item.href.startsWith("mailto:");

                return (
                  <Motion.a
                    key={item.label}
                    href={item.href}
                    target={isEmail ? undefined : "_blank"}
                    rel={isEmail ? undefined : "noreferrer"}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + index * 0.04, duration: 0.3 }}
                    whileHover={prefersReducedMotion ? undefined : { x: 3 }}
                    className="block"
                  >
                    <div className="flex items-start gap-3 text-[#1f1f1f]">
                      <div className="pt-0.5 text-[#2b2b2b]">
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-base font-semibold underline decoration-black/25 underline-offset-4">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm text-[#555555]">{item.value}</p>
                      </div>
                    </div>
                  </Motion.a>
                );
              })}
            </div>
          </Motion.div>
        </div>
      </div>

      {toast.message && (
        <Motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          className={[
            "fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border px-5 py-4 text-center text-sm font-medium shadow-[0_20px_50px_rgba(0,0,0,0.16)] backdrop-blur-2xl",
            toast.type === "success"
              ? "border-black/10 bg-[#1f1f1f]/95 text-white"
              : "border-red-400/20 bg-red-50/95 text-red-700",
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </Motion.div>
      )}
    </section>
  );
};

export default Contact;
