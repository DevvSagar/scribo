import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import net from "net";
import dns from "dns/promises";
import { fileURLToPath } from "url";
import { promises as fsPromises } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const PORT = Number.parseInt(process.env.PORT || "5001", 10);
const FRONTEND_URL = process.env.FRONTEND_URL;
const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;
const ASSEMBLY_BASE_URL = "https://api.assemblyai.com/v2";
const POLL_INTERVAL_MS = 3000;
const MAX_AUDIO_UPLOAD_SIZE_MB = Number.parseInt(process.env.MAX_AUDIO_UPLOAD_SIZE_MB || "250", 10);
const MAX_VIDEO_UPLOAD_SIZE_MB = Number.parseInt(process.env.MAX_VIDEO_UPLOAD_SIZE_MB || "100", 10);
const MAX_UPLOAD_SIZE_BYTES = Math.max(MAX_AUDIO_UPLOAD_SIZE_MB, MAX_VIDEO_UPLOAD_SIZE_MB) * 1024 * 1024;
const ALLOWED_MEDIA_EXTENSIONS = /\.(mp3|wav|m4a|mp4)$/i;
const BLOCKED_EXTENSIONS = /\.(exe|bat|cmd|sh|js|php|py|jar|msi|dll|com|scr)$/i;

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const requiredEnvVars = ["ASSEMBLY_API_KEY"];
if (isProduction) {
  requiredEnvVars.push("FRONTEND_URL", "PORT");
}

const missingEnvVars = requiredEnvVars.filter((key) => {
  const value = process.env[key];
  return typeof value !== "string" || value.trim().length === 0;
});

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
}

const allowedMimeTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "video/mp4",
]);

const isVideoUpload = (file) => file.mimetype === "video/mp4" || /\.mp4$/i.test(file.originalname);
const getMaxAllowedBytes = (file) =>
  (isVideoUpload(file) ? MAX_VIDEO_UPLOAD_SIZE_MB : MAX_AUDIO_UPLOAD_SIZE_MB) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (BLOCKED_EXTENSIONS.test(file.originalname)) {
      cb(new Error("Unsupported file type."));
      return;
    }

    const isAllowedMime = allowedMimeTypes.has(file.mimetype);
    const isAllowedExtension = ALLOWED_MEDIA_EXTENSIONS.test(file.originalname);

    if (isAllowedMime && isAllowedExtension) {
      cb(null, true);
      return;
    }

    cb(new Error("Invalid file type. Only MP3, WAV, M4A, and MP4 files are allowed."));
  },
});

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const logInfo = (message) => {
  console.log(`[server] ${message}`);
};

const logError = (message, metadata = {}) => {
  console.error(`[server] ${message}`, metadata);
};

