import { configuration } from "@botpress/runtime";

interface WpApiResponse<T = any> {
  success: boolean;
  data: T[];
  total: number;
}

export async function wpApiFetch<T = any>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<WpApiResponse<T>> {
  const baseUrl = configuration.wordpressBaseUrl.replace(/\/$/, "");
  const url = new URL(`${baseUrl}/bpwc/v1/bot/${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== 0) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${configuration.wpApiToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `WordPress API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<WpApiResponse<T>>;
}
