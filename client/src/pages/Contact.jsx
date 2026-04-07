import { motion as Motion } from "framer-motion";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

const contactDetails = [
  {
    label: "Email",
    value: "Deevvxxx@gmail.com",
    note: "For product inquiries, freelance work, and thoughtful collaborations.",
    icon: Mail,
  },
  {
    label: "Location",
    value: "Remote-friendly",
    note: "Available to work across async teams and flexible time zones.",
    icon: MapPin,
  },
];

const Contact = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section className="relative overflow-hidden px-4 pb-28 pt-14 sm:px-6 sm:pb-32 lg:px-8 lg:pb-40 lg:pt-18 xl:pb-44">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.045),transparent_62%)]" />

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
        <Motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-full max-w-xl flex-col justify-between gap-10"
        >
          <div>
            <h1 className="max-w-lg text-4xl font-semibold leading-[1.02] text-[#1f1f1f] sm:text-5xl lg:text-[4rem]">
              Get in touch for product, design, or build work.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-[#5f5f5f] sm:text-lg">
              If you are building an AI product or need a sharper SaaS experience, send a clear brief and I’ll review it with context, scope, and product focus in mind.
            </p>
          </div>

          <div className="space-y-6">
            {contactDetails.map((item, index) => {
              const Icon = item.icon;

              return (
                <Motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06 }}
                  whileHover={{ x: 3 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/8 bg-white text-[#1f1f1f] shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a7a7a]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-xl font-medium text-[#1f1f1f]">{item.value}</p>
                    <p className="mt-2 max-w-md text-sm leading-7 text-[#5f5f5f]">{item.note}</p>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        </Motion.div>

        <Motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onSubmit={handleSubmit}
          className="flex h-full flex-col rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#3f3f3f]">First name</span>
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fafafa] px-4 py-3 text-[#1f1f1f] outline-none transition duration-300 placeholder:text-[#9d9d9d] focus:border-black/20 focus:bg-white"
                placeholder="Enter your first name..."
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#3f3f3f]">Last name</span>
              <input
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fafafa] px-4 py-3 text-[#1f1f1f] outline-none transition duration-300 placeholder:text-[#9d9d9d] focus:border-black/20 focus:bg-white"
                placeholder="Enter your last name..."
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#3f3f3f]">Email</span>
            <input
              className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fafafa] px-4 py-3 text-[#1f1f1f] outline-none transition duration-300 placeholder:text-[#9d9d9d] focus:border-black/20 focus:bg-white"
              placeholder="Enter your email address..."
            />
          </label>

          <label className="mt-4 block flex-1">
            <span className="text-sm font-medium text-[#3f3f3f]">How can I help?</span>
            <textarea
              className="mt-2 min-h-[14rem] h-[calc(100%-2rem)] w-full rounded-2xl border border-black/10 bg-[#fafafa] px-4 py-3 text-[#1f1f1f] outline-none transition duration-300 placeholder:text-[#9d9d9d] focus:border-black/20 focus:bg-white"
              placeholder="Tell me about the product, current stage, and what you need help with..."
            />
          </label>

          <Motion.button
            whileHover={{ y: -4, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="mt-6 inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#1f1f1f] px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-black"
          >
            Send Message
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Motion.button>
        </Motion.form>
      </div>
    </section>
  );
};

export default Contact;
