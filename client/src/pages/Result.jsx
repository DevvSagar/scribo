import { motion as Motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const getSummaryParagraphs = (summary) =>
  (summary || "No summary was returned for this text.")
    .split(/\n+/)
    .map((paragraph) => paragraph.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);

const ActionButton = ({ children, icon, variant = "secondary", onClick }) => {
  const styles =
    variant === "primary"
      ? "border-[#1f1f1f] bg-[#1f1f1f] text-white shadow-black/10 hover:bg-black"
      : "border-black/10 bg-white text-[#1f1f1f] hover:border-black/20 hover:bg-[#f5f5f5]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_16px_36px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-0.5 hover:scale-[1.02] ${styles}`}
    >
      {icon}
      {children}
    </button>
  );
};

const SkeletonLines = () => (
  <div className="space-y-4">
    <div className="h-4 w-11/12 animate-pulse rounded-full bg-black/8" />
    <div className="h-4 w-full animate-pulse rounded-full bg-black/8" />
    <div className="h-4 w-9/12 animate-pulse rounded-full bg-black/8" />
    <div className="h-4 w-10/12 animate-pulse rounded-full bg-black/8" />
  </div>
);

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const resultData = useMemo(() => location.state ?? null, [location.state]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  if (!resultData?.result) {
    return <Navigate to="/app" replace />;
  }

  const { result, fileName } = resultData;
  const summaryText = result.summary || "No summary was returned for this text.";
  const originalText = result.transcript || "No original text was returned for this result.";
  const summaryParagraphs = getSummaryParagraphs(summaryText);
  const originalWordCount = originalText.trim().split(/\s+/).filter(Boolean).length;

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      showToast("Summary copied to clipboard.");
    } catch {
      showToast("Copy failed. Please try again.");
    }
  };

  const handleDownloadSummary = () => {
    const summaryItems = summaryParagraphs.length > 0 ? summaryParagraphs : [summaryText];
    const generatedDate = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date());
    const content = [
      "SCRIBO AI SUMMARY NOTES",
      "=======================",
      "",
      `Source File: ${fileName || "AI summary"}`,
      `Generated: ${generatedDate}`,
      `Status: ${result.status || "completed"}`,
      `Original Text: ${originalWordCount} words`,
      "",
      "SUMMARY",
      "-------",
      ...summaryItems.map((item, index) => `${index + 1}. ${item}`),
      "",
      "SOURCE CONTEXT",
      "--------------",
      "This summary was generated from the original text shown in Scribo. Review the source text in the app before sharing externally.",
      "",
      "NOTES",
      "-----",
      "- Cleaned and formatted for quick review.",
      "- Keep this file with the related meeting or document context.",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(fileName || "ai-summary").replace(/\.[^/.]+$/, "")}-summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Summary downloaded.");
  };

  return (
    <section className="relative min-h-[calc(100svh-81px)] overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_52%,#f6f6f6_100%)] px-5 py-10 text-[#1f1f1f] sm:px-8 lg:px-10 lg:py-14 xl:px-12 2xl:px-16">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_60%)]" />
      <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-black/[0.035] blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <Motion.header
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#666666] shadow-[0_12px_30px_rgba(0,0,0,0.04)] backdrop-blur-2xl">
            <CheckCircle2 className="h-4 w-4 text-[#1f1f1f]" strokeWidth={2} />
            AI Result
          </div> */}
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#1f1f1f] sm:text-5xl lg:text-6xl">
            Your Summary is Ready 🎉
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5f5f5f] sm:text-lg">
            Review, copy or download your AI-generated summary
          </p>
          {result.savedToHistory && (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#5f5f5f]">
              This upload and summary were saved to your history automatically.
            </p>
          )}
        </Motion.header>

        <Motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]"
        >
          <article className="rounded-[2rem] border border-black/8 bg-white/90 p-5 shadow-[0_22px_55px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-black/12 hover:shadow-[0_28px_70px_rgba(0,0,0,0.08)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7a7a]">Source</p>
                <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[#1f1f1f]">
                  <FileText className="h-5 w-5 text-[#1f1f1f]" strokeWidth={2} />
                  Original Text
                </h2>
              </div>
              <span className="rounded-full border border-black/8 bg-[#fafafa] px-3 py-1.5 text-xs text-[#5f5f5f]">
                {originalWordCount} words
              </span>
            </div>

            <div className="mt-6 h-[24rem] overflow-y-auto rounded-[1.5rem] border border-black/8 bg-[#fafafa] p-5 text-sm leading-7 text-[#5f5f5f] shadow-inner shadow-black/[0.03] sm:text-[0.95rem]">
              {isLoading ? <SkeletonLines /> : <p className="whitespace-pre-line">{originalText}</p>}
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_24px_65px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-black/12 hover:shadow-[0_30px_76px_rgba(0,0,0,0.1)] sm:p-7">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-black/[0.035] blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a7a7a]">Main Output</p>
                <h2 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-[-0.03em] text-[#1f1f1f] sm:text-4xl">
                  <Sparkles className="h-6 w-6 text-[#1f1f1f]" strokeWidth={2} />
                  AI Summary
                </h2>
              </div>
              <span className="rounded-full border border-black/8 bg-[#f3f3f3] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f1f1f]">
                {result.status || "ready"}
              </span>
            </div>

            <div className="relative mt-7 h-[24rem] space-y-5 overflow-y-auto pr-1 text-lg leading-8 text-[#2f2f2f] sm:text-xl sm:leading-9">
              {isLoading ? (
                <SkeletonLines />
              ) : (
                summaryParagraphs.map((paragraph) => (
                  <p key={paragraph} className="rounded-[1.35rem] border border-black/8 bg-[#fafafa] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.04)]">
                    {paragraph}
                  </p>
                ))
              )}
            </div>
          </article>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45 }}
          className="flex flex-col gap-3 sm:grid sm:grid-cols-3"
        >
          <ActionButton icon={<ArrowLeft className="h-4 w-4" strokeWidth={2} />} onClick={() => navigate("/app")}>
            New Text
          </ActionButton>
          <ActionButton icon={<Clipboard className="h-4 w-4" strokeWidth={2} />} variant="primary" onClick={handleCopySummary}>
            Copy Summary
          </ActionButton>
          <ActionButton icon={<Download className="h-4 w-4" strokeWidth={2} />} onClick={handleDownloadSummary}>
            Download Summary
          </ActionButton>
        </Motion.div>
      </div>

      {toast && (
        <Motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
          className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-black/10 bg-[#1f1f1f]/95 px-5 py-4 text-center text-sm font-medium text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
        >
          {toast}
        </Motion.div>
      )}
    </section>
  );
};

export default Result;
