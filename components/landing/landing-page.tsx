"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Camera, ChevronLeft, ChevronRight, Clapperboard, Drama, Film,
  MapPin, MoreHorizontal, Music, PenLine, Palette, Play, Scissors, Search, Sparkles, Star,
  User, Users, Video, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES, CONTENT, CONTENT_FILTERS, FOOTER_COLUMNS, NAV_LINKS, PROFESSIONALS,
} from "./data";

const ICONS: Record<string, LucideIcon> = {
  users: Users, clapperboard: Clapperboard, video: Video, drama: Drama, music: Music,
  pen: PenLine, camera: Camera, scissors: Scissors, palette: Palette, more: MoreHorizontal,
};

const FILTER_TYPES: Record<string, string> = {
  Movies: "Movie", Series: "Series", Music: "Music", Documentaries: "Documentary", "Short Films": "Short Film", Trailers: "Trailer",
};

const AVATAR_GRADIENTS = [
  "from-amber-400 to-orange-600", "from-sky-400 to-blue-600", "from-emerald-400 to-teal-600",
  "from-fuchsia-400 to-purple-600", "from-rose-400 to-red-600", "from-cyan-400 to-indigo-600",
];

const YELLOW_BTN =
  "bg-gradient-to-r from-[#ffc61a] to-[#f7a600] text-[#0a2a6b] font-semibold shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/40";

