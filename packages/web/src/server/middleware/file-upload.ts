import { fileTypeFromBuffer } from "file-type"

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

/** MIME types that must never be accepted regardless of context. */
const BLOCKED_MIMES = new Set([
  "application/x-executable",
  "application/x-elf",
  "application/x-mach-binary",
  "application/x-msdownload",
  "application/x-dosexec",
  "application/vnd.microsoft.portable-executable",
  "text/javascript",
  "application/javascript",
  "application/x-javascript",
  "application/x-php",
  "application/x-sh",
  "application/x-shellscript",
  "application/x-perl",
  "application/x-python-code",
  "application/x-ruby",
  "application/x-httpd-cgi",
])

/** Only these MIME types are accepted for logo/image uploads. */
const ALLOWED_IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/webp"])

// ─── Custom errors ────────────────────────────────────────────────────────────

export class FileSizeError extends Error {
  constructor(sizeBytes: number) {
    super(
      `File exceeds the 10 MB limit (received ${(sizeBytes / 1_048_576).toFixed(1)} MB).`,
    )
    this.name = "FileSizeError"
  }
}

export class FileTypeError extends Error {
  readonly detectedMime: string
  constructor(detectedMime: string, context?: string) {
    const hint = context
      ? ` ${context} accepts: ${context === "logo" ? "PNG, JPEG, WebP" : "any non-executable type"}.`
      : ""
    super(`File type '${detectedMime}' is not permitted.${hint}`)
    this.name = "FileTypeError"
    this.detectedMime = detectedMime
  }
}

// ─── Validator ────────────────────────────────────────────────────────────────

export type UploadContext = "logo" | "document"

/**
 * Validates an uploaded file buffer.
 *
 * @param buffer  Raw file bytes.
 * @param context "logo" — only PNG/JPEG/WebP; "document" — any non-executable.
 * @throws {FileSizeError} if buffer exceeds 10 MB.
 * @throws {FileTypeError} if MIME type is blocked or not allowed in context.
 */
export async function validateUpload(
  buffer: Buffer,
  context: UploadContext = "document",
): Promise<{ mime: string; ext: string | undefined }> {
  // 1. Size check
  if (buffer.byteLength > MAX_FILE_SIZE) {
    throw new FileSizeError(buffer.byteLength)
  }

  // 2. Detect MIME from magic bytes — never trust the client's Content-Type
  const detected = await fileTypeFromBuffer(buffer)
  const mime = detected?.mime ?? "application/octet-stream"
  const ext = detected?.ext

  // 3. Block executables unconditionally
  if (BLOCKED_MIMES.has(mime)) {
    throw new FileTypeError(mime)
  }

  // 4. Context-specific allow-list
  if (context === "logo" && !ALLOWED_IMAGE_MIMES.has(mime)) {
    throw new FileTypeError(mime, "logo")
  }

  return { mime, ext }
}
