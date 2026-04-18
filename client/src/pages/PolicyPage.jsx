import { motion as Motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  Database,
  FileAudio2,
  LockKeyhole,
  Mail,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRoundCheck,
} from "lucide-react";

const policyCards = [
  {
    title: "Information you provide",
    description:
      "When you use Scribo, you may provide account details, uploaded meeting files, attendee email addresses, calendar connection details, and any text you enter into the product.",
    icon: UserRoundCheck,
  },
  {
    title: "Meeting content processed",
    description:
      "Uploaded audio or video files may be processed to generate transcripts, summaries, highlights, action items, and related meeting outputs needed for the app experience.",
    icon: FileAudio2,
  },
  {
    title: "How data is used",
    description:
      "We use your information to authenticate users, generate meeting outputs, store history, power scheduler features, and improve reliability and product support workflows.",
    icon: ScanSearch,
  },
  {
    title: "Third-party services",
    description:
      "Scribo relies on third-party providers for services such as transcription, calendar integration, email delivery, hosting, and database infrastructure.",
    icon: CalendarDays,
  },
  {
    title: "Storage and retention",
    description:
      "Some product data is stored so users can revisit prior uploads, chats, and meetings. Temporary server files used during upload handling should be cleaned up after processing.",
    icon: Database,
  },
  {
    title: "Security posture",
    description:
      "The backend uses protective middleware, auth checks, validated inputs, and upload restrictions to reduce accidental exposure and unsafe request handling.",
    icon: LockKeyhole,
  },
];

const commitments = [
  "Only collect product data that supports authentication, meeting processing, scheduling, and user history.",
  "Use protected backend routes and server-side validation instead of trusting raw client input.",
  "Limit unsupported or unsafe uploads through type and size validation.",
  "Keep users informed when third-party processing is part of the product workflow.",
  "Treat meeting content as potentially sensitive business context.",
];

const faqs = [
  {
    question: "Does Scribo store meeting history?",
    answer:
      "Yes, the app can store chat history, generated summaries, and meeting records so signed-in users can reopen and manage prior work.",
    icon: Database,
  },
  {
    question: "Can calendar data be connected?",
    answer:
      "Yes, users can connect Google Calendar so Scribo can create Meet-enabled meetings and read upcoming meetings needed for the scheduler experience.",
    icon: CalendarDays,
  },
  {
    question: "How are temporary uploads handled?",
    answer:
      "Uploaded files are processed to generate meeting output, and temporary server-side files are intended to be removed after handling as part of the backend flow.",
    icon: Trash2,
  },
  {
    question: "What if this project goes public?",
    answer:
      "A production launch should include a legal review, exact retention rules, regional compliance checks, incident response planning, and a final policy aligned to the real infrastructure used.",
    icon: ShieldCheck,
  },
];

const sectionTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

const PolicyPage = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#f6f4ef_0%,#fbfbf8_36%,#ffffff_72%,#f2f4ee_100%)]" />
      <Motion.div
        aria-hidden="true"
        className="absolute left-[-8rem] top-[-6rem] -z-10 h-[24rem] w-[24rem] rounded-full bg-[#dce7ff]/70 blur-3xl"
        animate={prefersReducedMotion ? undefined : { x: [0, 24, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <Motion.div
        aria-hidden="true"
        className="absolute right-[-7rem] top-32 -z-10 h-[22rem] w-[22rem] rounded-full bg-[#efe0c7]/70 blur-3xl"
        animate={prefersReducedMotion ? undefined : { x: [0, -22, 0], y: [0, 14, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(24,24,24,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,24,0.03)_1px,transparent_1px)] bg-[size:76px_76px] opacity-45" />

      <section className="px-5 pb-12 pt-14 sm:px-8 lg:px-10 lg:pb-16 lg:pt-18 xl:px-12 2xl:px-16">
        <div className="mx-auto grid max-w-[1440px] gap-8 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
          <Motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/84 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#656565] shadow-[0_14px_34px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              Privacy Overview
            </div>

            <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[0.98] tracking-[-0.05em] text-[#1f1f1f] sm:text-5xl lg:text-[4.6rem]">
              Meeting data deserves clear boundaries, not vague promises.
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-[#575757] sm:text-lg">
              This page explains what information Scribo may process, why it is used, where third-party integrations
              come into the product flow, and what security-minded behaviors are already part of the app.
            </p>
          </Motion.div>

          <Motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.08, ...sectionTransition }}
            className="rounded-[2.1rem] border border-black/8 bg-white/84 p-7 shadow-[0_26px_64px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b7b7b]">Core Commitments</p>
            <div className="mt-6 space-y-3">
              {commitments.map((item, index) => (
                <Motion.div
                  key={item}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + index * 0.05, duration: 0.36 }}
                  whileHover={prefersReducedMotion ? undefined : { x: 3 }}
                  className="rounded-[1.2rem] border border-black/8 bg-[#fbfbf8] px-4 py-4 text-sm leading-7 text-[#525252]"
                >
                  {item}
                </Motion.div>
              ))}
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10 xl:px-12 2xl:px-16">
        <div className="mx-auto grid max-w-[1440px] gap-5 md:grid-cols-2 xl:grid-cols-3">
          {policyCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <Motion.article
                key={card.title}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.18 }}
                transition={{ delay: index * 0.05, duration: 0.42 }}
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                className="rounded-[1.9rem] border border-black/8 bg-white/84 p-6 shadow-[0_18px_44px_rgba(0,0,0,0.05)] backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2e7] text-[#1f1f1f]">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[#1f1f1f]">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#595959] sm:text-[0.98rem]">{card.description}</p>
              </Motion.article>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-10 lg:py-18 xl:px-12 2xl:px-16">
        <div className="mx-auto grid max-w-[1440px] gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <Motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={sectionTransition}
            className="rounded-[2rem] border border-black/8 bg-[#1f1f1f] p-7 text-white shadow-[0_30px_72px_rgba(0,0,0,0.14)] sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Practical Summary</p>
            <h2 className="mt-4 font-serif text-3xl tracking-[-0.04em] sm:text-4xl">
              Scribo handles data needed to run the meeting workflow.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">
              That includes files users upload, outputs the system generates, account/session details, and calendar
              information used to power the scheduling experience. Meeting content should be treated as sensitive by default.
            </p>
          </Motion.div>

          <div className="grid gap-5 md:grid-cols-2">
            {faqs.map((item, index) => {
              const Icon = item.icon;

              return (
                <Motion.div
                  key={item.question}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.05, duration: 0.42 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                  className="rounded-[1.8rem] border border-black/8 bg-white/84 p-6 shadow-[0_18px_44px_rgba(0,0,0,0.05)] backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3ece1] text-[#1f1f1f]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#1f1f1f]">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#595959]">{item.answer}</p>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-18 pt-4 sm:px-8 lg:px-10 lg:pb-22 xl:px-12 2xl:px-16">
        <Motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={sectionTransition}
          className="mx-auto flex max-w-[1440px] flex-col gap-4 rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(247,248,243,0.92)_100%)] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf3ff] text-[#1f1f1f]">
              <Mail className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b7b7b]">Important Note</p>
          </div>
          <p className="max-w-5xl text-sm leading-8 text-[#575757] sm:text-base">
            This is a product-level privacy overview for the current implementation. Before a public production launch,
            the final policy should be reviewed against the exact infrastructure, retention behavior, service providers,
            regional compliance requirements, and operational practices used in the deployed app.
          </p>
        </Motion.div>
      </section>
    </div>
  );
};

export default PolicyPage;
