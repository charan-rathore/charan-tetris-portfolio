import { createHash } from "node:crypto";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; expires: number }>();
const reply = (error: string, status: number) => Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply("Please send this form from the portfolio page.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply("Invalid request.", 415);
  let input: Record<string, unknown>;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply("Empty message.", 400);
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 20_000) { await reader.cancel(); return reply("Please keep the message under 5,000 characters.", 413); }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!input || typeof input !== "object" || Array.isArray(input)) return reply("Invalid message.", 400);
  } catch { return reply("Invalid message.", 400); }
  const { name, email, message } = input;
  if (typeof name !== "string" || name.trim().length < 2 || name.length > 80 || /[\r\n]/.test(name) || typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof message !== "string" || message.trim().length < 10 || message.length > 5000) return reply("Please enter a name, a valid email, and a message of 10–5,000 characters.", 400);
  if (input.website || typeof input.elapsed !== "number" || input.elapsed < 1500) return reply("Please take a moment and try again.", 400);
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || "ra7hore.charan@gmail.com";
  if (!key || !from) return reply("Message delivery is being connected. Please email ra7hore.charan@gmail.com directly for now. Your message has not been sent.", 503);
  const now = Date.now();
  for (const [id, entry] of attempts) if (entry.expires < now) attempts.delete(id);
  // Best-effort instance limit. Add a shared gateway/WAF limit before broad promotion.
  const identity = createHash("sha256").update(request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").digest("hex");
  const entry = attempts.get(identity) || { count: 0, expires: now + 600_000 };
  if (entry.count >= 3 || attempts.size >= 1000) return reply("Please wait a few minutes before sending another message.", 429);
  entry.count++; attempts.set(identity, entry);
  const idempotency = createHash("sha256").update(JSON.stringify([name.trim(), email.trim(), message.trim(), Math.floor(now/600_000)])).digest("hex");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": idempotency },
      body: JSON.stringify({ from, to: [to], reply_to: email.trim(), subject: `Portfolio message from ${name.trim()}`, text: `From: ${name.trim()}\nReply to: ${email.trim()}\n\n${message.trim()}` }), signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return reply("Delivery could not be confirmed. Please retry or email Charan directly.", 502);
    const result = await response.json();
    if (!result.id) return reply("Delivery could not be confirmed. Please retry.", 502);
    return Response.json({ accepted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return reply("The email service did not respond in time. Please retry.", 504); }
}
