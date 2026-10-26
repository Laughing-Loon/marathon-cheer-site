"use client";

import { useEffect, useState } from "react";
import { DISTANCE } from "@/lib/config";
import { MAP_H, MAP_W, at, pathBetween } from "@/lib/course";
import { useNow } from "@/lib/clock";
import { listSightings } from "@/lib/db";
import { clock, mileLabel, runnerPosition, seenAt, type Sighting } from "@/lib/model";
import { pronouns } from "@/lib/runner";
import { useRunner } from "./RunnerProvider";

export default function LiveMap({ baseSvg }: { baseSvg: string }) {
  const now = useNow(2000);
  const r = useRunner();
  const p = pronouns(r);
  const [sightings, setSightings] = useState<Sighting[]>([]);

  useEffect(() => {
    const load = () => listSightings().then(setSightings).catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const pos = now ? runnerPosition(now, sightings, r) : null;
  const mile = pos?.mile ?? 0;
  const [x, y] = at(mile);
  const started = now ? now.getTime() >= new Date(r.start_time).getTime() : false;
  const cloudPath = pos && pos.hi - pos.lo > 0.02 ? pathBetween(pos.lo, pos.hi) : null;

  let status = `${r.name} is at the start. Probably in a porta-potty line.`;
  if (pos && started) {
    if (mile >= DISTANCE) status = `${r.name} has finished. Probably. Go find ${p.obj} near the finish.`;
    else if (pos.anchor)
      status = `Spotted at mile ${mileLabel(Number(pos.anchor.mile))} at ${clock(seenAt(pos.anchor), true)}; model says mile ${mile.toFixed(1)} now.`;
    else status = `Model says mile ${mile.toFixed(1)}. ${r.name} is somewhere in the orange cloud. Probably.`;
  }

  return (
    <>
      <div
        style={{
          position: "relative",
          border: "2px solid var(--ink)",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "5px 5px 0 var(--ink)",
          background: "#A9D4EE",
        }}
      >
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          width="100%"
          role="img"
          aria-label={`Map of the marathon course from Staten Island through Brooklyn, Queens, Manhattan and the Bronx to Central Park. ${status}`}
          style={{ display: "block", height: "auto" }}
          data-mile={mile.toFixed(2)}
        >
          <g dangerouslySetInnerHTML={{ __html: baseSvg }} />
          {cloudPath && (
            <path
              className="cloud"
              d={cloudPath}
              fill="none"
              stroke="#F26B2A"
              strokeWidth={22}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.4}
            />
          )}
          {!cloudPath && <circle className="cloud" cx={x} cy={y} r={16} fill="#F26B2A" opacity={0.4} />}
          <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1.5)`}>
            <g className="bob">
              <path d="M-7 5 Q0 -14 7 5 Z" fill="#F26B2A" stroke="#FFFFFF" strokeWidth={2.5} strokeLinejoin="round" />
              {/* Chin-length bob: back of the hair, face, then a side fringe (colors from runner settings) */}
              <path
                d="M-8 -9 Q-9.2 -13 -8.5 -16 A8.5 8.5 0 0 1 8.5 -16 Q9.2 -13 8 -9 Q6.5 -7.8 5.2 -9.4 L-5.2 -9.4 Q-6.5 -7.8 -8 -9 Z"
                fill={r.hair_color}
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              <circle cx={0} cy={-13.5} r={5.4} fill={r.skin_color} />
              <path d="M-6.2 -13.8 Q-5.2 -19.8 0 -20 Q5.6 -19.8 6.3 -14.4 Q2.5 -17.6 -1 -16.2 Q-3.6 -15.2 -6.2 -13.8 Z" fill={r.hair_color} />
            </g>
          </g>
        </svg>
      </div>
      <p style={{ margin: 0, fontSize: 15, color: "var(--muted)" }} aria-live="polite">
        {status}
      </p>
      {started && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
          The cloud grows the longer {p.subj} {p.plural ? "run" : "runs"}, like {p.poss} excuses. A sighting photo snaps it back.
        </p>
      )}
    </>
  );
}
