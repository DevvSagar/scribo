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
          <p className="text-sm uppercase tracking-[0.3em] text-[#7a7a7a]">Features</p>
          <h1 className="mt-4 text-4xl font-bold text-[#1f1f1f] sm:text-5xl">
            Built to make meeting follow-up effortless
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#5f5f5f]">
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
              className="rounded-3xl border border-black/8 bg-[#fafafa] p-7 shadow-[0_18px_45px_rgba(0,0,0,0.04)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f0f0] text-[#1f1f1f]">
                0{index + 1}
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-[#1f1f1f]">{feature.title}</h2>
              <p className="mt-3 leading-7 text-[#5f5f5f]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
