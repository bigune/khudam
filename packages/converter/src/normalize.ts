/**
 * Canonical form used for every lexicon key and lookup:
 * NFC-normalized, lowercase, trimmed.
 */
export function normalizeWord(input: string): string {
  return input.normalize("NFC").toLowerCase().trim().normalize("NFC");
}
