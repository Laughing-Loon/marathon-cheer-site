"use client";

import { useEffect, useRef, useState } from "react";

/** Poster photo that removes itself if the file isn't there (e.g. not uploaded yet), leaving a text poster. */
export default function PosterPhoto({ src }: { src: string }) {
  const [ok, setOk] = useState(true);
  const ref = useRef<HTMLImageElement>(null);

  // The image can fail before React attaches onError, so also check it once mounted.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) setOk(false);
  }, []);

  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt=""
      draggable={false}
      onError={() => setOk(false)}
      style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover", filter: "grayscale(.4) contrast(1.15) sepia(.15)" }}
    />
  );
}
