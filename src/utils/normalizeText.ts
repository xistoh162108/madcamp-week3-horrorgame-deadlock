export function normalizeCode(code: string): string {
  return code
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/  +/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim()
    .toLowerCase();
}

export type ValidationRule =
  | { type: "mustInclude"; tokens: string[] }
  | { type: "exact"; answer: string }
  | { type: "regex"; pattern: string };

export function validateAnswer(
  input: string,
  rule: ValidationRule
): boolean {
  const normalized = normalizeCode(input);

  switch (rule.type) {
    case "mustInclude":
      return rule.tokens.every((token) =>
        normalized.includes(normalizeCode(token))
      );
    case "exact":
      return normalized === normalizeCode(rule.answer);
    case "regex":
      return new RegExp(rule.pattern, "i").test(normalized);
    default:
      return false;
  }
}
