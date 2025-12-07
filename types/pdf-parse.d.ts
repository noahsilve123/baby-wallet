declare module 'pdf-parse' {
  type PdfParseResult = { text?: string }
  interface PdfParseOpts {
    max?: number
    version?: string
  }
  type PdfParse = ((data: Buffer | Uint8Array, opts?: PdfParseOpts) => Promise<PdfParseResult>) & {
    PDFParse?: (new (options: { data: Buffer | Uint8Array }) => {
      getText: (options?: unknown) => Promise<PdfParseResult>
      destroy?: () => Promise<void> | void
      constructor: unknown
    }) & {
      setWorker?: (workerPath: string) => void
    }
  }
  const pdfParse: PdfParse
  export = pdfParse
}
