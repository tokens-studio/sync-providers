import { delay } from "./delay.js";

export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 100,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      // eslint-disable-next-line no-console
      console.log(`Retrying... Attempts left: ${retries}`);
      await delay(delayMs);
      return fetchWithRetry(fn, retries - 1, delayMs);
    }
    throw error;
  }
}
