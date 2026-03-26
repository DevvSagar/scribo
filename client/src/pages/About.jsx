import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">About us</p>
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            <span className="bg-gradient-to-r from-blue-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Meeting intelligence without the chaos
            </span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Scribo helps teams move from raw conversations to clear summaries,
            action items, and searchable knowledge.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            ["Fast workflow", "Upload a call and get structured notes in minutes."],
            ["Team friendly", "Keep decisions, blockers, and follow-ups visible."],
            ["Built to scale", "Works for solo founders and growing operations teams."],
          ].map(([title, description], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 leading-7 text-slate-400">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
