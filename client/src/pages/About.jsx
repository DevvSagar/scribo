import { motion as Motion } from "framer-motion";

const About = () => {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[#7a7a7a]">About us</p>
          <h1 className="mt-4 text-4xl font-bold text-[#1f1f1f] sm:text-5xl">
            Meeting intelligence without the chaos
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#5f5f5f]">
            Scribo helps teams move from raw conversations to clear summaries,
            action items, and searchable knowledge.
          </p>
        </Motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            ["Fast workflow", "Upload a call and get structured notes in minutes."],
            ["Team friendly", "Keep decisions, blockers, and follow-ups visible."],
            ["Built to scale", "Works for solo founders and growing operations teams."],
          ].map(([title, description], index) => (
            <Motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl border border-black/8 bg-[#fafafa] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.04)]"
            >
              <h2 className="text-xl font-semibold text-[#1f1f1f]">{title}</h2>
              <p className="mt-3 leading-7 text-[#5f5f5f]">{description}</p>
            </Motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
