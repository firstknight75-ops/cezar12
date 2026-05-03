import { useEffect, useState } from "react";

const chapters = [
  { n: "01", t: "Origin", d: "Where the number begins." },
  { n: "02", t: "Silence", d: "The first held breath." },
  { n: "03", t: "Form", d: "An object remembers." },
  { n: "04", t: "Weight", d: "What gravity confesses." },
  { n: "05", t: "Mirror", d: "The reader, reflected." },
  { n: "06", t: "Salt", d: "A pause between chapters." },
  { n: "07", t: "Ash", d: "What remains, refined." },
  { n: "08", t: "Thread", d: "A line through every page." },
  { n: "09", t: "Tide", d: "Return, then return again." },
  { n: "10", t: "Ember", d: "Small heat, long memory." },
  { n: "11", t: "Vow", d: "Spoken once, kept always." },
  { n: "12", t: "Cezar", d: "The closing of the circle." },
];

const Index = () => {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* NAV */}
      <header className="relative z-20 border-b border-ink/15">
        <div className="container flex items-center justify-between py-5 font-mono-ed text-xs uppercase tracking-[0.2em]">
          <span className="text-ink">Cezar 12</span>
          <nav className="hidden md:flex gap-8 text-ink/70">
            <a href="#chapters" className="hover:text-oxblood transition-colors">Chapters</a>
            <a href="#manifesto" className="hover:text-oxblood transition-colors">Manifesto</a>
            <a href="#edition" className="hover:text-oxblood transition-colors">Edition</a>
          </nav>
          <span className="text-ink/60">{time} · STK</span>
        </div>
      </header>

      {/* HERO */}
      <section className="relative grain">
        <div className="container relative pt-16 pb-28 md:pt-28 md:pb-40">
          <div className="flex items-center gap-4 mb-10 rise">
            <span className="h-px w-16 bg-ink" />
            <span className="font-mono-ed text-xs uppercase tracking-[0.3em] text-ink/70">Vol. I — A Numbered Edition</span>
          </div>

          <h1 className="font-display text-balance leading-[0.85] tracking-tight text-ink rise-2"
              style={{ fontSize: "clamp(4rem, 14vw, 14rem)", fontWeight: 300 }}>
            Cezar
            <span className="inline-block ml-3 md:ml-6 text-oxblood italic" style={{ fontWeight: 900 }}>
              12<sup className="text-ember text-[0.35em] align-super ml-1">★</sup>
            </span>
          </h1>

          <div className="mt-12 grid md:grid-cols-12 gap-8 items-end">
            <p className="md:col-span-6 md:col-start-1 font-display text-xl md:text-2xl leading-snug text-ink/85 max-w-xl rise-3">
              Twelve chapters. One quiet rebellion.
              A serial of objects, ideas, and small disturbances —
              printed once, then never again.
            </p>
            <div className="md:col-span-4 md:col-start-9 flex flex-col gap-4 rise-4">
              <a href="#edition"
                 className="group inline-flex items-center justify-between gap-4 bg-ink text-cream px-6 py-5 font-mono-ed text-xs uppercase tracking-[0.25em] hover:bg-oxblood transition-colors">
                Reserve № 12
                <span className="text-ember group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a href="#manifesto"
                 className="inline-flex items-center justify-between gap-4 border border-ink/40 px-6 py-5 font-mono-ed text-xs uppercase tracking-[0.25em] hover:border-ink hover:bg-ink/5 transition-all">
                Read the Manifesto
                <span>↓</span>
              </a>
            </div>
          </div>

          {/* Floating ember badge */}
          <div className="hidden md:block absolute right-8 top-32 drift">
            <div className="relative w-40 h-40 rounded-full bg-oxblood text-cream flex items-center justify-center font-display text-center"
                 style={{ boxShadow: "var(--shadow-editorial)" }}>
              <div>
                <div className="font-mono-ed text-[10px] uppercase tracking-[0.3em] text-cream/70">Edition of</div>
                <div className="text-5xl font-black italic text-ember">312</div>
                <div className="font-mono-ed text-[10px] uppercase tracking-[0.3em] text-cream/70">Numbered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y border-ink/20 bg-ink text-cream overflow-hidden py-5">
          <div className="marquee font-display italic text-2xl md:text-3xl whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-16 items-center">
                {["Issue 12", "★", "Letterpress, by hand", "★", "Stockholm — Lisbon", "★", "Twelve chapters", "★", "Numbered & signed", "★"].map((w, j) => (
                  <span key={j} className="flex items-center gap-16">
                    <span>{w}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section id="manifesto" className="relative py-28 md:py-40">
        <div className="container grid md:grid-cols-12 gap-10">
          <div className="md:col-span-3">
            <div className="font-mono-ed text-xs uppercase tracking-[0.3em] text-oxblood">§ 01</div>
            <div className="font-mono-ed text-xs uppercase tracking-[0.3em] text-ink/50 mt-1">Manifesto</div>
          </div>
          <div className="md:col-span-9">
            <p className="font-display text-3xl md:text-5xl leading-[1.1] text-balance text-ink">
              We make slow things on purpose. <span className="text-ink/40">Each chapter is a small refusal —</span>
              <span className="italic text-oxblood"> of speed, of noise, of the disposable.</span>
            </p>
            <div className="mt-12 grid md:grid-cols-3 gap-8 font-display text-lg text-ink/80">
              <p><span className="font-mono-ed text-xs uppercase tracking-[0.25em] text-oxblood block mb-2">i.</span>One idea per page. No more.</p>
              <p><span className="font-mono-ed text-xs uppercase tracking-[0.25em] text-oxblood block mb-2">ii.</span>Paper that holds the thumb.</p>
              <p><span className="font-mono-ed text-xs uppercase tracking-[0.25em] text-oxblood block mb-2">iii.</span>Twelve, then we stop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTERS */}
      <section id="chapters" className="relative py-28 md:py-40 bg-ink text-cream">
        <div className="container">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
            <h2 className="font-display text-5xl md:text-7xl leading-none">
              The Twelve <span className="italic text-ember">Chapters</span>
            </h2>
            <span className="font-mono-ed text-xs uppercase tracking-[0.3em] text-cream/60">Index — 01 / 12</span>
          </div>

          <ul className="divide-y divide-cream/15 border-y border-cream/15">
            {chapters.map((c) => (
              <li key={c.n} className="group grid grid-cols-12 items-center py-6 md:py-8 hover:bg-cream/5 transition-colors px-2 -mx-2">
                <span className="col-span-2 md:col-span-1 font-mono-ed text-sm text-ember">{c.n}</span>
                <span className="col-span-6 md:col-span-4 font-display text-2xl md:text-4xl group-hover:translate-x-2 transition-transform">{c.t}</span>
                <span className="hidden md:block md:col-span-6 font-display italic text-cream/70 text-lg">{c.d}</span>
                <span className="col-span-4 md:col-span-1 text-right font-mono-ed text-xs uppercase tracking-[0.2em] text-cream/40 group-hover:text-ember transition-colors">Read →</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* EDITION / CTA */}
      <section id="edition" className="relative py-28 md:py-40 grain">
        <div className="container grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="font-mono-ed text-xs uppercase tracking-[0.3em] text-oxblood mb-6">§ The Edition</div>
            <h3 className="font-display text-5xl md:text-7xl leading-[0.95] text-ink text-balance">
              312 copies. <br/>
              <span className="italic text-oxblood">Numbered by hand.</span>
            </h3>
            <p className="font-display text-xl text-ink/75 mt-8 max-w-md">
              Reserve a copy of Cezar 12 before the press is broken. Each comes signed,
              wrapped in linen, and shipped with a single pressed bay leaf.
            </p>
          </div>

          <div className="relative">
            <div className="bg-cream border-2 border-ink p-8 md:p-12" style={{ boxShadow: "var(--shadow-editorial)" }}>
              <div className="flex justify-between items-start mb-8 font-mono-ed text-xs uppercase tracking-[0.25em]">
                <span>Reservation</span>
                <span className="text-oxblood">№ ___ / 312</span>
              </div>
              <div className="space-y-5">
                <label className="block">
                  <span className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-ink/60">Your name</span>
                  <input type="text" placeholder="As it should appear"
                         className="mt-2 w-full bg-transparent border-b-2 border-ink pb-2 font-display text-xl focus:outline-none focus:border-oxblood transition-colors" />
                </label>
                <label className="block">
                  <span className="font-mono-ed text-[10px] uppercase tracking-[0.25em] text-ink/60">Address</span>
                  <input type="email" placeholder="you@somewhere"
                         className="mt-2 w-full bg-transparent border-b-2 border-ink pb-2 font-display text-xl focus:outline-none focus:border-oxblood transition-colors" />
                </label>
                <button className="w-full mt-6 bg-oxblood text-cream py-5 font-mono-ed text-xs uppercase tracking-[0.3em] hover:bg-ink transition-colors">
                  Place Reservation →
                </button>
                <p className="font-mono-ed text-[10px] uppercase tracking-[0.2em] text-ink/50 text-center pt-2">
                  Ships in the season of the next solstice
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink/20 bg-ink text-cream/80">
        <div className="container py-10 flex flex-col md:flex-row gap-4 justify-between items-center font-mono-ed text-xs uppercase tracking-[0.25em]">
          <span>© Cezar 12 — Printed in finite quantity</span>
          <span className="flex gap-6">
            <a href="#" className="hover:text-ember transition-colors">Instagram</a>
            <a href="#" className="hover:text-ember transition-colors">Letters</a>
            <a href="#" className="hover:text-ember transition-colors">Colophon</a>
          </span>
        </div>
      </footer>
    </main>
  );
};

export default Index;
