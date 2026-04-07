import { motion as Motion } from "framer-motion";
import { Database, LockKeyhole, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

const policySections = [
  {
    title: "What data is used",
    description:
      "Scribo processes the files you upload, along with the generated transcript, summary, and related output needed to provide the product experience.",
    icon: Database,
  },
  {
    title: "How user data is protected",
    description:
      "We aim to protect user data through secure transport, controlled backend processing, validated uploads, and a minimal approach to storing sensitive information.",
    icon: LockKeyhole,
  },
  {
    title: "Why safety matters here",
    description:
      "Meeting files often contain internal decisions, client context, and sensitive conversations. The product is designed with that responsibility in mind.",
    icon: ShieldCheck,
  },
  {
    title: "Temporary file handling",
    description:
      "Uploaded files are used to process the request and temporary server files are cleaned up after handling whenever possible as part of the workflow.",
    icon: Trash2,
  },
];

const principles = [
  "No secrets should be committed to the frontend or public repository.",
  "Uploads are validated before processing to reduce unsafe or unsupported file handling.",
  "The backend uses security middleware such as rate limiting and protective request handling.",
  "Only the minimum product data needed for transcription and summarization should be processed.",
];

const PolicyPage = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.05),transparent_58%)]" />

      <section className="px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-14 lg:pt-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <Motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-[#666666] shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              Privacy Policy
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.02] text-[#1f1f1f] sm:text-5xl lg:text-[4rem]">
              Your recordings, notes, and generated data should be handled with care.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f5f5f] sm:text-lg">
              Scribo is built for meeting workflows that can contain sensitive business context. This page explains the general approach to user safety, data handling, and protective product practices.
            </p>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7a7a7a]">Core Commitments</p>
            <div className="mt-6 space-y-3">
              {principles.map((item, index) => (
                <Motion.div
                  key={item}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.05 }}
                  whileHover={{ x: 3 }}
                  className="rounded-[1.3rem] border border-black/8 bg-white px-4 py-4 text-sm leading-7 text-[#4f4f4f] shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
                >
                  {item}
                </Motion.div>
              ))}
            </div>
          </Motion.div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          {policySections.map((section, index) => {
            const Icon = section.icon;

            return (
              <Motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05, duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="group rounded-[1.8rem] border border-black/8 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_26px_60px_rgba(0,0,0,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/8 bg-[#fafafa] text-[#1f1f1f] transition-colors duration-300 group-hover:bg-[#f4f4f4]">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[#1f1f1f]">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#5f5f5f] sm:text-[0.98rem]">
                  {section.description}
                </p>
              </Motion.div>
            );
          })}
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="mx-auto mt-10 max-w-6xl rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7a7a7a]">Important Note</p>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-[#5f5f5f] sm:text-base">
            This page is a product-level privacy overview for your web app experience. If you plan to publish publicly or handle regulated data, you should still review the exact storage, retention, third-party processing, and legal compliance requirements for your final production setup.
          </p>
        </Motion.div>
      </section>
    </div>
  );
};

export default PolicyPage;
