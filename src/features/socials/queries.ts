import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

export const getVisibleSocialLinks = cache(() =>
  db.socialLink.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
);

export const getAllSocialLinks = () => db.socialLink.findMany({ orderBy: { order: "asc" } });
