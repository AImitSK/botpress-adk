import { configuration } from "@botpress/runtime";

interface WpApiResponse<T = any> {
  success: boolean;
  data: T[];
  total: number;
}

const TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

interface FetchOptions {
  method?: "GET" | "POST";
  body?: Record<string, any>;
}

export async function wpApiFetch<T = any>(
  endpoint: string,
  params: Record<string, string | number> = {},
  options: FetchOptions = {}
): Promise<WpApiResponse<T>> {
  const baseUrl = configuration.wordpressBaseUrl.replace(/\/$/, "");
  const url = new URL(`${baseUrl}/bpwc/v1/bot/${endpoint}`);

  const method = options.method || "GET";

  if (method === "GET") {
    for (const [key, value] of Object.entries(params)) {
      if (value !== "" && value !== 0) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const fetchOpts: RequestInit = {
        method,
        headers: {
          Authorization: `Bearer ${configuration.wpApiToken}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      };

      if (method === "POST" && options.body) {
        fetchOpts.body = JSON.stringify(options.body);
      }

      const response = await fetch(url.toString(), fetchOpts);

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(
          `WordPress API error: ${response.status} ${response.statusText}`
        );
      }

      return response.json() as Promise<WpApiResponse<T>>;
    } catch (err: any) {
      lastError = err;

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1))
        );
      }
    }
  }

  throw lastError ?? new Error("WordPress API request failed");
}
