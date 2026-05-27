"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import {
  generateStudentDocuments,
  openGeneratedCoverLetter,
  openGeneratedCv,
  type GeneratedDocumentProfile,
  type GeneratedJobOffer,
} from "@/lib/api/document-generator";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExperienceRow = {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  highlights: string;
};

type EducationRow = {
  id: string;
  school: string;
  degree: string;
  period: string;
  details: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => crypto.randomUUID();

const makeEmptyExperience = (): ExperienceRow => ({
  id: uid(),
  role: "",
  company: "",
  location: "",
  period: "",
  highlights: "",
});

const makeEmptyEducation = (): EducationRow => ({
  id: uid(),
  school: "",
  degree: "",
  period: "",
  details: "",
});

function splitLines(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </span>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-sky-500 dark:focus:ring-sky-900/40 ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-sky-500 dark:focus:ring-sky-900/40 ${props.className ?? ""}`}
    />
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">
        {children}
      </h2>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocumentGeneratorScreen() {
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openingDocId, setOpeningDocId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; company?: string }>({});
  const [success, setSuccess] = useState("");
  const [generatedCvId, setGeneratedCvId] = useState("");
  const [generatedCoverLetterId, setGeneratedCoverLetterId] = useState("");

  const [profile, setProfile] = useState<GeneratedDocumentProfile>({
    name: "", email: "", phone: "", location: "", targetedRole: "",
    organization: "", summary: "", githubUrl: "", linkedinUrl: "",
    websiteUrl: "", skills: [], languages: [], certifications: [],
    experiences: [], education: [],
  });

  const [skillsInput, setSkillsInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [certificationsInput, setCertificationsInput] = useState("");
  const [experiences, setExperiences] = useState<ExperienceRow[]>([makeEmptyExperience()]);
  const [education, setEducation] = useState<EducationRow[]>([makeEmptyEducation()]);

  const [offer, setOffer] = useState<GeneratedJobOffer>({
    title: "", company: "", location: "", domain: "", type: "",
    workMode: "", description: "", requirements: [], benefits: [], recruiterName: "",
  });
  const [requirementsInput, setRequirementsInput] = useState("");
  const [benefitsInput, setBenefitsInput] = useState("");

  // Cancelled-fetch guard
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function loadProfile() {
      try {
        const response = await fetchWithAuth(`${getClientApiBaseUrl()}/onboard/profile`, {
          method: "GET",
        });

        if (!response.ok) throw new Error("Failed to load your profile");

        const payload = (await response.json()) as {
          name?: string | null;
          email?: string | null;
          location?: string | null;
          targeted_role?: string | null;
          organization?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          skills?: string[];
          education?: string[];
          experiences?: string[];
          achievements?: string[];
        };

        if (cancelledRef.current) return;

        setProfile((current) => ({
          ...current,
          name: payload.name || current.name,
          email: payload.email || current.email,
          location: payload.location || current.location,
          targetedRole: payload.targeted_role || current.targetedRole,
          organization: payload.organization || current.organization,
          githubUrl: payload.github_url || current.githubUrl,
          linkedinUrl: payload.linkedin_url || current.linkedinUrl,
          skills: payload.skills || current.skills,
          certifications: payload.achievements || current.certifications,
        }));

        setSkillsInput((payload.skills ?? []).join(", "));
        setCertificationsInput((payload.achievements ?? []).join(", "));

        const remoteEducation = (payload.education ?? []).slice(0, 3).map((entry) => ({
          ...makeEmptyEducation(),
          school: entry,
        }));
        setEducation(remoteEducation.length ? remoteEducation : [makeEmptyEducation()]);

        const remoteExperiences = (payload.experiences ?? []).slice(0, 3).map((entry) => ({
          ...makeEmptyExperience(),
          role: entry,
        }));
        setExperiences(remoteExperiences.length ? remoteExperiences : [makeEmptyExperience()]);
      } catch (loadError) {
        if (!cancelledRef.current) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load profile");
        }
      } finally {
        if (!cancelledRef.current) setIsLoadingProfile(false);
      }
    }

    void loadProfile();
    return () => { cancelledRef.current = true; };
  }, []);

  const updateExperience = useCallback(
    (id: string, field: keyof ExperienceRow, value: string) => {
      setExperiences((current) =>
        current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      );
    },
    [],
  );

  const removeExperience = useCallback((id: string) => {
    setExperiences((current) => (current.length > 1 ? current.filter((e) => e.id !== id) : current));
  }, []);

  const updateEducation = useCallback(
    (id: string, field: keyof EducationRow, value: string) => {
      setEducation((current) =>
        current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
      );
    },
    [],
  );

  const removeEducation = useCallback((id: string) => {
    setEducation((current) => (current.length > 1 ? current.filter((e) => e.id !== id) : current));
  }, []);

  // ── Client-side validation ─────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors: { title?: string; company?: string } = {};
    if (!offer.title?.trim()) errors.title = "Job title is required";
    if (!offer.company?.trim()) errors.company = "Company is required";
    // Require structured experience fields: for any filled experience row,
    // ensure role, company, period, and highlights are provided.
    for (const item of experiences) {
      const hasAny = item.role.trim() || item.company.trim() || item.highlights.trim() || item.period.trim();
      if (hasAny) {
        if (!item.role.trim() || !item.company.trim() || !item.highlights.trim() || !item.period.trim()) {
          setError('Please provide role, company, period, and highlights for each filled experience entry.');
          return false;
        }
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setGeneratedCvId("");
    setGeneratedCoverLetterId("");
    setFieldErrors({});

    if (!validate()) return;

    setIsGenerating(true);

    try {
      const profilePayload: GeneratedDocumentProfile = {
        ...profile,
        skills: splitLines(skillsInput),
        languages: splitLines(languagesInput),
        certifications: splitLines(certificationsInput),
        experiences: experiences
          .filter((item) => item.role.trim() || item.company.trim() || item.highlights.trim())
          .map((item) => ({
            role: item.role.trim(),
            company: item.company.trim(),
            location: item.location.trim(),
            period: item.period.trim(),
            highlights: splitLines(item.highlights),
          })),
        education: education
          .filter((item) => item.school.trim() || item.degree.trim() || item.details.trim())
          .map((item) => ({
            school: item.school.trim(),
            degree: item.degree.trim(),
            period: item.period.trim(),
            details: splitLines(item.details),
          })),
      };

      const offerPayload: GeneratedJobOffer = {
        ...offer,
        requirements: splitLines(requirementsInput),
        benefits: splitLines(benefitsInput),
      };

      const result = await generateStudentDocuments({ profile: profilePayload, offer: offerPayload });

      setGeneratedCvId(result.cv?.id ?? "");
      setGeneratedCoverLetterId(result.coverLetter?.id ?? "");
      setSuccess("Your CV and cover letter were generated and saved successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Open doc handler (shows inline loading state) ──────────────────────────

  const handleOpenDoc = async (docId: string, type: "cv" | "coverLetter") => {
    setOpeningDocId(docId);
    try {
      if (type === "cv") await openGeneratedCv(docId);
      else await openGeneratedCoverLetter(docId);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Failed to open document");
    } finally {
      setOpeningDocId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered · Groq llama-3.3-70b
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                Document Generator
              </h1>
              <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
                Fill in your profile and the job offer once. The AI tailors your CV summary,
                experience bullets, and cover letter — then uploads both PDFs to your document library.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-400">
              {[
                [FileText, "Cloudinary storage, no local files"],
                [Upload, "Server-side PDF generation"],
                [CheckCircle2, "Immediately reusable in applications"],
              ].map(([Icon, text], i) => (
                <div key={i} className="flex items-center gap-2">
                  {/* @ts-ignore */}
                  <Icon className="h-3.5 w-3.5 text-sky-500" />
                  <span>{text as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* ── LEFT: Profile ─────────────────────────────────────────── */}
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Profile</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Pre-filled from your saved profile where available.
                </p>
              </div>

              {/* Personal */}
              <div className="space-y-3">
                <SectionHeading>Personal</SectionHeading>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <FieldLabel>Full name</FieldLabel>
                    <Input value={profile.name ?? ""} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel>Email</FieldLabel>
                    <Input type="email" value={profile.email ?? ""} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel>Phone</FieldLabel>
                    <Input value={profile.phone ?? ""} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+1 555 000 0000" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <FieldLabel>Location</FieldLabel>
                    <Input value={profile.location ?? ""} onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))} placeholder="City, Country" />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel>Targeted role</FieldLabel>
                    <Input value={profile.targetedRole ?? ""} onChange={(e) => setProfile((p) => ({ ...p, targetedRole: e.target.value }))} placeholder="Software Engineer" />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel>Organization / School</FieldLabel>
                    <Input value={profile.organization ?? ""} onChange={(e) => setProfile((p) => ({ ...p, organization: e.target.value }))} placeholder="ESPRIT" />
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3">
                <SectionHeading>Links</SectionHeading>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["githubUrl", "linkedinUrl", "websiteUrl"] as const).map((key) => (
                    <div key={key} className="space-y-1">
                      <FieldLabel>{key === "githubUrl" ? "GitHub" : key === "linkedinUrl" ? "LinkedIn" : "Website"}</FieldLabel>
                      <Input value={(profile[key] as string) ?? ""} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} placeholder={`https://${key === "githubUrl" ? "github.com/you" : key === "linkedinUrl" ? "linkedin.com/in/you" : "yoursite.com"}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3">
                <SectionHeading>Summary</SectionHeading>
                <div className="space-y-1">
                  <FieldLabel>Professional summary (optional — AI will generate one)</FieldLabel>
                  <Textarea rows={3} value={profile.summary ?? ""} onChange={(e) => setProfile((p) => ({ ...p, summary: e.target.value }))} placeholder="Brief summary of your background and goals…" />
                </div>
              </div>

              {/* Skills / Languages / Certs */}
              <div className="space-y-3">
                <SectionHeading>Skills &amp; Qualifications</SectionHeading>
                <div className="space-y-1">
                  <FieldLabel>Skills (comma or newline separated)</FieldLabel>
                  <Textarea rows={2} value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="React, TypeScript, Node.js, PostgreSQL…" />
                </div>
                <div className="space-y-1">
                  <FieldLabel>Languages</FieldLabel>
                  <Textarea rows={2} value={languagesInput} onChange={(e) => setLanguagesInput(e.target.value)} placeholder="English (Fluent), French (Professional)…" />
                </div>
                <div className="space-y-1">
                  <FieldLabel>Certifications / achievements</FieldLabel>
                  <Textarea rows={2} value={certificationsInput} onChange={(e) => setCertificationsInput(e.target.value)} placeholder="AWS Certified Developer, Meta React Certificate…" />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionHeading>Experience</SectionHeading>
                  <button
                    type="button"
                    onClick={() => setExperiences((c) => [...c, makeEmptyExperience()])}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>

                <div className="space-y-3">
                  {experiences.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                    >
                      <button
                        type="button"
                        onClick={() => removeExperience(item.id)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input placeholder="Role" value={item.role} onChange={(e) => updateExperience(item.id, "role", e.target.value)} />
                        <Input placeholder="Company" value={item.company} onChange={(e) => updateExperience(item.id, "company", e.target.value)} />
                        <Input placeholder="Location" value={item.location} onChange={(e) => updateExperience(item.id, "location", e.target.value)} />
                        <Input placeholder="Period (e.g. Jan 2022 – Present)" value={item.period} onChange={(e) => updateExperience(item.id, "period", e.target.value)} />
                      </div>
                      <Textarea
                        rows={2}
                        className="mt-2"
                        placeholder="Highlights, one per line — AI will polish these into bullets"
                        value={item.highlights}
                        onChange={(e) => updateExperience(item.id, "highlights", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <SectionHeading>Education</SectionHeading>
                  <button
                    type="button"
                    onClick={() => setEducation((c) => [...c, makeEmptyEducation()])}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>

                <div className="space-y-3">
                  {education.map((item) => (
                    <div
                      key={item.id}
                      className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                    >
                      <button
                        type="button"
                        onClick={() => removeEducation(item.id)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input placeholder="School / Institution" value={item.school} onChange={(e) => updateEducation(item.id, "school", e.target.value)} />
                        <Input placeholder="Degree / Programme" value={item.degree} onChange={(e) => updateEducation(item.id, "degree", e.target.value)} />
                        <Input placeholder="Period (e.g. 2019 – 2023)" value={item.period} onChange={(e) => updateEducation(item.id, "period", e.target.value)} />
                      </div>
                      <Textarea
                        rows={2}
                        className="mt-2"
                        placeholder="Notable details, GPA, relevant courses…"
                        value={item.details}
                        onChange={(e) => updateEducation(item.id, "details", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Job offer + submit ──────────────────────────────── */}
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Job Offer</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  The more detail you provide, the more targeted the AI-generated documents will be.
                </p>
              </div>

              <div className="space-y-3">
                <SectionHeading>Position</SectionHeading>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <FieldLabel>Job title <span className="text-rose-500">*</span></FieldLabel>
                    <Input
                      required
                      value={offer.title ?? ""}
                      onChange={(e) => {
                        setOffer((o) => ({ ...o, title: e.target.value }));
                        if (fieldErrors.title) setFieldErrors((fe) => ({ ...fe, title: undefined }));
                      }}
                      placeholder="Frontend Engineer"
                      className={fieldErrors.title ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100" : ""}
                    />
                    {fieldErrors.title && <p className="text-xs text-rose-500">{fieldErrors.title}</p>}
                  </div>
                  <div className="space-y-1">
                    <FieldLabel>Company <span className="text-rose-500">*</span></FieldLabel>
                    <Input
                      required
                      value={offer.company ?? ""}
                      onChange={(e) => {
                        setOffer((o) => ({ ...o, company: e.target.value }));
                        if (fieldErrors.company) setFieldErrors((fe) => ({ ...fe, company: undefined }));
                      }}
                      placeholder="Acme Corp"
                      className={fieldErrors.company ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100" : ""}
                    />
                    {fieldErrors.company && <p className="text-xs text-rose-500">{fieldErrors.company}</p>}
                  </div>
                  <div className="space-y-1">
                    <FieldLabel>Location</FieldLabel>
                    <Input value={offer.location ?? ""} onChange={(e) => setOffer((o) => ({ ...o, location: e.target.value }))} placeholder="Paris, France" />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel>Domain / Industry</FieldLabel>
                    <Input value={offer.domain ?? ""} onChange={(e) => setOffer((o) => ({ ...o, domain: e.target.value }))} placeholder="FinTech, Healthcare…" />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel>Offer type</FieldLabel>
                    <Input value={offer.type ?? ""} onChange={(e) => setOffer((o) => ({ ...o, type: e.target.value }))} placeholder="Internship, Full-time…" />
                  </div>
                  <div className="space-y-1">
                    <FieldLabel>Work mode</FieldLabel>
                    <Input value={offer.workMode ?? ""} onChange={(e) => setOffer((o) => ({ ...o, workMode: e.target.value }))} placeholder="Remote, Hybrid, On-site" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <FieldLabel>Recruiter name</FieldLabel>
                    <Input value={offer.recruiterName ?? ""} onChange={(e) => setOffer((o) => ({ ...o, recruiterName: e.target.value }))} placeholder="Sarah Johnson" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <SectionHeading>Details</SectionHeading>
                <div className="space-y-1">
                  <FieldLabel>Description</FieldLabel>
                  <Textarea rows={5} value={offer.description ?? ""} onChange={(e) => setOffer((o) => ({ ...o, description: e.target.value }))} placeholder="Paste the job description here — the AI uses this to tailor your documents." />
                </div>
                <div className="space-y-1">
                  <FieldLabel>Requirements (comma or newline separated)</FieldLabel>
                  <Textarea rows={3} value={requirementsInput} onChange={(e) => setRequirementsInput(e.target.value)} placeholder="3+ years React, REST APIs, team collaboration…" />
                </div>
                <div className="space-y-1">
                  <FieldLabel>Benefits</FieldLabel>
                  <Textarea rows={2} value={benefitsInput} onChange={(e) => setBenefitsInput(e.target.value)} placeholder="Health insurance, flexible hours, remote Fridays…" />
                </div>
              </div>

              {/* AI info banner */}
              <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-xs text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <p>
                  The AI reads your profile and this offer to write a tailored summary, action-oriented
                  experience bullets, and a personalised cover letter — not generic templates.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isGenerating || isLoadingProfile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating with AI…
                  </>
                ) : (
                  <>
                    Generate CV &amp; Cover Letter
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Status messages */}
              {(error || success) && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    error
                      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                  }`}
                >
                  {error || success}
                </div>
              )}

              {/* Generated document buttons */}
              {(generatedCvId || generatedCoverLetterId) && (
                <div className="grid gap-3">
                  {generatedCvId && (
                    <button
                      type="button"
                      disabled={openingDocId === generatedCvId}
                      onClick={() => void handleOpenDoc(generatedCvId, "cv")}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-300 hover:bg-sky-50/50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-700 dark:hover:bg-sky-950/20"
                    >
                      {openingDocId === generatedCvId ? (
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-sky-500" />
                      ) : (
                        <FileText className="h-5 w-5 shrink-0 text-sky-500" />
                      )}
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Generated CV</div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {openingDocId === generatedCvId ? "Fetching…" : "Open CV"}
                        </div>
                      </div>
                    </button>
                  )}
                  {generatedCoverLetterId && (
                    <button
                      type="button"
                      disabled={openingDocId === generatedCoverLetterId}
                      onClick={() => void handleOpenDoc(generatedCoverLetterId, "coverLetter")}
                      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-300 hover:bg-sky-50/50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-700 dark:hover:bg-sky-950/20"
                    >
                      {openingDocId === generatedCoverLetterId ? (
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-sky-500" />
                      ) : (
                        <FileText className="h-5 w-5 shrink-0 text-indigo-500" />
                      )}
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Generated Cover Letter</div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {openingDocId === generatedCoverLetterId ? "Fetching…" : "Open Cover Letter"}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Navigation links */}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review previous documents:{" "}
                <Link href="/services/cover-letters/database" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                  Cover letter history
                </Link>{" "}
                ·{" "}
                <Link href="/services/cv-rewriter/database" className="font-medium text-sky-600 hover:underline dark:text-sky-400">
                  CV history
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}