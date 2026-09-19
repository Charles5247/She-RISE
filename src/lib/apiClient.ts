"use client";

/**
 * Safely posts/gets JSON and parses the JSON response, without ever letting a
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

async function parseResponse<T>(resPromise: Promise<Response>): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await resPromise;
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

export async function postJson<T = Record<string, unknown>>(
  url: string,
  body?: unknown
): Promise<ApiResult<T>> {
  return parseResponse<T>(
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    })
  );
}

export async function getJson<T = Record<string, unknown>>(
  url: string
): Promise<ApiResult<T>> {
  return parseResponse<T>(fetch(url, { method: "GET" }));
}

export async function patchJson<T = Record<string, unknown>>(
  url: string,
  body?: unknown
): Promise<ApiResult<T>> {
  return parseResponse<T>(
    fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    })
  );
}

export async function deleteJson<T = Record<string, unknown>>(
  url: string
): Promise<ApiResult<T>> {
  return parseResponse<T>(fetch(url, { method: "DELETE" }));
}
