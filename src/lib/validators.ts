export function validateIsraeliPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Check if the length is correct (10 digits)
  if (digits.length !== 10) return false;

  // Check if starts with valid Israeli prefix
  const validPrefixes = [
    "050",
    "051",
    "052",
    "053",
    "054",
    "055",
    "056",
    "058",
    "059",
  ];
  const prefix = digits.substring(0, 3);

  return validPrefixes.includes(prefix);
}
