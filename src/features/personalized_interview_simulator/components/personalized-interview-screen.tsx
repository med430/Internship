"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Loader2,
  MapPin,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { InterviewNav } from "@/components/virtual-interviewer/interview-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { jobFilterAPI } from "@/lib/api/job-filter-client";
import { startInterview } from "@/lib/api/interviews";
import type { JobDocument } from "@/types/job-matcher";
import { cn } from "@/lib/utils";

const QUESTION_COUNT = 12;

function getSelectedPersona() {
  if (typeof window === "undefined") return "alex_chen";
  return localStorage.getItem("selectedPersona") || "alex_chen";
}

function getOfferSearchText(offer: JobDocument) {
  return [
    offer.title,
    offer.company,
    offer.location,
    offer.job_function,
    offer.employment_type,
    offer.work_model,
    offer.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function PersonalizedInterviewScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<JobDocument[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let mounted = true;

    jobFilterAPI
      .filterJobs({ limit: 24, explore: true })
      .then((response) => {
        if (!mounted) return;
        const incoming = response.jobs ?? [];
        setOffers(incoming);
        setSelectedOfferId(incoming[0]?.job_id ?? null);
      })
      .catch((error) => {
        if (!mounted) return;
        toast.error(
          error instanceof Error ? error.message : "Failed to load offers",
        );
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return offers;
    return offers.filter((offer) => getOfferSearchText(offer).includes(query));
  }, [offers, search]);

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.job_id === selectedOfferId) ?? null,
    [offers, selectedOfferId],
  );

  const handleStart = useCallback(async () => {
    if (!selectedOffer) {
      toast.error("Choose an offer before starting.");
      return;
    }

    setIsStarting(true);
    const personaKey = getSelectedPersona();

    try {
      const interview = await startInterview({
        personaKey,
        questionCount: QUESTION_COUNT,
        company: selectedOffer.company,
        jobTitle: selectedOffer.title,
        jobDescription: selectedOffer.description,
      });

      if (interview.audioBase64 && interview.audioMime) {
        sessionStorage.setItem(
          `interview-audio:${interview.interviewId}`,
          JSON.stringify({
            audioBase64: interview.audioBase64,
            audioMime: interview.audioMime,
          }),
        );
      }

      router.push(
        `/services/virtual-interviewer/room?persona=${personaKey}&interviewId=${encodeURIComponent(
          interview.interviewId,
        )}&question=${encodeURIComponent(interview.questionText)}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start personalized interview.",
      );
      setIsStarting(false);
    }
  }, [router, selectedOffer]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-6xl">
        <InterviewNav />

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline" className="gap-2 border-primary/30">
              <Sparkles className="h-3.5 w-3.5" />
              Personalized Interview
            </Badge>
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                Practice for a Real Offer
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
                Select one offer and start a camera interview tailored to its
                company, role, and job description.
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="h-11 gap-2 rounded-xl"
            disabled={!selectedOffer || isStarting}
            onClick={() => {
              void handleStart();
            }}
          >
            {isStarting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Start Personalized Interview
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/80 shadow-lg backdrop-blur-xl">
            <div className="border-b border-border/70 p-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search offers by title, company, location, or skill"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            <div className="grid max-h-[620px] gap-3 overflow-y-auto p-5">
              {isLoading ? (
                <div className="flex min-h-64 items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading offers...
                </div>
              ) : filteredOffers.length === 0 ? (
                <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
                  No offers match your search.
                </div>
              ) : (
                filteredOffers.map((offer) => {
                  const selected = selectedOfferId === offer.job_id;
                  return (
                    <button
                      key={offer.job_id}
                      type="button"
                      onClick={() => setSelectedOfferId(offer.job_id)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/70 bg-background/50 hover:border-primary/40 hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="line-clamp-2 text-base font-semibold text-foreground">
                            {offer.title}
                          </h2>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {offer.company}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {offer.location}
                            </span>
                          </div>
                        </div>
                        {selected ? (
                          <Badge className="gap-1">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Selected
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {offer.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {offer.job_function ? (
                          <Badge variant="secondary">{offer.job_function}</Badge>
                        ) : null}
                        {offer.employment_type ? (
                          <Badge variant="outline">{offer.employment_type}</Badge>
                        ) : null}
                        {offer.work_model ? (
                          <Badge variant="outline">{offer.work_model}</Badge>
                        ) : null}
                        {typeof offer.match_score === "number" ? (
                          <Badge variant="outline">
                            {Math.round(offer.match_score)}% match
                          </Badge>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-2xl border-border/70 bg-card/80 p-6 shadow-lg backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <BriefcaseBusiness className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    Selected Offer
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Used as interview context
                  </p>
                </div>
              </div>

              {selectedOffer ? (
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedOffer.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedOffer.company}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="text-xs text-muted-foreground">Questions</p>
                      <p className="mt-1 font-semibold">{QUESTION_COUNT}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="text-xs text-muted-foreground">Mode</p>
                      <p className="mt-1 font-semibold">Camera</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">
                  Choose an offer from the list.
                </p>
              )}
            </Card>

            <Card className="rounded-2xl border-border/70 bg-card/80 p-6 shadow-lg backdrop-blur-xl">
              <h2 className="font-semibold text-foreground">Personalization</h2>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  Role-specific technical and motivation questions
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  Camera-based communication cues in the final report
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  Voice metrics can be added next from the simulator logic
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
