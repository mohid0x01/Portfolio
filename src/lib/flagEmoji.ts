/**
 * Converts a 2-letter ISO 3166-1 alpha-2 country code to a flag emoji.
 * Works by mapping A→🇦 etc. using Unicode Regional Indicator Symbols.
 */
export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  const upper = code.toUpperCase();
  const A = 0x1f1e6; // Regional Indicator A
  const charA = "A".charCodeAt(0);
  const c1 = String.fromCodePoint(A + upper.charCodeAt(0) - charA);
  const c2 = String.fromCodePoint(A + upper.charCodeAt(1) - charA);
  return c1 + c2;
}

/** Returns "🇺🇸 United States" style string */
export function flagLabel(code: string, name?: string): string {
  const flag = countryCodeToFlag(code);
  return name ? `${flag} ${name}` : flag;
}
