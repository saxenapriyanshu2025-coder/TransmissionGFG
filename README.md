# ASSEMBLE '26: The Multiverse Hackathon

Event website for a 24 hour, superhero themed hackathon by the **GeeksForGeeks Student Chapter, Bennett University**.
Built for the Junior Core Technical Team, Round 1 (Marvel × Web Design).

## Concept

The multiverse is breaking, and six realms have gone dark. Every participant is a hero who picks a realm (track),
joins a squad and has 24 hours to ship a fix.

The whole site is written like a classified mission file:

- **Trailer popup**: every time the site opens, the original 20 second cinematic trailer plays in a popup theatre. It tries to play with sound; if the browser blocks that, it plays muted with a "Tap for sound" button. Skip unlocks after 5 seconds (change `SKIP_AFTER` in `src/main.js`). Afterwards a small "Watch trailer" pill stays in the corner to replay it. The trailer has red comic close-ups and gold flares of the roster heroes in ink style, an accelerating flip-book montage of heroes and team names, a gold light tunnel, a metallic ASSEMBLE title and a closing "Transmission 2026 × Bennett University" live-feed signal, with an original score synthesized in Python. Rendered frame by frame from `teaser/intro.html`.
- **Showreel**: the site opens on a full-screen section playing the original ASSEMBLE '26 teaser (with a sound toggle). Every time the teaser reaches its own ASSEMBLE title shot (about 16 seconds in), the page glides down by itself to the ASSEMBLE hero with its gold portal, so the video hands off to the site. The teaser pauses when it leaves the screen and starts again from the beginning when you scroll back up.
- **Hero**: a live canvas "portal" of swirling energy that reacts to your cursor, a giant ASSEMBLE title with a
  red and cyan chromatic split that follows the mouse, HUD corners and a live countdown.
- **Built-in video player**: custom HTML5 player (play/pause, scrubber with hover time, buffer bar, mute, fullscreen, keyboard shortcuts Space/K/M/F/arrows, auto-hiding controls). Both videos ship as MP4 (H.264) with a WebM fallback, so they play everywhere, even offline.
- **Briefing**: the event story as a classified file, with count-up stats.
- **The Roster**: five original masked heroes (Genius, Speedster, Strategist, Mystic, Guardian), one per hero class. The cards expand on hover with animated power stats, and clicking one pre-selects that class in the registration form.
- **Six teams** (tracks), each with an Avenger as its member whose power matches the track: **Neural × Iron Man** (AI and ML, genius tech), **Sentinel × Captain America** (Cybersecurity, the shield), **Titan × Thor** (Cloud, Infra and Web3, rules the clouds), **Pulse × Black Panther** (HealthTech and Climate, Wakandan medical tech), **Rift × Doctor Strange** (AR, VR and Games, master of dimensions) and **Multiverse × Spider-Man** (Open Innovation, the student hero of the multiverse). Cards tilt in 3D, glow where your cursor is, and clicking one pre-selects that team in the registration form.
- **Team themes**: picking a team re-themes the whole site live (accent colours, buttons, title glow, portal colours) and gives the hero portal that hero's power: Iron Man targeting HUD, Captain America shield pulses, Thor lightning, Black Panther kinetic bursts, Doctor Strange spell circles, Spider-Man web threads. After registering, a full-screen "Suit online · Team X" moment plays, and the theme comes back every time the user logs in.
- **Mission timeline**: pinned horizontal scroll on desktop, vertical on mobile.
- **The Arsenal**: prize tiers and bounties.
- **Join the Initiative**: Google sign-in, a "hero file" form (alias, class, realm, squad), then a generated
  **Hero Pass** with a unique pass code and access glyph. The pass can be downloaded as a PNG and added to Google Calendar.
- **Intel Desk**: FAQ accordion.

Visual language: near-black ink, one strong red, bone white, comic halftone dots, film grain and
condensed poster type. All artwork, video and music are original.

## Tech stack

| Layer | Tools |
| --- | --- |
| Build | Vite 5, vanilla JS (ES modules), plain CSS |
| Motion | GSAP 3 + ScrollTrigger, Lenis smooth scroll, Canvas 2D |
| Auth | Supabase Auth with Google OAuth (PKCE flow) |
| Database | Supabase Postgres with Row Level Security |
| Hosting | Netlify |

### Backend and security

- `registrations` table, one row per Google account.
- RLS: users can only read, create and update their own row. Anonymous visitors cannot read anything.
- Database triggers force the email to match the signed-in Google account and generate the pass code on the
  server, so nobody can fake either one. Pass code, email and user id are locked after creation.
