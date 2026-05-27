import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export type Offer = {
	id: string;
	title: string;
	description: string;
	company: string;
	location: string;
	domain: string;
	type: string;
	startDate?: string;
	endDate?: string;
};

type GraphQLOffersResponse = {
	data?: {
		offers?: Offer[];
	};
	errors?: Array<{ message?: string }>;
};

export async function fetchOffers(
	pageNumber: number = 1,
	pageSize: number = 50,
): Promise<Offer[]> {
	const apiUrl = getClientApiBaseUrl();
	const response = await fetch(`${apiUrl}/graphql`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: `
				query Offers($pageNumber: Int, $pageSize: Int) {
					offers(pageNumber: $pageNumber, pageSize: $pageSize) {
						id
						title
						description
						company
						location
						domain
						type
						startDate
						endDate
					}
				}
			`,
			variables: { pageNumber, pageSize },
		}),
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch offers");
	}

	const payload = (await response.json()) as GraphQLOffersResponse;
	if (payload.errors?.length) {
		throw new Error(payload.errors[0]?.message || "Failed to fetch offers");
	}

	return payload.data?.offers || [];
}