const assemblyClient = axios.create({
  baseURL: ASSEMBLY_BASE_URL,
  timeout: 30000,
  headers: {
    authorization: ASSEMBLY_API_KEY,
    "content-type": "application/json",
  },
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

const privateIpv4Patterns = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^0\./,
];

const isPrivateIp = (address) => {
  if (!net.isIP(address)) return false;

  if (net.isIPv4(address)) {
    return privateIpv4Patterns.some((pattern) => pattern.test(address));
  }

  const normalized = address.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
};

const assertSafeExternalUrl = async (value) => {
  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("Invalid external URL received.");
  }

  if (!["https:"].includes(parsedUrl.protocol)) {
    throw new Error("Blocked non-HTTPS external URL.");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  if (["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error("Blocked localhost external URL.");
  }

  if (net.isIP(hostname) && isPrivateIp(hostname)) {
    throw new Error("Blocked private IP external URL.");
  }

  const lookupResults = await dns.lookup(hostname, { all: true });
  if (lookupResults.some((result) => isPrivateIp(result.address))) {
    throw new Error("Blocked private network destination.");
  }

  return parsedUrl.toString();
};

const sanitizeAssemblyMessage = (value) => {
  if (typeof value !== "string") return "Unable to process the uploaded audio right now.";
  return value.replace(/[\r\n\t]+/g, " ").slice(0, 200);
};

const createHttpError = (statusCode, publicMessage) => {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
};

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many upload requests. Please wait a few minutes and try again.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down and try again shortly.",
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin && !isProduction) {
        callback(null, true);
        return;
      }

      if (origin && origin === FRONTEND_URL) {
        callback(null, true);
        return;
      }

      callback(createHttpError(403, "Origin not allowed by CORS policy."));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(mongoSanitize());
app.use("/api", apiLimiter);
app.use("/upload", uploadLimiter);

app.get("/api/test", (_req, res) => {
  res.status(200).json({ message: "Backend Ready" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    environment: NODE_ENV,
    port: PORT,
    frontendConfigured: Boolean(FRONTEND_URL),
    assemblyConfigured: Boolean(ASSEMBLY_API_KEY),
    uploadLimits: {
      audioMb: MAX_AUDIO_UPLOAD_SIZE_MB,
      videoMb: MAX_VIDEO_UPLOAD_SIZE_MB,
    },
  });
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const uploadFileToAssembly = async (filePath) => {
  logInfo("Uploading audio file to AssemblyAI.");
  const stream = fs.createReadStream(filePath);

  try {
    const response = await assemblyClient.post("/upload", stream, {
      headers: {
        authorization: ASSEMBLY_API_KEY,
        "content-type": "application/octet-stream",
      },
    });

    return assertSafeExternalUrl(response.data.upload_url);
  } finally {
    stream.destroy();
  }
};

const requestTranscript = async (audioUrl) => {
  logInfo("Requesting transcription from AssemblyAI.");

  const response = await assemblyClient.post("/transcript", {
    audio_url: audioUrl,
    speech_models: ["universal-2"],
    punctuate: true,
    format_text: true,
    summarization: true,
    summary_model: "informative",
    summary_type: "bullets",
    auto_highlights: true,
  });

  if (typeof response.data?.id !== "string" || response.data.id.length === 0) {
    throw createHttpError(502, "Failed to create transcription job.");
  }

  return response.data.id;
};

const pollTranscriptResult = async (transcriptId) => {
  let attempts = 0;

  while (attempts < 120) {
    attempts += 1;

    const response = await assemblyClient.get(`/transcript/${encodeURIComponent(transcriptId)}`);
    const transcript = response.data;

    if (transcript.status === "completed") {
      logInfo("Transcript processing completed.");
      return transcript;
    }

    if (transcript.status === "error") {
      throw createHttpError(
        502,
        sanitizeAssemblyMessage(transcript.error || "Transcription failed on the provider side."),
      );
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw createHttpError(504, "Transcription timed out. Please try again.");
};

app.post("/upload", upload.single("file"), async (req, res, next) => {
  let localFilePath;

  try {
    if (!ASSEMBLY_API_KEY) {
      throw createHttpError(500, "Server configuration error.");
    }

    if (!req.is("multipart/form-data")) {
      throw createHttpError(415, "Unsupported content type.");
    }

    if (!req.file) {
      throw createHttpError(400, 'No file uploaded. Attach an audio file using the "file" field.');
    }

    if (typeof req.file.originalname !== "string" || req.file.originalname.length > 255) {
      throw createHttpError(400, "Invalid uploaded file name.");
    }

    if (!allowedMimeTypes.has(req.file.mimetype) || !ALLOWED_MEDIA_EXTENSIONS.test(req.file.originalname)) {
      throw createHttpError(400, "Invalid uploaded media file.");
    }

    if (req.file.size > getMaxAllowedBytes(req.file)) {
      const maxSizeLabel = isVideoUpload(req.file) ? MAX_VIDEO_UPLOAD_SIZE_MB : MAX_AUDIO_UPLOAD_SIZE_MB;
      throw createHttpError(400, `File too large. Maximum upload size is ${maxSizeLabel} MB.`);
    }

    localFilePath = req.file.path;

    const uploadUrl = await uploadFileToAssembly(localFilePath);
    const transcriptId = await requestTranscript(uploadUrl);
    const transcriptResult = await pollTranscriptResult(transcriptId);

    res.status(200).json({
      transcript: typeof transcriptResult.text === "string" ? transcriptResult.text : "",
      summary: typeof transcriptResult.summary === "string" ? transcriptResult.summary : "",
      highlights: Array.isArray(transcriptResult.auto_highlights_result?.results)
        ? transcriptResult.auto_highlights_result.results
        : [],
      status: transcriptResult.status,
    });
  } catch (error) {
    next(error);
  } finally {
    if (localFilePath) {
      try {
        await fsPromises.unlink(localFilePath);
      } catch (cleanupError) {
        logError("Failed to delete temporary upload.", { message: cleanupError.message });
      }
    }
  }
});

app.use((error, _req, res, _next) => {
  const statusCode =
    error.statusCode ||
    (error instanceof multer.MulterError ? 400 : 500);

  if (error.response) {
    logError("Upstream API request failed.", {
      status: error.response.status,
      provider: "AssemblyAI",
    });
  } else {
    logError("Request failed.", { statusCode, message: error.message });
  }

  const publicMessage =
    statusCode >= 500
      ? "Unable to complete the request right now. Please try again."
      : error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
        ? `File too large. Maximum upload size is ${Math.max(MAX_AUDIO_UPLOAD_SIZE_MB, MAX_VIDEO_UPLOAD_SIZE_MB)} MB.`
        : error.publicMessage || error.message || "Request failed.";

  res.status(statusCode).json({ error: publicMessage });
});

app.listen(PORT, () => {
  logInfo(
    `Server running on port ${PORT} (${NODE_ENV}). Config: frontendConfigured=${Boolean(
      FRONTEND_URL,
    )}, assemblyConfigured=${Boolean(ASSEMBLY_API_KEY)}, audioLimitMb=${MAX_AUDIO_UPLOAD_SIZE_MB}, videoLimitMb=${MAX_VIDEO_UPLOAD_SIZE_MB}`,
  );
});
