import { motion } from "framer-motion";

const features = [
  {
    title: "AI Summaries",
    description: "Convert long discussions into readable summaries with key outcomes.",
  },
  {
    title: "Action Items",
    description: "Extract tasks, owners, and next steps from every recording.",
  },
  {
    title: "Insight Highlights",
    description: "Capture deadlines, risks, and important decisions automatically.",
  },
];

const Features = () => {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Features</p>
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            <span className="bg-gradient-to-r from-blue-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Built to make meeting follow-up effortless
            </span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Everything your team needs to turn raw conversations into clear, actionable notes.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl border border-white/10 bg-slate-900/70 p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-sky-300">
                0{index + 1}
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-white">{feature.title}</h2>
              <p className="mt-3 leading-7 text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
