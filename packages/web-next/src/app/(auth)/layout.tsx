export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold text-blue-400">سيزار ١٢</span>
          <p className="mt-2 text-sm text-slate-400">منصة ذكاء الأعمال</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  )
}
