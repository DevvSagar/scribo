import { motion } from "framer-motion";

const Contact = () => {
  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[2rem] border border-white/10 bg-white/5 p-8"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Contact</p>
          <h1 className="mt-4 text-4xl font-bold text-white">
            <span className="bg-gradient-to-r from-blue-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Let’s build your workflow
            </span>
          </h1>
          <p className="mt-4 leading-8 text-slate-300">
            Tell us how your team records meetings and what output you want to automate.
          </p>
          <div className="mt-8 space-y-4 text-slate-400">
            <p>hello@scribo.ai</p>
            <p>Mon - Fri, 9:00 AM to 6:00 PM</p>
            <p>Remote-first team</p>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Your name" />
            <input className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Email address" />
          </div>
          <input className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Company" />
          <textarea className="mt-5 min-h-40 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500" placeholder="Tell us about your project" />
          <button className="mt-5 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-blue-500">
            Send message
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default Contact;
