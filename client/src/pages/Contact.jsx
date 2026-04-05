import { motion as Motion } from "framer-motion";

const Contact = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-[2rem] border border-black/8 bg-[#fafafa] p-8 shadow-[0_18px_45px_rgba(0,0,0,0.04)]"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-[#7a7a7a]">Hello</p>
          <h1 className="mt-4 text-4xl font-bold text-[#1f1f1f]">
            Let’s build something impactful
          </h1>
          <p className="mt-4 leading-8 text-[#5f5f5f]">
            Interested in AI-powered tools, web apps, or collaboration?  
Feel free to reach out.
          </p>
          <div className="mt-8 space-y-4 text-[#5f5f5f]">
            <p>📧  Deevvxxx@gmail.com</p>
            <p>🕒  Available for opportunities</p>
            <p>🌍  Open to remote work</p>
          </div>
        </Motion.div>

        <Motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_18px_45px_rgba(0,0,0,0.04)]"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <input className="rounded-2xl border border-black/10 bg-[#fafafa] px-4 py-3 text-[#1f1f1f] outline-none placeholder:text-[#9d9d9d] focus:border-black/20" placeholder="Your name" />
            <input className="rounded-2xl border border-black/10 bg-[#fafafa] px-4 py-3 text-[#1f1f1f] outline-none placeholder:text-[#9d9d9d] focus:border-black/20" placeholder="Email address" />
          </div>
          <input className="mt-5 w-full rounded-2xl border border-black/10 bg-[#fafafa] px-4 py-3 text-[#1f1f1f] outline-none placeholder:text-[#9d9d9d] focus:border-black/20" placeholder="Company" />
          <textarea className="mt-5 min-h-40 w-full rounded-2xl border border-black/10 bg-[#fafafa] px-4 py-3 text-[#1f1f1f] outline-none placeholder:text-[#9d9d9d] focus:border-black/20" placeholder="Tell us about your project" />
          <button className="mt-5 rounded-full bg-[#1f1f1f] px-6 py-3 font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-black">
            Send message
          </button>
        </Motion.form>
      </div>
    </section>
  );
};

export default Contact;
