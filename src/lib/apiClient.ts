"use client";

/**
 * Safely posts JSON and parses the JSON response, without ever letting a
 * non-JSON or empty body (e.g. a crashed server route, a proxy timeout
 * page, a dropped connection) throw an unhandled `res.json()` parse error.
 * Returns a uniform shape so callers can just check `.ok`.
 */
export interface ApiResult<T = Record<string, unknown>> {
  ok: boolean;
  status: number;
  data: T | null;
  message: string;
}

const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function postJson<T = Record<string, unknown>>(
  url: string,
  body: unknown
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Network failure — fetch itself threw (offline, DNS, CORS, etc.).
    return { ok: false, status: 0, data: null, message: "Couldn't reach the server. Check your connection and try again." };
  }

  let data: (T & { message?: string }) | null = null;
  try {
    data = await res.json();
  } catch {
    // Body wasn't valid JSON (crashed route with no body, HTML error page,
    // empty response, etc.) — never let this throw past the caller.
    data = null;
  }

  if (!res.ok) {
    return { ok: false, status: res.status, data, message: data?.message || GENERIC_ERROR };
  }
  return { ok: true, status: res.status, data, message: "" };
}
