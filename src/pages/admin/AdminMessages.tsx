import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { Trash2, Search, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMessages(data as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setDeletingId(id);
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete: " + error.message);
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message deleted");
    }
    setDeletingId(null);
  };

  const filtered = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <AdminGuard>
      <Helmet>
        <title>Messages — Admin</title>
      </Helmet>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">Messages</h1>
              <p className="font-body text-sm text-muted-foreground">
                Contact form submissions from visitors
              </p>
            </div>
            <div className="flex items-center gap-2 bg-secondary border border-border px-3 py-2">
              <Mail size={14} className="text-gold" />
              <span className="font-body text-sm text-foreground">{messages.length}</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-9 bg-secondary border-border font-body text-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Mail size={40} className="text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="font-body text-muted-foreground">
                {search ? "No messages match your search." : "No messages yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="bg-card border border-border p-5 group hover:border-gold/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-display text-base font-bold text-foreground">
                          {msg.name}
                        </span>
                        <a
                          href={`mailto:${msg.email}`}
                          className="font-body text-xs text-gold hover:underline truncate"
                        >
                          {msg.email}
                        </a>
                        <span className="font-body text-xs text-muted-foreground ml-auto">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {msg.message}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={deletingId === msg.id}
                      className="shrink-0 p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete message"
                    >
                      {deletingId === msg.id ? (
                        <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
