import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  ListChecks,
  ScanSearch,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const normalizeSummaryItems = (summary) => {
  if (!summary) return [];

  return summary
    .split("\n")
    .map((item) => item.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
};

const buildSummarySections = (summary) => {
  const items = normalizeSummaryItems(summary);

  if (items.length === 0) {
    return [
      { title: "Main Idea", icon: "summary", items: ["No structured summary was returned for this file."] },
      { title: "Key Takeaways", icon: "takeaways", items: [] },
      { title: "Action Points", icon: "actions", items: [] },
    ];
  }

  const mainIdea = items[0] ? [items[0]] : [];
  const takeaways = items.slice(1, 4);
  const actionPoints = items
    .slice(4)
    .map((item) => (item.toLowerCase().startsWith("use ") || item.toLowerCase().startsWith("limit ") || item.toLowerCase().startsWith("practice ") ? item : `Follow up on: ${item}`));

  return [
    { title: "Main Idea", icon: "summary", items: mainIdea },
    { title: "Key Takeaways", icon: "takeaways", items: takeaways },
    { title: "Action Points", icon: "actions", items: actionPoints },
  ];
};

const filterHighlights = (highlights) => {
  const blocked = new Set([
    "thing",
    "things",
    "minute",
    "minutes",
    "level",
    "okay",
    "yeah",
    "just",
    "really",
  ]);

  return highlights.filter((highlight) => {
    const text = highlight.text?.trim();
    if (!text) return false;
    if (text.length <= 3) return false;
    if (blocked.has(text.toLowerCase())) return false;
    return true;
  });
};

const extractKeywords = (summarySections, highlights) => {
  const words = new Set();

  [...summarySections.flatMap((section) => section.items), ...highlights.map((item) => item.text)]
    .flatMap((text) => text.split(/\s+/))
    .map((word) => word.toLowerCase().replace(/[^a-z0-9-]/g, ""))
    .filter((word) => word.length > 4)
    .forEach((word) => words.add(word));

  return Array.from(words).slice(0, 18);
};

const renderHighlightedText = (text, terms) => {
  if (!text) return null;
  if (!terms.length) return text;

  const escaped = terms
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (!escaped.length) return text;

  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isMatch = terms.some((term) => term.toLowerCase() === part.toLowerCase());
    if (isMatch) {
      return (
        <mark
          key={`${part}-${index}`}
          className="rounded bg-white/15 px-1 py-0.5 text-white"
        >
          {part}
        </mark>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
};

const SectionIcon = ({ type }) => {
  const iconProps = { className: "h-5 w-5", strokeWidth: 1.8 };

  if (type === "summary") {
    return <FileText {...iconProps} />;
  }

  if (type === "highlights") {
    return <Sparkles {...iconProps} />;
  }

  return <ScanSearch {...iconProps} />;
};

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse rounded-2xl bg-black/6 ${className}`} />
);

const SummaryCardIcon = ({ type }) => {
  const iconProps = { className: "h-5 w-5", strokeWidth: 1.8 };

  if (type === "summary") return <FileText {...iconProps} />;
  if (type === "takeaways") return <Sparkles {...iconProps} />;
  return <ListChecks {...iconProps} />;
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy summary");
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [showTranscriptFade, setShowTranscriptFade] = useState(true);
  const transcriptScrollRef = useRef(null);
  const resultData = useMemo(() => location.state ?? null, [location.state]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsHydrated(true), 220);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = transcriptScrollRef.current;
    if (!container || !resultData?.result) return;

    const updateFade = () => {
      const canScrollFurther = container.scrollTop + container.clientHeight < container.scrollHeight - 4;
      setShowTranscriptFade(canScrollFurther);
    };

    updateFade();
    container.addEventListener("scroll", updateFade);

    return () => {
      container.removeEventListener("scroll", updateFade);
    };
  }, [showFullTranscript, isHydrated, resultData, transcriptSearch]);

  if (!resultData?.result) {
    return <Navigate to="/app" replace />;
  }

  const { result, fileName } = resultData;
  const highlights = filterHighlights(result.highlights || []);
  const summarySections = buildSummarySections(result.summary);
  const keywordTerms = extractKeywords(summarySections, highlights);
  const transcriptWordCount = result.transcript ? result.transcript.trim().split(/\s+/).length : 0;
  const transcriptPreview = result.transcript || "No transcript was returned for this file.";
  const transcriptTerms = transcriptSearch.trim()
    ? [transcriptSearch.trim(), ...keywordTerms]
    : keywordTerms;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(result.summary || "");
      setCopyLabel("Copied ✅");
      window.setTimeout(() => setCopyLabel("Copy summary"), 1800);
    } catch {
      setCopyLabel("Copy failed");
      window.setTimeout(() => setCopyLabel("Copy summary"), 1800);
    }
  };

  const handleDownloadText = () => {
    const content = [
      `File: ${fileName || "Meeting upload"}`,
      `Status: ${result.status}`,
      "",
      "SUMMARY",
      result.summary || "No summary available.",
      "",
      "HIGHLIGHTS",
      highlights.length ? highlights.map((item) => `- ${item.text}`).join("\n") : "No highlights available.",
      "",
      "TRANSCRIPT",
      transcriptPreview,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(fileName || "scribo-result").replace(/\.[^/.]+$/, "")}-notes.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative overflow-hidden px-5 py-10 sm:px-8 lg:px-10 lg:py-14 xl:px-12 xl:py-18 2xl:px-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_60%)]" />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <Motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5 rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_22px_55px_rgba(0,0,0,0.05)] sm:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fafafa] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-[#666666]">
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                Result Workspace
              </div>
              <h1 className="mt-5 text-3xl font-semibold text-[#1f1f1f] sm:text-4xl lg:text-[3.15rem]">
                Your meeting output is ready to review.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5f5f] sm:text-base">
                The workspace has finished processing your upload. Review the AI summary, highlights, and transcript for{" "}
                <span className="font-medium text-[#1f1f1f]">{fileName || "your upload"}</span>.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="rounded-full border border-black/8 bg-[#fafafa] px-4 py-2 text-sm text-[#5f5f5f]">
                  Status: <span className="font-medium capitalize text-[#1f1f1f]">{result.status}</span>
                </div>
                <div className="rounded-full border border-black/8 bg-[#fafafa] px-4 py-2 text-sm text-[#5f5f5f]">
                  Transcript words: <span className="font-medium text-[#1f1f1f]">{transcriptWordCount || 0}</span>
                </div>
                <div className="rounded-full border border-black/8 bg-[#fafafa] px-4 py-2 text-sm text-[#5f5f5f]">
                  Highlights: <span className="font-medium text-[#1f1f1f]">{highlights.length}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/app")}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#1f1f1f] transition duration-300 hover:border-black/20 hover:bg-[#f5f5f5]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Upload another file
            </button>
          </div>
        </Motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            whileHover={{ y: -4 }}
            className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_22px_55px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_26px_65px_rgba(0,0,0,0.08)] sm:p-8"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3 text-[#1f1f1f]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f2f2f2]">
                    <SectionIcon type="summary" />
                  </div>
                  <p className="text-sm uppercase tracking-[0.22em]">Summary</p>
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-[#1f1f1f] sm:text-4xl">AI notes</h2>
                <p className="mt-2 text-sm leading-6 text-[#5f5f5f]">
                  Clean, presentation-ready takeaways from your uploaded meeting.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-[#f3f3f3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f1f1f]">
                  {result.status}
                </span>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-black"
                >
                  <Clipboard className="h-4 w-4" strokeWidth={2} />
                  {copyLabel}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadText}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#1f1f1f] transition duration-300 hover:border-black/20 hover:bg-[#f5f5f5]"
                >
                  <Download className="h-4 w-4" strokeWidth={2} />
                  Download as text
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {!isHydrated ? (
                <>
                  <SkeletonBlock className="h-28" />
                  <SkeletonBlock className="h-28" />
                  <SkeletonBlock className="h-28" />
                </>
              ) : (
                summarySections.map((section, index) => (
                  <Motion.div
                    key={`${section.title}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.04 }}
                    className="rounded-[1.5rem] border border-black/8 bg-[#fafafa] p-6 transition-shadow duration-300 hover:shadow-[0_18px_40px_rgba(0,0,0,0.05)] sm:p-7"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-white text-[#1f1f1f]">
                        <SummaryCardIcon type={section.icon} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-[#1f1f1f]">{section.title}</p>
                        {section.items.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {section.items.map((item) => (
                              <p key={item} className="text-base leading-8 text-[#3f3f3f]">
                                {section.title === "Main Idea" ? item : `• ${item}`}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-base leading-8 text-[#5f5f5f]">
                            No items extracted for this section.
                          </p>
                        )}
                      </div>
                    </div>
                  </Motion.div>
                ))
              )}
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            whileHover={{ y: -4 }}
            className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_22px_55px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_26px_65px_rgba(0,0,0,0.08)] sm:p-8"
          >
            <div className="flex items-center gap-3 text-[#1f1f1f]">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-[#fafafa]">
                <SectionIcon type="highlights" />
              </div>
              <p className="text-sm uppercase tracking-[0.22em]">Important Points</p>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[#1f1f1f]">Key topics</h2>
            <p className="mt-2 text-sm leading-6 text-[#5f5f5f]">
              Fast-scan talking points you can present or export immediately.
            </p>

            <div className="mt-6 grid gap-3">
              {!isHydrated ? (
                <>
                  <SkeletonBlock className="h-16" />
                  <SkeletonBlock className="h-16" />
                  <SkeletonBlock className="h-16" />
                </>
              ) : highlights.length > 0 ? (
                highlights.map((highlight, index) => (
                  <Motion.div
                    key={`${highlight.text}-${index}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.14 + index * 0.05 }}
                    className="rounded-[1.4rem] border border-black/8 bg-[#fafafa] px-4 py-4 text-sm leading-6 text-[#3f3f3f] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#1f1f1f]">
                        <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                      </div>
                      <p>{highlight.text}</p>
                    </div>
                  </Motion.div>
                ))
              ) : (
                <div className="rounded-2xl border border-black/8 bg-[#fafafa] px-4 py-3 text-sm leading-6 text-[#5f5f5f]">
                  No highlights were returned for this transcript.
                </div>
              )}
            </div>
          </Motion.div>
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_22px_55px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_26px_65px_rgba(0,0,0,0.08)] sm:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 text-[#1f1f1f]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/8 bg-[#fafafa]">
                  <SectionIcon type="transcript" />
                </div>
                <p className="text-sm uppercase tracking-[0.22em]">Transcript</p>
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">Full transcript</h2>
              <p className="mt-2 text-sm leading-6 text-[#5f5f5f]">
                Expand to inspect the full conversation text captured from the audio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFullTranscript((current) => !current)}
              className="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-medium text-[#1f1f1f] transition duration-300 hover:border-black/20 hover:bg-[#f5f5f5]"
            >
              {showFullTranscript ? "Show less" : "Expand transcript"}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8b8b]"
                strokeWidth={1.8}
              />
              <input
                type="text"
                value={transcriptSearch}
                onChange={(event) => setTranscriptSearch(event.target.value)}
                placeholder="Search in transcript..."
                className="w-full rounded-[1.25rem] border border-black/10 bg-[#fafafa] py-3 pl-11 pr-4 text-sm text-[#1f1f1f] outline-none placeholder:text-[#9d9d9d] focus:border-black/20"
              />
            </div>
          </div>

          <AnimatePresence initial={false}>
            <Motion.div
              key={showFullTranscript ? "expanded" : "collapsed"}
              initial={{ opacity: 0, height: 120 }}
              animate={{ opacity: 1, height: showFullTranscript ? "auto" : 190 }}
              exit={{ opacity: 0, height: 120 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative mt-6 overflow-hidden rounded-[1.5rem] border border-black/8 bg-[#fafafa]"
            >
              <div
                ref={transcriptScrollRef}
                className={showFullTranscript ? "max-h-[28rem] overflow-y-auto p-5 sm:p-6" : "p-5 sm:p-6"}
              >
                {!isHydrated ? (
                  <div className="space-y-3">
                    <SkeletonBlock className="h-4 w-full" />
                    <SkeletonBlock className="h-4 w-11/12" />
                    <SkeletonBlock className="h-4 w-10/12" />
                    <SkeletonBlock className="h-4 w-full" />
                    <SkeletonBlock className="h-4 w-9/12" />
                  </div>
                ) : (
                  <p
                    className={[
                      "whitespace-pre-line text-sm leading-8 text-[#3f3f3f] sm:text-base",
                      showFullTranscript ? "" : "line-clamp-6",
                    ].join(" ")}
                  >
                    {renderHighlightedText(transcriptPreview, transcriptTerms)}
                  </p>
                )}
              </div>
              {showTranscriptFade && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fafafa] to-transparent" />
              )}
            </Motion.div>
          </AnimatePresence>
        </Motion.div>
      </div>
    </section>
  );
};

export default Result;
