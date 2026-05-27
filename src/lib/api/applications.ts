import { createClient } from "@/utils/supabase/client";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export type StudentApplication = {
	id: string;
	student: {
		id: string;
		email?: string;
		name?: string;
		lastname?: string;
		username?: string;
	} | null;
	offer: {
		id: string;
		title: string;
		company: string;
		location: string;
		domain: string;
	} | null;
	cv: {
		id: string;
	} | null;
	coverLetter?: {
		id: string;
	} | null;
	status: string;
	matchScore?: number;
	createdAt: string;
};

type GraphQLApplicationsResponse = {
	data?: {
		applications?: StudentApplication[];
	};
	errors?: Array<{ message?: string }>;
};

function parseJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const parts = token.split(".");
		if (parts.length < 2) return null;
		const encoded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
		const padded = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);
		const decoded = atob(padded);
		return JSON.parse(decoded) as Record<string, unknown>;
	} catch {
		return null;
	}
}

function getBackendUserIdFromToken(): string | null {
	if (typeof document === "undefined") return null;

	const cookieToken = document.cookie
		.split("; ")
		.find((entry) => entry.startsWith("interview_token="))
		?.split("=")[1];

	const localToken = window.localStorage.getItem("interview_token");
	const token = cookieToken || localToken;
	if (!token) return null;

	const payload = parseJwtPayload(token);
	const userId = payload?.userId;
	return typeof userId === "string" && userId.trim() ? userId : null;
}

export async function createApplication(input: {
	offerId: string;
	cvId: string;
	coverLetterId?: string;
}): Promise<StudentApplication> {
	const apiUrl = getClientApiBaseUrl();
	const response = await fetchWithAuth(`${apiUrl}/applications`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(text || "Failed to apply to offer");
	}

	return (await response.json()) as StudentApplication;
}

export async function withdrawApplication(
	applicationId: string,
): Promise<StudentApplication> {
	const apiUrl = getClientApiBaseUrl();
	const response = await fetchWithAuth(
		`${apiUrl}/applications/${applicationId}/withdraw`,
		{
			method: "PATCH",
		},
	);

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(text || "Failed to withdraw application");
	}

	return (await response.json()) as StudentApplication;
}

export async function fetchMyApplications(
	pageNumber: number = 1,
	pageSize: number = 200,
): Promise<StudentApplication[]> {
	const apiUrl = getClientApiBaseUrl();

	const response = await fetchWithAuth(`${apiUrl}/graphql`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: `
				query Applications($pageNumber: Int, $pageSize: Int) {
					applications(pageNumber: $pageNumber, pageSize: $pageSize) {
						id
						student {
							id
							email
							name
							lastname
							username
						}
						offer {
							id
							title
							company
							location
							domain
						}
						cv {
							id
						}
						coverLetter {
							id
						}
						status
						matchScore
						createdAt
					}
				}
			`,
			variables: { pageNumber, pageSize },
		}),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch applications");
	}

	const payload = (await response.json()) as GraphQLApplicationsResponse;
	if (payload.errors?.length) {
		throw new Error(
			payload.errors[0]?.message || "Failed to fetch applications",
		);
	}

	const allApplications = payload.data?.applications || [];

	// Prefer backend JWT userId (used by guarded endpoints).
	const backendUserId = getBackendUserIdFromToken();
	if (backendUserId) {
		return allApplications.filter((application) => application.student?.id === backendUserId);
	}

	const supabase = createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user?.id) {
		return [];
	}

	return allApplications.filter((application) => application.student?.id === user.id);
}

