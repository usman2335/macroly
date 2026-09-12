import type { Metadata } from "next";
import { Public_Sans, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Public Sans: designed for the US Web Design System specifically to stay legible at small UI
// sizes — the brief here ("easy on the eyes, easy to read") is a real design constraint, not a
// vibe, and this face is built to that constraint rather than picked for its look.
const publicSans = Public_Sans({
  variable: "--font-sans-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Bulgatti — wordmark only, see fonts/BULGATTI-LICENSE.txt (personal-use font; Macroly is a
// private, non-commercial app, so that's fine). Not on Google Fonts, so it's self-hosted here
// rather than pulled via next/font/google.
const bulgatti = localFont({
  src: "./fonts/Bulgatti.ttf",
  variable: "--font-brand-face",
  display: "swap",
});

// JetBrains Mono: built for scanning columns of similar characters at speed (0/O, 1/l/I stay
// distinct) — this app's numbers are calorie counts someone is glancing at on a phone, so that's
// the actual job, not just "a mono font for data."
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Macroly",
  description: "Personal calorie and training tracker",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${jetbrainsMono.variable} ${bulgatti.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
