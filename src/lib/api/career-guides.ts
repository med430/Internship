import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import type {
  CareerGuide,
  CareerGuideWithPagination,
} from "@/lib/api/career-guides/types";

export type {
  CareerGuide,
  CareerGuideWithPagination,
} from "@/lib/api/career-guides/types";

export async function fetchUserCareerGuides(
  page: number = 1,
  pageSize: number = 10,
): Promise<CareerGuideWithPagination> {
  const apiBaseUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(
    `${apiBaseUrl}/onboard/career-guides?page=${page}&pageSize=${pageSize}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load career guides");
  }

  return (await response.json()) as CareerGuideWithPagination;
}

export async function fetchCareerGuideById(
  guideId: string,
): Promise<CareerGuide> {
  const apiBaseUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(
    `${apiBaseUrl}/onboard/career-guides/${guideId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load career guide");
  }

  return (await response.json()) as CareerGuide;
}
