# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

This repo is a Next.js 16 + React 19 application for Destination College. It serves two main purposes:

- A marketing/information site for programs, resources, and donations.
- A FAFSA file-prep helper that lets users upload financial PDFs, extracts relevant data, and maps it to FAFSA questions.

The FAFSA helper can talk either to an external Go-based extractor service (preferred, see README and Financial-tools repo) or to an internal Node-based extractor API implemented in this project.

## Commands & Development Workflow

All commands assume you are in the repo root.

### Install & dev server

- Install dependencies:
  - `npm install`
- Run the Next.js dev server on port 3000:
  - `npm run dev`

The FAFSA helper expects an extractor backend to be reachable at `NEXT_PUBLIC_EXTRACTOR_URL`.

### Build, start, and lint

- Production build:
  - `npm run build`
- Start production server (after `npm run build`):
  - `npm run start`
- Lint the project (ESLint + Next.js config):
  - `npm run lint`

### Extractor backend expectations

The README assumes a separate Go extractor service from the `Financial-tools` repo, typically run alongside this app:

- In the sibling Go repo (not this one), start the extractor service (example from README):
  - `cd ../Financial-tools`
  - `make run`  (or `go run .`)
- In this Next.js app, configure the frontend to point at that service by setting `NEXT_PUBLIC_EXTRACTOR_URL`, usually via `.env.local`:
  - `NEXT_PUBLIC_EXTRACTOR_URL=http://localhost:8080`

If `NEXT_PUBLIC_EXTRACTOR_URL` is **not** set, the frontend falls back to calling the internal Next.js API route at `/api/extractor` instead.

### Testing

There is currently **no test script or test framework configured** in `package.json`. If you add tests (e.g., Jest, Vitest, Playwright), also add the appropriate `npm test`/`npm run test:*` scripts and update this file with how to run a single test.

## Runtime & Configuration

- Node.js 20+ is expected (see README).
- Framework: Next.js 16 with the `app` directory router.
- TypeScript is enabled with strict settings and a `@/*` path alias mapping to the repo root.
- Styling is managed via `app/globals.css` (Tailwind 4 is installed but there is no standalone Tailwind config file in this repo).

Key environment variables:

- `NEXT_PUBLIC_EXTRACTOR_URL`
  - Public URL of the extractor backend (Go service or any compatible service).
  - If unset or empty, the browser client uses `/api/extractor` within this Next.js app.
- `STRIPE_SECRET_KEY`
  - Used by the donation Checkout API route to create Stripe sessions.
  - If missing, the donation API will return an error and log a warning at startup.

## High-Level Architecture

### Routing and layout

- `app/layout.tsx`
  - Sets global fonts via `next/font/google` and applies CSS variables for typography.
  - Wraps every page with the shared `<Header />` navigation and global `<body>` class names.
- `app/page.tsx`
  - Home/landing page with marketing content, hero section, program highlights, and CTAs linking to `/programs`, `/about`, `/resources`, and `/donate`.
- Content pages:
  - `app/about/page.tsx`, `app/programs/page.tsx`, `app/resources/page.tsx`, `app/donate/page.tsx`
  - Primarily presentational content built with standard React/Next components and shared styling utilities.

### Global navigation

- `app/components/Header.tsx`
  - Client component providing the sticky top navigation bar.
  - Desktop: inline nav links (Home, Programs, About, Resources, Donate) with a highlighted Donate button.
  - Mobile: hamburger menu that opens a slide-over `<aside>` with the same links.
  - Manages scroll locking and focus for accessibility (esc key to close, initial focus on first link when opened).

### FAFSA helper UI (client-side)