function SectionTitle({ children, action }: { children: React.ReactNode; action: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-3 text-xl font-bold text-[#0a2a6b]">
        <span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-[#ffc61a] to-[#f7a600]" />
        {children}
      </h2>
      <a href="#" className="group flex items-center gap-1 text-sm font-semibold text-[#0a2a6b]">
        {action} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </a>
    </div>
  );
}

function FilmStrip({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-2", className)} aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className="h-3 w-5 shrink-0 rounded-[2px] bg-white/10" />
      ))}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5 text-white">
      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffc61a] to-[#f7a600] text-[#0a2a6b] shadow-lg shadow-amber-500/30">
        <Film className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-extrabold tracking-wide">TANZANIA<br />CREATIVE HUB</p>
        <p className="text-[8px] tracking-widest text-white/60">FILM · MUSIC · TALENT · OPPORTUNITIES</p>
      </div>
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a2a6b]/90 shadow-lg backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-white/85 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className={cn(
                "relative pb-1 transition hover:text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#ffc61a] after:transition hover:after:scale-x-100",
                l === "Creators" && "text-[#ffc61a] after:scale-x-100"
              )}
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button aria-label="Search" className="flex size-8 items-center justify-center rounded-full text-white transition hover:bg-white/10">
            <Search className="size-4" />
          </button>
          <span className="hidden text-xs text-white/80 sm:block">EN</span>
          <Link href="#" className="rounded-full border border-white/60 px-5 py-1.5 text-xs font-medium text-white transition hover:bg-white hover:text-[#0a2a6b]">
            Login
          </Link>
          <Link href="#" className={cn("rounded-full px-5 py-1.5 text-xs", YELLOW_BTN)}>
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const stats = [
    { value: "2,500+", label: "Creative Professionals" },
    { value: "1,200+", label: "Titles Published" },
    { value: "31", label: "Regions Reached" },
  ];
  return (
    <section id="creators" className="relative overflow-hidden bg-gradient-to-br from-[#04123a] via-[#0a2a6b] to-[#1d4aa3] text-white">
      <div className="pointer-events-none absolute -left-20 -top-24 size-96 rounded-full bg-[#ffc61a]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-10 size-[28rem] rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
      <FilmStrip className="absolute left-0 top-3 opacity-80" />
      <FilmStrip className="absolute bottom-3 left-0 opacity-80" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <p className="mb-5 text-xs text-white/60">Home &rsaquo; Creators</p>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="size-3.5 text-[#ffc61a]" /> Tanzania&apos;s home for creative talent
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.1] md:text-6xl">
            Meet Tanzania&apos;s{" "}
            <span className="bg-gradient-to-r from-[#ffc61a] to-[#ff9d00] bg-clip-text text-transparent">Creative Professionals</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-white/80">
            Discover, connect and collaborate with talented filmmakers, musicians and creative professionals across Tanzania.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#professionals" className={cn("flex items-center gap-2 rounded-full px-7 py-3 text-sm", YELLOW_BTN)}>
              Explore Creators <ArrowRight className="size-4" />
            </a>
            <a href="#movies" className="flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-3 text-sm font-medium backdrop-blur transition hover:bg-white/15">
              <Play className="size-4 fill-current" /> Watch Content
            </a>
          </div>
          <dl className="mt-10 flex gap-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-2xl font-extrabold text-[#ffc61a]">{s.value}</dt>
                <dd className="text-xs text-white/70">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden h-80 md:block">
          <div className="absolute right-6 top-4 w-72 rotate-3 rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-md transition duration-500 hover:rotate-0">
            <Clapperboard className="mx-auto mb-3 size-10 text-[#ffc61a]" />
            <p className="text-2xl font-extrabold leading-tight tracking-widest">
              CREATIVE<br />TALENT<br /><span className="text-[#ffc61a]">BUILDS A</span><br />BRIGHTER<br />TANZANIA
            </p>
          </div>
          <div className="absolute bottom-2 left-4 flex -rotate-3 items-center gap-3 rounded-xl bg-white px-4 py-3 text-[#0a2a6b] shadow-2xl">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffc61a] to-[#f7a600]">
              <Star className="size-5 fill-current" />
            </div>
            <div>
              <p className="text-sm font-bold">Top Rated Talent</p>
              <p className="text-xs text-slate-500">Verified professionals</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Professionals() {
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section id="professionals" className="bg-gradient-to-b from-slate-50 to-white px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-20 -mt-16 flex gap-2 overflow-x-auto rounded-3xl bg-white p-3 shadow-2xl shadow-blue-900/15 ring-1 ring-slate-200/70 [scrollbar-width:none]">
          {CATEGORIES.map((c, i) => {
            const Icon = ICONS[c.icon];
            return (
              <button
                key={c.label}
                onClick={() => setActive(i)}
                className={cn(
                  "group flex h-24 min-w-[104px] flex-1 flex-col items-center justify-center gap-2.5 rounded-2xl px-3 text-xs font-semibold transition duration-300",
                  active === i
                    ? "bg-gradient-to-br from-[#0a2a6b] to-[#1d4aa3] text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0a2a6b]"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl transition duration-300",
                    active === i ? "bg-white/10" : "bg-slate-100 group-hover:bg-[#0a2a6b]/10"
                  )}
                >
                  <Icon className={cn("size-5 transition group-hover:scale-110", active === i && "text-[#ffc61a]")} />
                </span>
                <span className="whitespace-nowrap text-center leading-tight">{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-12">
          <SectionTitle action="View All Professionals">Featured Professionals</SectionTitle>
        </div>

        <div className="relative mt-6">
          <button onClick={() => scroll(-1)} aria-label="Previous" className="absolute -left-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 transition hover:bg-[#0a2a6b] hover:text-white md:flex">
            <ChevronLeft className="size-5" />
          </button>
          <div ref={scroller} className="flex gap-5 overflow-x-auto scroll-smooth px-1 pb-6 pt-2 [scrollbar-width:none]">
            {PROFESSIONALS.map((p, i) => (
              <div key={p.name} className="group w-52 shrink-0 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10">
                <div className={cn("relative mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-to-br p-[3px]", AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length])}>
                  <div className="flex size-full items-center justify-center rounded-full bg-white text-slate-400">
                    <User className="size-10" />
                  </div>
                  <BadgeCheck className="absolute -bottom-1 -right-1 size-6 fill-[#0a2a6b] text-white" />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-900">{p.name}</p>
                <p className="mt-0.5 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-[#0a2a6b]">{p.role}</p>
                <p className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500">
                  <MapPin className="size-3 text-[#f7a600]" /> {p.location}
                </p>
                <button className="mt-4 w-full rounded-lg bg-[#0a2a6b] py-2 text-xs font-semibold text-white transition group-hover:bg-gradient-to-r group-hover:from-[#0a2a6b] group-hover:to-[#1d4aa3]">
                  View Profile
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => scroll(1)} aria-label="Next" className="absolute -right-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-200 transition hover:bg-[#0a2a6b] hover:text-white md:flex">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function JoinBanner() {
  return (
    <section className="px-6 pb-12">
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-[#04123a] via-[#0a2a6b] to-[#1d4aa3] px-8 py-8 text-white shadow-2xl md:flex-row">
        <div className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full bg-[#ffc61a]/20 blur-3xl" />
        <div className="flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <Video className="size-8 text-[#ffc61a]" />
        </div>
        <div className="relative text-center md:text-left">
          <h3 className="text-2xl font-extrabold">Are you a creative professional?</h3>
          <p className="mt-1 text-sm text-white/80">Join our growing community and showcase your talent to the world.</p>
        </div>
        <Link href="#" className={cn("relative flex items-center gap-2 rounded-full px-7 py-3 text-sm", YELLOW_BTN)}>
          Create Your Profile <ArrowRight className="size-4" />
        </Link>
        <p className="relative hidden text-right font-serif text-xl italic text-white/80 lg:block">Tanzanian Stories,<br />Global Impact</p>
      </div>
    </section>
  );
}

function ExploreHero() {
  return (
    <section id="movies" className="relative overflow-hidden bg-gradient-to-r from-[#0a2a6b] via-[#3b3f8f] to-[#e0813a] px-6 py-16 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="pointer-events-none absolute -bottom-24 right-0 size-96 rounded-full bg-[#ffc61a]/30 blur-3xl" />
      <FilmStrip className="absolute bottom-3 right-0 opacity-70" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-xs text-white/70">Home &rsaquo; Content</p>
          <h2 className="text-4xl font-extrabold md:text-5xl">
            Explore{" "}
            <span className="bg-gradient-to-r from-[#ffc61a] to-[#ff9d00] bg-clip-text text-transparent">Tanzanian Content</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-white/85">
            Watch, listen and enjoy authentic Tanzanian stories, music and creative works from talented creators across the country.
          </p>
        </div>
        <div className="flex w-full max-w-sm items-center gap-2 rounded-full bg-white px-5 py-3 text-slate-500 shadow-2xl ring-4 ring-white/20 transition focus-within:ring-[#ffc61a]/60">
          <input placeholder="Search movies, music, creators..." className="w-full bg-transparent text-sm text-slate-800 outline-none" />
          <Search className="size-4" />
        </div>
      </div>
    </section>
  );
}

function ContentSection() {
  const [filter, setFilter] = useState("All");
  const items = CONTENT.filter((c) => filter === "All" || FILTER_TYPES[filter] === c.type);

  return (
    <section id="music" className="bg-gradient-to-b from-white to-slate-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {CONTENT_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-5 py-2 text-xs font-semibold transition duration-300",
                  filter === f
                    ? "bg-gradient-to-r from-[#0a2a6b] to-[#1d4aa3] text-white shadow-md shadow-blue-900/30"
                    : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:-translate-y-0.5 hover:text-[#0a2a6b]"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <select className="rounded-lg border bg-white px-3 py-2 text-xs text-slate-700 shadow-sm" defaultValue="Latest">
            <option>Latest</option>
            <option>Popular</option>
          </select>
        </div>

        <div className="mt-10">
          <SectionTitle action="View All Content">Featured Content</SectionTitle>
        </div>

        {items.length === 0 ? (
          <p className="py-14 text-center text-sm text-slate-500">No content in this category yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
            {items.map((c) => (
              <article key={c.title} className="group animate-in fade-in zoom-in-95 duration-500">
                <div className={cn("relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br shadow-lg transition duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl", c.color)}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  <span className={cn("absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow", c.badge)}>{c.type}</span>
                  <p className="absolute inset-x-2 top-1/2 -translate-y-1/2 text-center text-xl font-black uppercase leading-tight text-white drop-shadow-lg">{c.title}</p>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition duration-300 group-hover:opacity-100">
                    <span className="flex size-12 items-center justify-center rounded-full bg-[#ffc61a] text-[#0a2a6b] shadow-xl transition group-hover:scale-110">
                      <Play className="size-5 fill-current" />
                    </span>
                  </div>
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">{c.duration}</span>
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.genre}</p>
                  </div>
                  <button aria-label={`Play ${c.title}`} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0a2a6b] text-white transition hover:scale-110 hover:bg-[#1d4aa3]">
                    <Play className="size-3 fill-current" />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{c.year} &middot; {c.studio}</p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center justify-between gap-5 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-amber-50 px-8 py-6 shadow-sm md:flex-row">
          <div className="flex items-center gap-5">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffc61a] to-[#f7a600] text-[#0a2a6b] shadow-lg shadow-amber-500/30">
              <Film className="size-7" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-[#0a2a6b]">Support Tanzanian Creativity</p>
              <p className="text-sm text-slate-600">Watch, share and support local content. Together we can grow the creative industry.</p>
            </div>
          </div>
          <a href="#movies" className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0a2a6b] to-[#1d4aa3] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5">
            Explore More Content <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="help" className="relative bg-gradient-to-b from-[#071d52] to-[#04123a] px-6 pt-14 text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ffc61a] via-[#1d4aa3] to-[#ffc61a]" />
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 font-serif text-lg italic text-white/80">Tanzanian Stories,<br />Global Impact</p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-bold text-[#ffc61a]">{col.title}</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {col.links.map((l) => (
                <li key={l}><a href="#" className="transition hover:translate-x-1 hover:text-white inline-block">{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h4 className="mb-4 text-sm font-bold text-[#ffc61a]">Follow Us</h4>
          <div className="flex gap-2.5">
            {["f", "X", "ig", "yt", "in"].map((s) => (
              <a key={s} href="#" className="flex size-9 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold transition hover:-translate-y-1 hover:bg-[#ffc61a] hover:text-[#0a2a6b]">{s}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-2 border-t border-white/10 py-5 text-xs text-white/60 md:flex-row">
        <p>&copy; {new Date().getFullYear()} Tanzania Creative Hub. All rights reserved.</p>
        <div className="flex gap-5">
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Terms of Service</a>
          <a href="#" className="hover:text-white">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-white text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Professionals />
        <JoinBanner />
        <ExploreHero />
        <ContentSection />
      </main>
      <Footer />
    </div>
  );
}
