import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export type SkillRequirement = {
	id: string;
	skill: { id: string; name: string };
	level: string;
};

export type Offer = {
	id: string;
	title: string;
	description: string;
	company: string;
	location: string;
	domain: string;
	type: string;
	workMode: string;
	isPaid: boolean;
	stipendMin?: number | null;
	stipendMax?: number | null;
	startDate?: string;
	endDate?: string;
	skillRequirements?: SkillRequirement[];
};

const OFFER_FIELDS = `
	id title description company location domain
	type workMode isPaid startDate endDate
	skillRequirements { id skill { id name } level }
`;

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
	const apiUrl = getClientApiBaseUrl();
	const res = await fetch(`${apiUrl}/graphql`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query, variables }),
		cache: "no-store",
	});
	if (!res.ok) throw new Error("GraphQL request failed");
	const json = (await res.json()) as { data?: T; errors?: { message?: string }[] };
	if (json.errors?.length) throw new Error(json.errors[0]?.message ?? "GraphQL error");
	return json.data as T;
}

export async function fetchOffers(pageNumber = 1, pageSize = 200): Promise<Offer[]> {
	const data = await gql<{ offers: Offer[] }>(
		`query Offers($pageNumber: Int, $pageSize: Int) {
			offers(pageNumber: $pageNumber, pageSize: $pageSize) { ${OFFER_FIELDS} }
		}`,
		{ pageNumber, pageSize },
	);
	return data.offers ?? [];
}

export async function fetchOffer(id: string): Promise<Offer | null> {
	const data = await gql<{ offer: Offer | null }>(
		`query Offer($id: ID!) { offer(id: $id) { ${OFFER_FIELDS} } }`,
		{ id },
	);
	return data.offer ?? null;
}
