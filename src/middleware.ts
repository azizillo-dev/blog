import { NextResponse, type NextRequest } from "next/server";
import { COOKIE } from "@/lib/constants";
import { isLocale, matchLocale } from "@/i18n";
import { verifyToken } from "@/lib/auth/token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const session = await verifyToken(req.cookies.get(COOKIE.admin)?.value, "admin");
    if (!session) return NextResponse.redirect(new URL("/admin/login", req.url));
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

  const saved = req.cookies.get(COOKIE.locale)?.value;
  const locale = isLocale(saved) ? saved : matchLocale(req.headers.get("accept-language"));
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // api, next ichki fayllari, yuklangan rasmlar va kengaytmali fayllar o'tkazib yuboriladi
  matcher: ["/((?!api|_next|uploads|.*\\..*).*)"],
};
