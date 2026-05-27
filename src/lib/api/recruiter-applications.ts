import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export type RecruiterApplication = {
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
		domain?: string;
		recruiterProfile?: {
			user?: { id: string } | null;
		} | null;
	} | null;
	cv: { id: string } | null;
	coverLetter: { id: string } | null;
	status: string;
	createdAt: string;
};

type GraphQLRecruiterApplicationsResponse = {
	data?: {
		applications?: RecruiterApplication[];
	};
	errors?: Array<{ message?: string }>;
};

function readRecruiterToken(): string | null {
	if (typeof document === "undefined") return null;

	const cookieToken = document.cookie
		.split("; ")
		.find((entry) => entry.startsWith("recruiter_token="))
		?.split("=")[1];

	const localToken = window.localStorage.getItem("recruiter_token");
	return cookieToken || localToken;
}

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

function getRecruiterUserIdFromToken(): string | null {
	const token = readRecruiterToken();
	if (!token) return null;

	const payload = parseJwtPayload(token);
	const userId = payload?.userId;
	return typeof userId === "string" && userId.trim() ? userId : null;
}

async function recruiterFetch(input: string, init: RequestInit = {}) {
	const token = readRecruiterToken();
	if (!token) {
		throw new Error("You need to sign in as a recruiter again.");
	}

	return fetch(input, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			...(init.headers || {}),
		},
		cache: "no-store",
	});
}

export async function fetchRecruiterApplications(
	pageNumber: number = 1,
	pageSize: number = 200,
): Promise<RecruiterApplication[]> {
	const apiUrl = getClientApiBaseUrl();
	const response = await recruiterFetch(`${apiUrl}/graphql`, {
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
							recruiterProfile {
								user { id }
							}
						}
						cv { id }
						coverLetter { id }
						status
						createdAt
					}
				}
			`,
			variables: { pageNumber, pageSize },
		}),
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(text || "Failed to load applications");
	}

	const payload = (await response.json()) as GraphQLRecruiterApplicationsResponse;
	if (payload.errors?.length) {
		throw new Error(payload.errors[0]?.message || "Failed to load applications");
	}

	const allApplications = payload.data?.applications || [];
	const recruiterUserId = getRecruiterUserIdFromToken();

	if (!recruiterUserId) {
		return allApplications;
	}

	return allApplications.filter(
		(application) => application.offer?.recruiterProfile?.user?.id === recruiterUserId,
	);
}

export async function updateRecruiterApplicationStatus(
	applicationId: string,
	action: "accept" | "reject",
): Promise<void> {
	const apiUrl = getClientApiBaseUrl();
	const response = await recruiterFetch(
		`${apiUrl}/applications/${applicationId}/${action}`,
		{ method: "PATCH" },
	);

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(text || `Failed to ${action} application`);
	}
}

export async function openRecruiterApplicationFile(
	applicationId: string,
	type: "cv" | "cover-letter",
): Promise<void> {
	const apiUrl = getClientApiBaseUrl();
	const response = await recruiterFetch(
		`${apiUrl}/applications/${applicationId}/${type}`,
		{ method: "GET" },
	);

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(text || `Failed to open ${type}`);
	}

	const blob = await response.blob();
	const objectUrl = URL.createObjectURL(blob);
	window.open(objectUrl, "_blank", "noopener,noreferrer");
	window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
}