const MAX_INSIGHT_ITEMS = 6;

const normalizeText = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

const splitIntoSentences = (transcript) =>
  ((transcript || "")
    .replace(/\n+/g, " ")
    .match(/[^.!?]+[.!?]+/g) || [])
    .map((sentence) => normalizeText(sentence.replace(/^[-*•\d.)\s]+/, "")))
    .filter(Boolean);

const isAction = (sentence) =>
  /(will|should|need to|assign|complete)/i.test(sentence) &&
  sentence.length > 40 &&
  !/\?$/.test(sentence);

const score = (sentence) => {
  let currentScore = 0;

  if (/(will|should|need to)/i.test(sentence)) currentScore += 2;
  if (/(deadline|by|before|next|tomorrow)/i.test(sentence))
    currentScore += 2;
  if (sentence.length > 80) currentScore += 1;

  return currentScore;
};

const unique = (items) =>
  Array.from(new Set(items.map((item) => item.toLowerCase()))).map(
    (item) => items.find((candidate) => candidate.toLowerCase() === item),
  );

export const generateInsights = (transcript) => {
  const sentences = splitIntoSentences(transcript);

  const actionItems = sentences
    .filter(isAction)
    .sort((left, right) => score(right) - score(left))
    .slice(0, MAX_INSIGHT_ITEMS);

  return {
    actionItems: unique(actionItems),
  };
};
