/**
 * When a JPEG was taken, from its EXIF DateTimeOriginal (+ OffsetTimeOriginal if present).
 * Returns null for anything it can't read (HEIC, screenshots, edited photos). Without an
 * offset, the time is read as the phone's local time, which on race day is New York.
 */
export async function photoTakenAt(file: File): Promise<Date | null> {
  try {
    const v = new DataView(await file.slice(0, 128 * 1024).arrayBuffer());
    if (v.getUint16(0) !== 0xffd8) return null; // not a JPEG
    let p = 2;
    while (p + 4 < v.byteLength) {
      const marker = v.getUint16(p);
      const len = v.getUint16(p + 2);
      if (marker === 0xffe1 && v.getUint32(p + 4) === 0x45786966) return readExif(v, p + 10);
      if ((marker & 0xff00) !== 0xff00) return null;
      p += 2 + len;
    }
  } catch {}
  return null;
}

function readExif(v: DataView, tiff: number): Date | null {
  const le = v.getUint16(tiff) === 0x4949;
  const u16 = (o: number) => v.getUint16(o, le);
  const u32 = (o: number) => v.getUint32(o, le);
  const ascii = (o: number, n: number) => {
    let s = "";
    for (let i = 0; i < n; i++) {
      const c = v.getUint8(o + i);
      if (!c) break;
      s += String.fromCharCode(c);
    }
    return s;
  };
  const tags = (ifd: number) => {
    const out = new Map<number, string | number>();
    const n = u16(ifd);
    for (let i = 0; i < n; i++) {
      const e = ifd + 2 + i * 12;
      const tag = u16(e);
      const type = u16(e + 2);
      const count = u32(e + 4);
      if (type === 2) out.set(tag, ascii(count > 4 ? tiff + u32(e + 8) : e + 8, count));
      else if (type === 4) out.set(tag, u32(e + 8));
    }
    return out;
  };

  const ifd0 = tags(tiff + u32(tiff + 4));
  const exifPtr = ifd0.get(0x8769);
  if (typeof exifPtr !== "number") return null;
  const exif = tags(tiff + exifPtr);
  const dt = exif.get(0x9003); // "YYYY:MM:DD HH:MM:SS"
  if (typeof dt !== "string") return null;
  const m = dt.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const off = exif.get(0x9011); // "-05:00"
  if (typeof off === "string" && /^[+-]\d{2}:\d{2}$/.test(off)) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${off}`);
    return Number.isNaN(+d) ? null : d;
  }
  return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
}