- `app/components/FAFSATool.tsx`
  - Core client component implementing the FAFSA file-prep workflow.
  - Responsibilities:
    - Manages uploaded documents (`UploadedDoc` state) and per-document analysis state.
    - Accepts only PDFs; performs lightweight validation of MIME type, extension, and `%PDF` file header.
    - Infers a `DocumentType` for each file based on the filename (e.g., W-2, 1099, 1040, SSN letter).
    - Sends files to the extractor backend via `sendToExtractor` (from `app/lib/extractorClient.ts`), streaming upload progress to a progress indicator.
    - Combines backend-returned structured fields with heuristic fallback extraction (`extractFieldsFromText`) and merges them into `DocExtraction` objects.
    - Presents extracted fields alongside the FAFSA question they map to, allowing the user to:
      - Reassign an extraction to a different FAFSA question (dropdown bound to `fafsaQuestions`).
      - "Apply" a suggested value into the FAFSA translator input state.
    - Maintains a map of user responses (`ResponseMap`) keyed by FAFSA question ID.
    - Exposes tools for downloading/printing a "scratch sheet" of all questions + temporary answers, and clearing all responses.

  - Embedded sub-components:
    - `FAFSAQuestionNavigator`
      - Left-hand column: searchable, section-grouped list of FAFSA questions (from `app/data/fafsaQuestions.ts`).
      - Right-hand column: details for the currently active question, including hints for which lines of which documents to check.
      - Tracks which questions have responses (complete vs incomplete states).
    - `QuestionDetail`
      - Renders the actual input controls for a single question based on its `inputType` (`text`, `number`, `currency`, `yesno`).
      - Shows document hints, helper text, and explanatory copy for each question.

  - Internal utilities:
    - `buildScratchSheet` converts the current responses into a plain-text report that can be downloaded or printed.
    - `runWithTimeout` wraps the extraction call in a timeout; long-running analysis results in a controlled user-facing error.
    - `mergeExtractions` merges structured server fields with client-side heuristic fields, deduping by `(questionId, value)` and keeping the higher-confidence result.

### FAFSA question model

- `app/data/fafsaQuestions.ts`
  - Central source of truth for all FAFSA questions used by the UI and extraction logic.
  - Each `FAFSAQuestion` entry includes:
    - `id`: stable identifier used in state keys, extraction rules, and question selection.
    - `section`: logical grouping (e.g., Student Basics, Parent Financials, Assets & Savings).
    - `prompt`: FAFSA-style wording.
    - `translator`: human-friendly explanation.
    - `docHints`: list of supporting document types and where to look (e.g., "Form 1040, line 11").
    - Optional `helper` copy and `inputType` (drives input component behavior and formatting).
  - When adding or changing questions, update this file; the UI (navigator, detail pane, and scratch sheet) adapts based on this data model.

### Extraction logic (text heuristics)

- `app/lib/extractionRules.ts`
  - Defines how to heuristically extract FAFSA-relevant fields from raw PDF text.
  - Key types:
    - `DocumentType`: `'1040' | 'W-2' | '1099' | 'SSN Letter' | 'Other'`.
    - `ExtractedField`: `(questionId, label, value, confidence, source)`; used both by server-side extraction and client fallback logic.
  - Rule structure:
    - `summaryRules`: generic heuristics that look for patterns across any document (e.g., student legal name, SSN, DOB, AGI, wages, tax paid, household size, number in college).
    - `docTypeRules`: additional heuristics keyed by `DocumentType` (e.g., Form 1040 line 11/22/1, W-2 Box 1/2/12, 1099 distributions, SSN letter format).
  - Main API:
    - `extractFieldsFromText(text, docType)`
      - Normalizes whitespace.
      - Applies both `summaryRules` and the rules for the given `docType`.
      - Dedupes by `(questionId, value)`, preferring higher-confidence matches.
  - Utility functions handle normalization and cleanup:
    - `cleanCurrency`: strips currency symbols and commas and extracts numeric values.
    - `normalizeSsn`, `normalizeName`, `normalizeDate`: standardize formats for safer downstream handling.
    - `clampConfidence`: ensures confidence scores are between 0 and 1 with controlled precision.

### Extractor client (browser-side integration)

