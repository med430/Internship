"use client";

// The student's matching-relevant profile. Every field here lands in StudentProfile and feeds the recommendation engine.

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  ChevronDown,
  GraduationCap,
  Languages as LanguagesIcon,
  Loader2,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import dayjs from "dayjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ChipInput } from "@/components/shared/chip-input";

import {
  getMyProfile,
  patchMyProfile,
  type MyProfile,
  type MyProfileSkill,
} from "@/lib/api/me-profile-client";
import {
  listSkills,
  listSchools,
  listDomains,
  type SkillOption,
  type SchoolOption,
} from "@/lib/api/reference-client";
import {
  addMySkill,
  updateMySkill,
  removeMySkill,
} from "@/lib/api/me-skills-client";
import { cn } from "@/lib/utils";

const WORK_MODES = ["ONSITE", "REMOTE", "HYBRID"] as const;
const OFFER_TYPES = ["INTERNSHIP", "PFE", "RESEARCH", "PHD", "ALTERNANCE"] as const;
const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
const COMMON_LANGUAGES = ["English", "French", "Arabic", "Spanish", "German", "Italian"];
const COMMON_TUNISIAN_CITIES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Sousse",
  "Sfax",
  "Nabeul",
  "Bizerte",
  "Monastir",
];

type Patch = Partial<Omit<MyProfile, "id" | "userId" | "skills">>;

