const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

export function locMediaUrl(url?: string | null): string {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${API_URL.replace(/\/v1$/, "")}${url}`;
}

export type Schedule = { weekday: number; openMinute: number; closeMinute: number; isClosed: boolean };
export type Service = { id: string; code: string; name: string; description?: string | null; durationMinutes: number };
export type Branch = {
  id: string;
  slug: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  schedules?: Schedule[];
};
export type BranchDetail = Branch & { services?: Service[] };

async function safeJson<T>(url: string, fallback: T, revalidate: number): Promise<T> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchBranches(): Promise<Branch[]> {
  const data = await safeJson<Branch[] | { items: Branch[] }>(`${API_URL}/locations/branches`, [], 300);
  return Array.isArray(data) ? data : data.items ?? [];
}

export async function fetchBranch(slug: string): Promise<BranchDetail | null> {
  return safeJson<BranchDetail | null>(`${API_URL}/locations/branches/${encodeURIComponent(slug)}`, null, 300);
}

export async function fetchServices(): Promise<Service[]> {
  const data = await safeJson<Service[] | { items: Service[] }>(`${API_URL}/locations/services`, [], 300);
  return Array.isArray(data) ? data : data.items ?? [];
}

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export function weekdayKey(weekday: number): string {
  return WEEKDAY_KEYS[((weekday % 7) + 7) % 7];
}

export function formatMinutes(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
