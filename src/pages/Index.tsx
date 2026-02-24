import { useEffect, useState } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FilmCard from "@/components/FilmCard";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface SiteSettings {
  director_name: string;
  tagline: string;
  hero_video_url: string | null;
  show_featured_section: boolean;
}

interface Film {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  thumbnail_url: string | null;
  release_year: number | null;
  is_featured: boolean | null;
}

export default function Index() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [featuredFilms, setFeaturedFilms] = useState<Film[]>([]);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as SiteSettings);
      });

    supabase
      .from("films")
      .select("id, title, slug, short_description, thumbnail_url, release_year, is_featured")
      .eq("is_featured", true)
      .order("release_year", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setFeaturedFilms(data as Film[]);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>{settings?.director_name || "Bala"} — Film Director</title>
        <meta name="description" content={settings?.tagline || "Cinematic storyteller and award-winning film director"} />
        <meta property="og:title" content={`${settings?.director_name || "Bala"} — Film Director`} />
        <meta property="og:description" content={settings?.tagline || "Cinematic storyteller"} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Navbar sits transparently over the hero — no top padding needed */}
      <Navbar />
      <HeroSection settings={settings} />

      {/* Featured Films */}
      {settings?.show_featured_section && featuredFilms.length > 0 && (
        <section className="py-28 px-6 lg:px-16 max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="mb-16"
          >
            <p className="font-body text-[10px] tracking-[0.45em] uppercase mb-4" style={{ color: "hsl(var(--gold))" }}>
              Selected Works
            </p>
            <h2
              className="font-display font-bold text-foreground leading-none"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.02em" }}
            >
              Featured Films
            </h2>
            <div className="gold-line w-16 mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {featuredFilms.map((film, i) => (
              <FilmCard key={film.id} film={film} index={i} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <Link
              to="/films"
              className="inline-block font-body text-[10px] tracking-[0.4em] uppercase border px-12 py-4 transition-all duration-300 hover:bg-gold/5"
              style={{
                color: "hsl(var(--gold))",
                borderColor: "hsl(var(--gold) / 0.35)",
              }}
            >
              View All Films
            </Link>
          </motion.div>
        </section>
      )}

      <Footer directorName={settings?.director_name} />
    </>
  );
}
