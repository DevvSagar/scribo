import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import net from "net";
import dns from "dns/promises";
import { fileURLToPath } from "url";
import { promises as fsPromises } from "fs";
import contactRoutes from "./routes/contactRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const PORT = Number.parseInt(process.env.PORT || "5001", 10);
const FRONTEND_URL = process.env.FRONTEND_URL;
const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;
const UPLOAD_ACCESS_TOKEN = process.env.UPLOAD_ACCESS_TOKEN;
const ASSEMBLY_BASE_URL = "https://api.assemblyai.com/v2";
const POLL_INTERVAL_MS = 3000;
const MAX_AUDIO_UPLOAD_SIZE_MB = Number.parseInt(
  process.env.MAX_AUDIO_UPLOAD_SIZE_MB || "250",
  10,
);
const MAX_VIDEO_UPLOAD_SIZE_MB = Number.parseInt(
  process.env.MAX_VIDEO_UPLOAD_SIZE_MB || "100",
  10,
);
const MAX_UPLOAD_SIZE_BYTES =
  Math.max(MAX_AUDIO_UPLOAD_SIZE_MB, MAX_VIDEO_UPLOAD_SIZE_MB) * 1024 * 1024;
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

if (!UPLOAD_ACCESS_TOKEN) {
  console.warn("UPLOAD_ACCESS_TOKEN is not set");
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

const isVideoUpload = (file) =>
  file.mimetype === "video/mp4" || /\.mp4$/i.test(file.originalname);
const getMaxAllowedBytes = (file) =>
  (isVideoUpload(file) ? MAX_VIDEO_UPLOAD_SIZE_MB : MAX_AUDIO_UPLOAD_SIZE_MB) *
  1024 *
  1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "-");
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

    cb(
      new Error(
        "Invalid file type. Only MP3, WAV, M4A, and MP4 files are allowed.",
      ),
    );
  },
});

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", isProduction ? 1 : false);

const logInfo = (message) => {
  console.log(`[server] ${message}`);
};

const logError = (message, metadata = {}) => {
  console.error(`[server] ${message}`, metadata);
};

const sanitizeObject = (value) => {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach(sanitizeObject);
    return;
  }

  for (const key of Object.keys(value)) {
    const shouldRemove = key.startsWith("$") || key.includes(".");
    if (shouldRemove) {
      delete value[key];
      continue;
    }

    sanitizeObject(value[key]);
  }
};

const sanitizeRequest = (req, _res, next) => {
  // Express 5 exposes req.query as a getter-only property, so sanitize in place.
  for (const key of ["body", "params", "query"]) {
    if (req[key] && typeof req[key] === "object") {
      sanitizeObject(req[key]);
    }
  }

  next();
};

const requireUploadAccess = (req, res, next) => {
  const providedToken = req.get("x-upload-token");

  if (
    !providedToken ||
    !UPLOAD_ACCESS_TOKEN ||
    providedToken !== UPLOAD_ACCESS_TOKEN
  ) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  next();
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
  if (typeof value !== "string")
    return "Unable to process the uploaded audio right now.";
  return value.replace(/[\r\n\t]+/g, " ").slice(0, 200);
};

const normalizeText = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

const splitSummaryItems = (summary) =>
  (summary || "")
    .split(/\n+/)
    .map((item) => normalizeText(item.replace(/^[-*•\d.)\s]+/, "")))
    .filter((item) => item.length > 0);

const cleanSummary = (summary) => {
  const seen = new Set();
  const cleanedItems = splitSummaryItems(summary)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return item.length > 12;
    })
    .slice(0, 8);

  if (cleanedItems.length === 0) {
    return normalizeText(summary);
  }

  return cleanedItems.map((item) => `- ${item}`).join("\n");
};

const weakHighlightTerms = new Set([
  "thing",
  "things",
  "minute",
  "minutes",
  "level",
  "okay",
  "yeah",
  "really",
  "basically",
  "actually",
]);

const isUsefulHighlight = (text) => {
  const normalized = normalizeText(text).toLowerCase();
  if (normalized.length < 4) return false;
  if (weakHighlightTerms.has(normalized)) return false;
  if (/^\d+$/.test(normalized)) return false;
  return normalized.split(/\s+/).length <= 8;
};

const getHighlightScore = (highlight) => {
  const rank = Number(highlight.rank) || 0;
  const count = Number(highlight.count) || 0;
  const timestamps = Array.isArray(highlight.timestamps)
    ? highlight.timestamps.length
    : 0;
  return rank + count * 2 + timestamps;
};

