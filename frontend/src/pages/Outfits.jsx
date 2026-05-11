import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Check } from "lucide-react";
import Header from "@/components/Header";
import api from "@/lib/api";

export default function Outfits() {
  const [outfits, setOutfits] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [o, d] = await Promise.all([api.get("/outfits"), api.get("/designs")]);
      setOutfits(o.data.outfits);
      setDesigns(d.data.designs);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = (id) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim() || selected.length === 0) {
      toast.error("Name and at least one design required");
      return;
    }
    try {
      await api.post("/outfits", { name, design_ids: selected });
      toast.success("Outfit composed");
      setName(""); setSelected([]); setShowCreate(false);
      load();
    } catch (err) { toast.error(err?.response?.data?.detail || "Failed"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete outfit?")) return;
    try { await api.delete(`/outfits/${id}`); load(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
        <div className="flex items-baseline justify-between mb-10">
          <div>
            <span className="font-mono-label text-white/40">Composition</span>
            <h1 className="font-serif-display text-5xl lg:text-6xl tracking-tighter mt-3">
              <em className="italic text-[#D4AF37]">Outfit</em> builder.
            </h1>
          </div>
          <button className="btn-primary" onClick={() => setShowCreate(!showCreate)} data-testid="new-outfit-btn">
            <Plus size={14} /> {showCreate ? "Close" : "New Outfit"}
          </button>
        </div>

        {showCreate && (
          <form onSubmit={create} className="panel-card p-8 mb-12 space-y-6">
            <div>
              <label className="font-mono-label text-white/40 block mb-2">Outfit name</label>
              <input className="input-line max-w-md" value={name} onChange={(e) => setName(e.target.value)} placeholder="Friday · Black Tie" required data-testid="new-outfit-name" />
            </div>
            <div>
              <label className="font-mono-label text-white/40 block mb-3">Pick pieces ({selected.length} selected)</label>
              {designs.length === 0 ? (
                <p className="text-white/40 text-sm">No designs yet. Generate some first.</p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-px bg-white/10">
                  {designs.map((d) => {
                    const isSel = selected.includes(d.id);
                    return (
                      <button type="button" key={d.id} onClick={() => toggle(d.id)} className={`aspect-[3/4] bg-black relative overflow-hidden ${isSel ? "ring-2 ring-white" : ""}`} data-testid={`pick-${d.id}`}>
                        <img src={d.image} alt="" className="w-full h-full object-cover" />
                        {isSel && (
                          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                            <div className="bg-white text-black p-1"><Check size={14} /></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary" data-testid="submit-outfit">Compose</button>
              <button type="button" className="btn-ghost" onClick={() => { setShowCreate(false); setSelected([]); setName(""); }}>Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-32"><span className="spin-line" /></div>
        ) : outfits.length === 0 ? (
          <div className="panel-card p-20 text-center">
            <h3 className="font-serif-display text-4xl mb-3">No outfits yet</h3>
            <p className="text-white/50">Compose your first head-to-toe look.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {outfits.map((o) => (
              <div key={o.id} className="panel-card p-6" data-testid={`outfit-${o.id}`}>
                <div className="flex items-baseline justify-between mb-6">
                  <div>
                    <h3 className="font-serif-display text-3xl tracking-tight">{o.name}</h3>
                    <p className="font-mono-label text-white/40 mt-1">{o.designs?.length || 0} pieces · {new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => remove(o.id)} className="text-white/30 hover:text-white" data-testid={`delete-outfit-${o.id}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex gap-px bg-white/10 overflow-x-auto">
                  {o.designs?.map((d) => (
                    <div key={d.id} className="bg-black aspect-[3/4] w-48 flex-shrink-0">
                      <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
