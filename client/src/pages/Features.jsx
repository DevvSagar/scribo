import { motion as Motion } from "framer-motion";
import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Standard",
    tier: "Free",
    price: "$0",
    period: "/month",
    description: "A lightweight starting point for trying Scribo with smaller daily usage.",
    cta: "Current Plan",
    popular: false,
    values: {
      uploadLimit: "5/day",
      summaryQuality: "Basic",
      importantPoints: false,
      actionItems: false,
      highlights: false,
      meetingScheduler: false,
      processingSpeed: "Normal",
      fileSizeLimit: "Limited",
      support: "Email",
    },
  },
  {
    name: "Advanced",
    tier: "Pro",
    price: "$29",
    period: "/month",
    description: "Best for active teams that want richer summaries and faster turnaround.",
    cta: "Upgrade",
    popular: true,
    values: {
      uploadLimit: "Unlimited",
      summaryQuality: "Advanced",
      importantPoints: true,
      actionItems: true,
      highlights: true,
      meetingScheduler: false,
      processingSpeed: "Fast",
      fileSizeLimit: "Higher",
      support: "Priority",
    },
  },
  {
    name: "Pro",
    tier: "Premium",
    price: "$79",
    period: "/month",
    description: "For heavy-volume workflows that need the fastest processing and premium support.",
    cta: "Upgrade",
    popular: false,
    values: {
      uploadLimit: "Unlimited",
      summaryQuality: "Advanced+",
      importantPoints: true,
      actionItems: true,
      highlights: true,
      meetingScheduler: "Calendar Sync",
      processingSpeed: "Priority",
      fileSizeLimit: "Highest",
      support: "24/7",
    },
  },
];

const featureRows = [
  { key: "uploadLimit", label: "Upload Limit" },
  { key: "summaryQuality", label: "Summary Quality" },
  { key: "importantPoints", label: "Important Points" },
  { key: "actionItems", label: "Action Items" },
  { key: "highlights", label: "Highlights" },
  { key: "meetingScheduler", label: "Meeting Scheduler" },
  { key: "processingSpeed", label: "Processing Speed" },
  { key: "fileSizeLimit", label: "File Size Limit" },
  { key: "support", label: "Support" },
];

const renderValue = (value) => {
  if (value === true) {
    return <Check className="mx-auto h-4 w-4 text-[#1f1f1f]" strokeWidth={2.4} />;
  }

  if (value === false) {
    return <Minus className="mx-auto h-4 w-4 text-[#9a9a9a]" strokeWidth={2.4} />;
  }

  return <span>{value}</span>;
};

const getPlanButtonClasses = (cta) => {
  if (cta === "Current Plan") {
    return "cursor-default border-black/10 bg-[#f7f7f7] text-[#1f1f1f] hover:translate-y-0 hover:bg-[#f7f7f7]";
  }

  return "border-[#1f1f1f] bg-[#1f1f1f] text-white hover:bg-black";
};

