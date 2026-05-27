"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CAREER_DOMAINS } from "@/lib/constants/domains";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Briefcase, Building2, MapPin, Sparkles, Tag } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getSupabaseToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export function RecruiterOfferFormScreen({ offerId }: { offerId?: string }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [domain, setDomain] = useState(CAREER_DOMAINS[0] ?? "IT & Software Engineering");
  const router = useRouter();

  useEffect(() => {
    if (!offerId) return;
    (async () => {
      setLoading(true);
      try {
        const query = `query($id: ID!){ offer(id:$id){ id title description company location domain startDate endDate type } }`;
        const resp = await fetch(`${API_BASE}/graphql`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ query, variables: { id: offerId } })
        });
        const json = await resp.json();
        const o = json.data?.offer;
        if (o) {
          setTitle(o.title || "");
          setCompany(o.company || "");
          setDescription(o.description || "");
          setLocation(o.location || "");
          setDomain(o.domain || (CAREER_DOMAINS[0] ?? "IT & Software Engineering"));
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [offerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = await getSupabaseToken();
    try {
      const body = {
        title,
        description,
        company,
        location,
        domain,
        isPaid: false,
        workMode: "REMOTE",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        type: "INTERNSHIP",
        requiredSkills: [],
      };
      const url = offerId ? `${API_BASE}/offers/${offerId}` : `${API_BASE}/offers`;
      const method = offerId ? 'PATCH' : 'POST';
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || 'Save failed');
      }
      router.push('/recruiter/offers');
    } catch (err:any) {
      alert(err?.message || 'Save failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Card className="overflow-hidden border-white/60 bg-white/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/75">
          <CardHeader className="border-b border-slate-200/70 dark:border-white/10">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300 w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Recruiter workspace
            </div>
            <CardTitle className="text-3xl">{offerId ? "Edit offer" : "Create offer"}</CardTitle>
            <CardDescription>
              Write a clear role, target the right domain, and give students enough detail to apply confidently.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
                <Field icon={<Briefcase className="h-4 w-4" />} label="Title" required>
                  <input className="input-surface" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. AI Engineer Intern" required />
                </Field>

                <Field icon={<Building2 className="h-4 w-4" />} label="Company">
                  <input className="input-surface" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Acme Studio" />
                </Field>

                <Field icon={<MapPin className="h-4 w-4" />} label="Location" required>
                  <input className="input-surface" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Tunis, Tunisia" required />
                </Field>

                <Field icon={<Tag className="h-4 w-4" />} label="Domain" required>
                  <select className="input-surface" value={domain} onChange={(e) => setDomain(e.target.value)} required>
                    {CAREER_DOMAINS.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field icon={<BadgeCheck className="h-4 w-4" />} label="Description">
                <textarea
                  className="input-surface min-h-40"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Describe the mission, responsibilities, required skills, and what makes the role interesting."
                />
              </Field>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <span>Saving will use the recruiter account linked to the current session.</span>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : offerId ? "Update offer" : "Create offer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .input-surface {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.35);
          background: rgba(255, 255, 255, 0.88);
          padding: 0.875rem 1rem;
          font-size: 0.95rem;
          color: rgb(15 23 42);
          outline: none;
          transition: box-shadow 150ms ease, border-color 150ms ease, background 150ms ease;
        }

        .dark .input-surface {
          background: rgba(15, 23, 42, 0.7);
          color: white;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .input-surface::placeholder {
          color: rgba(100, 116, 139, 0.95);
        }

        .dark .input-surface::placeholder {
          color: rgba(148, 163, 184, 0.85);
        }

        .input-surface:focus {
          border-color: rgba(14, 165, 233, 0.7);
          box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12);
        }
      `}</style>
    </div>
  );
}

function Field({
  icon,
  label,
  required,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span className="text-slate-500 dark:text-slate-300">{icon}</span>
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}