- `event_stats()` exposes only totals (for the live "heroes assembled" counter), never personal data.

Full SQL: [`supabase/schema.sql`](supabase/schema.sql).

## Hero photos on the team cards

The six hero photos (supplied by the site owner) live in `src/assets/heroes/` as WebP cutouts with the backgrounds removed (rembg / ISNet). Iron Man's photo has a black background that blends into his armour, so it uses `photoBlend: true`: the photo's black is blended away with `mix-blend-mode: lighten` instead of being cut out. The photos appear on the team cards and on the "Suit online" screen after a user joins a team.

### Adding or replacing a photo

Each team in `src/data.js` has an empty `photo: ''` slot. To add one:

1. Put the image in `src/assets/heroes/`, for example `src/assets/heroes/iron-man.jpg`.
2. At the top of `src/data.js`, import it: `import ironMan from './assets/heroes/iron-man.jpg';`
3. Set the slot on that team: `photo: ironMan,` (a full image URL in quotes also works).
4. Run `npm run build` (and `./build-single.sh` for the one-file version).

The photo shows on the right side of the team card, fading into the card, and zooms slightly on hover. Portrait images with the face near the top look best.

## Run locally

```bash
npm install
npm run dev
```

Supabase keys go in `.env` (see `.env.example`). The publishable key is also set as a fallback in
`src/supabase.js`, because it is safe to ship to the browser (RLS protects the data).

## Single file version

`./build-single.sh` builds `out/assemble-26.html`, the whole site in one HTML file (CSS, JS, fonts and logo inlined).

## Deploy on Netlify

- **Git**: connect the repo. `netlify.toml` already sets `npm run build` and publishes `dist`.
- **Drag and drop**: run `npm run build` and drop the `dist` folder on https://app.netlify.com/drop

## Google sign-in setup (one time)

1. Google Cloud Console → APIs & Services → Credentials → Create **OAuth client ID** (Web application).
   Authorised redirect URI: `https://jhdqgdqbtobfqamudlai.supabase.co/auth/v1/callback`
2. Supabase → Authentication → Sign In / Providers → **Google**: turn it on, paste the Client ID and Secret.
3. Supabase → Authentication → URL Configuration:
   - Site URL: your Netlify URL, e.g. `https://assemble-26.netlify.app`
   - Redirect URLs: add `https://assemble-26.netlify.app/**` and `http://localhost:5173/**`

## Team registration

After Google sign-in, the form runs in steps: (1) pick a team, (2) choose how many members (1 to 5), (3) fill each member's name, batch, branch, hosteller or day scholar, enrollment number and email. Member 1 is the team leader, and their email comes from Google. Then the squad name, the leader's hero alias and role. Members are saved in the `members` JSON column with `team_size`, and listed under the Hero Pass.

## Registration emails

After a team registers, every member gets a "You're registered" email with the Hero Pass attached (PNG) and the event date. The Supabase Edge Function `send-registration-mail` (`supabase/functions/`) sends it through Gmail SMTP. The Gmail address and App Password are stored in **Supabase Vault** and read only by the server (service role); they are never in the site code. The function only emails the members saved on the signed-in user's own registration, and at most once every 10 minutes per team.

To change the sending account, update the `assemble_mail_user` and `assemble_mail_pass` secrets in Supabase → Project Settings → Vault.

## Accessibility and responsiveness

- Fully responsive from 320px phones to wide desktops, with no horizontal scroll.
- Respects `prefers-reduced-motion` (skips the loader, smooth scroll and heavy animation).
- Keyboard focus styles, ARIA on the accordion and menu, custom cursor only on mouse devices.

## Resources and assets

- Fonts (self-hosted through Fontsource): **Anton**, **Space Grotesk**, **JetBrains Mono** (all from Google Fonts, OFL).
- Libraries: GSAP, Lenis, Supabase JS, Vite.
- Emblem, hero roster characters, realm icons, class icons, portal animation, halftone and grain textures: made from scratch in SVG, CSS and Canvas.
- Video and music: both videos and the soundtrack were made from scratch for this site.
- No stock photos are used, so the site stays fast and fully original.
- Inspiration: Awwwards and Godly for layout and motion ideas, plus classic comic book halftone print.

## Disclaimer

A fan-inspired event theme. Not affiliated with or endorsed by Marvel or Disney.
Prize amounts and dates are placeholders until the chapter confirms them.
