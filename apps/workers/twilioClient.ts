import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const smsFrom = process.env.TWILIO_SMS_FROM;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

if (!accountSid || !authToken || !smsFrom || !whatsappFrom) {
  throw new Error(
    "Missing Twilio env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SMS_FROM, TWILIO_WHATSAPP_FROM",
  );
}

const client = twilio(accountSid, authToken);
export const twilioClient = client;

export type DispatchResult = {
  phone: string;
  channel: "SMS" | "WHATSAPP";
  ok: boolean;
  sid?: string;
  error?: string;
};

export async function sendSms(toPhone: string, body: string): Promise<DispatchResult> {
  try {
    const msg = await client.messages.create({ to: toPhone, from: smsFrom, body });
    return { phone: toPhone, channel: "SMS", ok: true, sid: msg.sid };
  } catch (err: any) {
    return { phone: toPhone, channel: "SMS", ok: false, error: err.message };
  }
}

export async function sendWhatsapp(toPhone: string, body: string): Promise<DispatchResult> {
  try {
    const msg = await client.messages.create({
      to: `whatsapp:${toPhone}`,
      from: whatsappFrom,
      body,
    });
    return { phone: toPhone, channel: "WHATSAPP", ok: true, sid: msg.sid };
  } catch (err: any) {
    return { phone: toPhone, channel: "WHATSAPP", ok: false, error: err.message };
  }
}