- `app/lib/extractorClient.ts`
  - Responsible for talking to the configured extractor service from the browser.
  - Determines the base URL once at module load:
    - `configuredExtractorUrl = process.env.NEXT_PUBLIC_EXTRACTOR_URL`.
    - If non-empty, uses that as `extractorUrl`.
    - Otherwise defaults to `'/api/extractor'` and logs an informational message to the console.
  - `sendToExtractor(file, onProgress?, docType?)`:
    - Uses `XMLHttpRequest` instead of `fetch` to provide upload progress callbacks.
    - Normalizes the target URL:
      - Trims whitespace.
      - Appends `/extract` if the URL does not already end with `/extract` or `/api/extractor`.
    - Sends a `multipart/form-data` POST with fields:
      - `file`: the uploaded PDF.
      - `docType`: optional, forwarded from the client-inferred `DocumentType`.
    - On success:
      - Expects a JSON object with `text` and optional `fields`.
      - Sanitizes `fields` via `sanitizeFields` to enforce type safety and clamp confidence.
    - On error:
      - Tries to surface an error message from the JSON body (if present) or plain response text.

### Internal PDF extractor API (Node runtime)

- `app/api/extractor/route.ts`
  - Node runtime API route (`runtime = 'nodejs'`, `maxDuration = 30`) that acts as a built-in extractor service.
  - Request handling:
    - Expects a `multipart/form-data` request with a `file` field containing the PDF and optional `docType` field.
    - Validates file presence and non-zero size; returns 400 with a clear JSON error if invalid.
  - PDF parsing:
    - Uses `pdf-parse` via `createRequire` to support CommonJS or ESM-style exports.
    - Attempts to configure a PDF worker path, preferring a `public/pdf.worker.mjs` file if present, otherwise resolving a worker bundled with `pdf-parse`.
    - Supports both older function-style API (`pdfParseModule(buffer)`) and an object-based `PDFParse` API (`new PDFParse({ data: buffer }).getText(...)`).
  - Text extraction and field heuristics:
    - If no text is extracted, returns 422 with a user-friendly message about image-based PDFs.
    - Otherwise, passes text plus `docType` into `extractFieldsFromText` to derive structured FAFSA fields.
  - Cleanup and errors:
    - Attempts to call `parser.destroy()` when supported.
    - Logs server-side errors with a consistent `[extractor]` prefix and returns 500 with a generic error message.

This route is primarily a fallback/local option; in production, it is expected that `NEXT_PUBLIC_EXTRACTOR_URL` will often point to the external Go service instead.

### Donation checkout flow

- `app/api/create-checkout-session/route.ts`
  - Next.js route that initiates a Stripe Checkout session for donations.
  - Initialization:
    - Reads `STRIPE_SECRET_KEY` from the environment at module load.
    - If unset, logs a warning and leaves `stripe` undefined.
  - `POST` handler:
    - Returns a 500 JSON error if Stripe is not configured.
    - Determines the `origin` from request headers or URL for use in success/cancel URLs.
    - Parses an optional JSON body: `{ amount?: number; note?: string }`.
    - Enforces a minimum donation amount of `$5` and rounds to cents.
    - Truncates the optional `note` to 250 characters and passes it via `metadata` when present.
    - Creates a Checkout session with a single line item labeled "Destination College Donation" and returns `{ url: session.url }` on success.
    - Logs and returns a 500 error with a generic message if session creation fails.

The `/donate` page (in `app/donate/page.tsx`) is responsible for calling this API route and redirecting the browser to the returned `url`.

## How to extend or modify core flows

- To change FAFSA question content or add new questions, edit `app/data/fafsaQuestions.ts`. The UI, scratch sheet, and extraction mapping are all keyed by the `id` fields in this file.
- To refine heuristic extraction (e.g., support new tax form layouts), update or add rules in `app/lib/extractionRules.ts`, keeping question IDs in sync with `fafsaQuestions`.
- To switch fully to an external extractor and avoid the Node PDF parsing path, ensure `NEXT_PUBLIC_EXTRACTOR_URL` is set in all environments and maintain contract compatibility with the `ExtractorResponse` shape (`{ text: string; fields: ExtractorField[] }`).
- If you introduce automated tests, prefer co-locating unit tests with the relevant files (e.g., tests for `extractionRules` and `extractorClient`) and document the new test commands in the Commands section above.
