export type Lang = "ar" | "en";

export const countries = [
  { code: "SA", ar: "المملكة العربية السعودية", en: "Saudi Arabia", dial: "+966" },
  { code: "AE", ar: "الإمارات العربية المتحدة", en: "United Arab Emirates", dial: "+971" },
  { code: "KW", ar: "الكويت", en: "Kuwait", dial: "+965" },
  { code: "QA", ar: "قطر", en: "Qatar", dial: "+974" },
  { code: "BH", ar: "البحرين", en: "Bahrain", dial: "+973" },
  { code: "OM", ar: "سلطنة عُمان", en: "Oman", dial: "+968" },
  { code: "IQ", ar: "العراق", en: "Iraq", dial: "+964" },
];

export const t = {
  ar: {
    brand: "سيزر ١٢",
    tagline: "منصة الأعمال الذكية للشركات الخليجية",
    // shared
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "إرسال",
    loading: "جارٍ المعالجة…",
    or: "أو",
    backHome: "العودة للرئيسية",
    // register
    registerTitle: "إنشاء حساب جديد",
    registerSub: "ابدأ رحلتك مع سيزر ١٢ في دقائق",
    fullName: "الاسم الكامل",
    fullNamePh: "محمد عبدالله",
    emailPh: "name@company.com",
    passwordPh: "٨ أحرف على الأقل",
    country: "الدولة",
    countryPh: "اختر دولتك",
    phone: "رقم الجوال",
    createAccount: "إنشاء الحساب",
    haveAccount: "لديك حساب بالفعل؟",
    signIn: "تسجيل الدخول",
    strengthWeak: "ضعيفة",
    strengthMedium: "متوسطة",
    strengthStrong: "قوية",
    checkInbox: "تحقق من بريدك الإلكتروني",
    checkInboxBody: "أرسلنا رابط التفعيل إلى بريدك. افتح الرسالة لإكمال التسجيل.",
    resend: "إعادة إرسال الرسالة",
    // login
    loginTitle: "تسجيل الدخول",
    loginSub: "أهلاً بعودتك. أدخل بياناتك للمتابعة.",
    remember: "تذكرني لمدة ٣٠ يوماً",
    forgot: "نسيت كلمة المرور؟",
    noAccount: "ليس لديك حساب؟",
    create: "إنشاء حساب",
    signInBtn: "دخول",
    notVerified: "حسابك غير مفعّل بعد.",
    resendVerify: "إعادة إرسال رابط التفعيل",
    locked: "تم قفل الحساب مؤقتاً. حاول مجدداً بعد",
    badCreds: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    // forgot
    forgotTitle: "إعادة تعيين كلمة المرور",
    forgotSub: "أدخل بريدك وسنرسل لك رابط إعادة التعيين.",
    sendLink: "إرسال الرابط",
    forgotSent: "تم الإرسال",
    forgotSentBody: "إذا كان البريد مسجلاً لدينا، ستصلك رسالة خلال دقائق.",
    backLogin: "العودة لتسجيل الدخول",
    // errors
    errRequired: "هذا الحقل مطلوب",
    errName: "الاسم بين ٢ و ١٠٠ حرفاً",
    errEmail: "صيغة البريد غير صحيحة",
    errEmailTaken: "هذا البريد مسجّل مسبقاً",
    errPassRules: "٨ أحرف على الأقل، وتحتوي رقماً وحرفاً كبيراً",
    errCountry: "اختر دولتك",
    errPhone: "رقم الجوال غير صحيح",
    err429: "محاولات كثيرة. حاول مجدداً بعد ساعة.",
    errGeneric: "حدث خطأ. حاول مرة أخرى.",
  },
  en: {
    brand: "Cezar 12",
    tagline: "Smart business platform for Gulf SMEs",
    email: "Email",
    password: "Password",
    submit: "Submit",
    loading: "Processing…",
    or: "or",
    backHome: "Back to home",
    registerTitle: "Create your account",
    registerSub: "Start with Cezar 12 in minutes",
    fullName: "Full name",
    fullNamePh: "Mohammed Abdullah",
    emailPh: "name@company.com",
    passwordPh: "At least 8 characters",
    country: "Country",
    countryPh: "Select your country",
    phone: "Phone number",
    createAccount: "Create account",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    strengthWeak: "Weak",
    strengthMedium: "Medium",
    strengthStrong: "Strong",
    checkInbox: "Check your inbox",
    checkInboxBody: "We sent a verification link to your email. Open it to finish setup.",
    resend: "Resend email",
    loginTitle: "Sign in",
    loginSub: "Welcome back. Enter your details to continue.",
    remember: "Remember me for 30 days",
    forgot: "Forgot password?",
    noAccount: "Don't have an account?",
    create: "Create one",
    signInBtn: "Sign in",
    notVerified: "Your account isn't verified yet.",
    resendVerify: "Resend verification link",
    locked: "Account temporarily locked. Try again in",
    badCreds: "Incorrect email or password.",
    forgotTitle: "Reset your password",
    forgotSub: "Enter your email and we'll send a reset link.",
    sendLink: "Send link",
    forgotSent: "Sent",
    forgotSentBody: "If that email is registered, a message will arrive shortly.",
    backLogin: "Back to sign in",
    errRequired: "This field is required",
    errName: "Name must be 2–100 characters",
    errEmail: "Invalid email format",
    errEmailTaken: "Email already registered",
    errPassRules: "8+ chars with a number and an uppercase letter",
    errCountry: "Please select a country",
    errPhone: "Invalid phone number",
    err429: "Too many attempts, try again in 1 hour",
    errGeneric: "Something went wrong. Please try again.",
  },
};

export function passwordStrength(p: string): 0 | 1 | 2 | 3 {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
  if (p.length >= 12 && /[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 3) as 0 | 1 | 2 | 3;
}

export function validPassword(p: string) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p);
}

export function validEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
