import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AsciiBackground from "@/components/AsciiBackground";

const outfit = Outfit({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MovieTracker - Отслеживай фильмы вместе с другом",
  description: "Приложение для отслеживания просмотренных фильмов и сериалов с возможностью сравнения прогресса с другом",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${outfit.variable} font-sans antialiased bg-zinc-950 text-slate-50 min-h-screen`}>
        <AsciiBackground />
        <Navigation />
        <main className="pt-16 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
