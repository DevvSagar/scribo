const writeLog = (level, message, metadata = {}) => {
  const safeMetadata =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? metadata
      : {};
  const entry = {
    level,
    message,
    ...safeMetadata,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(entry));
};

export const logger = {
  info(message, metadata) {
    writeLog("info", message, metadata);
  },
  warn(message, metadata) {
    writeLog("warn", message, metadata);
  },
  error(message, metadata) {
    writeLog("error", message, metadata);
  },
};

export default logger;
