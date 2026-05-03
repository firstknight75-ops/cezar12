import { describe, it, expect } from "vitest"
import { PromptBuilder, anonymizePrompt } from "../lib/prompt-builder"

const ubo = {
  riskLevel: "HIGH" as const,
  financialScore: 42,
  metrics: { conversion_rate: 0.03 },
  recommendations: { focus: "reduce churn" },
}

describe("PromptBuilder", () => {
  const builder = new PromptBuilder()

  it("includes risk level and score", () => {
    const p = builder.build({ domain: "ECOMMERCE", ubo, serviceType: "plan_90day" })
    expect(p).toContain("HIGH")
    expect(p).toContain("42")
  })

  it("includes domain context", () => {
    const p = builder.build({ domain: "RESTAURANT", ubo, serviceType: "kitchen_cost_analysis" })
    expect(p).toContain("restaurant")
  })

  it("includes service-specific instruction", () => {
    const p = builder.build({ domain: "SERVICES", ubo, serviceType: "buyer_persona" })
    expect(p).toContain("persona")
  })

  it("includes metrics block when present", () => {
    const p = builder.build({ domain: "ECOMMERCE", ubo, serviceType: "weekly_content" })
    expect(p).toContain("conversion_rate")
  })

  it("omits metrics block when null", () => {
    const p = builder.build({
      domain: "ECOMMERCE",
      ubo: { ...ubo, metrics: null },
      serviceType: "weekly_content",
    })
    expect(p).not.toContain("Key metrics")
  })

  it("includes extraData when provided", () => {
    const p = builder.build({
      domain: "REAL_ESTATE",
      ubo,
      serviceType: "market_research",
      extraData: { target_district: "Downtown Dubai" },
    })
    expect(p).toContain("Downtown Dubai")
  })

  it("omits extraData block when not provided", () => {
    const p = builder.build({ domain: "ECOMMERCE", ubo, serviceType: "ad_campaign" })
    expect(p).not.toContain("Additional context")
  })

  it("contains JSON instruction", () => {
    const p = builder.build({ domain: "ECOMMERCE", ubo, serviceType: "seo_plan" })
    expect(p).toContain("JSON")
  })
})

describe("anonymizePrompt", () => {
  it("replaces company_name", () => {
    const result = anonymizePrompt("Hello Al-Noor Trading, welcome.", {
      company_name: "Al-Noor Trading",
    })
    expect(result).toBe("Hello [COMPANY], welcome.")
  })

  it("replaces city", () => {
    const result = anonymizePrompt("Located in Dubai.", { city: "Dubai" })
    expect(result).toBe("Located in [CITY].")
  })

  it("replaces phone", () => {
    const result = anonymizePrompt("Call +971-50-1234567 now.", {
      phone: "+971-50-1234567",
    })
    expect(result).toBe("Call [PHONE] now.")
  })

  it("replaces website_url", () => {
    const result = anonymizePrompt("Visit https://example.com for more.", {
      website_url: "https://example.com",
    })
    expect(result).toBe("Visit [WEBSITE] for more.")
  })

  it("replaces multiple occurrences of the same value", () => {
    const result = anonymizePrompt("Dubai is great. Love Dubai.", { city: "Dubai" })
    expect(result).toBe("[CITY] is great. Love [CITY].")
  })

  it("replaces all fields simultaneously", () => {
    const result = anonymizePrompt(
      "Company: Acme Corp. City: Riyadh. Phone: 0501234. Web: acme.com",
      {
        company_name: "Acme Corp",
        city: "Riyadh",
        phone: "0501234",
        website_url: "acme.com",
      },
    )
    expect(result).toContain("[COMPANY]")
    expect(result).toContain("[CITY]")
    expect(result).toContain("[PHONE]")
    expect(result).toContain("[WEBSITE]")
  })

  it("skips undefined values", () => {
    const original = "Some prompt text."
    const result = anonymizePrompt(original, {})
    expect(result).toBe(original)
  })
})
