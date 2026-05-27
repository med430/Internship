import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  deletedAt: string | null;
}

const base = () => `${getClientApiBaseUrl()}/notifications`;

export async function fetchNotifications(): Promise<NotificationRecord[]> {
  const res = await fetchWithAuth(base(), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json() as Promise<NotificationRecord[]>;
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetchWithAuth(`${base()}/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetchWithAuth(`${base()}/read-all`, { method: "PATCH" });
}

export async function deleteNotification(id: string): Promise<void> {
  await fetchWithAuth(`${base()}/${id}`, { method: "DELETE" });
}
