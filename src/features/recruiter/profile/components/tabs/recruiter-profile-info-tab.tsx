"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Globe, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { updateRecruiterProfile, type RecruiterProfileData } from "@/lib/api/recruiter-profile-api";

function calcCompletion(p: RecruiterProfileData): number {
  const fields = [
    p.user.name, p.user.lastname, p.user.username,
    p.user.phone, p.user.avatarUrl,
    p.company, p.companyDescription, p.website,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

interface Props {
  profile: RecruiterProfileData;
}

export function RecruiterProfileInfoTab({ profile }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(profile.user.name ?? "");
  const [lastname, setLastname] = useState(profile.user.lastname ?? "");
  const [username, setUsername] = useState(profile.user.username ?? "");
  const [phone, setPhone] = useState(profile.user.phone ?? "");
  const [company, setCompany] = useState(profile.company ?? "");
  const [companyDescription, setCompanyDescription] = useState(profile.companyDescription ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");

  const completion = calcCompletion({
    ...profile,
    user: { ...profile.user, name, lastname, username, phone },
    company, companyDescription, website,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateRecruiterProfile({
        name:               name || undefined,
        lastname:           lastname || undefined,
        username:           username || undefined,
        phone:              phone || undefined,
        company:            company || undefined,
        companyDescription: companyDescription || undefined,
        website:            website || undefined,
      });
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Completion card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Completion</CardTitle>
            <Badge variant={completion >= 80 ? "default" : "secondary"} className="text-lg px-4 py-2">
              {completion}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completion} className="h-3" />
          {completion < 100 && (
            <p className="text-sm text-muted-foreground mt-3">
              Fill in more information to increase your profile completion and improve visibility with students.
            </p>
          )}
        </CardContent>
      </Card>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-sky-600" /> Personal Information
            </CardTitle>
            <CardDescription>Your identity on the platform</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">First name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="John" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Last name</label>
              <Input value={lastname} onChange={e => setLastname(e.target.value)} placeholder="Doe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Username</label>
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="johndoe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
              </label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+216 XX XXX XXX" type="tel" />
            </div>
          </CardContent>
        </Card>

        {/* Company info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-sky-600" /> Company Information
            </CardTitle>
            <CardDescription>Visible to students who see your offers</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company name *</label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company description</label>
              <Textarea
                value={companyDescription}
                onChange={e => setCompanyDescription(e.target.value)}
                placeholder="Tell students about your company..."
                rows={4}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Website
              </label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://company.com" type="url" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
