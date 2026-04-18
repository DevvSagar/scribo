import { motion as Motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const GoogleMeetIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-9 w-9">
    <rect x="6" y="12" width="22" height="24" rx="6" fill="#34A853" />
    <path d="M28 18.5 39.5 13v22L28 29.5Z" fill="#188038" />
    <path d="M17 18h3l5 6-5 6h-3l5-6Z" fill="white" opacity="0.92" />
  </svg>
);

const ZoomIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-9 w-9">
    <rect x="5" y="10" width="38" height="28" rx="10" fill="#2D8CFF" />
    <rect x="14" y="18" width="12" height="12" rx="3" fill="white" />
    <path d="M28 20.5 35 17v14l-7-3.5Z" fill="white" />
  </svg>
);

const TeamsIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-9 w-9">
    <rect x="10" y="12" width="18" height="22" rx="5" fill="#5B5FC7" />
    <circle cx="33.5" cy="17.5" r="5.5" fill="#7B83EB" />
    <path d="M29 22h10a4 4 0 0 1 4 4v5a5 5 0 0 1-5 5H29Z" fill="#7B83EB" />
    <path d="M16.5 18h8v3h-2.5v10h-3V21h-2.5Z" fill="white" />
  </svg>
);

const AssemblyAiIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-8 w-8">
    <rect x="7" y="7" width="34" height="34" rx="12" fill="#111111" />
    <path d="M17 30.5 24 16l7 14.5h-4l-1.2-2.9h-3.6L21 30.5Z" fill="white" />
    <path d="M23.3 24.6h1.4L24 22.8Z" fill="#111111" />
  </svg>
);

const MongoDbIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-8 w-8">
    <rect x="7" y="7" width="34" height="34" rx="12" fill="#E9F6ED" />
    <path
      d="M24.1 12c-1.7 3.3-7 8.2-7 14.4 0 5.3 3.1 8.8 6.5 10.8.2.1.4 0 .4-.2.3-1.4.6-3.4.7-5 .1-2.2.1-5.7.1-8.1 0-2.6-.1-8.8-.2-11.5 0-.3-.4-.5-.5-.4Z"
      fill="#13AA52"
    />
    <path
      d="M24.1 12c.1 2.7.2 8.8.2 11.5 0 2.4 0 5.9-.1 8.1-.1 1.6-.4 3.6-.7 5 0 .2.2.3.4.2 3.9-2.4 7-6 7-11.4 0-6.1-5-10.4-6.8-13.4-.1-.2-.4-.2-.4 0Z"
      fill="#0E7A3F"
    />
  </svg>
);

const featureDialogs = [
  {
    title: "AI Summary + Notes",
    description:
      "AssemblyAI-powered transcription helps turn recordings into readable summaries, notes, and follow-up points.",
    icon: AssemblyAiIcon,
    label: "AI Engine",
    accent: "from-[#f5f5f2] to-[#ffffff]",
  },
  {
    title: "MongoDB Save Layer",
    description:
      "Meeting history, uploads, and generated output can be stored in MongoDB so users can come back to their work anytime.",
    icon: MongoDbIcon,
    label: "Database",
    accent: "from-[#eef8f1] to-[#ffffff]",
  },
  {
    title: "Authentication",
    description:
      "Protected access keeps user work behind sign-in so uploads, summaries, and saved meeting data stay scoped to each account.",
    icon: ShieldCheck,
    label: "Access",
    accent: "from-[#f5f1e8] to-[#ffffff]",
  },
];

const platformHighlights = [
  {
    title: "Google Meet",
    description:
      "Create Meet-enabled meetings and keep them visible in the scheduler flow with attendee support and join links.",
    icon: GoogleMeetIcon,
    accent: "from-[#dff3e5] to-[#ffffff]",
  },
  {
    title: "Zoom",
    description:
      "Schedule external Zoom meetings while keeping the same planning surface and history-driven product experience.",
    icon: ZoomIcon,
    accent: "from-[#e2eeff] to-[#ffffff]",
  },
  {
    title: "Microsoft Teams",
    description:
      "Support Teams links in the same scheduler so the product feels useful across real team environments, not just one stack.",
    icon: TeamsIcon,
    accent: "from-[#e6e4ff] to-[#ffffff]",
  },
];

const sectionTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

