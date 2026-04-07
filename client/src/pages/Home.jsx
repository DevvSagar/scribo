import { motion as Motion } from "framer-motion";
import {
  ArrowRight,
  AudioWaveform,
  BriefcaseBusiness,
  Clock3,
  FileText,
  Layers3,
  ListChecks,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  WandSparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const productHighlights = [
  {
    title: "Readable AI summaries",
    description: "Turn long recordings into clean, structured notes that teams can actually scan.",
    icon: FileText,
  },
  {
    title: "Action items extracted",
    description: "Capture follow-ups, owners, and next steps without digging back through the call.",
    icon: ListChecks,
  },
  {
    title: "Searchable meeting context",
    description: "Keep transcripts, highlights, and outcomes in one focused workflow.",
    icon: Search,
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Upload your recording",
    description: "Drop an MP3, WAV, M4A, or MP4 file into the dedicated workspace.",
    icon: UploadCloud,
  },
  {
    step: "02",
    title: "Let Scribo process the meeting",
    description: "AI transcribes, organizes, and summarizes the conversation in the background.",
    icon: AudioWaveform,
  },
  {
    step: "03",
    title: "Review clear outputs",
    description: "Get a polished summary, highlights, and transcript ready to share or export.",
    icon: WandSparkles,
  },
];

const useCases = [
  {
    title: "Founder updates",
    description: "Capture product decisions, hiring notes, and follow-ups after fast-moving calls.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Client meetings",
    description: "Turn discussions into presentable notes and action items without manual admin work.",
    icon: Users,
  },
  {
    title: "Ops and internal reviews",
    description: "Keep recurring meetings searchable, structured, and easy to revisit later.",
    icon: Layers3,
  },
];

const metrics = [
  { label: "Faster follow-up", value: "Minutes", icon: Clock3 },
  { label: "Clear deliverables", value: "AI Notes", icon: Sparkles },
  { label: "Reliable handoff", value: "Team Ready", icon: ShieldCheck },
];

const sectionIntroTransition = { duration: 0.42, ease: [0.22, 1, 0.36, 1] };
const cardHover = { y: -4, transition: { duration: 0.2, ease: "easeOut" } };

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_58%)]" />
      <div className="absolute left-1/2 top-0 -z-10 h-[28rem] w-[60rem] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0))]" />

      <section className="px-5 pb-14 pt-12 sm:px-8 lg:px-10 lg:pb-18 lg:pt-16 xl:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1440px]">
          <Motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto flex max-w-5xl flex-col items-center text-center"
          >
            <Motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04, ...sectionIntroTransition }}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.26em] text-[#666666] shadow-[0_12px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              AI meeting intelligence
            </Motion.div>

            <Motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-5xl text-[3.1rem] font-semibold leading-[0.95] text-[#1f1f1f] sm:text-[4.1rem] lg:text-[5rem] xl:text-[5.5rem]"
            >
              Notes your team can trust right after the call.
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, ...sectionIntroTransition }}
              className="mt-6 max-w-3xl text-base leading-8 text-[#565656] sm:text-lg"
            >
              Scribo turns meeting recordings into structured summaries, action items, and searchable transcripts.
              The homepage sells the workflow. The app gives you a focused place to actually use it.
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, ...sectionIntroTransition }}
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              <Motion.button
                type="button"
                onClick={() => navigate("/app")}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black"
              >
                Get Started
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Motion.button>
            </Motion.div>

            <div className="mt-10 grid w-full max-w-4xl gap-3 sm:grid-cols-3">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;

                return (
                  <Motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + index * 0.08 }}
                    whileHover={cardHover}
                    className="rounded-[1.5rem] border border-black/8 bg-white px-5 py-5 text-center shadow-[0_18px_42px_rgba(0,0,0,0.04)]"
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f5f5f5] text-[#1f1f1f]">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <p className="mt-4 text-[1.55rem] font-semibold text-[#1f1f1f]">{metric.value}</p>
                    <p className="mt-1 text-sm text-[#5f5f5f]">{metric.label}</p>
                  </Motion.div>
                );
              })}
            </div>
          </Motion.div>
        </div>
      </section>

      <section id="features" className="px-5 py-14 sm:px-8 lg:px-10 lg:py-18 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-[1440px]">
          <Motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={sectionIntroTransition}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a7a7a]">Features</p>
            <h2 className="mt-4 text-3xl font-semibold text-[#1f1f1f] sm:text-4xl lg:text-[3rem]">
              A cleaner workflow from recording to follow-up.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5f5f]">
              Everything is designed to feel lightweight, premium, and useful immediately after the meeting ends.
            </p>
          </Motion.div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {productHighlights.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                  whileHover={cardHover}
                  className="rounded-[1.9rem] border border-black/8 bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_24px_55px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/8 bg-[#fafafa] text-[#1f1f1f]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[#1f1f1f]">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f5f5f] sm:text-[0.98rem]">{feature.description}</p>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-10 lg:py-18 xl:px-12 2xl:px-16">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionIntroTransition}
          className="mx-auto max-w-[1440px] rounded-[2.4rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] px-6 py-8 shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:px-8 sm:py-10 lg:px-10"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a7a7a]">How It Works</p>
            <h2 className="mt-4 text-3xl font-semibold text-[#1f1f1f] sm:text-4xl">
              A simple three-step product flow.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <Motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                  whileHover={cardHover}
                  className="rounded-[1.7rem] border border-black/8 bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-[0.2em] text-[#8a8a8a]">{step.step}</span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4f4f4] text-[#1f1f1f]">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-[#1f1f1f]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f5f5f] sm:text-[0.98rem]">{step.description}</p>
                </Motion.div>
              );
            })}
          </div>
        </Motion.div>
      </section>

      <section className="px-5 py-14 sm:px-8 lg:px-10 lg:py-18 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-[1440px]">
          <Motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={sectionIntroTransition}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7a7a7a]">Use Cases</p>
            <h2 className="mt-4 text-3xl font-semibold text-[#1f1f1f] sm:text-4xl lg:text-[3rem]">
              Built for teams that need faster, clearer post-meeting output.
            </h2>
          </Motion.div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {useCases.map((item, index) => {
              const Icon = item.icon;

              return (
                <Motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                  whileHover={cardHover}
                  className="rounded-[1.8rem] border border-black/8 bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/8 bg-[#fafafa] text-[#1f1f1f]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[#1f1f1f]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f5f5f] sm:text-[0.98rem]">{item.description}</p>
                </Motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
