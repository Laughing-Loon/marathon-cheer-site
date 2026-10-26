import type { Metadata } from "next";
import DemoBanner from "@/components/DemoBanner";
import SubHeader from "@/components/SubHeader";
import Coverage from "./Coverage";

export const metadata: Metadata = { title: "Claim a mile" };

export default function CoveragePage() {
  return (
    <main className="page">
      <DemoBanner />
      <SubHeader bg="var(--sun)" title={<>Cheer<br />coverage</>}>
        Spread out. A wall of friends at mile 8 and nobody at mile 20 is how marathons end in tears.
      </SubHeader>
      <Coverage />
    </main>
  );
}