const Features = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pricingRef = useRef(null);

  const popularPlan = useMemo(
    () => plans.find((plan) => plan.popular)?.name || "Advanced",
    [],
  );

  const scrollToPricing = () => {
    if (!pricingRef.current) return;

    const navHeight =
      document.querySelector("nav")?.getBoundingClientRect().height ?? 0;
    const pricingTop =
      pricingRef.current.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: Math.max(pricingTop - navHeight - 1, 0),
      behavior: "smooth",
    });
  };

  const handlePlanAction = () => {
    if (location.pathname === "/features") {
      scrollToPricing();
      return;
    }

    navigate("/features");
  };

  useEffect(() => {
    if (location.hash === "#pricing") {
      const timeoutId = window.setTimeout(() => {
        scrollToPricing();
      }, 120);

      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, [location.hash]);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_58%)]" />
      <div className="absolute left-1/2 top-0 -z-10 h-[24rem] w-[56rem] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,255,255,0))]" />

      <section className="px-5 pb-10 pt-12 sm:px-8 lg:px-10 lg:pt-16 xl:px-12 2xl:px-16">
        <div className="mx-auto max-w-[1440px]">
          <Motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex max-w-4xl flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-[#666666] shadow-[0_12px_30px_rgba(0,0,0,0.04)] backdrop-blur-sm">
              <Sparkles className="h-4 w-4" strokeWidth={1.8} />
              Pricing & features
            </div>

            <h1 className="mt-6 max-w-4xl text-[2.9rem] font-semibold leading-[0.95] text-[#1f1f1f] sm:text-[4rem] lg:text-[4.8rem]">
              Pick the plan that fits how your team works with AI notes.
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-[#5f5f5f] sm:text-lg">
              Compare summary depth, speed, and collaboration features in one clean view. The Advanced plan is the sweet
              spot for most teams using Scribo every week.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={scrollToPricing}
                className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-6 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black"
              >
                Compare plans
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
              <p className="rounded-full border border-black/8 bg-white px-4 py-3 text-sm text-[#666666] shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                Most popular: <span className="font-semibold text-[#1f1f1f]">{popularPlan}</span>
              </p>
            </div>
          </Motion.div>
        </div>
      </section>

      <section
        id="pricing"
        ref={pricingRef}
        className="scroll-mt-28 px-5 pb-16 pt-4 sm:px-8 lg:px-10 lg:pb-20 xl:px-12 2xl:px-16"
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="hidden overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.06)] lg:block">
            <div className="grid grid-cols-[1.25fr_repeat(3,minmax(0,1fr))]">
              <div className="border-r border-black/8 bg-[linear-gradient(180deg,#fdfdfd_0%,#f8f8f8_100%)] p-8">
                <h2 className="text-3xl font-semibold text-[#1f1f1f]">Feature comparison</h2>
                <p className="mt-4 max-w-xs text-sm leading-7 text-[#5f5f5f]">
                  Compare usage limits, summary quality, and premium workflow features across every plan.
                </p>
              </div>

              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={[
                    "border-r border-black/8 p-8 last:border-r-0",
                    plan.popular ? "bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)]" : "bg-white",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[1.9rem] font-semibold text-[#1f1f1f]">{plan.name}</h3>
                    {plan.popular && (
                      <span className="inline-flex items-center rounded-full bg-[#1f1f1f] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-[#5f5f5f]">{plan.description}</p>
                </div>
              ))}
            </div>

            {featureRows.map((feature) => (
              <div
                key={feature.key}
                className="grid grid-cols-[1.25fr_repeat(3,minmax(0,1fr))] border-t border-black/8"
              >
                <div className="border-r border-black/8 px-8 py-5 text-sm font-medium text-[#3c3c3c]">{feature.label}</div>
                {plans.map((plan) => (
                  <div
                    key={`${plan.name}-${feature.key}`}
                    className={[
                      "flex items-center justify-center border-r border-black/8 px-6 py-5 text-sm font-medium text-[#1f1f1f] last:border-r-0",
                      plan.popular ? "bg-[#fcfcfc]" : "bg-white",
                    ].join(" ")}
                  >
                    {renderValue(plan.values[feature.key])}
                  </div>
                ))}
              </div>
            ))}

            <div className="grid grid-cols-[1.25fr_repeat(3,minmax(0,1fr))] border-t border-black/8">
              <div className="border-r border-black/8 bg-[linear-gradient(180deg,#fdfdfd_0%,#f8f8f8_100%)] px-8 py-8">
                <p className="text-sm leading-7 text-[#5f5f5f]">
                  Every plan keeps the same clean Scribo experience. Upgrade when you need richer outputs and higher usage.
                </p>
              </div>

              {plans.map((plan) => (
                <div
                  key={`${plan.name}-footer`}
                  className={[
                    "border-r border-black/8 px-8 py-8 last:border-r-0",
                    plan.popular ? "bg-[#fcfcfc]" : "bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-end gap-1">
                    <span className="text-[2.4rem] font-semibold leading-none text-[#1f1f1f]">{plan.price}</span>
                    <span className="pb-1 text-sm text-[#6d6d6d]">{plan.period}</span>
                  </div>
                  <button
                    type="button"
                    onClick={plan.cta === "Current Plan" ? undefined : handlePlanAction}
                    disabled={plan.cta === "Current Plan"}
                    className={[
                      "mt-6 inline-flex w-full items-center justify-center rounded-2xl border px-4 py-3.5 text-sm font-semibold transition duration-300 hover:-translate-y-0.5",
                      getPlanButtonClasses(plan.cta),
                    ].join(" ")}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:hidden">
            {plans.map((plan) => (
              <Motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                whileHover={{ y: -4 }}
                className={[
                  "rounded-[2rem] border p-6 shadow-[0_20px_46px_rgba(0,0,0,0.05)] transition duration-300",
                  plan.popular
                    ? "border-black/14 bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)]"
                    : "border-black/8 bg-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-[#1f1f1f]">{plan.name}</h3>
                  </div>
                  {plan.popular && (
                    <span className="rounded-full bg-[#1f1f1f] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white">
                      Most Popular
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm leading-7 text-[#5f5f5f]">{plan.description}</p>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-[2.4rem] font-semibold leading-none text-[#1f1f1f]">{plan.price}</span>
                  <span className="pb-1 text-sm text-[#6d6d6d]">{plan.period}</span>
                </div>

                <div className="mt-6 space-y-3 rounded-[1.5rem] border border-black/8 bg-[#fbfbfb] p-4">
                  {featureRows.map((feature) => (
                    <div key={`${plan.name}-${feature.key}-mobile`} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-[#5f5f5f]">{feature.label}</span>
                      <span className="font-medium text-[#1f1f1f]">{renderValue(plan.values[feature.key])}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={plan.cta === "Current Plan" ? undefined : handlePlanAction}
                  disabled={plan.cta === "Current Plan"}
                  className={[
                    "mt-6 inline-flex w-full items-center justify-center rounded-2xl border px-4 py-3.5 text-sm font-semibold transition duration-300 hover:-translate-y-0.5",
                    getPlanButtonClasses(plan.cta),
                  ].join(" ")}
                >
                  {plan.cta}
                </button>
              </Motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
