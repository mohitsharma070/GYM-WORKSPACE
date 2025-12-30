// Utility helpers for phone number normalization.
// We only add the +91 prefix when the user provides exactly 10 digits without a country code.
// Existing country codes (starting with +) are preserved and non-digit characters are stripped.

export function normalizePhoneInput(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Preserve explicit country codes: keep '+' and digits only
  if (trimmed.startsWith("+")) {
    const cleaned = "+" + trimmed.slice(1).replace(/\D/g, "");
    return cleaned;
  }

  // Remove all non-digits
  const digits = trimmed.replace(/\D/g, "");

  // Add +91 when user types exactly 10 digits (common Indian mobiles)
  if (digits.length === 10) {
    return "+91" + digits;
  }

  // Fallback: return the digits as-is (no implicit country code guess)
  return digits;
}
