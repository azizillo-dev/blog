import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { verifySecret } from "@/lib/auth/password";
import { getSecretPageBySlug } from "@/features/secret/queries";
import { recordVisit } from "@/features/secret/visits";
import { Container } from "@/components/layout/Container";
import { SecretExperience } from "@/components/secret/SecretExperience";
import { SecretPasswordForm } from "@/components/secret/SecretPasswordForm";

// Har so'rovda yangi: manzil o'zgarishi darhol ishlasin va tashrif yozilsin
export const dynamic = "force-dynamic";

// Qidiruv tizimlari indekslamasin
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Params = { params: Promise<{ locale: string; secret: string }> };

const COOKIE_NAME = "secret_pass"; // unlock.ts dagi nom bilan bir xil

export default async function SecretPage({ params }: Params) {
  const { secret } = await params;
  const page = await getSecretPageBySlug(secret.toLowerCase());
  if (!page) notFound();

  if (page.hasPassword) {
    const token = (await cookies()).get(COOKIE_NAME)?.value ?? "";
    const row = await db.secretPage.findUnique({ where: { id: page.id }, select: { passwordHash: true } });
    const unlocked = Boolean(token) && Boolean(row) && (await verifySecret(token, row!.passwordHash));
    if (!unlocked) {
      return (
        <Container size="prose">
          <SecretPasswordForm slug={page.slug} title={page.title} />
        </Container>
      );
    }
  }

  await recordVisit(page.id, await headers()).catch(() => {}); // statistika sahifani buzmasin

  return (
    <Container size="wide">
      {page.scenes.length === 0 ? (
        <p className="py-24 text-center text-muted">Bu yerda hali hech narsa yo&apos;q.</p>
      ) : (
        <SecretExperience title={page.title} intro={page.intro} nextLabel={page.nextLabel} scenes={page.scenes} />
      )}
    </Container>
  );
}
