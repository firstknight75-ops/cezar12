import { describe, it, expect } from "vitest"
import {
  anonymizeForAI,
  replaceCompanyName,
  type CompanyData,
} from "../lib/prompt-builder"

const FULL_COMPANY: CompanyData = {
  company_name: "Al-Noor Trading LLC",
  company_name_en: "Al-Noor Trading",
  website_url: "https://alnoor.sa",
  instagram_url: "https://instagram.com/alnoor",
  phone: "+966-50-1234567",
  social_links: { twitter: "@alnoor", facebook: "alnoor" },
  target_cities: ["Riyadh", "Jeddah"],
  logo_url: "https://cdn.example.com/logo.png",
  industry: "restaurant",
  business_model: "B2C",
  company_size: "11-50",
  monthly_marketing_budget: 15000,
  target_monthly_revenue: 200000,
  brand_positioning: "Premium casual dining",
  brand_voice_tone: "Warm and approachable",
  price_range: "mid-range",
}

describe("anonymizeForAI", () => {
  it("strips company_name", () => {
    const result = anonymizeForAI(FULL_COMPANY)
    expect(result).not.toHaveProperty("company_name")
  })

  it("strips company_name_en", () => {
    const result = anonymizeForAI(FULL_COMPANY)
    expect(result).not.toHaveProperty("company_name_en")
  })

  it("strips website_url", () => {
    const result = anonymizeForAI(FULL_COMPANY)
    expect(result).not.toHaveProperty("website_url")
  })

  it("strips instagram_url", () => {
    const result = anonymizeForAI(FULL_COMPANY)
    expect(result).not.toHaveProperty("instagram_url")
  })

  it("strips phone", () => {
    const result = anonymizeForAI(FULL_COMPANY)
    expect(result).not.toHaveProperty("phone")
  })

  it("strips social_links", () => {
    const result = anonymizeForAI(FULL_COMPANY)
    expect(result).not.toHaveProperty("social_links")
  })

  it("strips target_cities", () => {
    const result = anonymizeForAI(FULL_COMPANY)
    expect(result).not.toHaveProperty("target_cities")
  })

  it("strips logo_url", () => {
    const result = anonymizeForAI(FULL_COMPANY)
    expect(result).not.toHaveProperty("logo_url")
  })

  it("keeps industry", () => {
    expect(anonymizeForAI(FULL_COMPANY)).toHaveProperty("industry", "restaurant")
  })

  it("keeps business_model", () => {
    expect(anonymizeForAI(FULL_COMPANY)).toHaveProperty("business_model", "B2C")
  })

  it("keeps company_size", () => {
    expect(anonymizeForAI(FULL_COMPANY)).toHaveProperty("company_size", "11-50")
  })

  it("keeps monthly_marketing_budget", () => {
    expect(anonymizeForAI(FULL_COMPANY)).toHaveProperty("monthly_marketing_budget", 15000)
  })

  it("keeps brand_positioning", () => {
    expect(anonymizeForAI(FULL_COMPANY)).toHaveProperty("brand_positioning", "Premium casual dining")
  })

  it("keeps brand_voice_tone", () => {
    expect(anonymizeForAI(FULL_COMPANY)).toHaveProperty("brand_voice_tone", "Warm and approachable")
  })

  it("keeps price_range", () => {
    expect(anonymizeForAI(FULL_COMPANY)).toHaveProperty("price_range", "mid-range")
  })

  it("does not mutate the input object", () => {
    const original = { ...FULL_COMPANY }
    anonymizeForAI(FULL_COMPANY)
    expect(FULL_COMPANY.company_name).toBe(original.company_name)
  })

  it("handles missing optional fields gracefully", () => {
    const minimal: CompanyData = { industry: "ecommerce" }
    const result = anonymizeForAI(minimal)
    expect(result.industry).toBe("ecommerce")
  })
})

describe("replaceCompanyName", () => {
  it("replaces company_name with 'the business'", () => {
    const result = replaceCompanyName(
      "Al-Noor Trading is expanding. Al-Noor Trading has strong margins.",
      { company_name: "Al-Noor Trading" },
    )
    expect(result).toBe("the business is expanding. the business has strong margins.")
  })

  it("replaces company_name_en when provided", () => {
    const result = replaceCompanyName(
      "Al-Noor Trading LLC serves customers in the Gulf.",
      { company_name: "Al-Noor Trading LLC", company_name_en: "Al-Noor" },
    )
    expect(result).toContain("the business")
    expect(result).not.toContain("Al-Noor Trading LLC")
  })

  it("leaves text unchanged when company names are undefined", () => {
    const text = "A generic business analysis."
    expect(replaceCompanyName(text, {})).toBe(text)
  })

  it("handles empty company name gracefully", () => {
    const text = "Some text."
    expect(replaceCompanyName(text, { company_name: "   " })).toBe(text)
  })
})
