import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, X, Sparkles, Download } from "lucide-react";
import Header from "@/components/Header";
import api from "@/lib/api";

const STYLES = ["Streetwear", "Haute Couture", "Minimalist", "Avant-garde", "Bohemian", "Tailoring", "Athleisure", "Resort"];
const PALETTES = ["Black & Gold", "Monochrome", "Pastel", "Earth Tones", "Neon", "Crimson & Ink", "Ivory & Bone"];
const MATERIALS = ["Silk", "Leather", "Wool", "Linen", "Denim", "Cashmere", "Velvet", "Latex"];
const AUDIENCES = ["Women", "Men", "Unisex", "Editorial"];

export default function Studio() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [audience, setAudience] = useState("");
  const [refFile, setRefFile] = useState(null);
  const [refPreview, setRefPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recent, setRecent] = useState([]);

  const loadRecent = async () => {
    try {
      const res = await api.get("/designs");
      setRecent(res.data.designs.slice(0, 6));
    } catch {/* ignore */}
  };

  useEffect(() => { loadRecent(); }, []);

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      toast.error("Reference image must be under 20MB");
      return;
    }
    setRefFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setRefPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const clearRef = () => {
    setRefFile(null);
    setRefPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const generate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please describe what you want to create");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("prompt", prompt);
      if (title) fd.append("title", title);
      if (style) fd.append("style", style);
      if (color) fd.append("color", color);
      if (material) fd.append("material", material);
      if (audience) fd.append("audience", audience);
      if (refFile) fd.append("reference", refFile);

      const res = await api.post("/designs/generate", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data.design);
      toast.success("Concept rendered");
      loadRecent();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.image;
    a.download = `${result.title.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  const Chip = ({ value, current, onChange, testid }) => (
    <button
      type="button"
      onClick={() => onChange(current === value ? "" : value)}
      className={`chip ${current === value ? "active" : ""}`}
      data-testid={testid}
    >
      {value}
    </button>
  );

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <span className="font-mono-label text-white/40">Studio · Generate</span>
            <h1 className="font-serif-display text-5xl lg:text-6xl tracking-tighter mt-3">
              The <em className="italic text-[#D4AF37]">workshop</em>.
            </h1>
          </div>
          <button onClick={() => navigate("/gallery")} className="btn-ghost hidden md:inline-flex" data-testid="goto-gallery">
            View Archive
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-white/10">
          {/* Left column — controls */}
          <form onSubmit={generate} className="lg:col-span-5 bg-[#0A0A0C] p-8 lg:p-10 space-y-10">
            <div>
              <label className="font-mono-label text-white/40 block mb-3">Reference image (optional)</label>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={onPickFile}
                className="hidden"
                data-testid="reference-file-input"
              />
              {refPreview ? (
                <div className="relative panel-card aspect-[4/5] overflow-hidden">
                  <img src={refPreview} alt="reference" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearRef}
                    className="absolute top-3 right-3 bg-black/70 border border-white/20 p-2 hover:border-white"
                    data-testid="clear-reference-btn"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="panel-card w-full aspect-[4/5] flex flex-col items-center justify-center gap-4 text-white/40 hover:text-white"
                  data-testid="upload-reference-btn"
                >
                  <Upload size={28} strokeWidth={1} />
                  <span className="font-mono-label">Drop reference / click to upload</span>
                  <span className="text-xs text-white/30">PNG · JPG · WEBP up to 20MB</span>
                </button>
              )}
            </div>

            <div>
              <label className="font-mono-label text-white/40 block mb-3">Title</label>
              <input
                className="input-line"
                placeholder="Untitled concept"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="title-input"
              />
            </div>

            <div>
              <label className="font-mono-label text-white/40 block mb-3">Prompt</label>
              <textarea
                className="input-line"
                placeholder="e.g. Create a modern streetwear version in black and gold, oversized silhouette, asymmetric zip, matte texture"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
                data-testid="prompt-input"
              />
            </div>

            <div>
              <label className="font-mono-label text-white/40 block mb-3">Style</label>
              <div className="flex flex-wrap gap-2">
                {STYLES.map((s) => (
                  <Chip key={s} value={s} current={style} onChange={setStyle} testid={`style-chip-${s.toLowerCase().replace(/\s/g, "-")}`} />
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono-label text-white/40 block mb-3">Palette</label>
              <div className="flex flex-wrap gap-2">
                {PALETTES.map((c) => (
                  <Chip key={c} value={c} current={color} onChange={setColor} testid={`palette-chip-${c.toLowerCase().replace(/\s/g, "-").replace(/&/g, "and")}`} />
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono-label text-white/40 block mb-3">Material</label>
              <div className="flex flex-wrap gap-2">
                {MATERIALS.map((m) => (
                  <Chip key={m} value={m} current={material} onChange={setMaterial} testid={`material-chip-${m.toLowerCase()}`} />
                ))}
              </div>
            </div>

            <div>
              <label className="font-mono-label text-white/40 block mb-3">Designed for</label>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map((a) => (
                  <Chip key={a} value={a} current={audience} onChange={setAudience} testid={`audience-chip-${a.toLowerCase()}`} />
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center" data-testid="generate-btn">
              {loading ? <><span className="spin-line" /> Rendering…</> : <><Sparkles size={14} /> Render Concept</>}
            </button>
          </form>

          {/* Right column — output */}
          <div className="lg:col-span-7 bg-[#0A0A0C] p-8 lg:p-10">
            <div className="flex items-baseline justify-between mb-8">
              <span className="font-mono-label text-white/40">Output</span>
              {result && (
                <button onClick={downloadResult} className="font-mono-label text-white/60 hover:text-white flex items-center gap-2" data-testid="download-result">
                  <Download size={12} /> Download
                </button>
              )}
            </div>

            {loading && (
              <div className="panel-card aspect-[4/5] flex flex-col items-center justify-center gap-6">
                <span className="spin-line" />
                <span className="font-mono-label text-white/40">The atelier is rendering · 20–40s</span>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-6" data-testid="result-container">
                <div className="panel-card overflow-hidden">
                  <img src={result.image} alt={result.title} className="w-full max-h-[70vh] object-contain bg-black" />
                </div>
                <div>
                  <h3 className="font-serif-display text-3xl mb-2">{result.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{result.prompt}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {[result.style, result.color, result.material, result.audience].filter(Boolean).map((t) => (
                      <span key={t} className="chip active">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && !result && (
              <div className="panel-card aspect-[4/5] flex flex-col items-center justify-center gap-4 text-center px-10">
                <Sparkles size={32} strokeWidth={1} className="text-white/40" />
                <h3 className="font-serif-display text-3xl">Awaiting direction</h3>
                <p className="text-white/40 text-sm max-w-xs">
                  Set your prompt, optional reference and aesthetic — render in seconds.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent strip */}
        {recent.length > 0 && (
          <div className="mt-20">
            <div className="flex items-baseline justify-between mb-6">
              <span className="font-mono-label text-white/40">Recent renders</span>
              <button onClick={() => navigate("/gallery")} className="font-mono-label text-white/60 hover:text-white" data-testid="see-all-recent">
                See all →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/10">
              {recent.map((d) => (
                <div key={d.id} className="aspect-[3/4] overflow-hidden bg-black group cursor-pointer" onClick={() => navigate(`/gallery?d=${d.id}`)} data-testid={`recent-${d.id}`}>
                  <img src={d.image} alt={d.title} className="w-full h-full object-cover img-editorial" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
