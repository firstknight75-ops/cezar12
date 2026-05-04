export const DISCLAIMER_AR =
  "\n\n---\nتنبيه: هذه النتائج مقدمة لأغراض إرشادية فقط ولا تُعدّ استشارة مالية أو قانونية أو ضريبية. يُرجى الاستعانة بمستشار مختص قبل اتخاذ أي قرارات."

export function injectDisclaimer(content: string): string {
  if (content.includes(DISCLAIMER_AR.trim())) return content
  return content + DISCLAIMER_AR
}

/** Fastify reply hook — wraps res.send to inject disclaimer into AI result fields. */
export function injectDisclaimerIntoPayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload
  const obj = payload as Record<string, unknown>
  const AI_FIELDS = ["result_content", "content", "summary", "recommendations", "analysis", "report"]
  for (const field of AI_FIELDS) {
    if (typeof obj[field] === "string") {
      obj[field] = injectDisclaimer(obj[field] as string)
    }
  }
  return obj
}
