/**
 * Small, dependency-free validation. The forms in this template are
 * frontend-only demos, so validation exists to make the UX honest rather than
 * to protect a backend. Wire your own API in and validate there too.
 */

export type Validator = (value: string) => string | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
// Deliberately permissive: international numbers vary far more than regexes do.
const PHONE = /^[+(]?[\d][\d\s().-]{6,}$/;

export const required =
  (label = "This field"): Validator =>
  (value) =>
    value.trim().length ? null : `${label} is required.`;

export const email: Validator = (value) =>
  !value.trim() ? "Email address is required." : EMAIL.test(value.trim()) ? null : "Enter a valid email address.";

export const optionalEmail: Validator = (value) =>
  !value.trim() ? null : EMAIL.test(value.trim()) ? null : "Enter a valid email address.";

export const phone: Validator = (value) =>
  !value.trim()
    ? "Phone number is required."
    : PHONE.test(value.trim())
      ? null
      : "Enter a valid phone number.";

export const minLength =
  (n: number, label = "This field"): Validator =>
  (value) =>
    value.trim().length >= n ? null : `${label} must be at least ${n} characters.`;

export function validate<T extends Record<string, string>>(
  values: T,
  rules: Partial<Record<keyof T, Validator[]>>,
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key of Object.keys(rules) as (keyof T)[]) {
    for (const rule of rules[key] ?? []) {
      const message = rule(values[key] ?? "");
      if (message) {
        errors[key] = message;
        break;
      }
    }
  }
  return errors;
}

/**
 * Stands in for a network request so loading and success states are real.
 * Replace the body with a `fetch` to your own endpoint.
 */
export function submitDemo<T>(payload: T, delay = 950): Promise<{ ok: true; payload: T }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ok: true, payload }), delay);
  });
}
