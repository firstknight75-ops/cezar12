import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Music2,
  Twitter,
  Youtube,
  Camera,
  MapPin,
} from "lucide-react"
import type { Lang, SetupData } from "@/lib/setup-i18n"
import { setupT } from "@/lib/setup-i18n"

interface Props {
  data: SetupData
  setField: <K extends keyof SetupData>(key: K, value: SetupData[K]) => void
  lang: Lang
}

const inputClass =
  "w-full h-11 ps-10 pe-3 bg-cream border border-ink/25 rounded-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood transition-colors"

type SocialField = {
  key: keyof SetupData
  label: string
  ph: string
  Icon: React.ElementType
}

export default function Step2DigitalPresence({ data, setField, lang }: Props) {
  const i = setupT[lang]

  const FIELDS: SocialField[] = [
    { key: "website", label: i.website, ph: i.websitePh, Icon: Globe },
    { key: "instagram", label: i.instagram, ph: i.instagramPh, Icon: Instagram },
    { key: "tiktok", label: i.tiktok, ph: i.tiktokPh, Icon: Music2 },
    { key: "twitter", label: i.twitter, ph: i.twitterPh, Icon: Twitter },
    { key: "linkedin", label: i.linkedin, ph: i.linkedinPh, Icon: Linkedin },
    { key: "facebook", label: i.facebook, ph: i.facebookPh, Icon: Facebook },
    { key: "snapchat", label: i.snapchat, ph: i.snapchatPh, Icon: Camera },
    { key: "youtube", label: i.youtube, ph: i.youtubePh, Icon: Youtube },
    { key: "google_business", label: i.googleBusiness, ph: i.googleBusinessPh, Icon: MapPin },
  ]

  const score = FIELDS.filter(({ key }) => !!(data[key] as string)).length

  return (
    <div className="space-y-8">
      {/* Coverage score card */}
      <div className="border border-ink/15 rounded-sm p-5 bg-cream/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/60">
            {i.coverageScore}
          </span>
          <span
            className={`font-display text-2xl transition-colors ${
              score >= 7 ? "text-oxblood" : score >= 4 ? "text-ember" : "text-ink/40"
            }`}
          >
            {score}
            <span className="font-mono-ed text-sm text-ink/30"> / 9</span>
          </span>
        </div>

        {/* Pip row */}
        <div className="flex gap-1.5">
          {FIELDS.map(({ key }, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                !!(data[key] as string) ? "bg-oxblood" : "bg-ink/12"
              }`}
            />
          ))}
        </div>

        <p className="font-mono-ed text-[10px] text-ink/50">{i.coverageHint}</p>
      </div>

      {/* Social fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FIELDS.map(({ key, label, ph, Icon }) => (
          <div key={key} className="space-y-1.5">
            <label className="block font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/70">
              {label}
            </label>
            <div className="relative">
              <Icon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35 pointer-events-none" />
              <input
                type="text"
                value={data[key] as string}
                onChange={(e) => setField(key, e.target.value)}
                placeholder={ph}
                className={inputClass}
                dir="ltr"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
