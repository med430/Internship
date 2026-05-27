"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Building2, Calendar, Briefcase, Wifi, BadgeDollarSign, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CVSelector, type CVSource } from "@/components/shared/cv-selector";
import { CoverLetterSelector, type CoverLetterSource } from "@/components/shared/cover-letter-selector";
import { fetchOffer, type Offer } from "@/lib/api/offers";
import { createApplication } from "@/lib/api/applications";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";

async function uploadCvIfNeeded(source: CVSource): Promise<string> {
  if (source.type === "database") return source.cv.id;

  const apiUrl = getClientApiBaseUrl();
  const form = new FormData();
  form.append("cv", source.file);

  const response = await fetchWithAuth(`${apiUrl}/cvs`, { method: "POST", body: form });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to upload CV");
  }

  const payload = (await response.json()) as { id?: string };
  if (!payload.id) throw new Error("Uploaded CV id not returned");
  return payload.id;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function WorkModeBadge({ mode }: { mode: string }) {
  const colors: Record<string, string> = {
    REMOTE: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    ONSITE: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    HYBRID: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${colors[mode] ?? "bg-muted text-muted-foreground"}`}>
      <Wifi className="h-3 w-3" />
      {mode}
    </span>
  );
}

export function OfferDetailScreen({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState<CVSource | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetterSource | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOffer(offerId)
      .then(setOffer)
      .catch(() => toast.error("Failed to load offer"))
      .finally(() => setLoading(false));
  }, [offerId]);

  const openApply = () => {
    setSelectedCv(null);
    setSelectedCoverLetter(null);
    setApplyOpen(true);
  };

  const submitApplication = async () => {
    if (!offer) return;
    if (!selectedCv) {
      toast.error("Please select a CV before applying");
      return;
    }

    setSubmitting(true);
    try {
      const cvId = await uploadCvIfNeeded(selectedCv);
      const coverLetterId =
        selectedCoverLetter?.type === "database" ? selectedCoverLetter.letter.id : undefined;

      await createApplication({ offerId: offer.id, cvId, ...(coverLetterId ? { coverLetterId } : {}) });
      toast.success("Application submitted successfully!");
      setApplyOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground animate-pulse">Loading offer...</div>;
  }

  if (!offer) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground mb-4">Offer not found.</p>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back to offers
      </Button>

      {/* Main card — everything in one place */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{offer.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{offer.company}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{offer.location}</span>
              </div>
            </div>
            <Button size="lg" onClick={openApply}>Apply now</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <WorkModeBadge mode={offer.workMode} />
            <Badge variant="secondary" className="gap-1">
              <Briefcase className="h-3 w-3" />{offer.type}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Tag className="h-3 w-3" />{offer.domain}
            </Badge>
            {offer.isPaid && (
              <Badge variant="secondary" className="gap-1 text-green-700 dark:text-green-400">
                <BadgeDollarSign className="h-3 w-3" />Paid
              </Badge>
            )}
          </div>

          {/* Dates */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground border-t pt-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Start: <strong className="text-foreground">{formatDate(offer.startDate)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              End: <strong className="text-foreground">{formatDate(offer.endDate)}</strong>
            </span>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <CardTitle className="text-base mb-3">Description</CardTitle>
            <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{offer.description}</p>
          </div>

          {/* Skills */}
          {offer.skillRequirements && offer.skillRequirements.length > 0 && (
            <>
              <Separator />
              <div>
                <CardTitle className="text-base mb-3">Required skills</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {offer.skillRequirements.map((sr) => (
                    <Badge key={sr.id} variant="outline" className="gap-1.5 px-3 py-1">
                      {sr.skill.name}
                      <span className="text-muted-foreground text-[10px]">{sr.level}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Apply modal */}
      <Dialog open={applyOpen} onOpenChange={(open) => { if (!open) setApplyOpen(false); }}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply to {offer.title}</DialogTitle>
            <DialogDescription>
              Select a CV and an optional cover letter to submit your application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            <CVSelector onCVSelect={setSelectedCv} />
            <CoverLetterSelector onSelect={setSelectedCoverLetter} />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApplyOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button onClick={submitApplication} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}