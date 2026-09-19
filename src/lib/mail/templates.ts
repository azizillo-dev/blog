import type { Locale } from "@/lib/constants";
import type { MailMessage } from "./send";

type Template = { subject: string; lines: string[] };

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function render(to: string, { subject, lines }: Template): MailMessage {
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#16181d;max-width:520px">${lines
    .map((l) => `<p>${escapeHtml(l)}</p>`)
    .join("")}</div>`;
  return { to, subject, text: lines.join("\n\n"), html };
}

export function verificationCodeMail(to: string, code: string, locale: Locale): MailMessage {
  const t: Record<Locale, Template> = {
    uz: { subject: `Tasdiqlash kodi: ${code}`, lines: [`Sizning tasdiqlash kodingiz: ${code}`, "Kod 10 daqiqa amal qiladi."] },
    ru: { subject: `Код подтверждения: ${code}`, lines: [`Ваш код подтверждения: ${code}`, "Код действует 10 минут."] },
    en: { subject: `Verification code: ${code}`, lines: [`Your verification code: ${code}`, "The code is valid for 10 minutes."] },
  };
  return render(to, t[locale]);
}

export function accessGrantedMail(to: string, password: string, loginUrl: string, locale: Locale): MailMessage {
  const t: Record<Locale, Template> = {
    uz: {
      subject: "Private bo'limga ruxsat berildi",
      lines: ["So'rovingiz tasdiqlandi!", `Email: ${to}`, `Parol: ${password}`, `Kirish: ${loginUrl}`],
    },
    ru: {
      subject: "Доступ к приватному разделу открыт",
      lines: ["Ваш запрос одобрен!", `Email: ${to}`, `Пароль: ${password}`, `Вход: ${loginUrl}`],
    },
    en: {
      subject: "Private access granted",
      lines: ["Your request was approved!", `Email: ${to}`, `Password: ${password}`, `Log in: ${loginUrl}`],
    },
  };
  return render(to, t[locale]);
}

export function accessRejectedMail(to: string, locale: Locale): MailMessage {
  const t: Record<Locale, Template> = {
    uz: { subject: "Private so'rov", lines: ["Afsuski, so'rovingiz rad etildi."] },
    ru: { subject: "Запрос на доступ", lines: ["К сожалению, ваш запрос отклонён."] },
    en: { subject: "Access request", lines: ["Unfortunately, your request was declined."] },
  };
  return render(to, t[locale]);
}
