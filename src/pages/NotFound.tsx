import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0f0f0f" }}
    >
      {/* Film grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />

      {/* Navbar logo */}
      <div className="absolute top-0 left-0 right-0 z-20 px-8 py-6">
        <Link
          to="/"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 200,
            letterSpacing: "0.22em",
            fontSize: "0.75rem",
            color: "hsl(var(--foreground))",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Balachandar Rajasekharan
        </Link>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="relative z-20 flex flex-col items-center text-center px-6"
      >
        {/* BALA branding */}
        <motion.h1
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.18em" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 200,
            fontSize: "clamp(4rem, 14vw, 10rem)",
            letterSpacing: "0.18em",
            color: "hsl(var(--foreground))",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          BALA
        </motion.h1>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            width: "4rem",
            height: "1px",
            background: "hsl(var(--gold, 43 74% 66%))",
            margin: "1.5rem auto",
            transformOrigin: "center",
          }}
        />

        {/* 404 number */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 200,
            fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)",
            letterSpacing: "0.35em",
            color: "hsl(var(--muted-foreground))",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          404
        </motion.p>

        {/* Page Not Found message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(0.85rem, 2vw, 1rem)",
            letterSpacing: "0.2em",
            color: "hsl(var(--muted-foreground))",
            textTransform: "uppercase",
            marginBottom: "2.5rem",
          }}
        >
          Page Not Found
        </motion.p>

        {/* Return Home button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link
            to="/"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 300,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--foreground) / 0.3)",
              padding: "0.85rem 2.5rem",
              display: "inline-block",
              textDecoration: "none",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "hsl(var(--foreground))";
              (e.currentTarget as HTMLAnchorElement).style.background =
                "hsl(var(--foreground) / 0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "hsl(var(--foreground) / 0.3)";
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            Return Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
