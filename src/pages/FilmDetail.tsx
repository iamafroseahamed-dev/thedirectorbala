import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Award, Calendar, FileText, X,
  ChevronLeft, ChevronRight, ExternalLink, Users, Star, Newspaper,
} from "lucide-react";

interface Review {
  review_title: string;
  reviewer_name: string;
  publication: string;
  review_text: string;
  review_link?: string;
}

interface Article {
  article_title: string;
  source: string;
  date?: string;
  article_link?: string;
}

interface Credits {
  writer?: string;
  director?: string;
  producer?: string;
  production_company?: string;
  cast?: string;
  dop_colourist?: string;
  editor?: string;
  production_designer?: string;
  gaffer?: string;
  grip?: string;
  script_overview?: string;
  music_composer?: string;
  sound_designer?: string;
  assistant_director?: string;
  bts?: string;
  drone_shots?: string;
  catering?: string;
}

interface Film {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  thumbnail_url: string | null;
  trailer_url: string | null;
  festival_awards: string | null;
  release_year: number | null;
  pitch_deck_url: string | null;
  gallery_images: string[] | null;
  credits: Credits | null;
  reviews: Review[] | null;
  articles: Article[] | null;
}

function getEmbedUrl(url: string): { type: "youtube" | "vimeo" | "video"; src: string } {
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return { type: "youtube", src: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&rel=0&modestbranding=1` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", src: `https://player.vimeo.com/video/${vimeoMatch[1]}?color=c9a84c&title=0&byline=0&portrait=0` };
  }
  return { type: "video", src: url };
}

// ─── Safe HTML renderer ─────────────────────────────────────────────────────────
function SafeHTML({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;
  // Strip script tags for safety
  const safe = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  return (
    <div
      className={`prose prose-invert prose-sm max-w-none font-body leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

// ─── PDF Modal ─────────────────────────────────────────────────────────────────
function PDFModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-[95vw] max-w-5xl h-[90vh] bg-card border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <FileText size={14} className="text-gold" />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Pitch Deck</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-body text-xs tracking-wider uppercase text-muted-foreground hover:text-gold transition-colors"
            >
              <ExternalLink size={11} />
              Open in new tab
            </a>
            <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${url}#toolbar=0&navpanes=0`}
            className="w-full h-full"
            title="Pitch Deck PDF"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, index, onClose, onNav }: {
  images: string[];
  index: number;
  onClose: () => void;
  onNav: (dir: 1 | -1) => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onNav]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(-1); }}
            className="absolute left-4 md:left-8 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(1); }}
            className="absolute right-4 md:right-8 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X size={22} />
      </button>
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.22 }}
          src={images[index]}
          alt={`Film still ${index + 1}`}
          className="relative z-10 max-h-[88vh] max-w-[88vw] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-body text-[11px] text-muted-foreground tracking-widest">
          {index + 1} / {images.length}
        </div>
      )}
    </motion.div>
  );
}

// ─── Scroll reveal ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {Icon && <Icon size={12} className="text-gold shrink-0" />}
      <p className="font-body text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
        {children}
      </p>
    </div>
  );
}

function EditorialDivider() {
  return <div className="border-t border-border/30 my-10" />;
}

