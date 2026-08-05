const MAX_RETRIES = 2;
const BASE_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries a failing API call up to `retries` times with exponential backoff
 * (300ms, 600ms). The final failure is rethrown so callers keep full control
 * over error UX — see systems/error-handling.md.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await delay(BASE_DELAY_MS * 2 ** attempt);
    }
  }

  throw lastError;
}