export function PreferencesForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [draft, setDraft] = useState<Patch>({});
  const [skills, setSkills] = useState<MyProfileSkill[]>([]);
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [domainOptions, setDomainOptions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, s, sc, d] = await Promise.all([
          getMyProfile(),
          listSkills(),
          listSchools(),
          listDomains(),
        ]);
        if (cancelled) return;
        if (!p) {
          toast.error("Could not load your profile");
          return;
        }
        setProfile(p);
        setSkills(p.skills);
        setSkillOptions(s);
        setSchoolOptions(sc);
        setDomainOptions(d);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load reference data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge draft on top of the saved profile to compute the current displayed value.
  const view: MyProfile | null = useMemo(() => {
    if (!profile) return null;
    return { ...profile, ...draft, skills };
  }, [profile, draft, skills]);

  const setField = useCallback(<K extends keyof Patch>(key: K, value: Patch[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (Object.keys(draft).length === 0) {
      toast.info("Nothing to save");
      return;
    }
    setSaving(true);
    try {
      const saved = await patchMyProfile(draft);
      setProfile(saved);
      setDraft({});
      toast.success("Profile saved — your feed will update on the next recompute.");
    } catch (err) {
      toast.error((err as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [draft]);

  if (loading || !view) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
          <CardDescription>
            A short paragraph the recommender uses for semantic matching later (M6+). Keep it focused — what you do, what you want.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={view.bio ?? ""}
            onChange={(e) => setField("bio", e.target.value)}
            placeholder="I’m a 4th-year INSAT student passionate about distributed systems and backend engineering…"
            rows={4}
            maxLength={1000}
          />
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> Education
          </CardTitle>
          <CardDescription>Where you study now, what year, what program.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>School</Label>
            <SchoolPicker
              schools={schoolOptions}
              value={view.schoolId}
              onChange={(id) => setField("schoolId", id)}
            />
          </div>
          <div className="space-y-2">
            <Label>Current year</Label>
            <Select
              value={view.currentYear?.toString() ?? "unset"}
              onValueChange={(v) =>
                setField("currentYear", v === "unset" ? null : Number(v))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unset">—</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    Year {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Program / Major</Label>
            <Input
              value={view.currentProgram ?? ""}
              onChange={(e) => setField("currentProgram", e.target.value || null)}
              placeholder="Software Engineering"
            />
          </div>
        </CardContent>
      </Card>

      {/* Work preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Work preferences
          </CardTitle>
          <CardDescription>What kind of internships you want to see at the top of your feed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Preferred work mode</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setField("preferredWorkMode", null)}
                className={cn(
                  "px-3 py-1.5 rounded-md border text-sm transition-colors",
                  view.preferredWorkMode === null
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted",
                )}
              >
                No preference
              </button>
              {WORK_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setField("preferredWorkMode", mode)}
                  className={cn(
                    "px-3 py-1.5 rounded-md border text-sm transition-colors",
                    view.preferredWorkMode === mode
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Offer types</Label>
            <div className="flex flex-wrap gap-4">
              {OFFER_TYPES.map((t) => {
                const checked = view.preferredOfferTypes.includes(t);
                return (
                  <label
                    key={t}
                    className="inline-flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        const next = c
                          ? [...view.preferredOfferTypes, t]
                          : view.preferredOfferTypes.filter((x) => x !== t);
                        setField("preferredOfferTypes", next);
                      }}
                    />
                    <span>{t}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="paidOnly" className="flex items-center gap-2 cursor-pointer">
                <Wallet className="w-4 h-4" /> Paid offers only
              </Label>
              <p className="text-xs text-muted-foreground">
                When on, unpaid offers score 0 and don’t appear in your feed.
              </p>
            </div>
            <Switch
              id="paidOnly"
              checked={view.paidOnly}
              onCheckedChange={(v) => setField("paidOnly", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location + domains */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Location & domains
          </CardTitle>
          <CardDescription>Cities you'd accept and topics you’d work on.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Preferred cities</Label>
            <ChipInput
              value={view.preferredCities}
              onChange={(next) => setField("preferredCities", next)}
              suggestions={COMMON_TUNISIAN_CITIES}
              placeholder="Type a city and press Enter…"
            />
          </div>
          <div className="space-y-2">
            <Label>Preferred domains</Label>
            <ChipInput
              value={view.preferredDomains}
              onChange={(next) => setField("preferredDomains", next)}
              suggestions={domainOptions}
              placeholder="Pick or type a domain…"
            />
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LanguagesIcon className="w-4 h-4" /> Languages
          </CardTitle>
          <CardDescription>
            Languages you can work in. Offers requiring a language you don’t list will rank lower.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChipInput
            value={view.languages}
            onChange={(next) => setField("languages", next)}
            suggestions={COMMON_LANGUAGES}
            placeholder="Type a language and press Enter…"
          />
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Availability
          </CardTitle>
          <CardDescription>
            Window during which you can take an internship. Offers overlapping this window score higher.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <DatePickerField
            label="Available from"
            value={view.availableFrom}
            onChange={(iso) => setField("availableFrom", iso)}
          />
          <DatePickerField
            label="Available until"
            value={view.availableTo}
            onChange={(iso) => setField("availableTo", iso)}
          />
        </CardContent>
      </Card>

      {/* Skills (per-row CRUD, independent of the form save) */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>
            Each skill saves immediately — no need to press Save below. The match score gives more weight to mandatory offer requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillsEditor
            skills={skills}
            skillOptions={skillOptions}
            onSkillsChange={setSkills}
          />
        </CardContent>
      </Card>

      {/* Save bar */}
      <div className="sticky bottom-4 flex justify-end">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={saving || Object.keys(draft).length === 0}
          className="shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SchoolPicker({
  schools,
  value,
  onChange,
}: {
  schools: SchoolOption[];
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = schools.find((s) => s.id === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between font-normal"
        >
          {selected ? selected.name : "Select school"}
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <Command>
          <CommandInput placeholder="Search schools…" />
          <CommandList>
            <CommandEmpty>No matches</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check className={cn("w-4 h-4 mr-2", value === null ? "opacity-100" : "opacity-0")} />
                <span className="text-muted-foreground">— None —</span>
              </CommandItem>
              {schools.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.name}
                  onSelect={() => {
                    onChange(s.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("w-4 h-4 mr-2", value === s.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{s.name}</div>
                    {s.city && (
                      <div className="text-xs text-muted-foreground truncate">{s.city}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (iso: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            {date ? dayjs(date).format("MMM D, YYYY") : "Pick a date"}
            <CalendarDays className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              onChange(d ? d.toISOString() : null);
              setOpen(false);
            }}
            initialFocus
          />
          {date && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function SkillsEditor({
  skills,
  skillOptions,
  onSkillsChange,
}: {
  skills: MyProfileSkill[];
  skillOptions: SkillOption[];
  onSkillsChange: (next: MyProfileSkill[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const skillById = useMemo(
    () => new Map(skillOptions.map((s) => [s.id, s.name])),
    [skillOptions],
  );
  const availableOptions = useMemo(
    () => skillOptions.filter((s) => !skills.some((sk) => sk.skillId === s.id)),
    [skillOptions, skills],
  );

  async function changeLevel(s: MyProfileSkill, level: MyProfileSkill["level"]) {
    onSkillsChange(skills.map((x) => (x.id === s.id ? { ...x, level } : x)));
    try {
      await updateMySkill(s.id, level);
    } catch (err) {
      toast.error((err as Error).message);
      onSkillsChange(skills);
    }
  }

  async function remove(s: MyProfileSkill) {
    const before = skills;
    onSkillsChange(skills.filter((x) => x.id !== s.id));
    try {
      await removeMySkill(s.id);
    } catch (err) {
      toast.error((err as Error).message);
      onSkillsChange(before);
    }
  }

  async function add(skillId: number, level: MyProfileSkill["level"]) {
    setAdding(true);
    try {
      await addMySkill({ skillId, level });
      const refreshed = await getMyProfile();
      if (refreshed) onSkillsChange(refreshed.skills);
      toast.success("Skill added");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-3">
      {skills.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No skills yet — add a few so the recommender can match you with relevant offers.
        </p>
      )}

      <ul className="space-y-2">
        {skills.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5"
          >
            <Badge variant="secondary" className="font-medium">
              {skillById.get(s.skillId) ?? `#${s.skillId}`}
            </Badge>
            <div className="flex items-center gap-2">
              <Select
                value={s.level}
                onValueChange={(v) => changeLevel(s, v as MyProfileSkill["level"])}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l.charAt(0) + l.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remove(s)}
                aria-label="Remove skill"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <AddSkillRow options={availableOptions} disabled={adding} onAdd={add} />
    </div>
  );
}

function AddSkillRow({
  options,
  disabled,
  onAdd,
}: {
  options: SkillOption[];
  disabled: boolean;
  onAdd: (skillId: number, level: MyProfileSkill["level"]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState<SkillOption | null>(null);
  const [level, setLevel] = useState<MyProfileSkill["level"]>("INTERMEDIATE");

  async function handleAdd() {
    if (!picked) return;
    onAdd(picked.id, level);
    setPicked(null);
    setLevel("INTERMEDIATE");
  }

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-dashed border-border">
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex-1 justify-between font-normal">
            {picked ? picked.name : "Pick a skill"}
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
          <Command>
            <CommandInput placeholder="Search skills…" />
            <CommandList>
              <CommandEmpty>No matches</CommandEmpty>
              <CommandGroup>
                {options.map((s) => (
                  <CommandItem
                    key={s.id}
                    value={s.name}
                    onSelect={() => {
                      setPicked(s);
                      setPickerOpen(false);
                    }}
                  >
                    {s.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Select
        value={level}
        onValueChange={(v) => setLevel(v as MyProfileSkill["level"])}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SKILL_LEVELS.map((l) => (
            <SelectItem key={l} value={l}>
              {l.charAt(0) + l.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleAdd} disabled={!picked || disabled} className="gap-1">
        <Plus className="w-4 h-4" /> Add
      </Button>
    </div>
  );
}
