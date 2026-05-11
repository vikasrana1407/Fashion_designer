import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Minus } from "lucide-react";
import Header from "@/components/Header";
import api from "@/lib/api";

export default function CollectionDetail() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/collections/${id}`);
      setCollection(res.data.collection);
    } catch {
      toast.error("Failed to load board");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const removeItem = async (designId) => {
    try {
      await api.delete(`/collections/${id}/items`, { data: { design_id: designId } });
      load();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10">
        <Link to="/collections" className="font-mono-label text-white/40 hover:text-white inline-flex items-center gap-2 mb-8" data-testid="back-to-collections">
          <ArrowLeft size={14} /> Back to boards
        </Link>

        {loading ? (
          <div className="flex justify-center py-32"><span className="spin-line" /></div>
        ) : !collection ? (
          <p>Not found.</p>
        ) : (
          <>
            <div className="mb-12">
              <span className="font-mono-label text-white/40">Mood Board</span>
              <h1 className="font-serif-display text-5xl lg:text-6xl tracking-tighter mt-3">{collection.name}</h1>
              {collection.description && <p className="text-white/60 mt-4 max-w-2xl">{collection.description}</p>}
            </div>

            {collection.designs?.length === 0 ? (
              <div className="panel-card p-20 text-center">
                <h3 className="font-serif-display text-3xl mb-3">No items yet</h3>
                <p className="text-white/50 mb-6">Add designs from the archive.</p>
                <Link to="/gallery" className="btn-primary inline-flex">Open Gallery</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-white/10">
                {collection.designs?.map((d) => (
                  <div key={d.id} className="aspect-[3/4] bg-black group relative overflow-hidden" data-testid={`board-item-${d.id}`}>
                    <img src={d.image} alt={d.title} className="w-full h-full object-cover img-editorial" />
                    <button className="absolute top-3 right-3 bg-black/70 border border-white/20 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:border-white" onClick={() => removeItem(d.id)} data-testid={`remove-board-${d.id}`}>
                      <Minus size={12} />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                      <p className="font-serif-display text-base">{d.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
