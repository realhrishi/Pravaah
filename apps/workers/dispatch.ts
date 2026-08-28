
import { prisma } from "@repo/database/client";

export async function dispatchAlertInternal(alertId: number) {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: { village: { include: { subscribers: true } } },
  });
  if (!alert) return;

  //to-do: integrate with actual dispatch service (SMS, email, etc.)

  for (const subscriber of alert.village.subscribers) {
    console.log(`[MOCK DISPATCH] → ${subscriber.phone} via ${subscriber.preferredChannel}: ${alert.riskClass} in ${alert.village.name}`);
  }

  return prisma.alert.update({
    where: { id: alertId },
    data: { dispatched: true, dispatchedAt: new Date() },
  });
}