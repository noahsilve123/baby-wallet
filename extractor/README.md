Extractor service scaffold
=========================

Purpose
-------
This folder provides a minimal scaffold and guidance for running the AI-based extractor as a standalone service (recommended for reliability). The Next.js app can then call this service by setting `NEXT_PUBLIC_EXTRACTOR_URL` to the service URL.

Why run it separately?
- Vercel serverless function environments may be resource- and time-limited for heavy model workloads (`@xenova/transformers`, `tesseract.js`).
- Running a dedicated container lets you allocate more memory/CPU and persist model caches, which speeds up inference and avoids cold-downloads.

What we provide
- `Dockerfile` – a base image with Node and Tesseract installed. It expects you to supply a `server.js` that exposes a simple `POST /extract` endpoint accepting `multipart/form-data` (field `file`) and returning JSON `{ text, fields }` similar to the current `/api/ai-extract` output.

Suggested service contract
- Endpoint: `POST /extract` or `POST /` (your choice). Accepts `file` (PDF) and optional `docType` form field.
- Response: `200` JSON `{ text: string, fields: Array<{ questionId,label,value,confidence,source? }> }`.

Deploy options (free / low-cost)
- Fly.io: small free allowance for VMs; good for long-running processes and you can scale RAM. Quick steps:
  1. Install `flyctl`.
  2. `fly launch` (choose a VM, e.g., shared-cpu-1x). Add a Dockerfile (this folder).
  3. `fly deploy`.
  4. Use the public URL in Vercel as `NEXT_PUBLIC_EXTRACTOR_URL`.
- Render: also supports web services with free tier (limited). Create a Web Service from your Git repo and point to this folder's Dockerfile.
- Railway / Railway.app: quick deployments, but free tier is limited.

Notes about models & runtime
- The existing `app/lib/aiExtractionPipeline.ts` uses `@xenova/transformers` + `tesseract.js`. You can copy that module into the extractor service and adapt to a plain Node server (JS or TS).
- To avoid runtime model downloads on cold start, try to:
  - Pre-bundle models if your runtime supports it, or
  - Use a persistent VM where the models are cached between requests.

Example local workflow (build & run Docker)
1. Implement `extractor/server.js` that loads your pipeline and exposes `/extract`.
2. Build the image:
   ```
   docker build -t dc-extractor:latest extractor/
   ```
3. Run locally:
   ```
   docker run -p 8080:8080 dc-extractor:latest
   ```
4. Point your app to the extractor: `NEXT_PUBLIC_EXTRACTOR_URL=http://localhost:8080` and rebuild the Next.js app for production.

How to wire Vercel
-------------------
1. If you host the extractor service externally (Fly / Render), set the project env var in Vercel:
   - `NEXT_PUBLIC_EXTRACTOR_URL`: `https://your-extractor.example.com`
2. If you want Vercel to run the endpoint itself, set `vercel.json` memory/duration above. Note: Vercel may still impose limits that make heavy model work unreliable.

Example `vercel.json` (already added in repo root)
```
{
  "functions": {
    "api/ai-extract": { "memory": 2048, "maxDuration": 60 },
    "api/extractor": { "memory": 2048, "maxDuration": 60 }
  }
}
```

Next steps for you
1. Implement `extractor/server.js` (or adapt `app/lib/aiExtractionPipeline.ts` into that service).
2. Build and test locally with Docker.
3. Deploy to Fly / Render and set `NEXT_PUBLIC_EXTRACTOR_URL` in Vercel to point at the deployed service.

If you want, I can scaffold a working `server.js` by porting the core of `app/lib/aiExtractionPipeline.ts` into a simple Express server here and attempt to run it locally, but that will install large ML packages and may be slow — tell me if you want me to proceed with a runnable port now.
