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

	// The GraphQL resolver already filters by the authenticated user server-side.
	return payload.data?.applications || [];
}

