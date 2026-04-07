import { motion as Motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const UnderDevelopmentPage = ({ badge, title }) => {
  return (
    <section className="relative overflow-hidden px-5 py-16 sm:px-8 lg:px-10 lg:py-24 xl:px-12 2xl:px-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.05),transparent_60%)]" />

      <div className="mx-auto flex w-full max-w-5xl justify-center">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-[2.2rem] border border-black/8 bg-white px-6 py-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:px-8 sm:py-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-[#666666] shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <Sparkles className="h-4 w-4" strokeWidth={1.8} />
            {badge}
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.02] text-[#1f1f1f] sm:text-5xl">
            {title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#5f5f5f] sm:text-lg">
            This page is being prepared right now. The flow, UI, and final content will be added soon.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1f1f1f] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black"
            >
              Back to home
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </Motion.div>
      </div>
    </section>
  );
};

export default UnderDevelopmentPage;
