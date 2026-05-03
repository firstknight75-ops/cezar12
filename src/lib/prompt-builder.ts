import type { ServiceType } from "./service-orchestrator"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Domain = "ECOMMERCE" | "SERVICES" | "RESTAURANT" | "REAL_ESTATE"

export type UboSnapshot = {
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  financialScore: number
  metrics?: Record<string, unknown> | null
  recommendations?: Record<string, unknown> | null
}

export type PromptParams = {
  domain: Domain
  ubo: UboSnapshot
  serviceType: ServiceType
  extraData?: Record<string, unknown>
}

// ─── Domain context strings ───────────────────────────────────────────────────

const DOMAIN_CONTEXT: Record<Domain, string> = {
  ECOMMERCE:
    "an e-commerce business selling products online, focused on conversion optimization and supply chain efficiency",
  SERVICES:
    "a service-based business providing professional or personal services, focused on client retention and margin",
  RESTAURANT:
    "a restaurant or food-service business, focused on kitchen cost control, menu engineering, and diner experience",
  REAL_ESTATE:
    "a real estate business dealing in property sales or rentals, focused on market positioning and ROI",
}

// ─── Service-specific instruction map ────────────────────────────────────────

const SERVICE_INSTRUCTIONS: Record<ServiceType, string> = {
  plan_90day:
    "Produce a detailed 90-day marketing and growth action plan with weekly milestones, KPIs for each milestone, and resource requirements.",
  weekly_content:
    "Generate a 4-week content calendar with one post idea per day (platform, format, headline, hook, CTA) suited to this business domain.",
  market_research:
    "Conduct a competitor and market landscape analysis. Identify 3 direct competitors, their strengths/weaknesses, market gaps, and recommended positioning.",
  buyer_persona:
    "Create 2–3 detailed buyer personas including demographics, psychographics, pain points, buying triggers, and preferred communication channels.",
  visual_identity:
    "Provide a visual identity brief: color palette (hex codes), typography recommendations, logo style direction, and brand voice adjectives.",
  seo_plan:
    "Develop an SEO roadmap: 10 primary keywords with monthly search volume estimates, on-page recommendations, and a 3-month link-building outline.",
  ad_campaign:
    "Design a paid advertising campaign: platform recommendation, budget allocation, 3 ad creatives (headline + description + CTA), audience targeting parameters.",
  performance_report:
    "Generate a marketing performance analysis report. Identify top 3 channels by estimated ROI, 3 underperforming areas, and concrete improvement actions.",
  lead_generation:
    "Create a lead generation strategy: 3 lead magnet ideas, a 5-step nurture sequence, recommended tools, and a conversion-rate optimization checklist.",
  kitchen_cost_analysis:
    "Analyse kitchen cost structure. Identify the top 3 cost drivers, propose menu engineering adjustments, and calculate potential margin improvement.",
  recipe_costing:
    "Perform detailed recipe costing for the provided dish(es). Calculate food cost percentage, suggest ingredient substitutions that preserve quality, and flag wastage risks.",
  promotion_optimizer:
    "Design 3 promotional offers (happy hour / combo / loyalty) with projected uplift in covers and revenue impact based on the current margin data.",
  data_edit_light:
    "Review and lightly refine the provided content for clarity, grammar, and tone consistency.",
  data_edit_heavy:
    "Perform a comprehensive rewrite and restructuring of the provided content while preserving the core message and facts.",
  pdf_export:
    "Format the provided content into a clean, structured report suitable for PDF export with executive summary, sections, and recommendations.",
  initial_assessment:
    "Perform an initial business health assessment. Summarise the key financial indicators, identify the top 3 risks, and outline recommended next steps.",
}

// ─── Anonymiser ───────────────────────────────────────────────────────────────

/**
 * Strips identifying values from a prompt string before sending to any AI
 * provider. Replaces matched text with a neutral placeholder.
 */
export function anonymizePrompt(
  prompt: string,
  values: { company_name?: string; city?: string; phone?: string; website_url?: string },
): string {
  let result = prompt
  const replacements: Array<[string | undefined, string]> = [
    [values.company_name, "[COMPANY]"],
    [values.city, "[CITY]"],
    [values.phone, "[PHONE]"],
    [values.website_url, "[WEBSITE]"],
  ]
  for (const [val, placeholder] of replacements) {
    if (val && val.trim()) {
      result = result.replaceAll(val, placeholder)
    }
  }
  return result
}

// ─── Builder ──────────────────────────────────────────────────────────────────

export class PromptBuilder {
  build({ domain, ubo, serviceType, extraData }: PromptParams): string {
    const domainCtx = DOMAIN_CONTEXT[domain]
    const instruction = SERVICE_INSTRUCTIONS[serviceType]
    const riskLine = `Current financial risk level: ${ubo.riskLevel} (score ${ubo.financialScore}/100).`

    const metricsBlock =
      ubo.metrics && Object.keys(ubo.metrics).length > 0
        ? `Key metrics: ${JSON.stringify(ubo.metrics, null, 2)}`
        : ""

    const recommendationsBlock =
      ubo.recommendations && Object.keys(ubo.recommendations).length > 0
        ? `Previous recommendations: ${JSON.stringify(ubo.recommendations, null, 2)}`
        : ""

    const extraBlock =
      extraData && Object.keys(extraData).length > 0
        ? `Additional context: ${JSON.stringify(extraData, null, 2)}`
        : ""

    const sections = [
      `You are a senior Gulf-region business intelligence analyst specialising in ${domainCtx}.`,
      riskLine,
      metricsBlock,
      recommendationsBlock,
      `Task: ${instruction}`,
      extraBlock,
      "Respond in structured JSON. Use Arabic numerals and provide section headings in both English and Arabic where applicable.",
    ].filter(Boolean)

    return sections.join("\n\n")
  }
}

export const promptBuilder = new PromptBuilder()
