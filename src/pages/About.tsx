import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, ExternalLink, Download, Youtube, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

interface SiteSettings {
  director_name: string;
  bio: string | null;
  profile_image_url: string | null;
  tagline: string | null;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("director_name, bio, profile_image_url, tagline")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as SiteSettings);
      });
  }, []);

  const directorName = settings?.director_name || "Bala";
  const bio = settings?.bio || "Award-winning film director known for his distinctive cinematic vision and powerful storytelling that transcends cultural boundaries.";
  const bioParagraphs = bio.split("\n").filter(Boolean);

  return (
    <>
      <Helmet>
        <title>About — {directorName}</title>
        <meta name="description" content={`Learn about film director ${directorName}`} />
      </Helmet>

      <Navbar />

      {/* ── EDITORIAL HEADER ── */}
      <section className="pt-36 pb-20 px-6 lg:px-16 max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-body text-[10px] tracking-[0.45em] uppercase mb-4" style={{ color: "hsl(var(--gold))" }}>
            The Director
          </p>
          <h1 className="font-cinematic font-semibold text-foreground leading-none"
            style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)", letterSpacing: "-0.02em" }}>
            {directorName}
          </h1>
          <div className="gold-line w-16 mt-6" />
        </motion.div>
      </section>

      {/* ── TWO-COLUMN EDITORIAL LAYOUT ── */}
      <main className="pb-32 px-6 lg:px-16 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-16 xl:gap-28 items-start">

          {/* ═══ LEFT — Biography & Content ═══ */}
          <div className="space-y-16 order-2 lg:order-1">

            {/* Biography */}
            <Reveal delay={0.08}>
              <div>
                <p className="font-body text-[10px] tracking-[0.35em] uppercase text-muted-foreground mb-6">Biography</p>
                <div className="space-y-5 max-w-2xl">
                  {bioParagraphs.map((para, i) => (
                    <p
                      key={i}
                      className="font-body text-base leading-[1.95] text-muted-foreground"
                      style={{ textAlign: "justify" }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* CTA row */}
            <Reveal delay={0.12}>
              <div className="flex flex-wrap items-center gap-6">
                <Link
                  to="/films"
                  className="inline-flex items-center gap-2 font-body text-xs tracking-[0.3em] uppercase border px-8 py-3.5 transition-all duration-300 hover:bg-gold/5"
                  style={{ color: "hsl(var(--gold))", borderColor: "hsl(var(--gold) / 0.4)" }}
                >
                  View Filmography
                  <ExternalLink size={12} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 font-body text-xs tracking-[0.3em] uppercase text-muted-foreground hover:text-gold transition-colors"
                >
                  <Mail size={13} />
                  Get in Touch
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ═══ RIGHT — Portrait ═══ */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
            <Reveal>
              {settings?.profile_image_url ? (
                <div className="relative group">
                  <img
                    src={settings.profile_image_url}
                    alt={directorName}
                    loading="lazy"
                    className="w-full aspect-[3/4] object-cover"
                  />
                  {/* Gold frame overlay */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-gold/10 group-hover:ring-gold/30 pointer-events-none transition-all duration-500" />
                  {/* Cinematic bottom gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                  {/* Name overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="font-display text-xl font-bold text-foreground">{directorName}</p>
                    <p className="font-body text-[10px] tracking-[0.3em] uppercase mt-1" style={{ color: "hsl(var(--gold))" }}>
                      Film Director
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-[3/4] bg-secondary flex flex-col items-center justify-center gap-4">
                  <span className="font-display text-8xl font-bold text-muted-foreground/20">
                    {directorName[0]}
                  </span>
                  <p className="font-body text-xs tracking-widest uppercase text-muted-foreground">No image set</p>
                </div>
              )}
            </Reveal>

            {/* Contact card */}
            <Reveal delay={0.1}>
              <div className="mt-6 border border-border/50 p-6 space-y-4">
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Contact & Follow</p>
                <Link
                  to="/contact"
                  className="flex items-center gap-3 font-body text-sm text-foreground hover:text-gold transition-colors"
                >
                  <Mail size={14} className="shrink-0" style={{ color: "hsl(var(--gold))" }} />
                  Send a Message
                </Link>
                
                {/* Social Media Links */}
                <div className="pt-2 border-t border-border/30 space-y-3">
                  <a
                    href="https://youtube.com/@houseofeleven11?si=QYfTt56pilRFXTZ7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-body text-sm text-foreground hover:text-gold transition-colors"
                  >
                    <Youtube size={14} className="shrink-0" style={{ color: "hsl(var(--gold))" }} />
                    YouTube
                  </a>
                  <a
                    href="https://www.instagram.com/thedirectorbala?igsh=YXZ2aXp2dmJxZnRv&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-body text-sm text-foreground hover:text-gold transition-colors"
                  >
                    <Instagram size={14} className="shrink-0" style={{ color: "hsl(var(--gold))" }} />
                    Instagram
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <Footer directorName={directorName} />
    </>
  );
}
