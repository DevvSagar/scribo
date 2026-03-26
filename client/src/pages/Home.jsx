import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const stats = [
  {
    value: "2 min",
    label: "Average summary time",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.8v4.7l3 1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "98%",
    label: "Key point coverage",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8">
        <path d="M12 3.8l6.6 2.4v5.2c0 4.2-2.6 7.9-6.6 8.8c-4-1-6.6-4.6-6.6-8.8V6.2L12 3.8Z" strokeLinejoin="round" />
        <path d="m9.4 12.2l1.7 1.7l3.6-3.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "24/7",
    label: "Upload availability",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 stroke-current" fill="none" strokeWidth="1.8">
        <path d="M7.5 17.2h8.8a3.4 3.4 0 0 0 .6-6.7A5.4 5.4 0 0 0 6.5 9.1a3.2 3.2 0 0 0 1 6.1Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const LARGE_FILE_SIZE = 25 * 1024 * 1024;
const API_BASE_URL = import.meta.env.VITE_API_URL;
const ALLOWED_FILE_TYPES = /\.(mp3|wav|m4a|mp4)$/i;

const Home = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploadPhase, setUploadPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingStage, setLoadingStage] = useState("");

  const uploadStatus = !file
    ? {
        label: "Waiting",
        className: "bg-slate-700/40 text-slate-300",
      }
    : uploadPhase === "processing"
      ? {
          label: loadingStage || "Processing",
          className: "bg-blue-500/15 text-blue-200",
        }
      : uploadPhase === "done"
        ? {
            label: "Ready",
            className: "bg-emerald-500/15 text-emerald-300",
          }
        : file.size > LARGE_FILE_SIZE
          ? {
              label: "Large file",
              className: "bg-amber-500/15 text-amber-300",
            }
          : {
              label: "Selected",
              className: "bg-emerald-500/15 text-emerald-300",
            };

  const uploadButtonLabel =
    uploadPhase === "processing"
      ? "Processing..."
      : uploadPhase === "done"
        ? "View Results"
      : "Upload & Summarize";

  const resetUploadState = () => {
    setFile(null);
    setUploadPhase("idle");
    setProgress(0);
    setIsDragging(false);
    setErrorMessage("");
    setLoadingStage("");
  };

  const applyNewFile = (nextFile) => {
    if (!nextFile) {
      resetUploadState();
      return;
    }

    if (!ALLOWED_FILE_TYPES.test(nextFile.name)) {
      setFile(null);
      setUploadPhase("idle");
      setProgress(0);
      setIsDragging(false);
      setLoadingStage("");
      setErrorMessage("Something went wrong, try again with an MP3, WAV, M4A, or MP4 file.");
      return;
    }

    setFile(nextFile);
    setUploadPhase("idle");
    setProgress(0);
    setIsDragging(false);
    setErrorMessage("");
    setLoadingStage("");
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null;
    applyNewFile(nextFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const nextFile = event.dataTransfer.files?.[0] ?? null;
    applyNewFile(nextFile);
  };

  const handleUploadAction = async () => {
    if (!file || uploadPhase === "processing") return;

    if (!API_BASE_URL) {
      setErrorMessage("App configuration error. Missing API URL.");
      return;
    }

    if (uploadPhase === "done") {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadPhase("processing");
    setProgress(10);
    setErrorMessage("");
    setLoadingStage("Uploading file...");

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setProgress(100);
      setUploadPhase("done");
      setLoadingStage("View Results");

      const payload = {
        result: data,
        fileName: file.name,
      };

      window.setTimeout(() => {
        resetUploadState();
        navigate("/result", { state: payload });
      }, 350);
    } catch (error) {
      setUploadPhase("idle");
      setProgress(0);
      setLoadingStage("");
      setErrorMessage("Something went wrong, try again.");
    }
  };

  useEffect(() => {
    if (!file) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [file]);

  useEffect(() => {
    if (uploadPhase !== "processing") return undefined;

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        return current + 6;
      });
    }, 280);

    return () => {
      window.clearInterval(interval);
    };
  }, [uploadPhase]);

  useEffect(() => {
    if (uploadPhase !== "processing") return;

    if (progress < 30) {
      setLoadingStage("Uploading file...");
      return;
    }

    if (progress < 72) {
      setLoadingStage("Transcribing audio...");
      return;
    }

    setLoadingStage("Generating summary...");
  }, [progress, uploadPhase]);

  return (
    <section className="relative overflow-hidden px-5 py-10 sm:px-8 lg:px-10 lg:py-12 xl:px-12 xl:py-16 2xl:px-16">
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_60%)]" />

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-10 md:gap-12 lg:grid-cols-12 xl:gap-14 2xl:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="col-span-1 flex min-w-0 flex-col items-center pt-2 text-center lg:col-span-6 lg:items-start lg:pt-3 lg:text-left xl:col-span-7 xl:pt-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex w-full max-w-3xl flex-col items-center lg:max-w-none lg:items-start"
          >
            <span className="inline-flex min-h-14 items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-6 py-3 text-base font-medium text-blue-100 shadow-[0_0_0_1px_rgba(59,130,246,0.08)] sm:text-lg">
              Built for teams, founders, and client calls
            </span>
          </motion.div>

          <motion.h1
            className="mt-5 max-w-4xl text-[2.9rem] font-bold leading-[0.96] text-white sm:text-[3.7rem] lg:mt-6 lg:max-w-none lg:text-[4.15rem] xl:text-[4.75rem] 2xl:text-[5.2rem]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
          >
            Turn meeting recordings into
            <span className="block bg-gradient-to-r from-blue-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              smart notes and action items
            </span>
          </motion.h1>

          <motion.p
            className="mt-4 max-w-2xl text-base leading-7 text-slate-300 lg:max-w-[38rem] xl:text-[1.05rem]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Upload your audio, extract key decisions, and deliver polished summaries
            your team can scan in seconds.
          </motion.p>

          <motion.div
            className="mt-6 flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:justify-center lg:max-w-none lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <button className="rounded-full border border-white/10 bg-transparent px-8 py-3.5 text-base font-medium text-slate-300 transition duration-300 hover:border-blue-400 hover:text-white">
              Watch demo
            </button>
          </motion.div>

          <div className="mt-7 grid w-full max-w-3xl gap-3.5 sm:grid-cols-3 lg:max-w-[44rem] xl:gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 backdrop-blur transition-shadow duration-300 hover:border-blue-400/25 hover:shadow-lg hover:shadow-blue-950/25 xl:p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-sky-300">
                  {stat.icon}
                </div>
                <p className="bg-gradient-to-r from-blue-300 to-sky-400 bg-clip-text text-[1.9rem] font-semibold text-transparent xl:text-[2.2rem]">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-sm leading-5 text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative col-span-1 mx-auto flex w-full max-w-[620px] justify-center lg:col-span-6 lg:mx-0 lg:w-full lg:max-w-none lg:justify-self-center xl:col-span-5 xl:max-w-[680px]"
        >
          <motion.div
            className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-blue-500/10 blur-3xl"
            animate={{
              opacity: isDragging ? 0.45 : [0.22, 0.34, 0.22],
              scale: isDragging ? 1.03 : [1, 1.04, 1],
            }}
            transition={{
              duration: isDragging ? 0.25 : 4.2,
              repeat: isDragging ? 0 : Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            animate={
              isDragging
                ? {
                    y: -6,
                    borderColor: "rgba(96, 165, 250, 0.4)",
                    boxShadow: "0 18px 50px rgba(29, 78, 216, 0.22)",
                  }
                : file
                  ? { y: [0, -4, 0] }
                  : { y: 0 }
            }
            transition={{ duration: 0.45, ease: "easeOut" }}
            whileHover={{
              y: -4,
              boxShadow: "0 20px 55px rgba(15, 23, 42, 0.55)",
              borderColor: "rgba(96, 165, 250, 0.22)",
            }}
            className="flex w-full max-w-[640px] flex-col rounded-[2.2rem] border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-blue-950/40 backdrop-blur sm:p-6 xl:p-7"
          >
            <motion.div
              animate={
                file
                  ? {
                      borderColor: "rgba(96, 165, 250, 0.35)",
                      boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.12)",
                    }
                  : {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
                    }
              }
              transition={{ duration: 0.3 }}
              className="flex min-h-[82px] items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-3 xl:px-6"
            >
              <div>
                <p className="text-sm text-slate-400 xl:text-base">Current upload</p>
                <p className="text-base font-medium text-white xl:text-xl">
                  {file ? file.name : "No file selected"}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium xl:text-sm ${uploadStatus.className}`}>
                {uploadStatus.label}
              </span>
            </motion.div>

            <motion.div
              animate={
                isDragging
                  ? {
                      borderColor: "rgba(96, 165, 250, 0.75)",
                      backgroundColor: "rgba(59, 130, 246, 0.14)",
                    }
                  : file
                  ? {
                      borderColor: "rgba(96, 165, 250, 0.55)",
                      backgroundColor: "rgba(59, 130, 246, 0.09)",
                    }
                  : {
                      borderColor: "rgba(96, 165, 250, 0.3)",
                      backgroundColor: "rgba(59, 130, 246, 0.05)",
                    }
              }
              transition={{ duration: 0.3 }}
              className="mt-6 flex min-h-[300px] flex-col justify-center rounded-[1.8rem] border border-dashed border-blue-400/30 bg-blue-500/5 p-5 text-center xl:min-h-[330px] xl:p-6"
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <motion.div
                animate={
                  isDragging
                    ? { scale: 1.12, rotate: -8 }
                    : file
                      ? { scale: [1, 1.08, 1], rotate: [0, -6, 0] }
                      : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-blue-500/25 to-violet-500/25 text-3xl text-sky-300 xl:h-18 xl:w-18"
              >
                ↑
              </motion.div>

              <p className="mt-4 text-xl font-semibold text-white xl:text-2xl">
                {isDragging ? "Drop your file here" : "Drop audio or choose a file"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400 xl:text-base">
                {isDragging
                  ? "Release to attach your recording and start the flow."
                  : "Supports MP3, WAV, M4A and long-form call recordings."}
              </p>

              <input
                type="file"
                className="mt-5 block w-full rounded-[1.25rem] border border-white/10 bg-slate-900 px-4 py-3.5 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-5 file:py-2.5 file:font-medium file:text-white xl:text-base"
                onChange={handleFileChange}
              />

              {(uploadPhase === "processing" || uploadPhase === "done") && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{uploadPhase === "done" ? "Summary ready to view" : loadingStage}</span>
                    <span>{progress}%</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </p>
              )}

              <motion.button
                animate={file ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mt-4 w-full rounded-[1.25rem] bg-gradient-to-r from-blue-500 via-sky-500 to-violet-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-950/40 transition duration-300 hover:-translate-y-1 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                disabled={!file || uploadPhase === "processing"}
                onClick={handleUploadAction}
              >
                {uploadButtonLabel}
              </motion.button>
            </motion.div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:gap-5">
              <div className="flex min-h-[118px] flex-col justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400 xl:text-base">AI output</p>
                <p className="mt-3 text-lg font-semibold text-white xl:text-xl">Summary, tasks, highlights</p>
              </div>
              <div className="flex min-h-[118px] flex-col justify-center rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400 xl:text-base">Export options</p>
                <p className="mt-3 text-lg font-semibold text-white xl:text-xl">Markdown, PDF, Notion</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Home;
