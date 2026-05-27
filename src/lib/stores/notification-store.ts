"use client";

import { create } from "zustand";
import {
  fetchNotifications as apiFetch,
  markNotificationRead as apiMarkRead,
  markAllNotificationsRead as apiMarkAllRead,
  deleteNotification as apiDelete,
  type NotificationRecord,
} from "@/lib/api/notifications";

export type { NotificationRecord };

interface NotificationStore {
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: NotificationRecord) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const data = await apiFetch();
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.isRead).length,
      });
    } catch {
      // silently fail — user may not be authenticated yet
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(
        0,
        state.notifications.filter((n) => !n.isRead && n.id !== id).length,
      ),
    }));
    try {
      await apiMarkRead(id);
    } catch { /* optimistic — ignore */ }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    try {
      await apiMarkAllRead();
    } catch { /* optimistic — ignore */ }
  },

  deleteNotification: async (id) => {
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== id);
      return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
    });
    try {
      await apiDelete(id);
    } catch { /* optimistic — ignore */ }
  },

  addNotification: (notification) => {
    // Avoid duplicates if SSE fires and fetch already loaded it
    if (get().notifications.some((n) => n.id === notification.id)) return;
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },
}));
