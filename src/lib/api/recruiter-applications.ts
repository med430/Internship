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
	status: "SUBMITTED" | "IN_REVIEW" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
	createdAt: string;
};

type GraphQLRecruiterApplicationsResponse = {
	data?: {
		applications?: RecruiterApplication[];
	};
	errors?: Array<{ message?: string }>;
};

async function getSupabaseToken(): Promise<string | null> {
	if (typeof window === "undefined") return null;
	try {
		const res = await fetch("/auth/session", { credentials: "include", cache: "no-store" });
		if (!res.ok) return null;
		const { accessToken } = await res.json() as { accessToken?: string };
		return accessToken ?? null;
	} catch {
		return null;
	}
}

async function recruiterFetch(input: string, init: RequestInit = {}) {
	const token = await getSupabaseToken();
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

	return payload.data?.applications || [];
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
	// Open the tab synchronously (within the user-gesture frame) to avoid popup blockers.
	// Then navigate it once the blob is ready.
	const newTab = window.open("", "_blank");

	try {
		const apiUrl = getClientApiBaseUrl();
		const response = await recruiterFetch(
			`${apiUrl}/applications/${applicationId}/${type}`,
			{ method: "GET" },
		);

		if (!response.ok) {
			newTab?.close();
			const text = await response.text().catch(() => "");
			throw new Error(text || `Failed to open ${type}`);
		}

		const blob = await response.blob();
		const objectUrl = URL.createObjectURL(blob);
		if (newTab) {
			newTab.location.href = objectUrl;
		} else {
			window.open(objectUrl, "_blank", "noopener,noreferrer");
		}
		window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
	} catch (err) {
		newTab?.close();
		throw err;
	}
}
