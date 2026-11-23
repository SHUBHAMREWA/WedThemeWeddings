"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarCheck, CalendarHeart, MapPin, X } from "lucide-react";
import { EVENT_TYPES } from "@/lib/constants";
import InquiryForm from "./InquiryForm";

export default function HeroSlider({
  images,
  title,
  subtitle,
  cities,
}: {
  images: string[];
  title: string;
  subtitle: string;
  cities: string[];
}) {
  const [i, setI] = useState(0);
  const [event, setEvent] = useState("");
  const [city, setCity] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, [images.length]);

  // Close the booking popup with Escape and lock page scroll while it is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function go(e: React.FormEvent) {
    e.preventDefault();
    setOpen(true);
  }

  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden bg-[#1f1f23] md:min-h-[640px]">
      {images.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={idx === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1500ms] ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-16 text-center text-white">
        <p className="animate-fade text-xs font-bold uppercase tracking-[0.3em] text-brand-200">
          Photography · Cinematography · Drone
        </p>
        <h1 className="font-display animate-fade mt-4 text-4xl leading-tight md:text-6xl">{title}</h1>
        <p className="animate-fade mx-auto mt-4 max-w-2xl text-base text-gray-200 md:text-lg">{subtitle}</p>

        <form
          onSubmit={go}
          className="mx-auto mt-9 flex max-w-3xl flex-col gap-2 rounded-xl bg-white p-2 text-left text-ink shadow-2xl md:flex-row md:items-center md:gap-0 md:rounded-full md:p-1.5"
        >
          <label className="flex flex-1 items-center gap-2 rounded-lg px-4 py-2.5 md:border-r md:border-line">
            <CalendarHeart className="h-5 w-5 shrink-0 text-brand-500" />
            <select value={event} onChange={(e) => setEvent(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none">
              <option value="">Select event type</option>
              {EVENT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 items-center gap-2 rounded-lg px-4 py-2.5">
            <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              list="hero-cities"
              placeholder="Type or select city"
              aria-label="City"
              className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-ink"
            />
            <datalist id="hero-cities">
              {cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <button type="submit" className="btn-primary rounded-lg px-7 py-3 md:rounded-full">
            <CalendarCheck className="h-4 w-4" /> Book your date
          </button>
        </form>

        {images.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {images.map((src, idx) => (
              <button
                key={src}
                onClick={() => setI(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${idx === i ? "w-8 bg-brand-500" : "w-3 bg-white/60"}`}
              />
            ))}
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm md:items-center"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Book your date"
        >
          <div className="relative my-6 w-full max-w-2xl text-left" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-t-2xl bg-brand-500 px-6 py-5 text-white md:px-8">
              <h2 className="font-display text-2xl">Book your date</h2>
              <p className="mt-1 text-sm text-brand-50">Share a few details and we will confirm availability and send a quote.</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 rounded-full p-2 text-white hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="[&>form]:rounded-t-none [&>div]:rounded-t-none">
              <InquiryForm key={`${event}|${city}`} cities={cities} defaults={{ event, city }} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
