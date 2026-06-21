import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type AppNotification = {
  id: number;
  userId: number;
  type: "application_received" | "application_accepted" | "application_rejected" | "new_message";
  title: string;
  message: string;
  isRead: boolean;
  relatedId: number | null;
  createdAt: string;
};

type NotificationsResponse = {
  notifications: AppNotification[];
  unreadCount: number;
};

async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch("/api/notifications", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json() as Promise<NotificationsResponse>;
}

async function markAllRead(): Promise<void> {
  await fetch("/api/notifications/read-all", {
    method: "PATCH",
    credentials: "include",
  });
}

async function markOneRead(id: number): Promise<void> {
  await fetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
    credentials: "include",
  });
}

export function useNotifications(enabled: boolean) {
  return useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled,
    refetchInterval: 15_000,
    staleTime: 10_000,
  } as Parameters<typeof useQuery<NotificationsResponse>>[0]);
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markOneRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
