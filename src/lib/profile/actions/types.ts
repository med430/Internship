import type { Database } from "@/types/database.types";

export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type ActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export type ActionResultWithUrl = ActionResult & {
  url?: string;
};
