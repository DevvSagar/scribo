const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const AI_TIMEOUT_MS = 12000;
const MAX_TRANSCRIPT_CHARS = 12000;

const normalizeItems = (items) =>
  Array.isArray(items)
    ? items
        .filter((item) => typeof item === "string")
        .map((item) => item.replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

const parseJsonObject = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const rawJson = fencedMatch ? fencedMatch[1].trim() : trimmed;

  return JSON.parse(rawJson);
};

export const generateAIInsights = async (transcript) => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const safeTranscript =
    typeof transcript === "string"
      ? transcript.trim().slice(0, MAX_TRANSCRIPT_CHARS)
      : "";

  const prompt = `
From the following meeting transcript, extract:

1. Action Items (clear tasks with owner if possible)

Keep it concise. Max 5.

Respond with valid JSON only using this shape:
{
  "actionItems": ["..."]
}

Transcript:
${safeTranscript}
  `.trim();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You extract structured meeting insights and return valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_object",
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI insights request failed with status ${response.status}.`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = parseJsonObject(content);

    return {
      actionItems: normalizeItems(parsed?.actionItems),
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
