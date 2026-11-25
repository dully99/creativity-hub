/** Strip grouping commas and parse a numeric amount string. */
export function normalizeAmountString(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/,/g, "").trim();
}

/** Keep digits and at most one decimal point. */
export function sanitizeAmountDigits(raw: string): string {
  const withoutCommas = raw.replace(/,/g, "");
  let result = "";
  let hasDecimal = false;

  for (const char of withoutCommas) {
    if (char >= "0" && char <= "9") {
      result += char;
    } else if (char === "." && !hasDecimal) {
      hasDecimal = true;
      result += char;
    }
  }

  return result;
}

/** Format a raw amount string with thousands separators. */
export function formatAmountWithCommas(raw: string): string {
  const sanitized = sanitizeAmountDigits(raw);
  if (!sanitized) {
    return "";
  }

  const endsWithDot = sanitized.endsWith(".");
  const [whole, ...rest] = sanitized.split(".");
  const decimal = rest.join("");
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (rest.length === 0 && !endsWithDot) {
    return formattedWhole;
  }
  if (decimal === "" && endsWithDot) {
    return `${formattedWhole}.`;
  }
  return `${formattedWhole}.${decimal}`;
}

export function parseAmountNumber(value: string | number | null | undefined): number {
  const normalized = normalizeAmountString(value);
  if (!normalized) {
    return Number.NaN;
  }
  return Number(normalized);
}
