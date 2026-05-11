import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { X, Trash2, Plus } from "lucide-react";
import Header from "@/components/Header";
import api from "@/lib/api";

export default function Gallery() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [collections, setCollections] = useState([]);
  const [params, setParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([api.get("/designs"), api.get("/collections")]);
      setDesigns(d.data.designs);
      setCollections(c.data.collections);
    } catch {
      toast.error("Failed to load archive");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const id = params.get("d");
    if (id && designs.length) {
      const d = designs.find((x) => x.id === id);
      if (d) setActive(d);
    }
  }, [params, designs]);

  const remove = async (id) => {
    if (!window.confirm("Remove this design from the archive?")) return;
    try {
      await api.delete(`/designs/${id}`);
      setDesigns(designs.filter((d) => d.id !== id));
      if (active?.id === id) setActive(null);
      toast.success("Removed");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const addToCollection = async (collectionId) => {
    if (!active) return;
    try {
      await api.post(`/collections/${collectionId}/items`, { design_id: active.id });
      toast.success("Added to mood board");
    } catch {
      toast.error("Failed to add");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <span className="font-mono-label text-white/40">Archive</span>
            <h1 className="font-serif-display text-5xl lg:text-6xl tracking-tighter mt-3">
              The <em className="italic text-[#D4AF37]">vault</em>.
            </h1>
          </div>
          <span className="font-mono-label text-white/40" data-testid="design-count">{designs.length} concepts</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-32"><span className="spin-line" /></div>
        ) : designs.length === 0 ? (
          <div className="panel-card p-20 text-center">
            <h3 className="font-serif-display text-4xl mb-3">The vault is empty</h3>
            <p className="text-white/50 mb-8">Begin a session in the studio to populate your archive.</p>
            <a href="/studio" className="btn-primary inline-flex" data-testid="empty-studio-cta">Go to Studio</a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/10">
            {designs.map((d) => (
              <div
                key={d.id}
                className="aspect-[3/4] overflow-hidden bg-black group cursor-pointer relative"
                onClick={() => { setActive(d); setParams({ d: d.id }); }}
                data-testid={`gallery-item-${d.id}`}
              >
                <img src={d.image} alt={d.title} className="w-full h-full object-cover img-editorial" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="font-serif-display text-lg leading-tight">{d.title}</p>
                  <p className="font-mono-label text-white/50 mt-1 truncate">{d.style || "Untitled style"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10" onClick={() => { setActive(null); setParams({}); }}>
          <div className="relative bg-[#0A0A0C] max-w-6xl w-full max-h-[95vh] overflow-y-auto grid grid-cols-1 lg:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 z-10 bg-black/70 border border-white/20 p-2 hover:border-white" onClick={() => { setActive(null); setParams({}); }} data-testid="close-detail">
              <X size={16} />
            </button>
            <div className="bg-black">
              <img src={active.image} alt={active.title} className="w-full h-full object-contain max-h-[95vh]" />
            </div>
            <div className="p-8 lg:p-10 space-y-6">
              <span className="font-mono-label text-white/40">Concept · {new Date(active.created_at).toLocaleDateString()}</span>
              <h2 className="font-serif-display text-4xl tracking-tighter">{active.title}</h2>
              <p className="text-white/60 text-sm leading-relaxed">{active.prompt}</p>

              <div className="flex flex-wrap gap-2">
                {[active.style, active.color, active.material, active.audience].filter(Boolean).map((t) => (
                  <span key={t} className="chip active">{t}</span>
                ))}
              </div>

              {active.reference && (
                <div>
                  <span className="font-mono-label text-white/40 block mb-2">Reference</span>
                  <img src={active.reference} alt="ref" className="w-32 h-40 object-cover border border-white/10" />
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <span className="font-mono-label text-white/40 block mb-3">Add to mood board</span>
                {collections.length === 0 ? (
                  <p className="text-white/40 text-sm">Create a mood board first.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {collections.map((c) => (
                      <button key={c.id} className="chip" onClick={() => addToCollection(c.id)} data-testid={`add-to-collection-${c.id}`}>
                        <Plus size={12} className="mr-1" /> {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <a href={active.image} download={`${active.title.replace(/\s+/g, "_")}.png`} className="btn-primary" data-testid="detail-download">Download</a>
                <button className="btn-ghost flex items-center gap-2" onClick={() => remove(active.id)} data-testid="detail-delete">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
