import { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";
import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus, Pencil, Trash2, Upload, FileText, X, Image, Film,
  Users, Star, Newspaper, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────
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

interface FilmRecord {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  thumbnail_url: string | null;
  trailer_url: string | null;
  festival_awards: string | null;
  release_year: number | null;
  is_featured: boolean | null;
  pitch_deck_url: string | null;
  gallery_images: string[] | null;
  credits: Credits | null;
  reviews: Review[] | null;
  articles: Article[] | null;
}

const emptyCredits: Credits = {
  writer: "",
  director: "",
  producer: "",
  production_company: "",
  cast: "",
  dop_colourist: "",
  editor: "",
  production_designer: "",
  gaffer: "",
  grip: "",
  script_overview: "",
  music_composer: "",
  sound_designer: "",
  assistant_director: "",
  bts: "",
  drone_shots: "",
  catering: "",
};

const emptyFilm: Omit<FilmRecord, "id"> = {
  title: "", slug: "", short_description: "", full_description: "",
  thumbnail_url: null, trailer_url: "", festival_awards: "",
  release_year: new Date().getFullYear(), is_featured: false,
  pitch_deck_url: null, gallery_images: [],
  credits: { ...emptyCredits }, reviews: [], articles: [],
};

function generateSlug(title: string) {
  return title.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

// ─── Section wrapper ────────────────────────────────────────────────────────────
function Section({
  title, icon: Icon, children, collapsible = false,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="space-y-4">
      <button
        type="button"
        className="flex items-center gap-2 pb-2 border-b border-border/60 w-full text-left"
        onClick={() => collapsible && setOpen((o) => !o)}
      >
        <Icon size={14} className="text-gold" />
        <span className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground flex-1">{title}</span>
        {collapsible && (open ? <ChevronUp size={12} className="text-muted-foreground" /> : <ChevronDown size={12} className="text-muted-foreground" />)}
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </div>
  );
}

// ─── Upload helper ─────────────────────────────────────────────────────────────
async function uploadFile(file: File, bucket: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) { toast.error("Upload failed: " + error.message); return null; }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Review editor ─────────────────────────────────────────────────────────────
function ReviewEditor({
  reviews, onChange,
}: {
  reviews: Review[]; onChange: (r: Review[]) => void;
}) {
  const addReview = () => onChange([...reviews, { review_title: "", reviewer_name: "", publication: "", review_text: "", review_link: "" }]);
  const remove = (i: number) => onChange(reviews.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Review, value: string) => {
    const updated = reviews.map((r, idx) => idx === i ? { ...r, [field]: value } : r);
    onChange(updated);
  };

  return (
    <div className="space-y-5">
      {reviews.map((review, i) => (
        <div key={i} className="border border-border/60 bg-secondary/30 p-4 space-y-3 relative">
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X size={14} />
          </button>
          <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Review {i + 1}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Quote Title</Label>
              <Input
                value={review.review_title}
                onChange={(e) => update(i, "review_title", e.target.value)}
                placeholder="e.g. Visually stunning cinema"
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Reviewer Name</Label>
              <Input
                value={review.reviewer_name}
                onChange={(e) => update(i, "reviewer_name", e.target.value)}
                placeholder="e.g. Anupama Chopra"
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Publication</Label>
              <Input
                value={review.publication}
                onChange={(e) => update(i, "publication", e.target.value)}
                placeholder="e.g. Film Companion"
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Review Link (optional)</Label>
              <Input
                value={review.review_link ?? ""}
                onChange={(e) => update(i, "review_link", e.target.value)}
                placeholder="https://..."
                className="bg-secondary border-border text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Review Text</Label>
            <RichTextEditor
              value={review.review_text}
              onChange={(v) => update(i, "review_text", v)}
              placeholder="Write the review excerpt..."
              minHeight={80}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addReview}
        className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-muted-foreground hover:text-gold transition-colors"
      >
        <Plus size={12} /> Add Review
      </button>
    </div>
  );
}

// ─── Article editor ─────────────────────────────────────────────────────────────
function ArticleEditor({
  articles, onChange,
}: {
  articles: Article[]; onChange: (a: Article[]) => void;
}) {
  const addArticle = () => onChange([...articles, { article_title: "", source: "", date: "", article_link: "" }]);
  const remove = (i: number) => onChange(articles.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Article, value: string) => {
    const updated = articles.map((a, idx) => idx === i ? { ...a, [field]: value } : a);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {articles.map((article, i) => (
        <div key={i} className="border border-border/60 bg-secondary/30 p-4 space-y-3 relative">
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
          >
            <X size={14} />
          </button>
          <p className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Article {i + 1}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Article Title</Label>
              <Input
                value={article.article_title}
                onChange={(e) => update(i, "article_title", e.target.value)}
                placeholder="e.g. Director Bala's new film shocks at Cannes"
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Source / Publication</Label>
              <Input
                value={article.source}
                onChange={(e) => update(i, "source", e.target.value)}
                placeholder="e.g. The Hindu"
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Date (optional)</Label>
              <Input
                value={article.date ?? ""}
                onChange={(e) => update(i, "date", e.target.value)}
                placeholder="e.g. May 2024"
                className="bg-secondary border-border text-sm"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Article Link</Label>
              <Input
                value={article.article_link ?? ""}
                onChange={(e) => update(i, "article_link", e.target.value)}
                placeholder="https://..."
                className="bg-secondary border-border text-sm"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addArticle}
        className="flex items-center gap-2 font-body text-xs tracking-wider uppercase text-muted-foreground hover:text-gold transition-colors"
      >
        <Plus size={12} /> Add Article / Press Mention
      </button>
    </div>
  );
}

// ─── Film Form ─────────────────────────────────────────────────────────────────
function FilmForm({
  initial, onSave, onClose,
}: {
  initial: Omit<FilmRecord, "id"> & { id?: string };
  onSave: (film: Omit<FilmRecord, "id"> & { id?: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<typeof initial>({
    ...initial,
    credits: initial.credits ?? { ...emptyCredits },
    reviews: initial.reviews ?? [],
    articles: initial.articles ?? [],
  });
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const set = useCallback(<K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value })), []);

  const setUpl = (key: string, val: boolean) =>
    setUploading((u) => ({ ...u, [key]: val }));

  const setCredit = (key: keyof Credits, val: string) =>
    setForm((f) => ({ ...f, credits: { ...(f.credits ?? {}), [key]: val } }));

  const handleTitleChange = (title: string) => {
    set("title", title);
    if (!initial.id) set("slug", generateSlug(title));
  };

  const handleThumbnailUpload = async (file: File) => {
    setUpl("thumbnail", true);
    const url = await uploadFile(file, "film-thumbnails");
    if (url) { set("thumbnail_url", url); toast.success("Thumbnail uploaded!"); }
    setUpl("thumbnail", false);
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUpl("gallery", true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file, "film-gallery");
      if (url) urls.push(url);
    }
    set("gallery_images", [...(form.gallery_images ?? []), ...urls]);
    if (urls.length) toast.success(`${urls.length} image(s) uploaded!`);
    setUpl("gallery", false);
  };

  const removeGalleryImage = (idx: number) =>
    set("gallery_images", (form.gallery_images ?? []).filter((_, i) => i !== idx));

  const handlePdfUpload = async (file: File) => {
    setUpl("pdf", true);
    const url = await uploadFile(file, "film-documents");
    if (url) { set("pitch_deck_url", url); toast.success("Pitch deck uploaded!"); }
    setUpl("pdf", false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const isUploading = Object.values(uploading).some(Boolean);
  const credits = form.credits ?? emptyCredits;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-h-[82vh] overflow-y-auto pr-2">

      {/* ── BASIC INFO ── */}
      <Section title="Basic Info" icon={Film}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="Film title"
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              required
              placeholder="film-slug"
              className="bg-secondary border-border font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Release Year</Label>
            <Input
              type="number"
              value={form.release_year ?? ""}
              onChange={(e) => set("release_year", parseInt(e.target.value))}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Subtitle</Label>
            <Input
              value={form.short_description ?? ""}
              onChange={(e) => set("short_description", e.target.value)}
              placeholder="e.g. Feature Film · 2024 · Drama"
              className="bg-secondary border-border"
            />
          </div>
          <div className="flex items-center gap-3 col-span-2">
            <Switch
              checked={form.is_featured ?? false}
              onCheckedChange={(v) => set("is_featured", v)}
            />
            <Label className="text-sm font-body text-muted-foreground">Featured on homepage</Label>
          </div>
        </div>
      </Section>

      {/* ── MEDIA ── */}
      <Section title="Media" icon={Image} collapsible>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Trailer URL</Label>
            <Input
              value={form.trailer_url ?? ""}
              onChange={(e) => set("trailer_url", e.target.value)}
              placeholder="YouTube, Vimeo, or direct .mp4 URL"
              className="bg-secondary border-border"
            />
            <p className="text-[11px] text-muted-foreground/60">Supports YouTube, Vimeo, and direct video links</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Thumbnail / Hero Image</Label>
            {form.thumbnail_url && (
              <div className="relative inline-block group">
                <img src={form.thumbnail_url} alt="thumbnail" className="w-32 h-20 object-cover border border-border" />
                <button
                  type="button"
                  onClick={() => set("thumbnail_url", null)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            )}
            <label className={`flex items-center gap-2 cursor-pointer border border-dashed border-border hover:border-gold/50 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors ${uploading.thumbnail ? "opacity-60 pointer-events-none" : ""}`}>
              <Upload size={14} />
              {uploading.thumbnail ? "Uploading..." : form.thumbnail_url ? "Replace thumbnail" : "Upload thumbnail"}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                disabled={uploading.thumbnail}
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Film Gallery / Stills</Label>
            {(form.gallery_images ?? []).length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {(form.gallery_images ?? []).map((src, i) => (
                  <div key={i} className="relative group aspect-[3/2] overflow-hidden">
                    <img src={src} alt={`Still ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className={`flex items-center gap-2 cursor-pointer border border-dashed border-border hover:border-gold/50 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors ${uploading.gallery ? "opacity-60 pointer-events-none" : ""}`}>
              <Upload size={14} />
              {uploading.gallery ? "Uploading..." : "Upload film stills (multiple)"}
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                disabled={uploading.gallery}
              />
            </label>
          </div>
        </div>
      </Section>

      {/* ── DESCRIPTIONS ── */}
      <Section title="Descriptions" icon={FileText} collapsible>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Synopsis / Full Description</Label>
            <RichTextEditor
              value={form.full_description ?? ""}
              onChange={(v) => set("full_description", v)}
              placeholder="Full synopsis of the film..."
            />
          </div>
        </div>
      </Section>

      {/* ── CREDITS ── */}
      <Section title="Credits" icon={Users} collapsible>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: "writer", label: "Writer" },
            { key: "director", label: "Director" },
            { key: "producer", label: "Producer" },
            { key: "production_company", label: "Production Company" },
            { key: "dop_colourist", label: "Director of Photography & Colourist" },
            { key: "editor", label: "Editor" },
            { key: "production_designer", label: "Production Designer" },
            { key: "gaffer", label: "Gaffer" },
            { key: "grip", label: "Grip" },
            { key: "script_overview", label: "Script Overview" },
            { key: "music_composer", label: "Music Composer" },
            { key: "sound_designer", label: "Sound Designer" },
            { key: "assistant_director", label: "Assistant Director" },
            { key: "bts", label: "BTS" },
            { key: "drone_shots", label: "Drone Shots" },
            { key: "catering", label: "Catering" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
              <Input
                value={credits[key as keyof Credits] ?? ""}
                onChange={(e) => setCredit(key as keyof Credits, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}...`}
                className="bg-secondary border-border text-sm"
              />
            </div>
          ))}
          <div className="space-y-1.5 col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Cast</Label>
            <Input
              value={credits.cast ?? ""}
              onChange={(e) => setCredit("cast", e.target.value)}
              placeholder="e.g. Actor A, Actor B, Actor C"
              className="bg-secondary border-border text-sm"
            />
          </div>
        </div>
      </Section>

      {/* ── FESTIVAL AWARDS ── */}
      <Section title="Festival Awards" icon={Star} collapsible>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Awards &amp; Accolades</Label>
          <RichTextEditor
            value={form.festival_awards ?? ""}
            onChange={(v) => set("festival_awards", v)}
            placeholder="Best Director — Cannes 2024..."
            minHeight={80}
          />
        </div>
      </Section>

      {/* ── REVIEWS ── */}
      <Section title="Reviews" icon={Star} collapsible>
        <ReviewEditor
          reviews={form.reviews ?? []}
          onChange={(r) => set("reviews", r)}
        />
      </Section>

      {/* ── ARTICLES / PRESS ── */}
      <Section title="Press / Articles" icon={Newspaper} collapsible>
        <ArticleEditor
          articles={form.articles ?? []}
          onChange={(a) => set("articles", a)}
        />
      </Section>

      {/* ── DOCUMENTS ── */}
      <Section title="Documents" icon={FileText} collapsible>
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pitch Deck PDF</Label>
          {form.pitch_deck_url && (
            <div className="flex items-center gap-3 px-4 py-3 bg-secondary border border-border">
              <FileText size={14} className="text-gold shrink-0" />
              <a href={form.pitch_deck_url} target="_blank" rel="noopener noreferrer"
                className="font-body text-xs text-muted-foreground hover:text-gold transition-colors truncate">
                {form.pitch_deck_url.split("/").pop()}
              </a>
              <button type="button" onClick={() => set("pitch_deck_url", null)}
                className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
                <X size={14} />
              </button>
            </div>
          )}
          <label className={`flex items-center gap-2 cursor-pointer border border-dashed border-border hover:border-gold/50 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors ${uploading.pdf ? "opacity-60 pointer-events-none" : ""}`}>
            <Upload size={14} />
            {uploading.pdf ? "Uploading..." : form.pitch_deck_url ? "Replace PDF" : "Upload Pitch Deck PDF"}
            <input type="file" accept=".pdf" className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
              disabled={uploading.pdf}
            />
          </label>
          <div className="space-y-1.5 pt-1">
            <Label className="text-[11px] text-muted-foreground/60">or paste a PDF URL</Label>
            <Input
              value={form.pitch_deck_url ?? ""}
              onChange={(e) => set("pitch_deck_url", e.target.value || null)}
              placeholder="https://example.com/pitch-deck.pdf"
              className="bg-secondary border-border text-sm"
            />
          </div>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-card pb-1">
        <Button
          type="submit"
          disabled={saving || isUploading}
          className="bg-gold text-primary-foreground hover:bg-gold/90 text-xs tracking-widest uppercase"
        >
          {saving ? "Saving..." : isUploading ? "Uploading..." : "Save Film"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="text-xs tracking-widest uppercase">
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Main AdminFilms page ──────────────────────────────────────────────────────
export default function AdminFilms() {
  const [films, setFilms] = useState<FilmRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<(Omit<FilmRecord, "id"> & { id?: string }) | null>(null);

  const fetchFilms = async () => {
    const { data } = await supabase.from("films").select("*").order("release_year", { ascending: false });
    setFilms((data as unknown as FilmRecord[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchFilms(); }, []);

  const openAdd = () => {
    setEditing({ ...emptyFilm });
    setDialogOpen(true);
  };

  const openEdit = (film: FilmRecord) => {
    setEditing({
      ...film,
      gallery_images: film.gallery_images ?? [],
      credits: (film.credits as Credits) ?? { ...emptyCredits },
      reviews: (film.reviews as Review[]) ?? [],
      articles: (film.articles as Article[]) ?? [],
    });
    setDialogOpen(true);
  };

  const handleSave = async (film: Omit<FilmRecord, "id"> & { id?: string }) => {
    // Cast jsonb fields through JSON serialization to satisfy Supabase's Json type
    const payload = JSON.parse(JSON.stringify({
      title: film.title,
      slug: film.slug,
      short_description: film.short_description,
      full_description: film.full_description,
      thumbnail_url: film.thumbnail_url,
      trailer_url: film.trailer_url,
      festival_awards: film.festival_awards,
      release_year: film.release_year,
      is_featured: film.is_featured,
      pitch_deck_url: film.pitch_deck_url,
      gallery_images: film.gallery_images ?? [],
      credits: film.credits ?? {},
      reviews: film.reviews ?? [],
      articles: film.articles ?? [],
    }));

    if (film.id) {
      const { error } = await supabase.from("films").update(payload).eq("id", film.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Film updated!");
    } else {
      const { error } = await supabase.from("films").insert([payload]);
      if (error) { toast.error(error.message); return; }
      toast.success("Film added!");
    }
    setDialogOpen(false);
    fetchFilms();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("films").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Film deleted");
    fetchFilms();
  };

  return (
    <AdminGuard>
      <Helmet><title>Films — Admin</title></Helmet>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Films</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">Manage your filmography</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAdd} className="bg-gold text-primary-foreground hover:bg-gold/90 text-xs tracking-widest uppercase">
                  <Plus size={16} /> Add Film
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl text-foreground">
                    {editing?.id ? "Edit Film" : "Add Film"}
                  </DialogTitle>
                </DialogHeader>
                {editing && (
                  <FilmForm
                    initial={editing}
                    onSave={handleSave}
                    onClose={() => setDialogOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-secondary animate-pulse rounded" />)}
            </div>
          ) : films.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-body text-muted-foreground">No films yet. Add your first film!</p>
            </div>
          ) : (
            <div className="border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">Title</TableHead>
                    <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">Year</TableHead>
                    <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">Reviews</TableHead>
                    <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">Press</TableHead>
                    <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground">Featured</TableHead>
                    <TableHead className="font-body text-xs uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {films.map((film) => (
                    <TableRow key={film.id} className="border-border hover:bg-secondary/50">
                      <TableCell className="font-body text-sm text-foreground">{film.title}</TableCell>
                      <TableCell className="font-body text-sm text-muted-foreground">{film.release_year}</TableCell>
                      <TableCell className="font-body text-xs text-muted-foreground">
                        {(film.reviews as Review[] | null)?.length
                          ? <span className="text-gold">{(film.reviews as Review[]).length}</span>
                          : "—"}
                      </TableCell>
                      <TableCell className="font-body text-xs text-muted-foreground">
                        {(film.articles as Article[] | null)?.length
                          ? <span className="text-gold">{(film.articles as Article[]).length}</span>
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <span className={`font-body text-xs px-2 py-0.5 ${film.is_featured ? "bg-gold/10 text-gold" : "text-muted-foreground"}`}>
                          {film.is_featured ? "Featured" : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(film)} className="hover:text-gold h-8 w-8">
                            <Pencil size={14} />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:text-destructive h-8 w-8">
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-display text-foreground">Delete Film</AlertDialogTitle>
                                <AlertDialogDescription className="font-body text-muted-foreground">
                                  Are you sure you want to delete "{film.title}"? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="font-body text-xs uppercase tracking-wider">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(film.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body text-xs uppercase tracking-wider"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  );
}
