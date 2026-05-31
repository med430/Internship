"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type CVSource } from "@/components/shared/cv-selector";
import { useJobMatcher } from "@/hooks/use-job-matcher";
import type { JobSearchFilters } from "@/types/job-matcher";
import {
  ARRAY_FILTER_TYPES,
  DEFAULT_FILTERS,
  JOBS_PER_PAGE,
  NUMBER_FILTER_TYPES,
  STORAGE_KEYS,
} from "../lib/constants";
import { buildActiveFilterTags } from "../lib/utils";
import { textExtractorAPI } from "@/lib/api/text-extractor-client";
import { tracking } from "@/lib/api/tracking-client";

export function useJobMatcherController() {
  const {
    allJobs,
    page,
    setPage,
    isLoading,
    error,
    backendMessage,
    matchJobs,
    filterJobs,
    hasPrevPage,
  } = useJobMatcher();

  const [searchQuery, setSearchQuery] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCVSelector, setShowCVSelector] = useState(false);
  const [activeFilters, setActiveFilters] = useState<JobSearchFilters>({});
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [selectedCVSource, setSelectedCVSource] = useState<CVSource | null>(
    null,
  );
  const [resumeContent, setResumeContent] = useState("");
  const [isExtractingCV, setIsExtractingCV] = useState(false);
  const [shouldFetchJobs, setShouldFetchJobs] = useState(false);

  const topOfResultsRef = useRef<HTMLDivElement>(null);
  const lastFetchParamsRef = useRef("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_JOBS);
    const savedFilters = localStorage.getItem(STORAGE_KEYS.ACTIVE_FILTERS);
    const savedCVSource = localStorage.getItem(STORAGE_KEYS.SELECTED_CV);

    if (saved) {
      setSavedJobs(new Set(JSON.parse(saved)));
    }

    if (savedFilters) {
      try {
        setActiveFilters(JSON.parse(savedFilters));
      } catch {
        setActiveFilters(DEFAULT_FILTERS);
      }
    } else {
      setActiveFilters(DEFAULT_FILTERS);
    }

    if (savedCVSource) {
      try {
        const parsedCVSource = JSON.parse(savedCVSource);
        if (parsedCVSource.type === "database") {
          setSelectedCVSource(parsedCVSource);
        }
      } catch {}
    }

    setFiltersLoaded(true);
    setShouldFetchJobs(true);
  }, []);

  useEffect(() => {
    const extractResumeContent = async () => {
      if (!selectedCVSource) {
        setResumeContent("");
        return;
      }

      setIsExtractingCV(true);
      try {
        if (selectedCVSource.type === "file") {
          const text = await textExtractorAPI.extractText(
            selectedCVSource.file,
          );
          setResumeContent(text);
        } else {
          setResumeContent(
            selectedCVSource.cv.anonymized_cv_text ||
              selectedCVSource.cv.jobs_summary ||
              "",
          );
        }
      } catch {
        setResumeContent("");
      } finally {
        setIsExtractingCV(false);
        setShouldFetchJobs(true);
      }
    };

    extractResumeContent();
  }, [selectedCVSource]);

  useEffect(() => {
    if (!filtersLoaded || isLoading || isExtractingCV || !shouldFetchJobs) {
      return;
    }

    const fetchParams = JSON.stringify({
      filters: activeFilters,
      resumeLength: resumeContent.length,
    });

    if (lastFetchParamsRef.current === fetchParams) {
      setShouldFetchJobs(false);
      return;
    }

    lastFetchParamsRef.current = fetchParams;
    setShouldFetchJobs(false);

    filterJobs(activeFilters, resumeContent.trim() || "").catch(
      () => undefined,
    );
  }, [
    shouldFetchJobs,
    filtersLoaded,
    activeFilters,
    resumeContent,
    filterJobs,
    isLoading,
    isExtractingCV,
  ]);

  useEffect(() => {
    if (filtersLoaded) {
      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_FILTERS,
        JSON.stringify(activeFilters),
      );
    }
  }, [activeFilters, filtersLoaded]);

  useEffect(() => {
    if (selectedCVSource?.type === "database") {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_CV,
        JSON.stringify(selectedCVSource),
      );
      return;
    }

    if (selectedCVSource === null) {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_CV);
    }
  }, [selectedCVSource]);

  useEffect(() => {
    if (!topOfResultsRef.current) {
      return;
    }

    topOfResultsRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [page]);

  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [modeFilter, setModeFilter] = useState<string[]>([]);
  const [paidOnly, setPaidOnly] = useState(false);

  const filteredAllJobs = useMemo(() => {
    let jobs = allJobs || [];

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      jobs = jobs.filter((job) =>
        [job.title, job.company, job.description]
          .join(" ")
          .toLowerCase()
          .includes(query),
      );
    }

    if (typeFilter.length > 0) {
      jobs = jobs.filter((job) =>
        typeFilter.some(
          (t) => (job.employment_type ?? "").toLowerCase() === t.toLowerCase(),
        ),
      );
    }

    if (modeFilter.length > 0) {
      jobs = jobs.filter((job) =>
        modeFilter.some(
          (m) => (job.work_model ?? "").toLowerCase() === m.toLowerCase(),
        ),
      );
    }

    if (paidOnly) {
      jobs = jobs.filter((job) => job.is_paid === true);
    }

    return jobs;
  }, [allJobs, searchQuery, typeFilter, modeFilter, paidOnly]);

  const activeFilterTags = useMemo(() => {
    return buildActiveFilterTags(activeFilters);
  }, [activeFilters]);

  const filteredTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredAllJobs.length / JOBS_PER_PAGE));
  }, [filteredAllJobs.length]);

  const paginatedJobs = useMemo(() => {
    return filteredAllJobs.slice(
      (page - 1) * JOBS_PER_PAGE,
      page * JOBS_PER_PAGE,
    );
  }, [filteredAllJobs, page]);

  useEffect(() => {
    if (page > filteredTotalPages) {
      setPage(1);
    }
  }, [page, filteredTotalPages, setPage]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, setPage]);

  const handleSave = useCallback((jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
        tracking.trackUnbookmark(jobId);
      } else {
        newSet.add(jobId);
        tracking.trackBookmark(jobId);
      }

      localStorage.setItem(
        STORAGE_KEYS.SAVED_JOBS,
        JSON.stringify([...newSet]),
      );
      return newSet;
    });
  }, []);

  const handleView = useCallback((jobId: string, position?: number) => {
    tracking.markOfferViewSource(jobId, "feed", position);
  }, []);

  // Debounced search-query tracking. Fires 400ms after the user stops typing.
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      tracking.trackSearch(searchQuery, activeFilters as Record<string, unknown>, filteredAllJobs.length);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters, filteredAllJobs.length]);

  // Impression batch — one event per card shown on the current page.
  useEffect(() => {
    if (paginatedJobs.length === 0) return;
    tracking.trackImpressions(
      paginatedJobs.map((job, index) => ({
        offerId: job.job_id ?? String(index),
        position: (page - 1) * JOBS_PER_PAGE + index,
        source: "feed",
      })),
    );
  }, [paginatedJobs, page]);

  const handleRefresh = useCallback(async () => {
    await filterJobs(activeFilters, resumeContent.trim() || "");
  }, [activeFilters, filterJobs, resumeContent]);

  const handleApplyFilters = useCallback((filters: JobSearchFilters) => {
    setActiveFilters(filters);
    setShowFilterModal(false);
    setShouldFetchJobs(true);
  }, []);

  const handleResetFilters = useCallback(() => {
    setActiveFilters(DEFAULT_FILTERS);
    setShouldFetchJobs(true);
  }, []);

  const removeFilter = useCallback(
    (filterType: keyof JobSearchFilters, value: string) => {
      const updatedFilters = { ...activeFilters };
      const currentValues = updatedFilters[filterType] as string[];

      if (currentValues && Array.isArray(currentValues)) {
        (updatedFilters[filterType] as string[]) = currentValues.filter(
          (item) => item !== value,
        );

        if ((updatedFilters[filterType] as string[]).length === 0) {
          delete updatedFilters[filterType];
        }
      }

      setActiveFilters(updatedFilters);
      setShouldFetchJobs(true);
    },
    [activeFilters],
  );

  const addQuickFilter = useCallback(
    (filterType: keyof JobSearchFilters, value: string | number) => {
      const updatedFilters = { ...activeFilters };

      if (
        typeof value === "string" &&
        ARRAY_FILTER_TYPES.includes(filterType)
      ) {
        const currentValues = (updatedFilters[filterType] as string[]) || [];
        if (!currentValues.includes(value)) {
          (updatedFilters[filterType] as string[]) = [...currentValues, value];
        }
      }

      if (
        typeof value === "number" &&
        NUMBER_FILTER_TYPES.includes(filterType)
      ) {
        (updatedFilters[filterType] as number) = value;
      }

      setActiveFilters(updatedFilters);
      setShouldFetchJobs(true);
    },
    [activeFilters],
  );

  const handleCVSelect = useCallback((cvSource: CVSource | null) => {
    setSelectedCVSource(cvSource);
    if (cvSource) {
      setShowCVSelector(false);
    }
  }, []);

  const handleRemoveCV = useCallback(() => {
    setSelectedCVSource(null);
    setShouldFetchJobs(true);
  }, []);

  const handleStartMatching = useCallback(async () => {
    if (!resumeContent.trim()) {
      return;
    }

    await matchJobs({
      resume_content: resumeContent.trim(),
      limit: 200,
    });
  }, [matchJobs, resumeContent]);

  const shouldShowCVPrompt =
    !selectedCVSource &&
    !showCVSelector &&
    allJobs.length === 0 &&
    !isLoading &&
    !isExtractingCV;

  const hasDisplayFilters = typeFilter.length > 0 || modeFilter.length > 0 || paidOnly;

  const clearDisplayFilters = useCallback(() => {
    setTypeFilter([]);
    setModeFilter([]);
    setPaidOnly(false);
  }, []);

  return {
    page,
    setPage,
    hasPrevPage,
    isLoading,
    isExtractingCV,
    error,
    backendMessage,
    searchQuery,
    setSearchQuery,
    showFilterModal,
    setShowFilterModal,
    showCVSelector,
    setShowCVSelector,
    selectedCVSource,
    resumeContent,
    activeFilters,
    activeFilterTags,
    filteredAllJobs,
    filteredTotalPages,
    paginatedJobs,
    savedJobs,
    topOfResultsRef,
    shouldShowCVPrompt,
    typeFilter,
    setTypeFilter,
    modeFilter,
    setModeFilter,
    paidOnly,
    setPaidOnly,
    hasDisplayFilters,
    clearDisplayFilters,
    handleSave,
    handleView,
    handleRefresh,
    handleApplyFilters,
    handleResetFilters,
    removeFilter,
    addQuickFilter,
    handleCVSelect,
    handleRemoveCV,
    handleStartMatching,
  };
}
