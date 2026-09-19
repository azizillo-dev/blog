import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await getSession("admin")) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <LoginForm />
    </div>
  );
}
