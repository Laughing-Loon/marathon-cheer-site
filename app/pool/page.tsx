import type { Metadata } from "next";
import DemoBanner from "@/components/DemoBanner";
import SubHeader from "@/components/SubHeader";
import { easternTime, startDate } from "@/lib/runner";
import { getSiteData } from "@/lib/siteData";
import Pool from "./Pool";

export const metadata: Metadata = { title: "Guess the finish time" };

export default async function PoolPage() {
  const { runner: r } = await getSiteData();
  return (
    <main className="page">
      <DemoBanner />
      <SubHeader bg="var(--pink)" title={<>Finish-time<br />pool</>}>
        Closest guess wins eternal glory. Furthest guess gets publicly shamed. Guesses lock at {easternTime(startDate(r))}. No insider trading.
      </SubHeader>
      <Pool />
      {r.donate_url && (
      <a href={r.donate_url} target="_blank" rel="noopener" className="btn btn-accent" style={{ margin: "0 16px 32px", minHeight: 52, fontSize: 16 }}>
        Put your money where your guess is →
      </a>
      )}
    </main>
  );
}