// ─── Credits table ─────────────────────────────────────────────────────────────
function CreditsBlock({ credits }: { credits: Credits }) {
  const rows: [string, string | undefined][] = [
    ["Writer", credits.writer],
    ["Director", credits.director],
    ["Producer", credits.producer],
    ["Production Company", credits.production_company],
    ["Cast", credits.cast],
    ["Director of Photography & Colourist", credits.dop_colourist],
    ["Editor", credits.editor],
    ["Production Designer", credits.production_designer],
    ["Gaffer", credits.gaffer],
    ["Grip", credits.grip],
    ["Script Overview", credits.script_overview],
    ["Music Composer", credits.music_composer],
    ["Sound Designer", credits.sound_designer],
    ["Assistant Director", credits.assistant_director],
    ["BTS", credits.bts],
    ["Drone Shots", credits.drone_shots],
    ["Catering", credits.catering],
  ];
  const filled = rows.filter(([, v]) => v);
  if (!filled.length) return null;

  return (
    <div className="space-y-3">
      {filled.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[140px_1fr] gap-4 items-start">
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground pt-0.5">{label}</span>
          <span className="font-body text-sm text-foreground leading-relaxed">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-l-2 border-gold/40 pl-5 py-1 space-y-2">
      {review.review_title && (
        <p className="font-display text-lg text-foreground tracking-wide leading-tight">
          "{review.review_title}"
        </p>
      )}
      {review.review_text && (
        <SafeHTML html={review.review_text} className="text-muted-foreground text-sm" />
      )}
      <div className="flex items-center gap-2 pt-1">
        {review.reviewer_name && (
          <span className="font-body text-xs text-foreground">— {review.reviewer_name}</span>
        )}
        {review.publication && (
          <span className="font-body text-xs text-gold italic">{review.publication}</span>
        )}
        {review.review_link && (
          <a
            href={review.review_link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-muted-foreground hover:text-gold transition-colors"
          >
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Article row ───────────────────────────────────────────────────────────────
function ArticleRow({ article }: { article: Article }) {
  const content = (
    <div className="group flex items-start justify-between gap-4 py-4 border-b border-border/30 last:border-0">
      <div className="space-y-1 min-w-0">
        <p className="font-body text-sm text-foreground group-hover:text-gold transition-colors leading-snug">
          {article.article_title}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {article.source && (
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{article.source}</span>
          )}
          {article.date && (
            <span className="font-body text-[10px] text-muted-foreground/60">{article.date}</span>
          )}
        </div>
      </div>
      {article.article_link && (
        <ExternalLink size={12} className="text-muted-foreground group-hover:text-gold transition-colors shrink-0 mt-0.5" />
      )}
    </div>
  );

  return article.article_link ? (
    <a href={article.article_link} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : content;
}

// ─── Main component ─────────────────────────────────────────────────────────────
export default function FilmDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("films")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setFilm(data as unknown as Film);
        setLoading(false);
      });
  }, [slug]);

  const galleryImages = film
    ? (film.gallery_images && film.gallery_images.length > 0
        ? film.gallery_images
        : film.thumbnail_url ? [film.thumbnail_url] : [])
    : [];

  const handleLightboxNav = useCallback((dir: 1 | -1) => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev + dir + galleryImages.length) % galleryImages.length;
    });
  }, [galleryImages.length]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (notFound || !film) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="font-display text-2xl text-muted-foreground">Film not found</p>
          <Link to="/films" className="text-gold font-body text-sm tracking-wider hover:underline">
            ← Back to Films
          </Link>
        </div>
      </>
    );
  }

  const trailer = film.trailer_url ? getEmbedUrl(film.trailer_url) : null;
  const credits = film.credits as Credits | null;
  const reviews = film.reviews as Review[] | null;
  const articles = film.articles as Article[] | null;
  const hasCredits = credits && Object.values(credits).some(Boolean);
  const hasReviews = reviews && reviews.length > 0;
  const hasArticles = articles && articles.length > 0;

  return (
    <>
      <Helmet>
        <title>{film.title} — Bala</title>
        <meta name="description" content={film.short_description || `${film.title} by director Bala`} />
        <meta property="og:title" content={`${film.title} — Bala`} />
        <meta property="og:description" content={film.short_description || ""} />
        {film.thumbnail_url && <meta property="og:image" content={film.thumbnail_url} />}
      </Helmet>

      <Navbar />

      {/* ── CINEMATIC HERO STRIP ── */}
      {film.thumbnail_url && (
        <div className="relative w-full h-[45vh] md:h-[55vh] overflow-hidden">
          <img
            src={film.thumbnail_url}
            alt={film.title}
            loading="eager"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 30%" }}
          />
          <div className="absolute inset-0 cinematic-gradient" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
        </div>
      )}

      <main className={`${film.thumbnail_url ? "-mt-28 relative z-10" : "pt-32"} pb-32`}>
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-screen-xl mx-auto px-6 lg:px-20 mb-12"
        >
          <Link
            to="/films"
            className="inline-flex items-center gap-2 font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft size={12} />
            All Films
          </Link>
        </motion.div>

        <div className="max-w-screen-xl mx-auto px-6 lg:px-20">

          {/* ── TITLE BLOCK ── */}
          <Reveal className="mb-14">
            <h1 className="font-cinematic text-5xl md:text-7xl xl:text-8xl text-foreground leading-none tracking-wide">
              {film.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">
              {film.release_year && (
                <span className="flex items-center gap-1.5 font-body text-xs tracking-widest text-muted-foreground uppercase">
                  <Calendar size={11} className="text-gold" />
                  {film.release_year}
                </span>
              )}
              {film.short_description && (
                <span className="font-body text-sm text-gold/80 italic">{film.short_description}</span>
              )}
              {film.pitch_deck_url && (
                <button
                  onClick={() => setPdfOpen(true)}
                  className="group flex items-center gap-1.5 font-body text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-gold transition-colors ml-auto"
                >
                  <FileText size={11} className="text-gold" />
                  <span className="border-b border-transparent group-hover:border-gold/40 pb-px transition-colors">
                    Pitch Deck
                  </span>
                </button>
              )}
            </div>
            <div className="h-px bg-gradient-to-r from-gold/50 via-gold/20 to-transparent mt-6" />
          </Reveal>

          {/* ── TRAILER ── */}
          {trailer && (
            <Reveal delay={0.1} className="mb-14">
              <div className="relative w-full aspect-video bg-muted overflow-hidden">
                {trailer.type === "video" ? (
                  <video
                    src={trailer.src}
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <iframe
                    src={trailer.src}
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                    title={`${film.title} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                )}
              </div>
            </Reveal>
          )}

          {/* ── EDITORIAL TWO-COLUMN ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-16 xl:gap-24 items-start">

            {/* ═══ LEFT — PRIMARY CONTENT ═══ */}
            <div className="space-y-0 min-w-0">

              {/* Synopsis */}
              {film.full_description && (
                <Reveal>
                  <SectionLabel>Synopsis</SectionLabel>
                  <SafeHTML
                    html={film.full_description}
                    className="text-muted-foreground text-[0.9rem]"
                  />
                  <EditorialDivider />
                </Reveal>
              )}

              {/* Credits */}
              {hasCredits && (
                <Reveal delay={0.05}>
                  <SectionLabel icon={Users}>Credits</SectionLabel>
                  <CreditsBlock credits={credits!} />
                  <EditorialDivider />
                </Reveal>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <Reveal delay={0.08}>
                  <SectionLabel>Gallery</SectionLabel>
                  <div className={`grid gap-2 ${
                    galleryImages.length === 1 ? "grid-cols-1" :
                    galleryImages.length <= 2 ? "grid-cols-2" :
                    "grid-cols-2 sm:grid-cols-3"
                  }`}>
                    {galleryImages.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxIndex(i)}
                        className="group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        style={{ aspectRatio: galleryImages.length === 1 ? "16/7" : "3/2" }}
                        aria-label={`View film still ${i + 1}`}
                      >
                        <img
                          src={src}
                          alt={`Film still ${i + 1}`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                        />
                        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="font-body text-[9px] tracking-[0.3em] uppercase text-foreground bg-background/70 backdrop-blur-sm px-3 py-1.5">
                            View
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <EditorialDivider />
                </Reveal>
              )}

              {/* Reviews */}
              {hasReviews && (
                <Reveal delay={0.1}>
                  <SectionLabel icon={Star}>Reviews</SectionLabel>
                  <div className="space-y-7">
                    {reviews!.map((review, i) => (
                      <ReviewCard key={i} review={review} />
                    ))}
                  </div>
                  <EditorialDivider />
                </Reveal>
              )}

              {/* Press / Articles */}
              {hasArticles && (
                <Reveal delay={0.12}>
                  <SectionLabel icon={Newspaper}>Press</SectionLabel>
                  <div>
                    {articles!.map((article, i) => (
                      <ArticleRow key={i} article={article} />
                    ))}
                  </div>
                </Reveal>
              )}

            </div>

            {/* ═══ RIGHT — META PANEL ═══ */}
            <div className="lg:sticky lg:top-28 space-y-0">

              {/* Festival Awards */}
              {film.festival_awards && (
                <Reveal>
                  <div className="bg-card border border-border/60 p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Award size={12} className="text-gold shrink-0" />
                      <span className="font-body text-[10px] tracking-[0.35em] uppercase text-muted-foreground">Festival Awards</span>
                    </div>
                    <SafeHTML
                      html={film.festival_awards}
                      className="text-foreground/80 text-sm"
                    />
                  </div>
                  <div className="mt-6" />
                </Reveal>
              )}

              {/* Project details quick facts */}
              <Reveal delay={0.06}>
                <div className="bg-card border border-border/60 p-6 space-y-4">
                  <span className="font-body text-[10px] tracking-[0.35em] uppercase text-muted-foreground block mb-4">
                    Project Details
                  </span>
                  <div className="space-y-3">
                    {film.release_year && (
                      <div className="flex justify-between items-center">
                        <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">Year</span>
                        <span className="font-body text-sm text-foreground">{film.release_year}</span>
                      </div>
                    )}
                    {credits?.director && (
                      <div className="flex justify-between items-center">
                        <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">Director</span>
                        <span className="font-body text-sm text-foreground">{credits.director}</span>
                      </div>
                    )}
                    {hasReviews && (
                      <div className="flex justify-between items-center">
                        <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">Reviews</span>
                        <span className="font-body text-sm text-gold">{reviews!.length}</span>
                      </div>
                    )}
                    {film.gallery_images && film.gallery_images.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">Gallery</span>
                        <span className="font-body text-sm text-foreground">{film.gallery_images.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* Pitch Deck */}
              {film.pitch_deck_url && (
                <Reveal delay={0.08}>
                  <div className="mt-6">
                    <button
                      onClick={() => setPdfOpen(true)}
                      className="group w-full flex items-center justify-between gap-2 border border-border/60 px-5 py-4 hover:border-gold/40 transition-colors bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={14} className="text-gold" />
                        <span className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                          View Pitch Deck
                        </span>
                      </div>
                      <ExternalLink size={12} className="text-muted-foreground group-hover:text-gold transition-colors" />
                    </button>
                  </div>
                </Reveal>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* PDF Modal */}
      <AnimatePresence>
        {pdfOpen && film.pitch_deck_url && (
          <PDFModal url={film.pitch_deck_url} onClose={() => setPdfOpen(false)} />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={galleryImages}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNav={handleLightboxNav}
          />
        )}
      </AnimatePresence>
    </>
  );
}
