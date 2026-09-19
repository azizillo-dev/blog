import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/constants";

// Odatda middleware til bo'yicha yo'naltiradi; bu — zaxira.
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
