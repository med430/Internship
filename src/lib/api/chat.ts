import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import type { Conversation, Message } from "@/lib/api/chat/types";

export type { Conversation, Message } from "@/lib/api/chat/types";

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export async function fetchChatUsers(): Promise<ChatUser[]> {
  const res = await fetchWithAuth(`${getClientApiBaseUrl()}/chat/users`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json() as Promise<ChatUser[]>;
}

const base = () => `${getClientApiBaseUrl()}/chat`;

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetchWithAuth(`${base()}/conversations`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to load conversations");
  return res.json() as Promise<Conversation[]>;
}

export async function createConversation(participantIds: string[]): Promise<Conversation> {
  const res = await fetchWithAuth(`${base()}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantIds }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? "Failed to create conversation");
  }
  return res.json() as Promise<Conversation>;
}

export async function fetchMessages(
  conversationId: string,
  limit = 50,
  before?: string,
): Promise<Message[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set("before", before);
  const res = await fetchWithAuth(
    `${base()}/conversations/${conversationId}/messages?${params}`,
    { method: "GET" },
  );
  if (!res.ok) throw new Error("Failed to load messages");
  return res.json() as Promise<Message[]>;
}

export async function sendMessageHttp(
  conversationId: string,
  content: string,
): Promise<Message> {
  const res = await fetchWithAuth(
    `${base()}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );
  if (!res.ok) throw new Error("Failed to send message");
  return res.json() as Promise<Message>;
}