const Home = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden">
      <Motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7f5ee_0%,#fbfbf8_32%,#ffffff_66%,#f3f4ef_100%)]" />
        <Motion.div
          className="absolute left-[-8rem] top-[-4rem] h-[28rem] w-[28rem] rounded-full bg-[#d9ede4]/80 blur-3xl"
          animate={prefersReducedMotion ? undefined : { x: [0, 30, 0], y: [0, 24, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <Motion.div
          className="absolute right-[-6rem] top-24 h-[24rem] w-[24rem] rounded-full bg-[#f1dbc2]/70 blur-3xl"
          animate={prefersReducedMotion ? undefined : { x: [0, -26, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <Motion.div
          className="absolute bottom-[-8rem] left-1/2 h-[22rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#dbe1f6]/70 blur-3xl"
          animate={prefersReducedMotion ? undefined : { y: [0, -20, 0], opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,24,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,24,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
      </Motion.div>

      <section className="px-5 pb-10 pt-10 sm:px-8 lg:px-10 lg:pb-14 lg:pt-12 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-[1440px]">
          <Motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex max-w-5xl flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#646464] shadow-[0_14px_34px_rgba(0,0,0,0.04)] backdrop-blur-xl">
                <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                Meeting scheduler + AI summaries
            </div>

            <h1 className="mt-6 max-w-5xl font-serif text-[3.1rem] leading-[0.94] tracking-[-0.05em] text-[#1d1d1d] sm:text-[4.2rem] lg:text-[5rem]">
              Schedule across Meet, Zoom, and Teams while turning recordings into useful follow-up.
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-[#555555] sm:text-lg">
              Scribo’s main experience is now a cleaner meeting product: schedule across real platforms, process recordings,
              generate summaries, and keep follow-up work in a workspace that feels more like a product and less like a demo.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Motion.button
                type="button"
                onClick={() => navigate("/app")}
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(0,0,0,0.12)] transition hover:bg-black"
              >
                Open Workspace
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Motion.button>

              <Motion.button
                type="button"
                onClick={() => navigate("/privacy-policy")}
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/85 px-6 py-3.5 text-sm font-semibold text-[#1f1f1f] shadow-[0_14px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition hover:bg-white"
              >
                Read Privacy Policy
              </Motion.button>
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-10 lg:py-20 xl:px-12 2xl:px-16">
        <Motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition}
          className="mx-auto max-w-[1440px] rounded-[2.4rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,246,240,0.9)_100%)] p-6 shadow-[0_28px_68px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-8 lg:p-10"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b7b7b]">Core Flow</p>
            <h2 className="mt-4 font-serif text-3xl tracking-[-0.04em] text-[#1f1f1f] sm:text-4xl">
              The product story is AI summaries, saved records, and protected access.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5a5a5a]">
              This section highlights the parts that matter most in the product experience: AssemblyAI summaries and
              notes, MongoDB-backed storage, and authentication that keeps each workspace protected.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featureDialogs.map((item, index) => {
              const Icon = item.icon;

              return (
                <Motion.div
                  key={item.title}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06, duration: 0.42 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.01 }}
                  className={`rounded-[1.8rem] border border-black/8 bg-gradient-to-b ${item.accent} p-6 shadow-[0_18px_44px_rgba(0,0,0,0.05)]`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold tracking-[0.2em] text-[#8a8a8a]">{item.label}</span>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                      {item.title === "Authentication" ? (
                        <Icon className="h-6 w-6 text-[#1f1f1f]" strokeWidth={1.9} />
                      ) : (
                        <Icon />
                      )}
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-[#1f1f1f]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#585858] sm:text-[0.98rem]">{item.description}</p>
                </Motion.div>
              );
            })}
          </div>
        </Motion.div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-10 lg:py-20 xl:px-12 2xl:px-16">
        <Motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionTransition}
          className="mx-auto max-w-[1440px] rounded-[2.4rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,248,242,0.92)_100%)] p-6 shadow-[0_28px_68px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-8 lg:p-10"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b7b7b]">Platforms</p>
            <h2 className="mt-4 font-serif text-3xl tracking-[-0.04em] text-[#1f1f1f] sm:text-4xl">
              Built around the meeting platforms teams already use.
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5a5a5a]">
              The strongest front-facing story here is not a generic workflow. It is that Scribo helps users plan and
              follow up across Google Meet, Zoom, and Microsoft Teams in one cleaner experience.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {platformHighlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <Motion.div
                  key={item.title}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06, duration: 0.42 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.01 }}
                  className={`rounded-[1.8rem] border border-black/8 bg-gradient-to-b ${item.accent} p-6 shadow-[0_18px_44px_rgba(0,0,0,0.05)]`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold tracking-[0.2em] text-[#8a8a8a]">Platform</span>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                      <Icon />
                    </div>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-[#1f1f1f]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#585858] sm:text-[0.98rem]">{item.description}</p>
                </Motion.div>
              );
            })}
          </div>
        </Motion.div>
      </section>

    </div>
  );
};

export default Home;
