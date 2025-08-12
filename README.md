# Krish · Personal Website (Next.js App Router)

A personal site that brings together a developer portfolio, original music, and a curated Spotify playlist. Built with Next.js (App Router), TypeScript, and Tailwind CSS — with a custom global audio player that persists across pages.

## Features

- **Landing**: Centered hero with subtle beams background and tasteful fade-in animations
- **Portfolio**: GitHub repositories displayed as interactive `SpotlightCard`s
  - Uniform 3-column grid layout, consistent card structure
  - Language-aware accent styling, rise-in animation on load
- **Music**
  - Custom player: play/pause, next/previous, scrub timeline, volume slider
  - Demos vs Completed selector; per-track expandable lyrics sections
  - Auto-loads audio from Vercel Blob via server API; no hardcoded list
  - Global mini player: sticky above the footer on all non-music pages
    - Animates in/out; never overlaps footer; spacebar toggles play anywhere
- **Spotify playlist**
  - Server API route using Client Credentials flow
  - Album art + track metadata rendered client-side
  - Client-side cache per tab so navigations don’t refetch
- **UI/UX**
  - Rounded, translucent navbar with blur; consistent page spacing
  - White footer with social icons
  - Accessible focus/aria attributes on interactive elements

## Tech Stack

- **Framework**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: `lucide-react`
- **Data**:
  - GitHub REST API (public repos)
  - Spotify Web API (playlist via server route)
  - Vercel Blob (audio hosting + listing)
- **Tooling**: ESLint (`next/core-web-vitals`), `@t3-oss/env-nextjs` for env validation, Husky pre-commit hook

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+

### Installation
```bash
npm install
```

### Environment Variables
The project validates env vars via `src/env.js`. Create a `.env` (or `.env.local`) with the following as needed:

```bash
# General
NODE_ENV=development

# GitHub (optional; improves API limits/filters)
GITHUB_TOKEN=                   # optional
GITHUB_USERNAME=                # optional
NEXT_PUBLIC_GITHUB_USERNAME=    # optional (public)

# Audio / Vercel Blob
NEXT_PUBLIC_AUDIO_BASE=         # public base URL where audio is served (Blob public URL)
KS_READ_WRITE_TOKEN=            # Vercel Blob access token for listing (server-only)

# Spotify API (server-only)
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_PLAYLIST_ID=            # e.g. from a playlist URL
```

Notes:
- `NEXT_PUBLIC_AUDIO_BASE` must be the public Blob URL where your audio files are accessible (e.g., `https://...vercel-storage.com/...`).
- `KS_READ_WRITE_TOKEN` is used server-side to list blobs. See Vercel Blob docs: `https://vercel.com/docs/storage/vercel-blob`.
- Spotify credentials use Client Credentials flow; no redirect URI is required for reading a public playlist.

### Scripts
```bash
# Dev
npm run dev            # start Next.js in dev

# Build & preview
npm run build          # production build
npm run start          # start production server
npm run preview        # build + start

# Quality
npm run typecheck      # tsc --noEmit
npm run lint           # next lint
npm run check          # typecheck + lint (runs in pre-commit)
```

### Pre-commit Hook
Husky runs `npm run check` on each commit to keep the repo green.

## Architecture Overview

```
src/
  app/
    (landing)/page.tsx         # homepage hero
    music/page.tsx             # custom player + playlist
    portfolio/page.tsx         # GitHub projects grid
    contact/page.tsx
    api/
      music/list/route.ts      # lists audio blobs -> { demos, completed }
      spotify/playlist/route.ts# fetches playlist JSON (server)
  components/
    audio/
      AudioPlayerProvider.tsx  # global audio state, spacebar handler
      GlobalMiniPlayer.tsx     # sticky mini player above footer
    GitHubProjects.tsx         # repo grid using SpotlightCard
    SpotlightCard.tsx          # hover spotlight card component
    SpotifyPlaylist.tsx        # client view with in-memory cache per tab
    Header.tsx / Footer.tsx
  styles/globals.css           # rise animation, globals
  env.js                       # zod-validated env schema
```

### Audio flow
- `/api/music/list` queries Vercel Blob using `KS_READ_WRITE_TOKEN`, groups files into Demos vs Completed, returns public `src` URLs derived from `NEXT_PUBLIC_AUDIO_BASE`.
- `AutoBlobTracks` fetches the list once per mount (with sessionStorage warm cache for faster navigation).
- `AudioPlayerProvider` wraps the app, exposing playback controls + state.
- `GlobalMiniPlayer` appears on non-music pages only when playback originated from the music page and either is playing or was paused from the mini player. It’s sticky above the footer and controlled by IntersectionObserver or sticky positioning as appropriate.
- Pressing space toggles play/pause anywhere (except while typing in inputs/contenteditable).

### Spotify playlist flow
- Server route retrieves an access token and fetches playlist JSON once per request.
- Client component caches the response in memory at the module level so it persists across client-side navigations; refetch only happens on full reload or new tab.

## Deployment (Vercel)
1. Push the repo to GitHub and import into Vercel.
2. Add the env vars listed above in the Vercel Project Settings.
3. Ensure audio files are uploaded to Vercel Blob and you use the public URL for `NEXT_PUBLIC_AUDIO_BASE`.
4. Deploy. The mini player will remain sticky above the footer across pages, and the playlist will not refetch during client-side navigations.

## Status
- Writings page is temporarily hidden and removed from the navbar.

## License
Personal project — all rights reserved unless stated otherwise.
