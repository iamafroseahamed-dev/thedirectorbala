import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface Testimonial {
  author: string;
  content: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (!isAutoplay) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoplay, testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-28 px-6 lg:px-16 max-w-screen-xl mx-auto">
      <Reveal>
        <div className="mb-16">
          <p className="font-body text-[10px] tracking-[0.45em] uppercase mb-4" style={{ color: "hsl(var(--gold))" }}>
            Testimonials
          </p>
          <h2
            className="font-cinematic font-semibold text-foreground leading-none"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.02em" }}
          >
            What People Say
          </h2>
          <div className="gold-line w-16 mt-6" />
        </div>
      </Reveal>

      {/* Carousel */}
      <div className="max-w-3xl mx-auto">
        {/* Testimonial card with animation */}
        <div className="relative h-full min-h-[480px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full absolute"
            >
              <div className="border border-border/50 p-8 lg:p-12 hover:border-gold/30 transition-all duration-500 bg-background/40 backdrop-blur-sm">
                {/* Stars */}
                <div className="flex gap-1.5 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="fill-gold text-gold"
                    />
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="font-body text-base leading-[1.8] text-muted-foreground mb-8">
                  {currentTestimonial.content}
                </p>

                {/* Author */}
                <div className="pt-6 border-t border-border/30">
                  <p className="font-body font-semibold text-foreground text-sm">
                    {currentTestimonial.author}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-12">
          {/* Previous button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPrevious}
            className="p-2.5 border border-border/50 hover:border-gold/50 transition-all duration-300"
            style={{ color: "hsl(var(--gold))" }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </motion.button>

          {/* Indicators */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  setIsAutoplay(false); // Pause on manual selection
                }}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: i === currentIndex ? 24 : 8,
                  backgroundColor:
                    i === currentIndex
                      ? "hsl(var(--gold))"
                      : "hsl(var(--border))",
                }}
                whileHover={{ scale: 1.1 }}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          {/* Next button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToNext}
            className="p-2.5 border border-border/50 hover:border-gold/50 transition-all duration-300"
            style={{ color: "hsl(var(--gold))" }}
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </motion.button>

          {/* Play/Pause button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAutoplay(!isAutoplay)}
            className="p-2.5 border border-border/50 hover:border-gold/50 transition-all duration-300"
            style={{ color: "hsl(var(--gold))" }}
            aria-label={isAutoplay ? "Pause autoplay" : "Play autoplay"}
          >
            {isAutoplay ? <Pause size={18} /> : <Play size={18} />}
          </motion.button>
        </div>

        {/* Counter */}
        <div className="text-center mt-8">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">
            {currentIndex + 1} / {testimonials.length}
          </p>
        </div>
      </div>
    </section>
  );
}
