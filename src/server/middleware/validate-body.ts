import { z } from "zod"
import type { Request, Response, NextFunction } from "express"

// ─── Strict schema helper ──────────────────────────────────────────────────────
// Use instead of z.object({}) everywhere in API route definitions.
// Unknown keys are rejected at parse time, producing a 400 response.

export function strictObject<T extends z.ZodRawShape>(
  shape: T,
): z.ZodObject<T, "strict"> {
  return z.object(shape).strict() as z.ZodObject<T, "strict">
}

// ─── Middleware factory ───────────────────────────────────────────────────────
// Validates req.body against a Zod schema (which should use strictObject).
// On failure: responds 400 with structured error list.
// On success: replaces req.body with the parsed (stripped) value and calls next().

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        issues: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
          code: i.code,
        })),
      })
      return
    }
    req.body = result.data
    next()
  }
}

// ─── Validation error extractor ───────────────────────────────────────────────
// Convenience — formats a ZodError for direct API responses.

export function formatZodError(err: z.ZodError): {
  error: string
  issues: Array<{ path: string; message: string; code: string }>
} {
  return {
    error: "Validation failed",
    issues: err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
      code: i.code,
    })),
  }
}
