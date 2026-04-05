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
        className: "bg-[#f1f1f1] text-[#5f5f5f]",
      }
    : uploadPhase === "processing"
      ? {
          label: loadingStage || "Processing",
          className: "bg-[#1f1f1f] text-white",
        }
      : uploadPhase === "done"
        ? {
            label: "Ready",
            className: "bg-[#1f1f1f] text-white",
          }
        : file.size > LARGE_FILE_SIZE
          ? {
              label: "Large file",
              className: "bg-[#ebebeb] text-[#4f4f4f]",
            }
          : {
              label: "Selected",
              className: "bg-[#1f1f1f] text-white",
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
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.03),transparent_60%)]" />

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
            <span className="inline-flex min-h-14 items-center rounded-full border border-black/8 bg-[#fafafa] px-6 py-3 text-base font-medium text-[#1f1f1f] shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:text-lg">
              Built for teams, founders, and client calls
            </span>
          </motion.div>

          <motion.h1
            className="mt-5 max-w-4xl text-[2.9rem] font-bold leading-[0.96] text-[#1f1f1f] sm:text-[3.7rem] lg:mt-6 lg:max-w-none lg:text-[4.15rem] xl:text-[4.75rem] 2xl:text-[5.2rem]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
          >
            Turn meeting recordings into
            <span className="block text-[#4f4f4f]">
              smart notes and action items
            </span>
          </motion.h1>

          <motion.p
            className="mt-4 max-w-2xl text-base leading-7 text-[#5f5f5f] lg:max-w-[38rem] xl:text-[1.05rem]"
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
            <button className="rounded-full border border-black/10 bg-white px-8 py-3.5 text-base font-medium text-[#1f1f1f] transition duration-300 hover:border-black/20 hover:bg-[#f5f5f5]">
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
                className="rounded-[1.4rem] border border-black/8 bg-[#fafafa] p-4 transition-shadow duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)] xl:p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f0f0] text-[#1f1f1f]">
                  {stat.icon}
                </div>
                <p className="text-[1.9rem] font-semibold text-[#1f1f1f] xl:text-[2.2rem]">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-sm leading-5 text-[#5f5f5f]">{stat.label}</p>
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
            className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-black/4 blur-3xl"
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
                    borderColor: "rgba(31, 31, 31, 0.18)",
                    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.08)",
                  }
                : file
                  ? { y: [0, -4, 0] }
                  : { y: 0 }
            }
            transition={{ duration: 0.45, ease: "easeOut" }}
            whileHover={{
              y: -4,
              boxShadow: "0 20px 55px rgba(0, 0, 0, 0.3)",
              borderColor: "rgba(31, 31, 31, 0.12)",
            }}
            className="flex w-full max-w-[640px] flex-col rounded-[2.2rem] border border-black/8 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.07)] sm:p-6 xl:p-7"
          >
            <motion.div
              animate={
                file
                  ? {
                      borderColor: "rgba(31, 31, 31, 0.14)",
                      boxShadow: "0 0 0 1px rgba(31, 31, 31, 0.04)",
                    }
                  : {
                      borderColor: "rgba(0, 0, 0, 0.08)",
                      boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
                    }
              }
              transition={{ duration: 0.3 }}
              className="flex min-h-[82px] items-center justify-between gap-4 rounded-[1.5rem] border border-black/8 bg-[#fafafa] px-5 py-3 xl:px-6"
            >
              <div>
                <p className="text-sm text-[#7a7a7a] xl:text-base">Current upload</p>
                <p className="text-base font-medium text-[#1f1f1f] xl:text-xl">
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
                      borderColor: "rgba(31, 31, 31, 0.2)",
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    }
                  : file
                  ? {
                      borderColor: "rgba(31, 31, 31, 0.14)",
                      backgroundColor: "rgba(0, 0, 0, 0.015)",
                    }
                  : {
                      borderColor: "rgba(31, 31, 31, 0.12)",
                      backgroundColor: "rgba(0, 0, 0, 0.01)",
                    }
              }
              transition={{ duration: 0.3 }}
              className="mt-6 flex min-h-[300px] flex-col justify-center rounded-[1.8rem] border border-dashed border-black/12 bg-[#fafafa] p-5 text-center xl:min-h-[330px] xl:p-6"
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
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-[#f0f0f0] text-3xl text-[#1f1f1f] xl:h-18 xl:w-18"
              >
                ↑
              </motion.div>

              <p className="mt-4 text-xl font-semibold text-[#1f1f1f] xl:text-2xl">
                {isDragging ? "Drop your file here" : "Drop audio or choose a file"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5f5f5f] xl:text-base">
                {isDragging
                  ? "Release to attach your recording and start the flow."
                  : "Supports MP3, WAV, M4A and long-form call recordings."}
              </p>

              <input
                type="file"
                className="mt-5 block w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3.5 text-sm text-[#1f1f1f] file:mr-4 file:rounded-full file:border-0 file:bg-[#1f1f1f] file:px-5 file:py-2.5 file:font-medium file:text-white xl:text-base"
                onChange={handleFileChange}
              />

              {(uploadPhase === "processing" || uploadPhase === "done") && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-black/8">
                    <motion.div
                      className="h-full rounded-full bg-[#1f1f1f]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[#5f5f5f]">
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
                className="mt-4 w-full rounded-[1.25rem] bg-[#1f1f1f] py-3.5 text-base font-semibold text-white shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:bg-black disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                disabled={!file || uploadPhase === "processing"}
                onClick={handleUploadAction}
              >
                {uploadButtonLabel}
              </motion.button>
            </motion.div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:gap-5">
              <div className="flex min-h-[118px] flex-col justify-center rounded-[1.5rem] border border-black/8 bg-[#fafafa] p-5">
                <p className="text-sm text-[#7a7a7a] xl:text-base">AI output</p>
                <p className="mt-3 text-lg font-semibold text-[#1f1f1f] xl:text-xl">Summary, tasks, highlights</p>
              </div>
              <div className="flex min-h-[118px] flex-col justify-center rounded-[1.5rem] border border-black/8 bg-[#fafafa] p-5">
                <p className="text-sm text-[#7a7a7a] xl:text-base">Export options</p>
                <p className="mt-3 text-lg font-semibold text-[#1f1f1f] xl:text-xl">Markdown, PDF, Notion</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Home;
