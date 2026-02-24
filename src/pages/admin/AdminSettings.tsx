import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface SiteSettings {
  id: string;
  director_name: string;
  tagline: string;
  hero_video_url: string | null;
  theme_color: string;
  bio: string | null;
  profile_image_url: string | null;
  show_featured_section: boolean;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setSettings(data as SiteSettings); });
  }, []);

  const set = (key: keyof SiteSettings, value: unknown) =>
    setSettings((s) => s ? { ...s, [key]: value } : s);

  const handleProfileUpload = async (file: File) => {
    setUploadingProfile(true);
    const ext = file.name.split(".").pop();
    const path = `profile-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("profile-images").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
    } else {
      const { data } = supabase.storage.from("profile-images").getPublicUrl(path);
      set("profile_image_url", data.publicUrl);
      toast.success("Profile image uploaded!");
    }
    setUploadingProfile(false);
  };

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    const ext = file.name.split(".").pop();
    const path = `hero-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("hero-videos").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
    } else {
      const { data } = supabase.storage.from("hero-videos").getPublicUrl(path);
      set("hero_video_url", data.publicUrl);
      toast.success("Hero video uploaded!");
    }
    setUploadingVideo(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    const { id, ...rest } = settings;
    const { error } = await supabase.from("site_settings").update(rest).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved!");
  };

  if (!settings) {
    return (
      <AdminGuard>
        <div className="flex min-h-screen bg-background">
          <AdminSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </main>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <Helmet><title>Site Settings — Admin</title></Helmet>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Site Settings</h1>
          <p className="font-body text-sm text-muted-foreground mb-10">Customize your portfolio</p>

          <form onSubmit={handleSave} className="max-w-2xl space-y-6">
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Director Name</Label>
              <Input
                value={settings.director_name}
                onChange={(e) => set("director_name", e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Tagline</Label>
              <Input
                value={settings.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Bio</Label>
              <Textarea
                rows={6}
                value={settings.bio ?? ""}
                onChange={(e) => set("bio", e.target.value)}
                className="bg-secondary border-border resize-none"
              />
            </div>

            {/* Hero Video */}
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Hero Video URL</Label>
              <Input
                value={settings.hero_video_url ?? ""}
                onChange={(e) => set("hero_video_url", e.target.value)}
                placeholder="Direct video URL or upload below"
                className="bg-secondary border-border"
              />
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border hover:border-gold/50 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Upload size={16} />
                {uploadingVideo ? "Uploading..." : "Upload hero video"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                  disabled={uploadingVideo}
                />
              </label>
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Profile Image URL</Label>
              <Input
                value={settings.profile_image_url ?? ""}
                onChange={(e) => set("profile_image_url", e.target.value)}
                placeholder="Direct image URL or upload below"
                className="bg-secondary border-border"
              />
              {settings.profile_image_url && (
                <img src={settings.profile_image_url} alt="Profile" className="w-24 h-32 object-cover" />
              )}
              <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border hover:border-gold/50 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Upload size={16} />
                {uploadingProfile ? "Uploading..." : "Upload profile image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleProfileUpload(e.target.files[0])}
                  disabled={uploadingProfile}
                />
              </label>
            </div>

            {/* Theme Color */}
            <div className="space-y-2">
              <Label className="font-body text-xs uppercase tracking-wider text-muted-foreground">Theme Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.theme_color}
                  onChange={(e) => set("theme_color", e.target.value)}
                  className="h-10 w-16 cursor-pointer bg-transparent border border-border rounded"
                />
                <Input
                  value={settings.theme_color}
                  onChange={(e) => set("theme_color", e.target.value)}
                  className="bg-secondary border-border font-mono text-sm flex-1"
                />
              </div>
            </div>

            {/* Featured section toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={settings.show_featured_section}
                onCheckedChange={(v) => set("show_featured_section", v)}
              />
              <Label className="font-body text-sm text-muted-foreground">Show featured films on homepage</Label>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-gold text-primary-foreground hover:bg-gold/90 font-body text-xs tracking-widest uppercase py-3 h-auto px-8"
            >
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </main>
      </div>
    </AdminGuard>
  );
}
