import { Helmet } from "react-helmet-async";
import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { Film, Settings, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <Helmet>
        <title>Dashboard — Admin</title>
      </Helmet>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="font-body text-sm text-muted-foreground mb-10">Manage your portfolio</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/admin/films"
              className="group p-6 bg-card border border-border hover:border-gold/40 transition-colors"
            >
              <Film size={24} className="text-gold mb-3" />
              <h2 className="font-display text-lg font-bold text-foreground group-hover:text-gold transition-colors">
                Films
              </h2>
              <p className="font-body text-sm text-muted-foreground mt-1">Add, edit, and manage your filmography</p>
            </Link>

            <Link
              to="/admin/messages"
              className="group p-6 bg-card border border-border hover:border-gold/40 transition-colors"
            >
              <MessageSquare size={24} className="text-gold mb-3" />
              <h2 className="font-display text-lg font-bold text-foreground group-hover:text-gold transition-colors">
                Messages
              </h2>
              <p className="font-body text-sm text-muted-foreground mt-1">Contact messages from visitors</p>
            </Link>

            <Link
              to="/admin/settings"
              className="group p-6 bg-card border border-border hover:border-gold/40 transition-colors"
            >
              <Settings size={24} className="text-gold mb-3" />
              <h2 className="font-display text-lg font-bold text-foreground group-hover:text-gold transition-colors">
                Site Settings
              </h2>
              <p className="font-body text-sm text-muted-foreground mt-1">Update bio, hero video, and branding</p>
            </Link>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}

