"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/constants";
import { fetchWithAuth } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { ERROR_MESSAGES } from "@/lib/errors/messages";

interface Persona {
  name: string;
  role: string;
  company: string;
  years_experience: number;
  style: string;
  difficulty: string;
  tone: string;
  position: string;
}

interface PersonaData {
  [key: string]: Persona;
}

// Avatar mapping for personas
const PERSONA_AVATARS: { [key: string]: string } = {
  alex_chen: "/personas/Alex Chen.png",
  sarah_williams: "/personas/Sarah Williams.png",
  ali_mahmoud: "/personas/Ali Mahmoud.png",
  aisha_obeid: "/personas/Aisha Obeid.png",
  jordan_lee: "/personas/Jordan Lee.png",
  harvey_specter: "/personas/Harvey Specter.png",
  emma_wilson: "/personas/Emma Wilson.png",
  lisa_anderson: "/personas/Lisa Anderson.png",
  michael_rodriguez: "/personas/Michael Rodriguez.png",
  james_thompson: "/personas/James Thompson.png",
};

export function PersonaSelector() {
  const [personas, setPersonas] = useState<PersonaData>({});
  const [selectedPersona, setSelectedPersona] = useState<string>("alex_chen");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPersonas();
    // Load selected persona from localStorage
    const savedPersona = localStorage.getItem("selectedPersona");
    if (savedPersona) {
      setSelectedPersona(savedPersona);
    }
  }, []);
  const fetchPersonas = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/virtual-interviewer/personas`,
      );

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            ERROR_MESSAGES.SERVICE_UNAVAILABLE,
          ),
        );
      }

      const data = await response.json();
      const payload =
        data &&
        typeof data === "object" &&
        "personas" in data &&
        data.personas &&
        typeof data.personas === "object" &&
        !Array.isArray(data.personas)
          ? (data.personas as PersonaData)
          : {};

      setPersonas(payload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load interviewer personas";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (personaKey: string) => {
    setSelectedPersona(personaKey);
    // Store in localStorage for interview room to access
    localStorage.setItem("selectedPersona", personaKey);
    toast.success(`Selected ${personas[personaKey]?.name ?? "interviewer"}`);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch ((difficulty ?? "").toLowerCase()) {
      case "entry-level":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    }
  };

  const personaEntries = Object.entries(personas ?? {}).filter(
    (entry): entry is [string, Persona] => {
      const value = entry[1];
      return Boolean(value && typeof value === "object");
    },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          Choose Your Interviewer
        </h3>
        <p className="text-sm text-muted-foreground">
          Select an AI interviewer persona that matches your preparation goals
        </p>
      </div>

      <div className="space-y-4">
        {/* Render personas in rows of 5 */}
        {personaEntries.length === 0 ? (
          <Card className="p-6 text-center border border-border bg-card/50">
            <p className="text-sm text-muted-foreground">
              No interviewer personas are available right now. Please try again
              in a moment.
            </p>
          </Card>
        ) : (
          Array.from(
            { length: Math.ceil(personaEntries.length / 5) },
            (_, rowIndex) => {
              const startIdx = rowIndex * 5;
              const rowPersonas = personaEntries.slice(startIdx, startIdx + 5);

              return (
                <div
                  key={rowIndex}
                  className="grid gap-2 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5"
                >
                  {rowPersonas.map(([key, persona]) => (
                    <Card
                      key={key}
                      className={`relative p-2 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                        selectedPersona === key
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleSelectPersona(key)}
                    >
                      {/* Selection indicator */}
                      {selectedPersona === key && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}

                      {/* Avatar */}
                      <div className="mb-2 flex justify-center">
                        <div className="relative h-22 w-27 rounded-full overflow-hidden border-2 border-border">
                          <Image
                            src={
                              PERSONA_AVATARS[key] || "/personas/Alex Chen.png"
                            }
                            alt={`${persona.name ?? "Interviewer"} avatar`}
                            fill
                            sizes="108px"
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col h-[280px]">
                        {/* Name and Role - Fixed height */}
                        <div className="h-[60px] text-center mb-3">
                          <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
                            {persona.name ?? "Interviewer"}
                          </h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {persona.role ?? "Role unavailable"}
                          </p>
                        </div>

                        {/* Company and Experience Badges - Fixed height */}
                        <div className="h-[32px] flex flex-wrap gap-1 justify-center mb-3">
                          <Badge
                            variant="outline"
                            className="text-[11px] whitespace-nowrap"
                          >
                            {persona.company ?? "Unknown company"}
                          </Badge>
                        </div>

                        {/* Position, Style, and Tone - Fixed height */}
                        <div className="h-[100px] mb-3 pt-3">
                          <div className="text-[11px] mb-2">
                            <span className="text-muted-foreground">
                              Position:
                            </span>{" "}
                            <span className="font-medium text-foreground">
                              {persona.position ?? "N/A"}
                            </span>
                          </div>
                          <div className="text-[11px] mb-2">
                            <span className="text-muted-foreground">
                              Topic:
                            </span>{" "}
                            <span className="font-medium text-foreground">
                              {persona.style ?? "N/A"}
                            </span>
                          </div>
                          <div className="text-[11px]">
                            <span className="text-muted-foreground">Tone:</span>{" "}
                            <span className="font-medium text-foreground">
                              {persona.tone ?? "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Difficulty Badge - Fixed position at bottom */}
                        <div className="flex justify-center mt-auto">
                          <Badge
                            className={`${getDifficultyColor(persona.difficulty)} text-[11px]`}
                          >
                            {persona.difficulty ?? "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            },
          )
        )}
      </div>
    </div>
  );
}
