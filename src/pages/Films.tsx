import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import FilmCard from "@/components/FilmCard";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface Film {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  thumbnail_url: string | null;
  release_year: number | null;
  is_featured: boolean | null;
}

export default function Films() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("films")
      .select("id, title, slug, short_description, thumbnail_url, release_year, is_featured")
      .order("release_year", { ascending: false })
      .then(({ data }) => {
        if (data) setFilms(data as Film[]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Films — Bala</title>
        <meta name="description" content="Browse the complete filmography of director Bala." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-36 pb-28">
        {/* Header */}
        <div className="max-w-screen-xl mx-auto px-6 lg:px-16 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="font-display font-bold text-foreground leading-none"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)", letterSpacing: "-0.02em" }}
            >
              Filmography
            </h1>
            <div className="gold-line w-16 mt-6" />
          </motion.div>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 lg:px-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[2/3] bg-secondary animate-pulse" />
              ))}
            </div>
          ) : films.length === 0 ? (
            <div className="text-center py-32">
              <p className="font-display text-2xl text-muted-foreground/40">No films added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {films.map((film, i) => (
                <FilmCard key={film.id} film={film} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
