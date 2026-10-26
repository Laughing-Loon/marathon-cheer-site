import type { Metadata } from "next";
import DemoBanner from "@/components/DemoBanner";
import SubHeader from "@/components/SubHeader";
import { pronouns } from "@/lib/runner";
import { getSiteData } from "@/lib/siteData";
import Spotted from "./Spotted";

export const metadata: Metadata = { title: "Sightings" };

export default async function SpottedPage() {
  const { runner: r } = await getSiteData();
  const p = pronouns(r);
  return (
    <main className="page">
      <DemoBanner />
      <SubHeader bg="var(--accent)" title={<>Spotted<br />{r.name}</>}>
        Saw {p.obj}? Snap {p.obj}. Your photo moves {p.poss} icon on the map, so the friends further up know {p.subj}&apos;{p.plural ? "re" : "s"} coming.
      </SubHeader>
      <Spotted />
    </main>
  );
}
