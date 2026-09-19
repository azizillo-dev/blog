import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type MailMessage = { to: string; subject: string; text: string; html: string };

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: Number(SMTP_PORT || 465) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

/**
 * MAIL_OUTBOX=1 — xatlar faqat `.mail-outbox/` ga yoziladi (testlar haqiqiy xat yubormasin).
 * Aks holda SMTP sozlangan bo'lsa — haqiqiy xat; SMTP yo'q bo'lsa dev'da outbox, prod'da xato.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  const outboxOnly = process.env.MAIL_OUTBOX === "1";
  const transport = outboxOnly ? null : getTransporter();
  if (transport) {
    await transport.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, ...message });
    return;
  }
  // Prod'da SMTP'siz xat "jim" yo'qolmasin.
  if (process.env.NODE_ENV === "production" && !outboxOnly) throw new Error("SMTP is not configured");

  const dir = path.join(process.cwd(), ".mail-outbox");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}-${message.to.replace(/[^a-z0-9@._-]/gi, "_")}.txt`);
  await writeFile(file, `To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n`, "utf8");
  console.info(`[mail:dev] → ${message.to} | ${message.subject}\n${message.text}`);
}
