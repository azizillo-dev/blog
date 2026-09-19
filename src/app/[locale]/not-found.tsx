import Link from "next/link";
import { Container } from "@/components/layout/Container";

// not-found params olmaydi — shuning uchun uch tilda qisqa matn.
export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="text-7xl font-extrabold tracking-tight text-accent">404</p>
      <p className="mt-4 text-muted">Sahifa topilmadi · Страница не найдена · Page not found</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-accent-fg transition-transform hover:scale-105">
        ←
      </Link>
    </Container>
  );
}
