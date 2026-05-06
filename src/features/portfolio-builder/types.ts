import type { Tables } from "@/types/database.types";

export type PortfolioBuilderStep = "configure" | "result";
export type Profile = Tables<"profiles">;

export interface PortfolioOption {
  id: string;
  name: string;
  badge: string;
  description: string;
}

export interface ProfileFieldOption {
  key: string;
  label: string;
}
