import { motion as Motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  CloudUpload,
  FileAudio2,
  FileVideo2,
  LoaderCircle,
  Waves,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DEFAULT_MAX_AUDIO_FILE_SIZE_MB = 100;
const DEFAULT_MAX_VIDEO_FILE_SIZE_MB = 200;
const GUEST_MAX_AUDIO_FILE_SIZE_MB = 100;
const GUEST_MAX_VIDEO_FILE_SIZE_MB = 200;
const API_BASE_URL = import.meta.env.VITE_API_URL;
const UPLOAD_TOKEN = import.meta.env.VITE_UPLOAD_TOKEN;
const ALLOWED_FILE_TYPES = /\.(mp3|wav|m4a|mp4)$/i;
const VIDEO_FILE_TYPES = /\.mp4$/i;

const formatFileSize = (size) => {
  if (!size) return "0 MB";
  const mb = size / (1024 * 1024);
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
};

const UploadPanel = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState(null);
  const [uploadPhase, setUploadPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingStage, setLoadingStage] = useState("");
  const getMaxFileSizeMb = (targetFile) => {
    const isVideoFile = VIDEO_FILE_TYPES.test(targetFile?.name || "");

    if (isAuthenticated) {
      return isVideoFile ? DEFAULT_MAX_VIDEO_FILE_SIZE_MB : DEFAULT_MAX_AUDIO_FILE_SIZE_MB;
    }

    return isVideoFile ? GUEST_MAX_VIDEO_FILE_SIZE_MB : GUEST_MAX_AUDIO_FILE_SIZE_MB;
  };

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
      setErrorMessage("Please upload an MP3, WAV, M4A, or MP4 file.");
      return;
    }

    const maxFileSizeMb = getMaxFileSizeMb(nextFile);
    const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

    if (nextFile.size > maxFileSizeBytes) {
      setFile(null);
      setUploadPhase("idle");
      setProgress(0);
      setIsDragging(false);
      setLoadingStage("");
      setErrorMessage(
        `Please choose a file smaller than ${maxFileSizeMb} MB.`,
      );
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

    if (uploadPhase === "done") return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadPhase("processing");
    setProgress(10);
    setErrorMessage("");
    setLoadingStage("Uploading file...");

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          "x-upload-token": UPLOAD_TOKEN,
        },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setProgress(100);
      setUploadPhase("done");
      setLoadingStage("Redirecting to results...");

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
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while processing the file. Please try again.",
      );
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

  const uploadButtonLabel =
    uploadPhase === "processing"
      ? "Processing..."
      : uploadPhase === "done"
        ? "Opening Results"
        : "Upload & Summarize";

  const fileTypeLabel = file?.name?.toLowerCase().endsWith(".mp4") ? "Video upload" : "Audio upload";
  const FileIcon = fileTypeLabel === "Video upload" ? FileVideo2 : FileAudio2;
  const currentMaxFileSizeMb = getMaxFileSizeMb(file);

  return (
    <div className="flex w-full flex-col justify-center">
      <Motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_22px_55px_rgba(0,0,0,0.06)] sm:p-6"
      >
        <div
          className={[
            "relative overflow-hidden rounded-[1.9rem] border border-dashed p-5 text-center transition duration-300 sm:p-6",
            isDragging ? "border-black/20 bg-[#f5f5f5]" : "border-black/12 bg-[#fafafa]",
          ].join(" ")}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_58%)]" />

          <Motion.div
            className="mx-auto flex h-18 w-18 items-center justify-center rounded-[1.65rem] bg-white shadow-[0_14px_34px_rgba(0,0,0,0.05)]"
            animate={
              uploadPhase === "processing"
                ? { y: [0, -4, 0], scale: [1, 1.02, 1] }
                : isDragging
                  ? { scale: 1.06 }
                  : { y: 0, scale: 1 }
            }
            transition={{ duration: 1.8, repeat: uploadPhase === "processing" ? Infinity : 0, ease: "easeInOut" }}
          >
            {uploadPhase === "processing" ? (
              <Motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <LoaderCircle className="h-8 w-8 text-[#1f1f1f]" strokeWidth={1.8} />
              </Motion.div>
            ) : uploadPhase === "done" ? (
              <CheckCircle2 className="h-8 w-8 text-[#1f1f1f]" strokeWidth={1.8} />
            ) : (
              <CloudUpload className="h-8 w-8 text-[#1f1f1f]" strokeWidth={1.8} />
            )}
          </Motion.div>

          <p className="mt-5 text-[1.75rem] font-semibold text-[#1f1f1f] sm:text-[1.9rem]">
            {isDragging ? "Drop your meeting file here" : "Drag and drop your file"}
          </p>
          <p className="mx-auto mt-2.5 max-w-2xl text-sm leading-6 text-[#5f5f5f] sm:text-[0.98rem]">
            Upload an MP3, WAV, M4A, or MP4 recording. Audio files support up to 100 MB and video files support up to
            200 MB. {isAuthenticated ? "Each signed-in user can keep up to 3 AssemblyAI upload sessions." : ""} Once
            selected, Scribo will process the file and move you straight into the result view.
          </p>

          <div className="mx-auto mt-5 max-w-xl">
            <input
              type="file"
              accept=".mp3,.wav,.m4a,.mp4,audio/*,video/mp4"
              onChange={handleFileChange}
              className="block w-full rounded-[1.2rem] border border-black/10 bg-white px-4 py-3 text-sm text-[#1f1f1f] file:mr-4 file:rounded-full file:border-0 file:bg-[#1f1f1f] file:px-5 file:py-2.5 file:font-medium file:text-white"
            />
          </div>

          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2.5 text-sm text-[#5f5f5f]">
            <span className="rounded-full border border-black/8 bg-white px-3 py-1.5">
              {file ? fileTypeLabel : "Audio or video"}
            </span>
            <span className="rounded-full border border-black/8 bg-white px-3 py-1.5">
              {file ? formatFileSize(file.size) : `Up to ${currentMaxFileSizeMb} MB`}
            </span>
            <span className="rounded-full border border-black/8 bg-white px-3 py-1.5">
              AI summary + transcript
            </span>
            {isAuthenticated && (
              <span className="rounded-full border border-black/8 bg-[#1f1f1f] px-3 py-1.5 text-white">
                Signed in
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="mx-auto mt-4 max-w-2xl rounded-2xl border border-red-400/18 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="mx-auto mt-5 max-w-2xl rounded-[1.5rem] border border-black/8 bg-white px-5 py-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a7a7a]">Status</p>
                <p className="mt-1 truncate text-base font-medium text-[#1f1f1f]">
                  {file ? loadingStage || "Ready to process" : "Waiting for upload"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fafafa]">
                {uploadPhase === "processing" ? (
                  <Waves className="h-5 w-5 text-[#1f1f1f]" strokeWidth={1.8} />
                ) : (
                  <FileIcon className="h-5 w-5 text-[#1f1f1f]" strokeWidth={1.8} />
                )}
              </div>
            </div>

            <div className="mt-3.5 h-2 overflow-hidden rounded-full bg-black/8">
              <Motion.div
                className="h-full rounded-full bg-[#1f1f1f]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-sm text-[#5f5f5f]">
              <span>{file ? file.name : "No file selected yet"}</span>
              <span>{progress}%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUploadAction}
            disabled={!file || uploadPhase === "processing"}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
          >
            {uploadButtonLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </Motion.div>
    </div>
  );
};

export default UploadPanel;
