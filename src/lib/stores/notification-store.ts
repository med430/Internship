"use client";

import { create } from "zustand";

type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
};

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

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  fetchNotifications: async () => undefined,
  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, is_read: true } : item,
      ),
      unreadCount: Math.max(
        0,
        state.notifications.filter((item) => !item.is_read && item.id !== id).length,
      ),
    }));
  },
  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((item) => ({
        ...item,
        is_read: true,
      })),
      unreadCount: 0,
    }));
  },
  deleteNotification: async (id) => {
    set((state) => {
      const notifications = state.notifications.filter((item) => item.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter((item) => !item.is_read).length,
      };
    });
  },
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
