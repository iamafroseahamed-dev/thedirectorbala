import { Link } from "react-router-dom";
import { Instagram, Youtube, Mail } from "lucide-react";

const socialLinks = [
  { href: "https://www.instagram.com/thedirectorbala?igsh=YXZ2aXp2dmJqZnRv&utm_source=qr", label: "Instagram", Icon: Instagram },
  { href: "https://youtube.com/@houseofeleven11?si=QYfTt56pilRFXTZ7", label: "YouTube", Icon: Youtube },
  { href: "mailto:houseofeleven11films@gmail.com", label: "Email", Icon: Mail },
];

interface FooterProps {
  directorName?: string;
}

export default function Footer({ directorName = "Bala" }: FooterProps) {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link
          to="/"
          className="font-body tracking-[0.18em] uppercase"
          style={{
            fontWeight: 300,
            fontSize: "clamp(0.6rem, 1.4vw, 0.75rem)",
            color: "hsl(var(--foreground))",
            opacity: 0.82,
            letterSpacing: "0.18em",
          }}
        >
          Balachandar Rajasekharan
        </Link>

        {/* Social links */}
        <div className="flex items-center gap-5">
          {socialLinks.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-muted-foreground hover:text-gold transition-colors duration-200"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">
          © {new Date().getFullYear()} {directorName}
        </p>
      </div>
    </footer>
  );
}
