export type Lang = "ar" | "en"

export const SETUP_COUNTRIES = [
  { code: "SA", ar: "المملكة العربية السعودية", en: "Saudi Arabia", currency: "SAR" },
  { code: "AE", ar: "الإمارات العربية المتحدة", en: "United Arab Emirates", currency: "AED" },
  { code: "KW", ar: "الكويت", en: "Kuwait", currency: "KWD" },
  { code: "QA", ar: "قطر", en: "Qatar", currency: "QAR" },
  { code: "BH", ar: "البحرين", en: "Bahrain", currency: "BHD" },
  { code: "OM", ar: "سلطنة عُمان", en: "Oman", currency: "OMR" },
  { code: "IQ", ar: "العراق", en: "Iraq", currency: "IQD" },
]

export const CITIES: Record<string, { ar: string; en: string }[]> = {
  SA: [
    { ar: "الرياض", en: "Riyadh" },
    { ar: "جدة", en: "Jeddah" },
    { ar: "الدمام", en: "Dammam" },
    { ar: "مكة المكرمة", en: "Mecca" },
    { ar: "المدينة المنورة", en: "Medina" },
    { ar: "الخبر", en: "Khobar" },
    { ar: "تبوك", en: "Tabuk" },
    { ar: "أبها", en: "Abha" },
  ],
  AE: [
    { ar: "دبي", en: "Dubai" },
    { ar: "أبوظبي", en: "Abu Dhabi" },
    { ar: "الشارقة", en: "Sharjah" },
    { ar: "عجمان", en: "Ajman" },
    { ar: "رأس الخيمة", en: "Ras Al Khaimah" },
  ],
  KW: [
    { ar: "مدينة الكويت", en: "Kuwait City" },
    { ar: "حولي", en: "Hawalli" },
    { ar: "السالمية", en: "Salmiya" },
    { ar: "الفروانية", en: "Farwaniya" },
  ],
  QA: [
    { ar: "الدوحة", en: "Doha" },
    { ar: "الوكرة", en: "Al Wakrah" },
    { ar: "الخور", en: "Al Khor" },
  ],
  BH: [
    { ar: "المنامة", en: "Manama" },
    { ar: "الرفاع", en: "Riffa" },
    { ar: "المحرق", en: "Muharraq" },
  ],
  OM: [
    { ar: "مسقط", en: "Muscat" },
    { ar: "صحار", en: "Sohar" },
    { ar: "صلالة", en: "Salalah" },
  ],
  IQ: [
    { ar: "بغداد", en: "Baghdad" },
    { ar: "البصرة", en: "Basra" },
    { ar: "أربيل", en: "Erbil" },
    { ar: "النجف", en: "Najaf" },
    { ar: "الموصل", en: "Mosul" },
  ],
}

export const CHALLENGES_AR = [
  "ضعف الوعي بالعلامة التجارية",
  "محدودية الحضور الرقمي",
  "المنافسة الشديدة",
  "الاحتفاظ بالعملاء",
  "محدودية الميزانية",
  "طاقة الفريق",
  "الأدوات والتقنية",
  "فهم السوق",
  "تحويل الزوار لعملاء",
  "بناء الثقة الرقمية",
]

export const CHALLENGES_EN = [
  "Low brand awareness",
  "Limited digital presence",
  "Intense competition",
  "Customer retention",
  "Budget constraints",
  "Team capacity",
  "Tools & technology",
  "Market understanding",
  "Visitor-to-customer conversion",
  "Building digital trust",
]

export const CHANNELS_AR = [
  "انستغرام",
  "تيك توك",
  "إعلانات جوجل",
  "تحسين محركات البحث (SEO)",
  "البريد الإلكتروني",
  "واتساب",
  "سناب شات",
  "تويتر/X",
  "فيسبوك",
  "لينكدإن",
  "يوتيوب",
  "المؤثرون",
  "SMS",
]

export const CHANNELS_EN = [
  "Instagram",
  "TikTok",
  "Google Ads",
  "SEO",
  "Email Marketing",
  "WhatsApp",
  "Snapchat",
  "Twitter/X",
  "Facebook",
  "LinkedIn",
  "YouTube",
  "Influencer Marketing",
  "SMS",
]

export type SetupData = {
  // Step 1
  company_name: string
  company_name_en: string
  industry: string
  company_size: string
  business_model: string
  country: string
  target_cities: string[]
  // Step 2
  website: string
  instagram: string
  tiktok: string
  twitter: string
  linkedin: string
  facebook: string
  snapchat: string
  youtube: string
  google_business: string
  // Step 3
  description: string
  unique_value_prop: string
  main_products: string[]
  price_range: string
  main_competitors: string[]
  current_challenges: string[]
  // Step 4
  has_marketing_team: boolean
  monthly_marketing_budget: string
  current_channels: string[]
  biggest_marketing_pain: string
  target_monthly_revenue_usd: string
}

