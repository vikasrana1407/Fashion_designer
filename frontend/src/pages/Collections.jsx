import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import api from "@/lib/api";

export default function Collections() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [designsById, setDesignsById] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [c, d] = await Promise.all([api.get("/collections"), api.get("/designs")]);
      setItems(c.data.collections);
      const map = {};
      d.data.designs.forEach((x) => { map[x.id] = x; });
      setDesignsById(map);
    } catch {
      toast.error("Failed to load mood boards");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await api.post("/collections", form);
      setForm({ name: "", description: "" });
      setShowCreate(false);
      toast.success("Mood board created");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this mood board?")) return;
    try {
      await api.delete(`/collections/${id}`);
      toast.success("Deleted");
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <span className="font-mono-label text-white/40">Curation</span>
            <h1 className="font-serif-display text-5xl lg:text-6xl tracking-tighter mt-3">
              <em className="italic text-[#D4AF37]">Mood</em> boards.
            </h1>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(true)} data-testid="new-collection-btn">
            <Plus size={14} /> New Board
          </button>
        </div>

        {showCreate && (
          <form onSubmit={create} className="panel-card p-8 mb-10 space-y-6 max-w-xl">
            <div>
              <label className="font-mono-label text-white/40 block mb-2">Name</label>
              <input className="input-line" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="SS26 · Black Ritual" required data-testid="new-collection-name" />
            </div>
            <div>
              <label className="font-mono-label text-white/40 block mb-2">Description</label>
              <input className="input-line" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A meditation in tailored darkness." data-testid="new-collection-desc" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" data-testid="submit-new-collection">Create</button>
              <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)} data-testid="cancel-new-collection">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-32"><span className="spin-line" /></div>
        ) : items.length === 0 ? (
          <div className="panel-card p-20 text-center">
            <h3 className="font-serif-display text-4xl mb-3">No mood boards yet</h3>
            <p className="text-white/50">Group concepts into curated stories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {items.map((c) => {
              const previews = (c.design_ids || []).slice(0, 4).map((id) => designsById[id]).filter(Boolean);
              return (
                <Link to={`/collections/${c.id}`} key={c.id} className="bg-[#0A0A0C] p-6 group hover:bg-[#121215] transition-colors" data-testid={`collection-card-${c.id}`}>
                  <div className="grid grid-cols-2 gap-1 aspect-square bg-black mb-6">
                    {previews.length === 0 ? (
                      <div className="col-span-2 flex items-center justify-center text-white/30 font-mono-label">Empty board</div>
                    ) : (
                      previews.map((d, i) => (
                        <img key={d.id} src={d.image} alt="" className={`w-full h-full object-cover ${previews.length === 1 ? "col-span-2 row-span-2" : ""}`} />
                      ))
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif-display text-2xl tracking-tight">{c.name}</h3>
                      <p className="font-mono-label text-white/40 mt-1">{c.design_ids?.length || 0} items</p>
                    </div>
                    <button onClick={(e) => { e.preventDefault(); remove(c.id); }} className="text-white/30 hover:text-white" data-testid={`delete-collection-${c.id}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {c.description && <p className="text-white/50 text-sm mt-3 line-clamp-2">{c.description}</p>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
