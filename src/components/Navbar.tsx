import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/films", label: "Films" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isHero = location.pathname === "/";

  // On hero: fully transparent until scrolled. On other pages: always solid.
  const isTransparent = isHero && !scrolled;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        transition: "background 0.55s cubic-bezier(0.4,0,0.2,1), backdrop-filter 0.55s ease, border-color 0.55s ease",
        background: isTransparent
          ? "transparent"
          : "hsl(var(--background) / 0.92)",
        backdropFilter: isTransparent ? "none" : "blur(16px) saturate(1.4)",
        borderBottom: isTransparent
          ? "1px solid transparent"
          : "1px solid hsl(var(--border))",
      }}
    >
      <nav
        className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16 md:h-20"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {/* Logo */}
        <Link
          to="/"
          className="font-body uppercase tracking-[0.22em] leading-none"
          style={{
            color: "hsl(var(--gold))",
            fontWeight: 200,
            fontSize: "clamp(0.55rem, 1.2vw, 0.65rem)",
            letterSpacing: "0.22em",
            textShadow: isTransparent ? "0 2px 20px hsl(0 0% 0% / 0.5)" : "none",
            transition: "text-shadow 0.55s ease, color 0.55s ease",
            opacity: isTransparent ? 0.88 : 1,
          }}
        >
          Balachandar Rajasekharan
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className="font-body text-sm tracking-widest uppercase transition-colors duration-300"
                style={{
                  color:
                    location.pathname === link.href
                      ? "hsl(var(--gold))"
                      : isTransparent
                      ? "hsl(var(--foreground) / 0.75)"
                      : "hsl(var(--muted-foreground))",
                  textShadow: isTransparent ? "0 1px 12px hsl(0 0% 0% / 0.6)" : "none",
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 transition-colors duration-300"
          style={{
            color: isTransparent
              ? "hsl(var(--foreground) / 0.85)"
              : "hsl(var(--foreground))",
          }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {menuOpen ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.2 }}
                style={{ display: "block" }}
              >
                <X size={20} strokeWidth={1.5} />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ opacity: 0, rotate: 45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -45 }}
                transition={{ duration: 0.2 }}
                style={{ display: "block" }}
              >
                <Menu size={20} strokeWidth={1.5} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden overflow-hidden"
            style={{
              background: "hsl(var(--background) / 0.97)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            <ul className="flex flex-col px-6 py-5 gap-5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="block font-body text-sm tracking-widest uppercase py-1.5 transition-colors"
                    style={{
                      color:
                        location.pathname === link.href
                          ? "hsl(var(--gold))"
                          : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
