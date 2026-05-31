// Browseable offers feed using the same card as the job matcher, paginated by cursor with infinite scroll.

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";

import JobCard from "@/components/job-matcher/job-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { jobFilterAPI } from "@/lib/api/job-filter-client";
import { tracking } from "@/lib/api/tracking-client";
import { convertJobToCardProps } from "@/features/job-matcher/lib/utils";
import type { JobDocument } from "@/types/job-matcher";

const PAGE_SIZE = 12;
const SAVED_PAGE_SIZE = 12;
const SKELETON_COUNT = 6;
const PREFETCH_ROOT_MARGIN = "800px";
const UNBOOKMARK_UNDO_MS = 6000;
const EXPLORE_SEED_WINDOW_MS = 15 * 60 * 1000;

type OffersTab = "all" | "saved";

function SkeletonCard() {
	return (
		<div className="rounded-xl border border-border/60 bg-card animate-pulse">
			<div className="flex items-start justify-between gap-3 p-5 pb-3">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					<div className="w-10 h-10 rounded-lg bg-muted" />
					<div className="flex-1 space-y-2">
						<div className="h-3 w-24 rounded bg-muted" />
						<div className="h-2.5 w-16 rounded bg-muted" />
					</div>
				</div>
				<div className="h-6 w-20 rounded-full bg-muted" />
			</div>
			<div className="px-5 space-y-2">
				<div className="h-4 w-3/4 rounded bg-muted" />
				<div className="h-3 w-1/2 rounded bg-muted" />
			</div>
			<div className="px-5 mt-3 space-y-2">
				<div className="h-3 w-full rounded bg-muted" />
				<div className="h-3 w-5/6 rounded bg-muted" />
			</div>
			<div className="flex gap-1.5 px-5 mt-4">
				<div className="h-5 w-14 rounded-full bg-muted" />
				<div className="h-5 w-20 rounded-full bg-muted" />
			</div>
			<div className="flex items-center gap-2 p-4 mt-4 border-t border-border/40">
				<div className="h-9 w-9 rounded-lg bg-muted" />
				<div className="flex-1" />
			</div>
		</div>
	);
}

function mergeUniqueJobs(existing: JobDocument[], incoming: JobDocument[]): JobDocument[] {
	const seen = new Set(existing.map((job) => job.job_id));
	const fresh = incoming.filter((job) => !seen.has(job.job_id));
	return fresh.length > 0 ? [...fresh, ...existing] : existing;
}

function appendUniqueJobs(existing: JobDocument[], incoming: JobDocument[]): JobDocument[] {
	const seen = new Set(existing.map((job) => job.job_id));
	const fresh = incoming.filter((job) => !seen.has(job.job_id));
	return fresh.length > 0 ? [...existing, ...fresh] : existing;
}

function matchesJobSearch(job: JobDocument, query: string): boolean {
	return [job.title, job.company, job.description]
		.join(" ")
		.toLowerCase()
		.includes(query);
}

