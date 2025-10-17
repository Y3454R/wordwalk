# WordWalk

Minimal, elegant vocabulary audiobook app built with Next.js 13.5 (JavaScript), Tailwind CSS, and shadcn-style UI.

## Features

- Word groups (sets) loaded from `data/words.json`
- Continuous TTS playback (word → synonym → sentence) with 1–2s pauses
- Controls: Play / Pause / Stop / Next / Prev
- Progress: “Word X of Y” with progress bar
- Adjustable speech rate: slow / medium / fast
- Light/Dark theme toggle (persisted)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Data

Edit `data/words.json` to manage sets. Structure:

```json
{
  "groups": [
    {
      "id": 1,
      "name": "Set 1",
      "words": [
        {
          "id": 1,
          "word": "abreast",
          "synonym": "up-to-date",
          "sentence": "..."
        }
      ]
    }
  ]
}
```

Choose the active set from the dropdown in the UI.

## Usage

- Click Play to start; Pause/Resume or Stop anytime
- Next/Prev jumps between words
- Change rate via the rate dropdown
- Toggle theme with the header button

## Tech notes

- TTS uses the browser `SpeechSynthesis` API (separate utterances per field)
- Playback is resilient to fast skips via a session run id
- Styling via Tailwind; UI primitives: `Button`, `Card`, `Progress`

## Deploy (Vercel)

1. Push to a Git repo
2. Import the repo in Vercel
3. Use defaults for a Next.js app

## Browser support

Requires `SpeechSynthesis` (modern Chrome/Edge/Safari/Firefox). Some browsers require a user gesture before audio can play.