const buildImportantPoints = (highlights = []) => {
  const seen = new Set();

  return highlights
    .filter((highlight) => isUsefulHighlight(highlight?.text))
    .sort((a, b) => getHighlightScore(b) - getHighlightScore(a))
    .map((highlight) => normalizeText(highlight.text))
    .filter((text) => {
      const key = text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
};

const buildActionItems = (summary) => {
  const actionPattern =
    /\b(need|needs|should|next|follow|prepare|review|track|improve|add|keep|use|limit|focus|create|share|send|schedule|decide|align|test|ship)\b/i;

  return splitSummaryItems(summary)
    .filter((item) => actionPattern.test(item))
    .map((item) =>
      item.replace(/^(next steps? are to|next step is to)\s+/i, ""),
    )
    .slice(0, 5);
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
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-upload-token"],
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(sanitizeRequest);
app.use("/api", apiLimiter);
app.use("/api", contactRoutes);

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

const detectMediaTypeFromFile = async (filePath) => {
  const fileHandle = await fsPromises.open(filePath, "r");

  try {
    const buffer = Buffer.alloc(64);
    const { bytesRead } = await fileHandle.read(buffer, 0, buffer.length, 0);
    const header = buffer.subarray(0, bytesRead);
    const extension = path.extname(filePath).toLowerCase();

    if (
      header.length >= 12 &&
      header.subarray(0, 4).toString("ascii") === "RIFF" &&
      header.subarray(8, 12).toString("ascii") === "WAVE"
    ) {
      return ".wav";
    }

    if (
      header.length >= 3 &&
      header.subarray(0, 3).toString("ascii") === "ID3"
    ) {
      return ".mp3";
    }

    if (
      header.length >= 2 &&
      header[0] === 0xff &&
      (header[1] & 0xe0) === 0xe0
    ) {
      return ".mp3";
    }

    if (
      header.length >= 12 &&
      header.subarray(4, 8).toString("ascii") === "ftyp"
    ) {
      const brand = header.subarray(8, 12).toString("ascii");
      const m4aBrands = new Set(["M4A ", "M4B ", "isom", "mp41", "mp42", "qt  "]);
      if (extension === ".m4a" && m4aBrands.has(brand)) {
        return ".m4a";
      }

      return ".mp4";
    }

    return null;
  } finally {
    await fileHandle.close();
  }
};

const assertUploadedFileSignature = async (file) => {
  const detectedExtension = await detectMediaTypeFromFile(file.path);
  const providedExtension = path.extname(file.originalname).toLowerCase();

  if (!detectedExtension) {
    throw createHttpError(400, "Uploaded file content does not match a supported media format.");
  }

  const compatibleExtensions = new Map([
    [".mp3", new Set([".mp3"])],
    [".wav", new Set([".wav"])],
    [".m4a", new Set([".m4a"])],
    [".mp4", new Set([".mp4", ".m4a"])],
  ]);

  if (!compatibleExtensions.get(detectedExtension)?.has(providedExtension)) {
    throw createHttpError(400, "Uploaded file content does not match the selected file type.");
  }
};

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
    summary_type: "bullets_verbose",
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

    const response = await assemblyClient.get(
      `/transcript/${encodeURIComponent(transcriptId)}`,
    );
    const transcript = response.data;

    if (transcript.status === "completed") {
      logInfo("Transcript processing completed.");
      return transcript;
    }

    if (transcript.status === "error") {
      throw createHttpError(
        502,
        sanitizeAssemblyMessage(
          transcript.error || "Transcription failed on the provider side.",
        ),
      );
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw createHttpError(504, "Transcription timed out. Please try again.");
};

app.post(
  "/upload",
  requireUploadAccess,
  uploadLimiter,
  upload.single("file"),
  async (req, res, next) => {
    let localFilePath;

    try {
      if (!ASSEMBLY_API_KEY) {
        throw createHttpError(500, "Server configuration error.");
      }

      if (!req.is("multipart/form-data")) {
        throw createHttpError(415, "Unsupported content type.");
      }

      if (!req.file) {
        throw createHttpError(
          400,
          'No file uploaded. Attach an audio file using the "file" field.',
        );
      }

      if (
        typeof req.file.originalname !== "string" ||
        req.file.originalname.length > 255
      ) {
        throw createHttpError(400, "Invalid uploaded file name.");
      }

      if (
        !allowedMimeTypes.has(req.file.mimetype) ||
        !ALLOWED_MEDIA_EXTENSIONS.test(req.file.originalname)
      ) {
        throw createHttpError(400, "Invalid uploaded media file.");
      }

      if (req.file.size > getMaxAllowedBytes(req.file)) {
        const maxSizeLabel = isVideoUpload(req.file)
          ? MAX_VIDEO_UPLOAD_SIZE_MB
          : MAX_AUDIO_UPLOAD_SIZE_MB;
        throw createHttpError(
          400,
          `File too large. Maximum upload size is ${maxSizeLabel} MB.`,
        );
      }

      localFilePath = req.file.path;
      await assertUploadedFileSignature(req.file);

      const uploadUrl = await uploadFileToAssembly(localFilePath);
      const transcriptId = await requestTranscript(uploadUrl);
      const transcriptResult = await pollTranscriptResult(transcriptId);
      const rawHighlights = Array.isArray(
        transcriptResult.auto_highlights_result?.results,
      )
        ? transcriptResult.auto_highlights_result.results
        : [];
      const refinedSummary = cleanSummary(transcriptResult.summary);
      const importantPoints = buildImportantPoints(rawHighlights);
      const actionItems = buildActionItems(refinedSummary);

      res.status(200).json({
        transcript:
          typeof transcriptResult.text === "string" ? transcriptResult.text : "",
        summary: refinedSummary,
        importantPoints,
        actionItems,
        highlights: rawHighlights,
        status: transcriptResult.status,
      });
    } catch (error) {
      next(error);
    } finally {
      if (localFilePath) {
        try {
          if (localFilePath && fs.existsSync(localFilePath)) {
            await fsPromises.unlink(localFilePath);
          }
        } catch (cleanupError) {
          logError("Failed to delete temporary upload.", {
            message: cleanupError.message,
          });
        }
      }
    }
  },
);

app.use((error, _req, res, _next) => {
  const statusCode =
    error.statusCode || (error instanceof multer.MulterError ? 400 : 500);

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
