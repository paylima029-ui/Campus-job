import { db, notificationsTable } from "@workspace/db";

type NotificationType = "application_received" | "application_accepted" | "application_rejected" | "new_message";

export async function notifyUser(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: number,
): Promise<void> {
  try {
    await db.insert(notificationsTable).values({ userId, type, title, message, relatedId: relatedId ?? null });
  } catch {
    // Notifications are best-effort — never block the main response
  }
}
