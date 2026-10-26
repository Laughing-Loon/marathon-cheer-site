# Yell at ___ Day 📣

A loud, New York–flavored website that helps your friends cheer you on at the **TCS New York City Marathon**. You share one link and they get:

- **A live-ish map:** your icon runs the 2026 course at your goal pace inside a "cloud" that widens with uncertainty, and snaps to wherever a friend last spotted you.
- **Where to stand:** 13 viewing spots, each with its street sign, subway lines and the window when you'll pass, computed from your wave and pace.
- **Claim a mile:** a subway-line map of the course. Friends claim stops (with what they're wearing) so nobody's alone in the Bronx.
- **Spotted:** a tabloid front page ("THE DAILY ___") that updates with each photo friends post. A sighting moves your map icon.
- **Guess the finish time:** a pool on a timeline, entered on a MetroCard. It locks at the gun, enforced by the database.
- **Make a sign:** shuffle through puns on cardboard, then print.
- **Donate:** a bodega-awning link to your fundraiser.

Everything personal (your name, pronouns, bib, corral, pace, fundraiser, sign puns and photos) lives in **your own Supabase database**, not in this code. Fork it, add your details, deploy. No code edits needed.

> Built for the NYC Marathon: the course map, viewing spots, subway lines and the Bronx route are NYC 2026 data. Using it for another race means replacing those (see [Another race?](#another-race)).

---

## What you need

- A free [GitHub](https://github.com) account
- A free [Supabase](https://supabase.com) account (database + photo storage)
- A free [Vercel](https://vercel.com) account (hosting)
- About 20 minutes

## 1. Copy the code

Click **Use this template** (or **Fork**) at the top of this page to make your own copy, then:

```bash
git clone https://github.com/<you>/<your-copy>.git
cd <your-copy>
npm install
npm run dev
```

Open http://localhost:3000. With no database connected, the site runs in **demo mode** as a runner named Alex. Entries are saved in your browser only, and a black banner says so.

## 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com). Pick the **East US** region (closest to New York).
2. In **SQL Editor**, paste and run [`supabase/schema.sql`](supabase/schema.sql). This creates the tables, the security rules and two photo buckets.
3. Then run [`supabase/seed.sql`](supabase/seed.sql). It adds a starter settings row and a set of sign puns.
4. Go to **Project Settings → API** and copy the **Project URL** and the **publishable key** (`sb_publishable_…`; the legacy `anon` key also works).

> Never use the `service_role` / secret key in this site. The publishable key is designed to be public; the security rules in `schema.sql` are what protect your data.

## 3. Make it yours

In Supabase, open **Table Editor → `runner`** and edit the one row. Changes show up on the live site within about a minute, with no redeploy.

| Column | What it is | Example |
| --- | --- | --- |
| `name` | What friends yell. Short is best: it goes on vertical tabs and headlines. | `Sam` |
| `pronouns` | `she`, `he` or `they`. Used throughout the copy. | `she` |
| `bib` | Your bib number. Powers the "Real splits on NYRR" button. | `12345` |
| `splits_url` | Optional. Overrides that button's link. | |
| `start_time` | The gun for **your wave**. Daylight saving ends race morning, so use `-05`. | `2026-11-01 09:10:00-05` |
| `wave`, `start_color`, `corral` | From your NYRR race confirmation. Color is `Orange`, `Blue` or `Green`. | `1`, `Orange`, `E` |
| `pace_goal_s` | Goal pace in **seconds per mile**: where the icon sits. | `504` (8:24/mi) |
| `pace_fast_s`, `pace_slow_s` | Your fastest and slowest likely pace: the "cloud" and the pass-by windows. Add ~1.5% to slow for weaving. | `500`, `533` |
| `board_from`, `board_to` | Range of the finish-time guess board, `h:mm`. | `3:30`, `4:30` |
| `donate_url`, `cause` | Your fundraising page and who it's for. Leave empty to hide donating. | `Team for Kids` |
| `hair_color`, `skin_color` | Colors for your little map icon (hex). | `#FFD84A` |
| `finish_time` | Set **after** the race (`h:mm:ss`) to crown the pool's winner and loser. | `3:41:07` |

**Signs:** edit **`signs`**. `{NAME}` becomes your name in capitals and `{name}` as typed. A line break in `top` starts a new line. The `bottom` line is the punchline in orange.

**Photo wall (optional):** posters of your past races or training runs, wheatpasted behind the flyer.
1. **Strip location data first.** Phone photos record where they were taken. Re-saving as JPEG, or taking a screenshot of the photo, removes it on most phones.
2. In **Storage → `wall`**, make a folder `past-runs` and upload up to six photos (portrait works best).
3. In **`past_runs`**, add a row per photo: `title` (`BROOKLYN HALF` or `SEP 20`), optional `subtitle` (`2024 · 1:52:10`) and `line` (a joke), and `photo_path` (`past-runs/your-file.jpg`).

Anything in these tables can be read by anyone who has your site's link, so don't put anything there you wouldn't put on the site.

## 4. Connect your laptop (optional)

To see your real data locally, copy `.env.example` to `.env.local` and fill it in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

`.env.local` is ignored by git. Never commit it.

## 5. Deploy to Vercel

1. At [vercel.com/new](https://vercel.com/new), import your GitHub copy.
2. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Click **Deploy**. Every push to `main` redeploys automatically.

Share the `*.vercel.app` link. The site asks search engines not to index it, so it stays shared-by-link. Link previews in iMessage, WhatsApp and Slack show a flyer card with your name.

Using a custom domain? Set `NEXT_PUBLIC_SITE_URL` (for example `https://cheer.example.com`) so link previews use it.

## Race week

- **Double-check your start time** in the NYRR app the day before. If it changes, update `start_time`. The guess lock follows it automatically.
- **Rehearse:** add `?now=2026-11-01T11:00:00-05:00` to any page to pretend it's race morning. The clock keeps ticking from there. `?now=` on its own resets it.
- **Moderate:** delete any claim, guess, sighting or photo in the Supabase dashboard.
- **After the race:** set `finish_time` to settle the pool.

## How it works

- **Next.js** (App Router) on **Vercel**; **Supabase** for data and photos, called from the browser with the publishable key. No accounts.
- **Row-level security** (`supabase/schema.sql`): friends can add and read claims, guesses and sightings but never edit or delete them. Settings tables are read-only. Guesses are rejected by the database once `now() >= start_time`. Timestamps are set by the database, and a sighting's "seen at" time is limited to the 30 minutes before posting.
- **The icon:** `mile = (now − start) / goal pace`, re-anchored on the latest sighting by when the runner was *seen*, not when the photo was posted. The cloud spans the fast and slow paces.
- **Settings** load on the server (`lib/siteData.ts`), are cached for a minute and passed to the page. If Supabase is unreachable, the site falls back to defaults for a few seconds.

| Where | What |
| --- | --- |
| `lib/runner.ts` | Settings type, defaults, pronouns, helpers |
| `lib/spots.ts` | The 13 viewing spots, trains and pass-by miles |
| `lib/course.ts`, `public/map-base.svg`, `scripts/map/` | Course line and base map |
| `app/*` | One folder per screen |
| `supabase/` | Schema, security rules and starter content |

## Another race?

The structure carries over, but the NYC data doesn't:

1. Put your course's waypoints in `scripts/map/course.csv`, then regenerate the base map with `scripts/map/make-map.py` from your city's boundary GeoJSON (adjust the bounding box at the top).
2. Copy the waypoints into `lib/course.ts`.
3. Rewrite `lib/spots.ts` with your viewing spots, and update the allowed `spot_id` values in `schema.sql` to match.
4. Edit the NYC-specific copy: the subway bullets, the "Miles 1–8 are hard mode" note, the Bronx jokes and the Daily paper's headlines.

## Privacy

- No location is ever collected from the runner. The icon is a pace model plus friends' sightings.
- Friends' photos are resized in the browser before upload, which also drops their location data.
- The upload form asks people to keep strangers out of shot.
- Everything personal is in your Supabase project and can be deleted there at any time.
