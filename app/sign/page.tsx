import type { Metadata } from "next";
import SubHeader from "@/components/SubHeader";
import { getSiteData } from "@/lib/siteData";
import Sign from "./Sign";

export const metadata: Metadata = { title: "Make a sign" };

export default async function SignPage() {
  const { runner: r, signs } = await getSiteData();
  return (
    <main className="page">
      <SubHeader bg="var(--leaf)" title="Make a sign">
        Shuffle until one makes you snort. Print it. Hold it high. Yell {r.name}&apos;s name.
      </SubHeader>
      <Sign signs={signs} />
    </main>
  );
}