export function OffersScreen() {
	const [activeTab, setActiveTab] = useState<OffersTab>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [jobs, setJobs] = useState<JobDocument[]>([]);
	const [savedJobs, setSavedJobs] = useState<JobDocument[]>([]);
	const [cursor, setCursor] = useState<string | null>(null);
	const [savedCursor, setSavedCursor] = useState<string | null>(null);
	const [loadingMore, setLoadingMore] = useState(false);
	const [savedLoadingMore, setSavedLoadingMore] = useState(false);
	const [savedLoading, setSavedLoading] = useState(false);
	const [savedLoaded, setSavedLoaded] = useState(false);
	const [done, setDone] = useState(false);
	const [savedDone, setSavedDone] = useState(false);
	const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
	const [pendingUnsave, setPendingUnsave] = useState<Set<string>>(new Set());
	const [exploreSeed] = useState(() => Math.floor(Date.now() / EXPLORE_SEED_WINDOW_MS));

	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const fetchingRef = useRef(false);
	const savedFetchingRef = useRef(false);
	const abortRef = useRef<AbortController | null>(null);
	const pendingUnbookmarkTimersRef = useRef<Map<string, number>>(new Map());

	// Pulls one page of the explore feed and appends it, advancing the cursor.
	const loadPage = useCallback(async (cursorValue: string | null) => {
		if (fetchingRef.current) return;
		fetchingRef.current = true;
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		try {
			const response = await jobFilterAPI.filterJobs(
				{
					limit: PAGE_SIZE,
					explore: true,
					exploreSeed,
					...(cursorValue ? { cursor: cursorValue } : {}),
				},
				{ signal: controller.signal },
			);

			const incoming = response.jobs ?? [];
			setJobs((prev) => {
				const known = new Set(prev.map((j) => j.job_id));
				const fresh = incoming.filter((j) => !known.has(j.job_id));

				if (fresh.length > 0) {
					tracking.trackImpressions(
						fresh.map((job, index) => ({
							offerId: job.job_id,
							position: prev.length + index,
							source: "offers",
						})),
					);
				}

				setBookmarked((existing) => {
					const merged = new Set(existing);
					fresh.forEach((j) => { if (j.bookmarked) merged.add(j.job_id); });
					return merged;
				});

				const freshBookmarked = fresh.filter((j) => j.bookmarked);
				if (freshBookmarked.length > 0) {
					setSavedJobs((existing) => mergeUniqueJobs(existing, freshBookmarked));
				}

				return [...prev, ...fresh];
			});

			const nextCursor = response.next_cursor ?? null;
			setCursor(nextCursor);
			if (!nextCursor || incoming.length === 0) setDone(true);
		} catch (err) {
			if ((err as Error).name === "AbortError") return;
			toast.error(err instanceof Error ? err.message : "Failed to load offers");
			setDone(true);
		} finally {
			fetchingRef.current = false;
		}
	}, [exploreSeed]);

	const loadSavedOffers = useCallback(async (cursorValue: string | null) => {
		if (savedFetchingRef.current) return;
		savedFetchingRef.current = true;
		if (cursorValue) {
			setSavedLoadingMore(true);
		} else {
			setSavedLoading(true);
		}
		try {
			const response = await jobFilterAPI.filterJobs({
				limit: SAVED_PAGE_SIZE,
				savedOnly: true,
				...(cursorValue ? { cursor: cursorValue } : {}),
			});
			const incoming = response.jobs ?? [];

			setSavedJobs((existing) => (
				cursorValue ? appendUniqueJobs(existing, incoming) : incoming
			));
			setBookmarked((existing) => {
				const merged = new Set(existing);
				incoming.forEach((job) => merged.add(job.job_id));
				return merged;
			});

			const basePosition = cursorValue ? savedJobs.length : 0;
			if (incoming.length > 0) {
				tracking.trackImpressions(
					incoming.map((job, index) => ({
						offerId: job.job_id,
						position: basePosition + index,
						source: "offers_saved",
					})),
				);
			}
			const nextCursor = response.next_cursor ?? null;
			setSavedCursor(nextCursor);
			if (!nextCursor || incoming.length === 0) setSavedDone(true);
			setSavedLoaded(true);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to load saved offers");
		} finally {
			savedFetchingRef.current = false;
			setSavedLoading(false);
			setSavedLoadingMore(false);
		}
	}, [savedJobs.length]);

	// Initial page on mount + abort any in-flight request when the screen unmounts.
	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			void loadPage(null);
		}, 0);
		return () => {
			window.clearTimeout(timeoutId);
			abortRef.current?.abort();
		};
	}, [loadPage]);

	// IntersectionObserver triggers the next page when the sentinel near the bottom enters the viewport.
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		if (activeTab === "all" && done) return;
		if (activeTab === "saved" && savedDone) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry?.isIntersecting) return;
				if (activeTab === "all") {
					if (fetchingRef.current || done) return;
					setLoadingMore(true);
					loadPage(cursor).finally(() => setLoadingMore(false));
					return;
				}

				if (savedFetchingRef.current || savedDone || !savedLoaded) return;
				void loadSavedOffers(savedCursor);
			},
			{ rootMargin: PREFETCH_ROOT_MARGIN },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [
		activeTab,
		cursor,
		done,
		loadPage,
		loadSavedOffers,
		savedCursor,
		savedDone,
		savedLoaded,
	]);

	useEffect(() => {
		if (activeTab !== "saved" || savedLoaded || savedLoading) return;
		const timeoutId = window.setTimeout(() => {
			void loadSavedOffers(null);
		}, 0);
		return () => window.clearTimeout(timeoutId);
	}, [activeTab, loadSavedOffers, savedLoaded, savedLoading]);

	useEffect(() => {
		const timers = pendingUnbookmarkTimersRef.current;
		return () => {
			timers.forEach((timeoutId, offerId) => {
				window.clearTimeout(timeoutId);
				tracking.trackUnbookmark(offerId);
			});
			timers.clear();
		};
	}, []);

	const handleView = useCallback((offerId: string, position?: number) => {
		tracking.markOfferViewSource(offerId, "offers", position);
	}, []);

	const cancelPendingUnbookmark = useCallback((offerId: string, notify = false) => {
		const timeoutId = pendingUnbookmarkTimersRef.current.get(offerId);
		if (timeoutId === undefined) return false;

		window.clearTimeout(timeoutId);
		pendingUnbookmarkTimersRef.current.delete(offerId);
		setPendingUnsave((prev) => {
			const next = new Set(prev);
			next.delete(offerId);
			return next;
		});
		setBookmarked((prev) => {
			const next = new Set(prev);
			next.add(offerId);
			return next;
		});
		if (notify) toast.success("Kept in saved offers");
		return true;
	}, []);

	const scheduleUnbookmark = useCallback((offerId: string) => {
		if (pendingUnbookmarkTimersRef.current.has(offerId)) return;

		setPendingUnsave((prev) => {
			const next = new Set(prev);
			next.add(offerId);
			return next;
		});

		const toastId = toast("Removed from saved offers", {
			description: "Undo before it is removed from your saved tab.",
			action: {
				label: "Undo",
				onClick: () => {
					cancelPendingUnbookmark(offerId, true);
					toast.dismiss(toastId);
				},
			},
			duration: UNBOOKMARK_UNDO_MS,
		});

		const timeoutId = window.setTimeout(() => {
			pendingUnbookmarkTimersRef.current.delete(offerId);
			setPendingUnsave((prev) => {
				const next = new Set(prev);
				next.delete(offerId);
				return next;
			});
			setBookmarked((prev) => {
				const next = new Set(prev);
				next.delete(offerId);
				return next;
			});
			tracking.trackUnbookmark(offerId);
			toast.dismiss(toastId);
		}, UNBOOKMARK_UNDO_MS);
		pendingUnbookmarkTimersRef.current.set(offerId, timeoutId);
	}, [cancelPendingUnbookmark]);

	const handleSave = useCallback((offerId: string) => {
		if (cancelPendingUnbookmark(offerId, true)) return;

		if (bookmarked.has(offerId)) {
			scheduleUnbookmark(offerId);
			return;
		}

		const knownJob = jobs.find((job) => job.job_id === offerId)
			?? savedJobs.find((job) => job.job_id === offerId);
		if (knownJob) {
			setSavedJobs((existing) => mergeUniqueJobs(existing, [{ ...knownJob, bookmarked: true }]));
		}

		setBookmarked((prev) => {
			const next = new Set(prev);
			next.add(offerId);
			return next;
		});
		tracking.trackBookmark(offerId);
		toast.success("Saved offer");
	}, [
		bookmarked,
		cancelPendingUnbookmark,
		jobs,
		savedJobs,
		scheduleUnbookmark,
	]);

	const savedVisibleJobs = useMemo(
		() => savedJobs.filter((job) => bookmarked.has(job.job_id) || pendingUnsave.has(job.job_id)),
		[bookmarked, pendingUnsave, savedJobs],
	);
	const normalizedSearchQuery = searchQuery.trim().toLowerCase();
	const visibleJobs = useMemo(() => {
		const baseJobs = activeTab === "saved" ? savedVisibleJobs : jobs;
		if (!normalizedSearchQuery) return baseJobs;
		return baseJobs.filter((job) => matchesJobSearch(job, normalizedSearchQuery));
	}, [activeTab, jobs, normalizedSearchQuery, savedVisibleJobs]);
	const savedCount = Math.max(0, bookmarked.size - pendingUnsave.size);
	const loadingInitial = activeTab === "all"
		? jobs.length === 0 && !done
		: savedVisibleJobs.length === 0 && (!savedLoaded || savedLoading);
	const currentLoadingMore = activeTab === "all" ? loadingMore : savedLoadingMore;
	const currentDone = activeTab === "all" ? done : savedDone;
	const emptyMessage = normalizedSearchQuery
		? activeTab === "saved"
			? "No saved offers match your search."
			: "No offers match your search."
		: activeTab === "saved"
			? "No saved offers yet."
			: "No offers available right now.";

	useEffect(() => {
		if (!normalizedSearchQuery) return;
		const timer = window.setTimeout(() => {
			tracking.trackSearch(
				searchQuery.trim(),
				{ source: "offers", tab: activeTab },
				visibleJobs.length,
			);
		}, 400);
		return () => window.clearTimeout(timer);
	}, [activeTab, normalizedSearchQuery, searchQuery, visibleJobs.length]);

	if (loadingInitial) {
		return (
			<div className="p-6 space-y-6">
				<OffersHeader
					activeTab={activeTab}
					onTabChange={setActiveTab}
					savedCount={savedCount}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
				/>
				<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}
				</div>
			</div>
		);
	}

	if (visibleJobs.length === 0) {
		return (
			<div className="p-6 space-y-6">
				<OffersHeader
					activeTab={activeTab}
					onTabChange={setActiveTab}
					savedCount={savedCount}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
				/>
				<Card>
					<CardContent className="py-10 text-center text-sm text-muted-foreground">
						{emptyMessage}
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<OffersHeader
				activeTab={activeTab}
				onTabChange={setActiveTab}
				savedCount={savedCount}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>

			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{visibleJobs.map((job, index) => {
					const props = convertJobToCardProps(job);
					const isPendingUnsave = pendingUnsave.has(job.job_id);
					return (
						<JobCard
							key={job.job_id}
							{...props}
							isSaved={bookmarked.has(job.job_id) && !isPendingUnsave}
							detailSource="offers"
							showMatchScore={false}
							position={index}
							onSave={handleSave}
							onView={handleView}
						/>
					);
				})}
				{currentLoadingMore && Array.from({ length: SKELETON_COUNT }).map((_, i) => (
					<SkeletonCard key={`skeleton-${i}`} />
				))}
			</div>

			{(activeTab === "all" || visibleJobs.length > 0) && (
				<div
					ref={sentinelRef}
					className="flex items-center justify-center py-8 text-xs text-muted-foreground"
					aria-hidden={currentDone && !currentLoadingMore}
				>
					{currentLoadingMore ? (
						<span className="inline-flex items-center gap-2">
							<Loader2 className="w-4 h-4 animate-spin" />
							Loading more…
						</span>
					) : currentDone ? (
						<span>{activeTab === "saved" ? "All saved offers loaded." : "You've reached the end."}</span>
					) : (
						<span>&nbsp;</span>
					)}
				</div>
			)}
		</div>
	);
}

