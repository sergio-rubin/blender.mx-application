import type { LeadInput, LeadPage, Session } from "@/types";

const API_ROOT = (import.meta.env.VITE_API_URL ?? "/api/v1").replace(/\/$/, "");
const REQUEST_TIMEOUT = 12_000;
let csrfToken: string | null = null;

type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

async function parseJson(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  return response.json();
}

async function ensureCsrf(): Promise<string> {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${API_ROOT}/auth/csrf/`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const body = await parseJson(response);
  if (!response.ok || !body?.csrfToken) {
    throw new ApiError("No pudimos iniciar la sesión segura.", response.status);
  }
  const token = String(body.csrfToken);
  csrfToken = token;
  return token;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const unsafe = !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);
  const token = unsafe ? await ensureCsrf() : null;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_ROOT}${path}`, {
      ...init,
      credentials: "include",
      signal: init.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { "X-CSRFToken": token } : {}),
        ...init.headers,
      },
    });
    const body = await parseJson(response);
    if (!response.ok) {
      throw new ApiError(
        body?.message ?? "No pudimos completar la solicitud.",
        response.status,
        body?.errors,
      );
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("La solicitud tardó demasiado. Intenta de nuevo.", 408);
    }
    throw new ApiError("No pudimos conectar con el servidor.", 0);
  } finally {
    window.clearTimeout(timeout);
  }
}

export const api = {
  createLead: (lead: LeadInput) =>
    request<{ message: string }>("/leads/", { method: "POST", body: JSON.stringify(lead) }),
  session: () => request<Session>("/auth/session/"),
  login: async (username: string, password: string) => {
    const session = await request<Session>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    csrfToken = session.csrfToken ?? null;
    return session;
  },
  logout: async () => {
    await request<void>("/auth/logout/", { method: "POST" });
    csrfToken = null;
  },
  leads: (search = "", signal?: AbortSignal) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<LeadPage>(`/leads/${params}`, { signal });
  },
};

export function resetApiState() {
  csrfToken = null;
}
