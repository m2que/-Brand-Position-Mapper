# Brand Position Mapper

An AI-powered tool that maps a brand on a customer perception map relative to competitors using global or regional scope and grounded supporting sources.

## Run locally

1. Install dependencies: `npm install`
2. Create `.env.local` or `.env` and set `GEMINI_API_KEY`
3. Start the app: `npm run dev`

## Notes

- The browser app calls `api/brand-map.ts`
- `GEMINI_API_KEY` is used server-side only