export const EMPTY_SETUP: SetupData = {
  company_name: "",
  company_name_en: "",
  industry: "",
  company_size: "",
  business_model: "",
  country: "",
  target_cities: [],
  website: "",
  instagram: "",
  tiktok: "",
  twitter: "",
  linkedin: "",
  facebook: "",
  snapchat: "",
  youtube: "",
  google_business: "",
  description: "",
  unique_value_prop: "",
  main_products: [],
  price_range: "",
  main_competitors: [],
  current_challenges: [],
  has_marketing_team: false,
  monthly_marketing_budget: "",
  current_channels: [],
  biggest_marketing_pain: "",
  target_monthly_revenue_usd: "",
}

export const STORAGE_KEY = "cezar12_setup_draft"

export const setupT = {
  ar: {
    brand: "سيزار 12",
    stepOf: (s: number) => `الخطوة ${s} من 4`,
    saveLater: "حفظ والمتابعة لاحقاً",
    savedDraft: "تم حفظ المسودة",
    back: "رجوع",
    next: "التالي",
    complete: "إكمال الملف التعريفي",
    completing: "جارٍ الحفظ...",

    step1Title: "المعلومات الأساسية",
    step1Sub: "أخبرنا عن شركتك",
    step2Title: "الحضور الرقمي",
    step2Sub: "كلما أضفت أكثر، كان تحليل الذكاء الاصطناعي أدق",
    step3Title: "وصف النشاط التجاري",
    step3Sub: "ساعدنا على فهم عرضك وسوقك",
    step4Title: "الوضع التسويقي",
    step4Sub: "أخبرنا عن جهودك التسويقية الحالية",

    companyName: "اسم الشركة",
    companyNamePh: "شركة ريادية للتقنية",
    companyNameEn: "اسم الشركة بالإنجليزية",
    companyNameEnPh: "Riyadiah Tech",
    optional: "اختياري",
    industry: "القطاع",
    industryEcommerce: "التجارة الإلكترونية",
    industryServices: "الخدمات",
    industryRestaurant: "المطاعم",
    industryRealEstate: "العقارات",
    companySize: "حجم الشركة",
    businessModel: "نموذج العمل",
    country: "الدولة",
    selectCountry: "اختر الدولة",
    targetCities: "المدن المستهدفة",
    targetCitiesHint: "اختر جميع المدن التي تستهدفها",

    coverageScore: "نقاط التغطية",
    coverageHint: "كلما أضفت أكثر، كان تحليل الذكاء الاصطناعي أدق",
    website: "الموقع الإلكتروني",
    websitePh: "https://example.com",
    instagram: "انستغرام",
    instagramPh: "@yourhandle",
    tiktok: "تيك توك",
    tiktokPh: "@yourhandle",
    twitter: "تويتر / X",
    twitterPh: "@yourhandle",
    linkedin: "لينكدإن",
    linkedinPh: "linkedin.com/company/...",
    facebook: "فيسبوك",
    facebookPh: "facebook.com/...",
    snapchat: "سناب شات",
    snapchatPh: "@yourhandle",
    youtube: "يوتيوب",
    youtubePh: "youtube.com/@...",
    googleBusiness: "جوجل بيزنس",
    googleBusinessPh: "اسم النشاط في جوجل",

    description: "وصف النشاط التجاري",
    descriptionPh: "صِف نشاطك التجاري بوضوح: ماذا تقدم، لمن، وكيف تخلق القيمة...",
    descriptionHint: (n: number) => `${n} / 1000 حرف — الحد الأدنى 50`,
    uniqueValueProp: "ما الذي يميزك عن المنافسين؟",
    uniqueValuePh: "اذكر ما يجعلك فريداً في السوق...",
    mainProducts: "المنتجات / الخدمات الرئيسية",
    mainProductsPh: "اكتب واضغط Enter",
    mainProductsHint: "حتى 10 عناصر",
    priceRange: "نطاق الأسعار",
    priceBudget: "اقتصادي",
    priceMid: "متوسط",
    pricePremium: "راقٍ",
    priceLuxury: "فاخر",
    competitors: "المنافسون الرئيسيون",
    addCompetitor: "إضافة منافس",
    competitorPh: (n: number) => `المنافس ${n}`,
    challenges: "أبرز التحديات الحالية",
    challengesHint: "اختر ما ينطبق عليك",

    hasMarketingTeam: "هل لديك فريق تسويق؟",
    yes: "نعم",
    no: "لا",
    monthlyBudget: "الميزانية التسويقية الشهرية (USD)",
    monthlyBudgetPh: "مثال: 2000",
    currentChannels: "القنوات التسويقية الحالية",
    biggestPain: "أكبر تحدٍّ تسويقي تواجهه",
    biggestPainPh: "صِف أكبر عقبة في مسيرتك التسويقية...",
    targetRevenue: "الإيراد الشهري المستهدف (USD)",
    targetRevenuePh: "مثال: 50000",

    errRequired: "هذا الحقل مطلوب",
    errDescShort: "الوصف يجب أن يكون 50 حرفاً على الأقل",
    errDescLong: "الوصف يجب ألا يتجاوز 1000 حرف",
    errGeneric: "حدث خطأ، يُرجى المحاولة مرة أخرى",
  },
  en: {
    brand: "Cezar 12",
    stepOf: (s: number) => `Step ${s} of 4`,
    saveLater: "Save & Continue Later",
    savedDraft: "Draft saved",
    back: "Back",
    next: "Next",
    complete: "Complete Profile",
    completing: "Saving...",

    step1Title: "Basic Info",
    step1Sub: "Tell us about your company",
    step2Title: "Digital Presence",
    step2Sub: "The more you add, the smarter the AI analysis",
    step3Title: "Business Description",
    step3Sub: "Help us understand your offering and market",
    step4Title: "Marketing Status",
    step4Sub: "Tell us about your current marketing efforts",

    companyName: "Company Name",
    companyNamePh: "Riyadiah Tech",
    companyNameEn: "Company Name (English)",
    companyNameEnPh: "Riyadiah Tech",
    optional: "Optional",
    industry: "Industry",
    industryEcommerce: "E-Commerce",
    industryServices: "Services",
    industryRestaurant: "Restaurant",
    industryRealEstate: "Real Estate",
    companySize: "Company Size",
    businessModel: "Business Model",
    country: "Country",
    selectCountry: "Select country",
    targetCities: "Target Cities",
    targetCitiesHint: "Select all cities you operate in",

    coverageScore: "Coverage Score",
    coverageHint: "The more you add, the smarter the AI analysis",
    website: "Website",
    websitePh: "https://example.com",
    instagram: "Instagram",
    instagramPh: "@yourhandle",
    tiktok: "TikTok",
    tiktokPh: "@yourhandle",
    twitter: "Twitter / X",
    twitterPh: "@yourhandle",
    linkedin: "LinkedIn",
    linkedinPh: "linkedin.com/company/...",
    facebook: "Facebook",
    facebookPh: "facebook.com/...",
    snapchat: "Snapchat",
    snapchatPh: "@yourhandle",
    youtube: "YouTube",
    youtubePh: "youtube.com/@...",
    googleBusiness: "Google Business",
    googleBusinessPh: "Business name on Google",

    description: "Business Description",
    descriptionPh:
      "Describe your business clearly: what you offer, who it's for, and how you create value...",
    descriptionHint: (n: number) => `${n} / 1,000 chars — min 50`,
    uniqueValueProp: "What sets you apart from competitors?",
    uniqueValuePh: "Mention what makes you unique in the market...",
    mainProducts: "Main Products / Services",
    mainProductsPh: "Type and press Enter",
    mainProductsHint: "Up to 10 items",
    priceRange: "Price Range",
    priceBudget: "Budget",
    priceMid: "Mid-Range",
    pricePremium: "Premium",
    priceLuxury: "Luxury",
    competitors: "Main Competitors",
    addCompetitor: "Add Competitor",
    competitorPh: (n: number) => `Competitor ${n}`,
    challenges: "Current Challenges",
    challengesHint: "Select all that apply",

    hasMarketingTeam: "Do you have a marketing team?",
    yes: "Yes",
    no: "No",
    monthlyBudget: "Monthly Marketing Budget (USD)",
    monthlyBudgetPh: "e.g. 2000",
    currentChannels: "Current Marketing Channels",
    biggestPain: "Biggest Marketing Challenge",
    biggestPainPh: "Describe the biggest obstacle in your marketing journey...",
    targetRevenue: "Target Monthly Revenue (USD)",
    targetRevenuePh: "e.g. 50000",

    errRequired: "This field is required",
    errDescShort: "Description must be at least 50 characters",
    errDescLong: "Description must not exceed 1,000 characters",
    errGeneric: "Something went wrong, please try again",
  },
}