function OffersHeader({
	activeTab,
	onTabChange,
	savedCount,
	searchQuery,
	onSearchChange,
}: {
	activeTab: OffersTab;
	onTabChange: (tab: OffersTab) => void;
	savedCount: number;
	searchQuery: string;
	onSearchChange: (query: string) => void;
}) {
	return (
		<header className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Offers</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Browse recruiter offers ranked for you. Scroll to load more.
					</p>
				</div>
				<Tabs value={activeTab} onValueChange={(value) => onTabChange(value as OffersTab)}>
					<TabsList>
						<TabsTrigger value="all">All offers</TabsTrigger>
						<TabsTrigger value="saved" className="gap-1.5">
							<Bookmark className="w-4 h-4" />
							Saved
							{savedCount > 0 && (
								<span className="ml-1 rounded-full bg-background px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
									{savedCount}
								</span>
							)}
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 min-w-[220px]">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search by title, company, description..."
						value={searchQuery}
						onChange={(event) => onSearchChange(event.target.value)}
						className="pl-10 h-9"
					/>
				</div>
				{searchQuery && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => onSearchChange("")}
						className="h-9 gap-1.5 text-muted-foreground"
					>
						<X className="h-3.5 w-3.5" />
						Clear
					</Button>
				)}
			</div>
		</header>
	);
}

export default OffersScreen;
