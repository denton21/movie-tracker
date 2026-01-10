import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AsciiBackground from "@/components/AsciiBackground";

const inter = Inter({
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
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased bg-gray-950 text-white min-h-screen`}>
        <AsciiBackground />
        <Navigation />
        <main className="pt-16 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
