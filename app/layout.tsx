import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { RunnerProvider } from "@/components/RunnerProvider";
import { easternTime, raceDay, startDate, startTag } from "@/lib/runner";
import { getSiteData } from "@/lib/siteData";
import "./globals.css";

// Bundled (Latin subset) rather than next/font/google, so builds never depend on fetching from Google.
const outfit = localFont({
  variable: "--font-outfit",
  src: [
    { path: "./fonts/Outfit-400-latin.woff2", weight: "400" },
    { path: "./fonts/Outfit-600-latin.woff2", weight: "600" },
    { path: "./fonts/Outfit-800-latin.woff2", weight: "800" },
    { path: "./fonts/Outfit-900-latin.woff2", weight: "900" },
  ],
});

// Link previews need absolute URLs: set NEXT_PUBLIC_SITE_URL, or let Vercel provide its production domain.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  const { runner: r } = await getSiteData();
  const start = startDate(r);
  const title = `Yell at ${r.name} Day`;
  const tag = startTag(r);
  const description = `Where to stand, when to get there, and how to yell at ${r.name} during the NYC Marathon. ${raceDay(start)} · ${easternTime(start)}${tag ? ` · ${tag}` : ""}.`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s · ${title}` },
    description,
    openGraph: { title: `${title} 📣`, description, siteName: title, type: "website", url: "/" },
    twitter: { card: "summary_large_image", title: `${title} 📣`, description },
    robots: { index: false, follow: false }, // unlisted, shared by link
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EFE8D8",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { runner } = await getSiteData();
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <RunnerProvider runner={runner}>{children}</RunnerProvider>
      </body>
    </html>
  );
}
