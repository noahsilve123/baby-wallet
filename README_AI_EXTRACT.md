Client-side OCR & extraction (free)
=================================

This project includes a client-side OCR component that runs entirely in the browser using Tesseract.js. No external paid services or servers are required.

Quick usage
-----------

- Start the dev server:

```cmd
npm install
npm run dev
```

- Open `http://localhost:3000/ai-extract` and use the "Client-side document extraction" page to upload an image or PDF. Extraction runs locally in the browser.

Notes & limitations
-------------------
- Running OCR in the browser is free but CPU intensive. It may be slow on older machines and large PDFs.
- The component includes a tiny parsing helper (emails, phone-like strings, and common date formats) — it's a best-effort heuristic and not a replacement for a server-side pipeline.
- If you want scheduled reminders or queueing later, you'll need a server (Redis + bullmq) or a third-party scheduler. For now reminders are disabled to keep the site fully client-side and free.

Files added
-----------
- `app/components/AIExtractClient.tsx` — client OCR + parsing UI
- `app/ai-extract/page.tsx` — page that embeds the client component

If you want improvements (e.g., better parsing rules, PDF page extraction, or smaller language packs), tell me which one and I will implement only free/open-source options.
