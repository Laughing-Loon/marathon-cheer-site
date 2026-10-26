import Link from "next/link";
import type { ReactNode } from "react";

export default function SubHeader({ bg, title, children }: { bg: string; title: ReactNode; children: ReactNode }) {
  return (
    <header className="subhead" style={{ background: bg }}>
      <Link href="/" className="home-link">
        ← Home
      </Link>
      <h1>{title}</h1>
      <p>{children}</p>
    </header>
  );
}
