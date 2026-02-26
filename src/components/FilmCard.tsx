import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Film {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  thumbnail_url?: string | null;
  release_year?: number | null;
  is_featured?: boolean | null;
}

interface FilmCardProps {
  film: Film;
  index?: number;
}

export default function FilmCard({ film, index = 0 }: FilmCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/films/${film.slug}`} className="group block">
        {/* Thumbnail */}
        <div className="relative overflow-hidden bg-secondary aspect-[2/3]">
          {film.thumbnail_url ? (
            <img
              src={film.thumbnail_url}
              alt={film.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="font-display text-4xl text-muted-foreground/20">
                {film.title[0]}
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Hover content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
            {film.short_description && (
              <p className="font-body text-[11px] text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                {film.short_description}
              </p>
            )}
            <span className="inline-flex items-center gap-2 font-body text-[10px] tracking-[0.3em] uppercase" style={{ color: "hsl(var(--gold))" }}>
              Film Details
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </span>
          </div>

          {/* Gold frame reveal */}
          <div className="absolute inset-0 ring-1 ring-inset ring-transparent group-hover:ring-gold/25 transition-all duration-500 pointer-events-none" />

          {/* Year badge */}
          {film.release_year && (
            <div
              className="absolute top-3 right-3 text-[10px] font-body tracking-widest px-2 py-1 backdrop-blur-sm"
              style={{
                color: "hsl(var(--gold))",
                background: "hsl(var(--background) / 0.75)",
              }}
            >
              {film.release_year}
            </div>
          )}

          {/* Featured indicator */}
          {film.is_featured && (
            <div
              className="absolute top-3 left-3 text-[8px] font-body tracking-[0.3em] uppercase px-2 py-1"
              style={{
                color: "hsl(var(--gold))",
                background: "hsl(var(--gold) / 0.12)",
                border: "1px solid hsl(var(--gold) / 0.25)",
              }}
            >
              Featured
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="mt-4 space-y-1">
          <h3 className="font-cinematic text-base font-semibold text-foreground group-hover:text-gold transition-colors duration-300 leading-snug">
            {film.title}
          </h3>
          {film.release_year && (
            <p className="font-body text-[11px] text-muted-foreground tracking-wider">{film.release_year}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
