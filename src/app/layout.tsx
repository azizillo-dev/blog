import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { LOCALES } from "@/lib/constants";
import "./globals.css";

const sans = Manrope({ variable: "--font-sans", subsets: ["latin", "cyrillic"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "Blog", template: "%s" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e11" },
  ],
};

// Hydrate'dan oldin ishlaydi: theme va til <html> ga darhol qo'yiladi → miltillash yo'q.
const bootScript = `(function(){try{var d=document.documentElement,t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';d.dataset.theme=t;var l=location.pathname.split('/')[1];if(${JSON.stringify(
  LOCALES,
)}.indexOf(l)>-1)d.lang=l;}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className={`${sans.variable} ${mono.variable} min-h-dvh antialiased`}>{children}</body>
    </html>
  );
}
