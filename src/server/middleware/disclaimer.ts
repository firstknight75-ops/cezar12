import type { Request, Response, NextFunction } from "express"

// ─── Disclaimer text ──────────────────────────────────────────────────────────

export const DISCLAIMER_AR =
  "هذا التحليل إرشادي فقط ولا يُشكّل استشارة مالية أو تسويقية متخصصة. " +
  "النتائج تعتمد على البيانات المُدخلة وقد تختلف الأرقام الفعلية. " +
  "Cezar 12 غير مسؤول عن نتائج تطبيق هذه التوصيات."

const SEPARATOR = "\n\n---\n"

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/** Appends the Arabic disclaimer to any AI-generated content string. */
export function injectDisclaimer(content: string): string {
  if (content.includes(DISCLAIMER_AR)) return content // already present — idempotent
  return content + SEPARATOR + DISCLAIMER_AR
}

/**
 * Recursively walks a plain object and appends the disclaimer to every
 * string field whose key is one of the AI output fields.
 */
function injectIntoValue(value: unknown): unknown {
  if (typeof value === "string" && value.trim()) return injectDisclaimer(value)
  if (Array.isArray(value)) return value.map(injectIntoValue)
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        AI_CONTENT_KEYS.has(k) ? injectIntoValue(v) : v,
      ]),
    )
  }
  return value
}

/** Keys in API response bodies that carry AI-generated text. */
const AI_CONTENT_KEYS = new Set([
  "result_content",
  "resultContent",
  "content",
  "summary",
  "recommendations",
  "analysis",
  "report",
])

// ─── Express middleware ───────────────────────────────────────────────────────
// Intercepts res.json() on AI output routes and injects the disclaimer before
// the response is sent.

export function disclaimerMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  const originalJson = res.json.bind(res)

  res.json = function disclaimerJson(body: unknown) {
    if (body && typeof body === "object") {
      body = injectIntoValue(body)
    }
    return originalJson(body)
  } as Response["json"]

  next()
}
