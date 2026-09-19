import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { SettingKey } from "@/lib/constants";

export type Settings = Record<SettingKey, string>;

const DEFAULTS: Settings = { siteTitle: "My I/O", authorName: "", leetcodeUsername: "", skills: "" };

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...values } as Settings;
});
