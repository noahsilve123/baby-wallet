## Destination College FAFSA Helper

This Next.js application powers the FAFSA prep and donation pages for Destination College. The FAFSA helper now relies on the standalone Go service in [`Financial-tools`](https://github.com/noahsilve123/Financial-tools) to do all document parsing and OCR.

## Prerequisites

- Node.js 20+
- Go extractor service running locally or deployed somewhere reachable
- Environment variable `NEXT_PUBLIC_EXTRACTOR_URL` pointing at that service (e.g. `http://localhost:8080`)

## Local development

1. Install dependencies

	```bash
	npm install
	```

2. Start the FAFSA extractor backend (from the Financial-tools repo)

	```bash
	cd ../Financial-tools
	make run   # or go run .
	```

3. Create an `.env.local` in this project with

	```env
	NEXT_PUBLIC_EXTRACTOR_URL=http://localhost:8080
	```

4. Back in this repo, run the frontend

	```bash
	npm run dev
	```

Open [http://localhost:3000](http://localhost:3000) to use the site. Dropped PDFs/images will be uploaded to the extractor service and the text streamed back to the FAFSA helper UI.

## Testing the extractor connection

- The FAFSA uploader expects a JSON payload `{ "text": "..." }`. You can hit the Go service manually with `curl -F "file=@samples/sample.pdf" $NEXT_PUBLIC_EXTRACTOR_URL/extract` to confirm it returns data before opening the Next.js UI.
- If the spinner stays at 0 %, check the browser devtools network tab for any `/extract` errors. Missing or incorrect `NEXT_PUBLIC_EXTRACTOR_URL` is the most common issue.

## Deployment notes

- Deploy the Go extractor first (Render, Railway, Fly.io, etc.) and expose it via HTTPS.
- Set `NEXT_PUBLIC_EXTRACTOR_URL` in the hosting provider’s environment settings so the frontend always points to the correct backend.
- The frontend is a standard Next.js 16 app, so any platform that supports Next.js (Vercel, Netlify, Azure Static Web Apps) will work.
