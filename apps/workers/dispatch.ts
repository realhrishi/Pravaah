import { prisma } from "@repo/database/client";
import { sendSms, sendWhatsapp, twilioClient, type DispatchResult } from "./twilioClient";

function toE164India(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  if (digitsOnly.startsWith("91") && digitsOnly.length === 12) return `+${digitsOnly}`;
  return phone.startsWith("+") ? phone : `+${digitsOnly}`;
}
const IN_FLIGHT = new Set(["queued", "sending", "sent", "accepted"]);

async function checkDeliveryStatus(sid: string, delayMs = 4000): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  try {
    const msg = await twilioClient.messages(sid).fetch();
    return msg.status; // e.g. "delivered", "failed", "undelivered", "sent"
  } catch (err: any) {
    return `status_check_failed: ${err.message}`;
  }
}

export async function dispatchAlertInternal(alertId: number) {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: { village: { include: { subscribers: true } } },
  });
  if (!alert) return;

  const messageBody = `${alert.riskClass} risk alert for ${alert.village.name}. Stay alert and follow local safety guidance.`;

  const sendJobs: Promise<DispatchResult>[] = [];
  for (const subscriber of alert.village.subscribers) {
    const phone = toE164India(subscriber.phone);
    for (const channel of subscriber.preferredChannel) {
      if (channel === "SMS") sendJobs.push(sendSms(phone, messageBody));
      if (channel === "WHATSAPP") sendJobs.push(sendWhatsapp(phone, messageBody));
    }
  }

  const settled = await Promise.allSettled(sendJobs);
  const sendResults: DispatchResult[] = settled.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { phone: "unknown", channel: "SMS", ok: false, error: String(r.reason) },
  );

  const withStatus = await Promise.all(
    sendResults.map(async (r) => {
      if (!r.ok || !r.sid) return { ...r, finalStatus: "not_sent" };
      const status = await checkDeliveryStatus(r.sid);
      return { ...r, finalStatus: status };
    }),
  );

  const delivered = withStatus.filter((r) => r.finalStatus === "delivered").length;
  const stillInFlight = withStatus.filter((r) => IN_FLIGHT.has(r.finalStatus)).length;
  const failed = withStatus.filter(
    (r) => !IN_FLIGHT.has(r.finalStatus) && r.finalStatus !== "delivered",
  );

  console.log(
    `[DISPATCH] alert ${alertId}: ${delivered} delivered, ${stillInFlight} still in flight, ${failed.length} failed/undelivered (of ${withStatus.length} total)`,
  );
  if (failed.length > 0) {
    console.error(`[DISPATCH] failed sends for alert ${alertId}:`, failed);
  }

  return prisma.alert.update({
    where: { id: alertId },
    data: { dispatched: true, dispatchedAt: new Date() },
  });
}