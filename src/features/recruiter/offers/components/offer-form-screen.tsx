"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CAREER_DOMAINS } from "@/lib/constants/domains";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  DollarSign,
  MapPin,
  Sparkles,
  Tag,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { createOffer, updateOffer } from "@/lib/api/actions/offer-actions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const OFFER_TYPES: { value: string; label: string }[] = [
  { value: "INTERNSHIP", label: "Internship (Stage)" },
  { value: "PFE", label: "PFE" },
  { value: "RESEARCH", label: "Research" },
  { value: "PHD", label: "PhD / Thèse" },
  { value: "ALTERNANCE", label: "Alternance" },
];
const WORK_MODES: { value: string; label: string }[] = [
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
];
const SKILL_LEVELS: { value: string; label: string }[] = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "EXPERT", label: "Expert" },
];

const LEVEL_STYLE: Record<string, string> = {
  BEGINNER:     "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  INTERMEDIATE: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  ADVANCED:     "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  EXPERT:       "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

type SkillEntry = { skillName: string; level: string };

export function RecruiterOfferFormScreen({ offerId }: { offerId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [domain, setDomain] = useState<string>(CAREER_DOMAINS[0] ?? "IT & Software Engineering");
  const [type, setType] = useState<string>("INTERNSHIP");
  const [workMode, setWorkMode] = useState<string>("REMOTE");
  const [isPaid, setIsPaid] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Skills
  const [skillOptions, setSkillOptions] = useState<{ id: string; name: string }[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<SkillEntry[]>([]);
  const [pendingSkill, setPendingSkill] = useState("");
  const [pendingLevel, setPendingLevel] = useState("INTERMEDIATE");

  // Fetch available skills from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query { skills(pageNumber: 1, pageSize: 500) { id name } }`,
          }),
        });
        const json = await res.json();
        const raw: { id: string; name: string }[] = json.data?.skills ?? [];
        setSkillOptions([...raw].sort((a, b) => a.name.localeCompare(b.name)));
      } catch {
        // non-blocking — form still works, skill section stays empty
      }
    })();
  }, []);

  // Load offer data in edit mode
  useEffect(() => {
    if (!offerId) return;
    (async () => {
      setLoading(true);
      try {
        const query = `query($id: ID!){
          offer(id:$id){
            id title description company location domain
            startDate endDate type workMode isPaid
            skillRequirements { id skill { id name } level }
          }
        }`;
        const resp = await fetch(`${API_BASE}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables: { id: offerId } }),
        });
        const json = await resp.json();
        const o = json.data?.offer;
        if (o) {
          setTitle(o.title || "");
          setCompany(o.company || "");
          setDescription(o.description || "");
          setLocation(o.location || "");
          setDomain(o.domain || (CAREER_DOMAINS[0] ?? "IT & Software Engineering"));
          setType(o.type || "INTERNSHIP");
          setWorkMode(o.workMode || "REMOTE");
          setIsPaid(o.isPaid ?? false);
          setStartDate(o.startDate ? o.startDate.split("T")[0] : "");
          setEndDate(o.endDate ? o.endDate.split("T")[0] : "");
          if (o.skillRequirements?.length) {
            setRequiredSkills(
              o.skillRequirements.map((sr: any) => ({
                skillName: sr.skill.name,
                level: sr.level,
              })),
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [offerId]);

  const addSkill = () => {
    if (!pendingSkill) return;
    if (requiredSkills.some((s) => s.skillName === pendingSkill)) return;
    setRequiredSkills((prev) => [...prev, { skillName: pendingSkill, level: pendingLevel }]);
    setPendingSkill("");
    setPendingLevel("INTERMEDIATE");
  };

  const removeSkill = (name: string) =>
    setRequiredSkills((prev) => prev.filter((s) => s.skillName !== name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        title,
        description,
        company,
        location,
        domain,
        isPaid,
        workMode,
        startDate: startDate
          ? new Date(startDate).toISOString()
          : new Date().toISOString(),
        endDate: endDate
          ? new Date(endDate).toISOString()
          : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        type,
        requiredSkills,
      };
      if (offerId) {
        await updateOffer(offerId, body);
      } else {
        await createOffer(body);
      }
      router.push("/recruiter/offers");
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Card className="overflow-hidden border-white/60 bg-white/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader className="border-b border-slate-200/70 dark:border-white/10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300 w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Recruiter workspace
            </div>
            <CardTitle className="text-3xl">
              {offerId ? "Edit offer" : "New offer"}
            </CardTitle>
            <CardDescription>
              Write a clear role, target the right domain, and give students enough
              detail to apply confidently.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Basic info */}
              <section className="space-y-4">
                <SectionHeading>Basic information</SectionHeading>
                <div className="grid gap-4 lg:grid-cols-2">
                  <FormField label="Job title" icon={<Briefcase className="h-4 w-4" />} required>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. AI Engineer Intern"
                      required
                    />
                  </FormField>

                  <FormField label="Company" icon={<Building2 className="h-4 w-4" />}>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Studio"
                    />
                  </FormField>

                  <FormField label="Location" icon={<MapPin className="h-4 w-4" />} required>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Tunis, Tunisia"
                      required
                    />
                  </FormField>

                  <FormField label="Domain" icon={<Tag className="h-4 w-4" />} required>
                    <Select value={domain} onValueChange={setDomain}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CAREER_DOMAINS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </section>

              {/* Offer details */}
              <section className="space-y-4">
                <SectionHeading>Offer details</SectionHeading>
                <div className="grid gap-4 lg:grid-cols-2">
                  <FormField label="Offer type" icon={<Briefcase className="h-4 w-4" />}>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OFFER_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Work mode" icon={<Wifi className="h-4 w-4" />}>
                    <Select value={workMode} onValueChange={setWorkMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WORK_MODES.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Start date" icon={<CalendarDays className="h-4 w-4" />}>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </FormField>

                  <FormField label="End date" icon={<CalendarDays className="h-4 w-4" />}>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-4 py-3.5 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <Label
                      htmlFor="isPaid"
                      className="text-sm font-medium cursor-pointer text-slate-700 dark:text-slate-200"
                    >
                      Paid position
                    </Label>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      (students will see this)
                    </span>
                  </div>
                  <Switch id="isPaid" checked={isPaid} onCheckedChange={setIsPaid} />
                </div>
              </section>

              {/* Required skills */}
              <section className="space-y-4">
                <SectionHeading>Required skills</SectionHeading>

                {/* Picker row */}
                <div className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    <Select value={pendingSkill} onValueChange={setPendingSkill}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a skill…" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {skillOptions
                          .filter((s) => !requiredSkills.some((r) => r.skillName === s.name))
                          .map((s) => (
                            <SelectItem key={s.id} value={s.name}>
                              {s.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-40 shrink-0">
                    <Select value={pendingLevel} onValueChange={setPendingLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_LEVELS.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={addSkill}
                    disabled={!pendingSkill}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>

                {/* Added skills list */}
                {requiredSkills.length > 0 && (
                  <div className="rounded-xl border border-slate-200/70 dark:border-white/10 divide-y divide-slate-200/60 dark:divide-white/5 overflow-hidden">
                    {requiredSkills.map((sk) => (
                      <div
                        key={sk.skillName}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/60 dark:bg-white/3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {sk.skillName}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${LEVEL_STYLE[sk.level] ?? LEVEL_STYLE.BEGINNER}`}>
                            {SKILL_LEVELS.find((l) => l.value === sk.level)?.label ?? sk.level}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSkill(sk.skillName)}
                            className="rounded-full p-0.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {requiredSkills.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                    No skills added yet — optional but helps candidates self-assess.
                  </p>
                )}
              </section>

              {/* Description */}
              <section className="space-y-4">
                <SectionHeading>Description</SectionHeading>
                <FormField
                  label="Role description"
                  icon={<BadgeCheck className="h-4 w-4" />}
                >
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    placeholder="Describe the mission, responsibilities, required skills, and what makes the role interesting."
                    className="resize-none"
                  />
                </FormField>
              </section>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 pt-6 dark:border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving…" : offerId ? "Update offer" : "Post offer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-white/10">
      {children}
    </h3>
  );
}

function FormField({
  label,
  icon,
  required,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        {icon && (
          <span className="text-slate-400">{icon}</span>
        )}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
