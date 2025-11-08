import axios from "axios";

/**
 * Axios POST with retry for network/server errors only
 */
export async function axiosPostWithRetry(
  url,
  data,
  headers = {},
  retries = 8,
  delay = 2000
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await axios.post(url, data, { headers });
    } catch (err) {
      const status = err.response?.status;

      // If error is 4xx (except maybe 429), do NOT retry
      if (status && status >= 400 && status < 500 && status !== 429) {
        console.error(
          `❌ ${url} failed with ${status}: ${err.message}. Skipping retry.`
        );
        throw err;
      }

      // For network errors or 5xx errors, retry
      if (attempt === retries) throw err;
      const wait = delay * Math.pow(1.5, attempt - 1);
      console.warn(`⚠️ ${url} failed: ${err.message}. Retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
