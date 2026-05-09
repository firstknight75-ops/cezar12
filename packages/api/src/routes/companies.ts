import type { FastifyPluginAsync } from "fastify"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "../db/client.js"
import { companies } from "@cezar12/shared/db/schema"

const CompanyBody = z.object({
  company_name: z.string().min(1),
  company_name_en: z.string().optional().default(""),
  industry: z.enum(["ecommerce", "services", "restaurant", "real_estate"]),
  company_size: z.enum(["1-10", "11-50", "51-200", "200+"]),
  business_model: z.enum(["B2B", "B2C", "B2B2C", "Marketplace"]),
  country: z.string().min(1),
  target_cities: z.array(z.string()).optional().default([]),
  website: z.string().optional().default(""),
  instagram: z.string().optional().default(""),
  tiktok: z.string().optional().default(""),
  twitter: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  facebook: z.string().optional().default(""),
  snapchat: z.string().optional().default(""),
  youtube: z.string().optional().default(""),
  google_business: z.string().optional().default(""),
  description: z.string().min(1),
  unique_value_prop: z.string().min(1),
  main_products: z.array(z.string()).optional().default([]),
  price_range: z.enum(["budget", "mid-range", "premium", "luxury"]),
  main_competitors: z.array(z.string()).optional().default([]),
  has_marketing_team: z.boolean().optional().default(false),
  monthly_marketing_budget: z.string().optional().default("0"),
  current_channels: z.array(z.string()).optional().default([]),
  target_monthly_revenue_usd: z.string().optional().default("0"),
}).passthrough()

export const companiesRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", async (req, reply) => {
    const [company] = await db.select().from(companies).where(eq(companies.userId, req.user!.id)).limit(1)
    return reply.send({ data: company ?? null })
  })

  app.post("/", async (req, reply) => {
    const body = CompanyBody.parse(req.body)
    const [company] = await db.insert(companies).values({
      userId: req.user!.id,
      companyName: body.company_name,
      companyNameEn: body.company_name_en || null,
      industry: body.industry,
      companySize: body.company_size,
      businessModel: body.business_model,
      country: body.country,
      targetCities: body.target_cities,
      websiteUrl: body.website || null,
      socialLinks: {
        instagram: body.instagram,
        tiktok: body.tiktok,
        twitter: body.twitter,
        linkedin: body.linkedin,
        facebook: body.facebook,
        snapchat: body.snapchat,
        youtube: body.youtube,
        googleBusiness: body.google_business,
      },
      description: body.description,
      uniqueValueProp: body.unique_value_prop,
      mainProducts: body.main_products,
      priceRange: body.price_range,
      mainCompetitors: body.main_competitors,
      hasMarketingTeam: body.has_marketing_team,
      monthlyMarketingBudget: body.monthly_marketing_budget || "0",
      currentChannels: body.current_channels,
      targetMonthlyRevenue: body.target_monthly_revenue_usd || "0",
      isComplete: true,
    }).returning()

    return reply.status(201).send({ data: { companyId: company.id } })
  })
}