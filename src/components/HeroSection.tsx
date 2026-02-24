import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface SiteSettings {
  director_name: string;
  tagline: string;
  hero_video_url: string | null;
  show_featured_section: boolean;
}

interface HeroSectionProps {
  settings: SiteSettings | null;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Extend window for YT API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function HeroSection({ settings }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [ytReady, setYtReady] = useState(false);

  const { scrollY } = useScroll();
  const textY = useTransform(scrollY, [0, 600], [0, 80]);
  const textOpacity = useTransform(scrollY, [0, 350], [1, 0]);
  const videoScale = useTransform(scrollY, [0, 600], [1.04, 1.0]);

  const heroUrl = settings?.hero_video_url ?? "";
  const ytId = heroUrl ? getYouTubeId(heroUrl) : null;
  const isYouTube = !!ytId;
  const isDirectVideo = !isYouTube && !!heroUrl;

  // Load YouTube IFrame API once
  useEffect(() => {
    if (!isYouTube) return;

    const initPlayer = () => {
      if (!ytContainerRef.current || !ytId) return;
      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: ytId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          playlist: ytId,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => setYtReady(true),
          onStateChange: (e) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Script not loaded yet — attach callback and load script
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.getElementById("yt-api-script")) {
        const script = document.createElement("script");
        script.id = "yt-api-script";
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    }

    return () => {
      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYouTube, ytId]);

  // Fade in controls after 2 seconds
  useEffect(() => {
    const t = setTimeout(() => setControlsVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const handlePlayPause = useCallback(() => {
    if (isYouTube && ytPlayerRef.current && ytReady) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
      setIsPlaying((p) => !p);
      return;
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying((p) => !p);
    }
  }, [isYouTube, isPlaying, ytReady]);

  const handleMute = useCallback(() => {
    if (isYouTube && ytPlayerRef.current && ytReady) {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        // Ramp volume from 0 → 80 smoothly
        ytPlayerRef.current.setVolume(0);
        let vol = 0;
        const ramp = setInterval(() => {
          vol = Math.min(80, vol + 4);
          ytPlayerRef.current?.setVolume(vol);
          if (vol >= 80) clearInterval(ramp);
        }, 40);
      } else {
        ytPlayerRef.current.mute();
      }
      setIsMuted((m) => !m);
      return;
    }
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      if (!newMuted) {
        videoRef.current.volume = 0;
        const ramp = setInterval(() => {
          if (videoRef.current && videoRef.current.volume < 0.95) {
            videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.05);
          } else {
            clearInterval(ramp);
          }
        }, 40);
      }
      setIsMuted(newMuted);
    }
  }, [isYouTube, isMuted, ytReady]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "100dvh", minHeight: "100svh" }}
    >
      {/* ── VIDEO / IMAGE BACKGROUND ── */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ scale: videoScale, transformOrigin: "center center" }}
      >
        {isYouTube ? (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* YT Player API replaces this div */}
            <div
              ref={ytContainerRef}
              className="absolute w-[300%] h-[300%] -top-[100%] -left-[100%]"
            />
          </div>
        ) : isDirectVideo ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={heroUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : (
          /* Cinematic static fallback */
          <div className="absolute inset-0 bg-background">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "180px 180px",
              }}
            />
          </div>
        )}
      </motion.div>

      {/* ── CINEMATIC OVERLAY SYSTEM ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, hsl(0 0% 0% / 0.18) 0%, hsl(0 0% 0% / 0.08) 30%, hsl(0 0% 0% / 0.28) 70%, hsl(var(--dark-bg)) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(0 0% 0% / 0.72) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, hsl(0 0% 0% / 0.35) 0%, transparent 22%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
          backgroundSize: "220px 220px",
          opacity: 0.032,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── HERO CONTENT ── */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
      >
        {/* Director name — thin cinematic weight */}
        <motion.h1
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="select-none leading-none"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 200,
            fontSize: "clamp(3.5rem, 12vw, 10rem)",
            letterSpacing: "0.18em",
            textShadow: "0 4px 80px hsl(0 0% 0% / 0.5), 0 0 120px hsl(var(--gold) / 0.06)",
            color: "hsl(var(--foreground))",
          }}
        >
          {settings?.director_name?.toUpperCase() || "BALA"}
        </motion.h1>

        {/* Gold line + tagline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.1, ease: "easeOut" }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <div className="gold-line w-20 mx-auto" />
          <p
            className="font-body tracking-[0.5em] uppercase text-[11px] md:text-xs"
            style={{ color: "hsl(var(--muted-foreground))", fontWeight: 300 }}
          >
            {settings?.tagline || "Cinematic Storyteller"}
          </p>
        </motion.div>
      </motion.div>

      {/* ── SCROLL INDICATOR ── */}
      <motion.button
        onClick={scrollToContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.6, duration: 1.0 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 transition-colors animate-bounce-subtle"
        style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}
        aria-label="Scroll down"
      >
        <ChevronDown size={22} strokeWidth={1} />
      </motion.button>

      {/* ── CINEMATIC MEDIA CONTROLS (bottom-right) ── */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute bottom-8 right-8 flex items-center gap-3 z-20"
          >
            {/* Play / Pause — for direct video and YouTube */}
            {(isDirectVideo || isYouTube) && (
              <motion.button
                onClick={handlePlayPause}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300"
                style={{
                  borderColor: "hsl(var(--foreground) / 0.3)",
                  background: "hsl(0 0% 0% / 0.3)",
                  backdropFilter: "blur(12px)",
                  color: "hsl(var(--foreground) / 0.85)",
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isPlaying ? (
                    <motion.span
                      key="pause"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Pause size={14} strokeWidth={1.5} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="play"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Play size={14} strokeWidth={1.5} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}

            {/* Mute / Unmute */}
            {(isDirectVideo || isYouTube) && (
              <motion.button
                onClick={handleMute}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300"
                style={{
                  borderColor: "hsl(var(--foreground) / 0.3)",
                  background: "hsl(0 0% 0% / 0.3)",
                  backdropFilter: "blur(12px)",
                  color: "hsl(var(--foreground) / 0.85)",
                }}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMuted ? (
                    <motion.span
                      key="muted"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.18 }}
                    >
                      <VolumeX size={14} strokeWidth={1.5} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="unmuted"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Volume2 size={14} strokeWidth={1.5} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FILM FRAME CORNERS (decorative) ── */}
      <div
        className="absolute top-[calc(env(safe-area-inset-top,0px)+1.75rem)] left-7 w-7 h-7 border-l border-t pointer-events-none"
        style={{ borderColor: "hsl(var(--gold) / 0.2)" }}
      />
      <div
        className="absolute top-[calc(env(safe-area-inset-top,0px)+1.75rem)] right-7 w-7 h-7 border-r border-t pointer-events-none"
        style={{ borderColor: "hsl(var(--gold) / 0.2)" }}
      />
      <div
        className="absolute bottom-7 left-7 w-7 h-7 border-l border-b pointer-events-none"
        style={{ borderColor: "hsl(var(--gold) / 0.2)" }}
      />
      <div
        className="absolute bottom-7 right-7 w-7 h-7 border-r border-b pointer-events-none"
        style={{ borderColor: "hsl(var(--gold) / 0.2)" }}
      />
    </section>
  );
}
