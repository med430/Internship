import { API_BASE_URL } from "@/lib/constants";

const GQL_URL = `${API_BASE_URL}/graphql`;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  lastname: string;
  username: string;
  role: "STUDENT" | "RECRUITER" | "ADMIN";
}

export interface AdminOffer {
  id: string;
  recruiterProfileId: string;
  title: string;
  company: string;
  location: string;
  domain: string;
  type: string;
  workMode: string;
  isPaid: boolean;
  startDate: string;
  endDate: string;
  createdAt?: string;
  deletedAt?: string | null;
}

export interface AdminStats {
  users: number;
  offers: number;
  applications: number;
  interviews: number;
}

// ─── REST helpers ────────────────────────────────────────────────────────────

async function adminFetch<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchAdminOffers(
  accessToken: string,
  page = 1,
  pageSize = 50,
): Promise<AdminOffer[]> {
  return adminFetch<AdminOffer[]>(
    `/admin/offers?page=${page}&pageSize=${pageSize}`,
    accessToken,
  );
}

export async function fetchAdminStats(
  accessToken: string,
): Promise<AdminStats> {
  return adminFetch<AdminStats>("/admin/stats", accessToken);
}

// ─── GraphQL helpers ──────────────────────────────────────────────────────────

async function gqlFetch<T>(
  query: string,
  accessToken: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(GQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

export async function fetchAdminUsers(
  accessToken: string,
  pageNumber = 1,
  pageSize = 50,
): Promise<AdminUser[]> {
  const data = await gqlFetch<{ users: AdminUser[] }>(
    `query($pageNumber: Int!, $pageSize: Int!) {
      users(pageNumber: $pageNumber, pageSize: $pageSize) {
        id email name lastname username role
      }
    }`,
    accessToken,
    { pageNumber, pageSize },
  );
  return data.users ?? [];
}
