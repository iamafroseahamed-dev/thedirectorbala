import { useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export interface AdminSession {
  id: string;
  email: string;
  name: string | null;
  loggedInAt: string;
}

export function getAdminSession(): AdminSession | null {
  const stored = localStorage.getItem("admin_session");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AdminSession;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem("admin_session");
}

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      navigate("/admin/login", { replace: true });
    }
    setChecking(false);
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
