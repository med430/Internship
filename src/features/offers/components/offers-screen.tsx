"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CVSelector, type CVSource } from "@/components/shared/cv-selector";
import {
	CoverLetterSelector,
	type CoverLetterSource,
} from "@/components/shared/cover-letter-selector";
import { fetchOffers, type Offer } from "@/lib/api/offers";
import { createApplication } from "@/lib/api/applications";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { uploadCoverLetter } from "@/lib/api/cover-letters";

const PAGE_SIZE = 12;

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
	if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
	if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
	if (currentPage >= totalPages - 2) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
	return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

type ApplyModalState = {
	open: boolean;
	offer: Offer | null;
};

function resolveCoverLetterId(source: CoverLetterSource | null): string | undefined {
	if (!source) return undefined;
	if (source.type === "database") return source.letter.id;
	return undefined;
}

async function uploadCoverLetterIfNeeded(source: CoverLetterSource): Promise<string> {
	if (source.type === "database") {
		return source.letter.id;
	}

	const uploaded = await uploadCoverLetter(source.file);
	return uploaded.id;
}

async function uploadCvIfNeeded(source: CVSource): Promise<string> {
	if (source.type === "database") {
		return source.cv.id;
	}

	const apiUrl = getClientApiBaseUrl();
	const form = new FormData();
	form.append("cv", source.file);

	const response = await fetchWithAuth(`${apiUrl}/cvs`, {
		method: "POST",
		body: form,
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(text || "Failed to upload CV");
	}

	const payload = (await response.json()) as { id?: string };
	if (!payload.id) {
		throw new Error("Uploaded CV id not returned");
	}

	return payload.id;
}

export function OffersScreen() {
	const [offers, setOffers] = useState<Offer[]>([]);
	const [loadingOffers, setLoadingOffers] = useState(true);
	const [applyState, setApplyState] = useState<ApplyModalState>({
		open: false,
		offer: null,
	});
	const [selectedCv, setSelectedCv] = useState<CVSource | null>(null);
	const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetterSource | null>(null);
	const [submittingApplication, setSubmittingApplication] = useState(false);
	const [page, setPage] = useState(1);

	useEffect(() => {
		let mounted = true;

		const run = async () => {
			setLoadingOffers(true);
			try {
				const data = await fetchOffers(1, 100);
				if (mounted) {
					setOffers(data);
				}
			} catch (error) {
				toast.error(error instanceof Error ? error.message : "Failed to load offers");
			} finally {
				if (mounted) {
					setLoadingOffers(false);
				}
			}
		};

		run();
		return () => {
			mounted = false;
		};
	}, []);

	const sortedOffers = useMemo(
		() => [...offers].sort((a, b) => a.title.localeCompare(b.title)),
		[offers],
	);

	const totalPages = Math.ceil(sortedOffers.length / PAGE_SIZE);
	const paginated = useMemo(
		() => sortedOffers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
		[sortedOffers, page],
	);

	const openApplyModal = (offer: Offer) => {
		setSelectedCv(null);
		setSelectedCoverLetter(null);
		setApplyState({ open: true, offer });
	};

	const closeApplyModal = () => {
		setApplyState({ open: false, offer: null });
		setSubmittingApplication(false);
	};

	const submitApplication = async () => {
		if (!applyState.offer) {
			return;
		}

		if (!selectedCv) {
			toast.error("Please select a CV before applying");
			return;
		}

		setSubmittingApplication(true);
		try {
			const cvId = await uploadCvIfNeeded(selectedCv);
			const coverLetterId = selectedCoverLetter
				? await uploadCoverLetterIfNeeded(selectedCoverLetter)
				: undefined;

			await createApplication({
				offerId: applyState.offer.id,
				cvId,
				...(coverLetterId ? { coverLetterId } : {}),
			});

			toast.success("Application submitted successfully");
			closeApplyModal();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to submit application",
			);
			setSubmittingApplication(false);
		}
	};

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Offers</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Browse recruiter offers and apply with your saved documents.
				</p>
			</div>

			{loadingOffers ? (
				<div className="text-sm text-muted-foreground">Loading offers...</div>
			) : sortedOffers.length === 0 ? (
				<Card>
					<CardContent className="py-10 text-center text-sm text-muted-foreground">
						No offers available right now.
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{paginated.map((offer) => (
						<Card key={offer.id}>
							<CardHeader>
								<CardTitle className="text-lg">
									<Link
										href={`/services/offers/${offer.id}`}
										className="hover:underline"
									>
										{offer.title}
									</Link>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="text-sm text-muted-foreground">
									{offer.company} • {offer.location || "Remote"}
								</div>
								<p className="text-sm whitespace-pre-wrap line-clamp-3">{offer.description}</p>
								<div className="flex items-center justify-end gap-2">
									<Button variant="outline" asChild>
										<Link href={`/services/offers/${offer.id}`}>View details</Link>
									</Button>
									<Button onClick={() => openApplyModal(offer)}>Apply</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Pagination */}
			{!loadingOffers && totalPages > 1 && (
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-5 py-3 shadow-sm">
					<p className="text-xs text-muted-foreground">
						Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sortedOffers.length)} of {sortedOffers.length} offers
					</p>
					<Pagination className="w-fit mx-0">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
							</PaginationItem>
							{getPaginationItems(page, totalPages).map((item, i) =>
								item === "ellipsis" ? (
									<PaginationItem key={"e-" + i}><PaginationEllipsis /></PaginationItem>
								) : (
									<PaginationItem key={item}>
										<PaginationLink isActive={item === page} onClick={() => setPage(item)} className="cursor-pointer">{item}</PaginationLink>
									</PaginationItem>
								)
							)}
							<PaginationItem>
								<PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}

			<Dialog
				open={applyState.open}
				onOpenChange={(open) => {
					if (!open) {
						closeApplyModal();
					}
				}}
			>
				<DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Apply to {applyState.offer?.title || "Offer"}</DialogTitle>
						<DialogDescription>
							Select a CV and optional cover letter to submit your application.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6">
						<CVSelector onCVSelect={setSelectedCv} />
						<CoverLetterSelector onSelect={setSelectedCoverLetter} />

						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={closeApplyModal}
								disabled={submittingApplication}
							>
								Cancel
							</Button>
							<Button onClick={submitApplication} disabled={submittingApplication}>
								{submittingApplication ? "Submitting..." : "Submit Application"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default OffersScreen;

