"use client";

import { useEffect, useRef, useState } from "react";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  image?: string; // optional background image
  bg?: string; // tailwind bg gradient
  ctaText?: string;
  ctaHref?: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "deal-1",
    title: "Today’s Specials",
    subtitle: "Hand‑picked favorites and best prices",
    bg: "from-primary/15 to-accent/10",
  },
  {
    id: "deal-2",
    title: "Family Combos",
    subtitle: "Share more, save more",
    bg: "from-amber-200/20 to-rose-200/10",
  },
  {
    id: "deal-3",
    title: "Fresh & Fast",
    subtitle: "Made to order, delivered hot",
    bg: "from-emerald-200/20 to-cyan-200/10",
  },
];

export default function BannerCarousel({ slides = DEFAULT_SLIDES }: { slides?: Slide[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slides.length]);

  const slide = slides[index];

  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r shadow-sm min-h-[140px] flex items-center justify-between p-6 md:p-8 bg-clip-padding"
           style={{ backgroundImage: slide.image ? `url(${slide.image})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* overlay for readability */}
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg || 'from-primary/10 to-accent/10'}`} />
        <div className="relative z-10">
          <div className="text-sm text-muted-foreground mb-1">Don’t miss</div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">{slide.title}</h2>
          {slide.subtitle && (
            <p className="text-sm md:text-base text-muted-foreground mt-1">{slide.subtitle}</p>
          )}
        </div>
        <div className="relative z-10 hidden md:block">
          {slide.ctaHref ? (
            <a href={slide.ctaHref} className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90">{slide.ctaText || 'Explore'}</a>
          ) : (
            <div className="px-4 py-2 rounded-full bg-card text-foreground border border-border font-semibold">{slide.ctaText || 'Explore'}</div>
          )}
        </div>
        {/* dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i+1}`}
              className={`w-2 h-2 rounded-full ${i === index ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
