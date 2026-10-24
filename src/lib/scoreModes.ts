export const SCORE_MODES = [
  { value: "ADV 9+STB", label: "Avantage à 9 jeux + Super TB (padel)" },
  { value: "ADVANTAGE", label: "Avantage classique" },
  { value: "GOLDEN", label: "Point d'or" },
  { value: "GOLDEN+STB", label: "Point d'or + Super TB" },
  { value: "AMERICANO", label: "Américano" },
  { value: "STAR POINT", label: "Star point (2 avantages)" },
] as const;

export type ScoreMode = (typeof SCORE_MODES)[number]["value"];

export const isScoreMode = (value: unknown): value is ScoreMode =>
  typeof value === "string" && SCORE_MODES.some((mode) => mode.value === value);
