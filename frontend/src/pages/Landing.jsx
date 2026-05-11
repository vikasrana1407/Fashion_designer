import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

const HERO_MAIN = "https://images.unsplash.com/photo-1762504013915-c1faf57f291b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwyfHxoaWdoJTIwZmFzaGlvbiUyMGVkaXRvcmlhbCUyMHBvcnRyYWl0JTIwZGFya3xlbnwwfHx8fDE3Nzg0NzY3NTV8MA&ixlib=rb-4.1.0&q=85";
const HERO_SEC = "https://images.unsplash.com/photo-1766299231533-27fb998d1a6e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxoaWdoJTIwZmFzaGlvbiUyMGVkaXRvcmlhbCUyMHBvcnRyYWl0JTIwZGFya3xlbnwwfHx8fDE3Nzg0NzY3NTV8MA&ixlib=rb-4.1.0&q=85";
const CONCEPT_1 = "https://images.unsplash.com/photo-1588011025378-15f4778d2558?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxzdHJlZXR3ZWFyJTIwamFja2V0JTIwYmxhY2t8ZW58MHx8fHwxNzc4NDc2NzcwfDA&ixlib=rb-4.1.0&q=85";
const CONCEPT_2 = "https://images.unsplash.com/photo-1771736825285-b46748f03a86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxzdHJlZXR3ZWFyJTIwamFja2V0JTIwYmxhY2t8ZW58MHx8fHwxNzc4NDc2NzcwfDA&ixlib=rb-4.1.0&q=85";
const CONCEPT_3 = "https://images.unsplash.com/photo-1775805043566-e43546873ede?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHw0fHxzdHJlZXR3ZWFyJTIwamFja2V0JTIwYmxhY2t8ZW58MHx8fHwxNzc4NDc2NzcwfDA&ixlib=rb-4.1.0&q=85";
const FABRIC_GOLD = "https://images.pexels.com/photos/2248589/pexels-photo-2248589.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const FABRIC_EMBR = "https://images.unsplash.com/photo-1758278212585-c050f6ee5742?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZmFicmljJTIwZ29sZCUyMGJsYWNrfGVufDB8fHx8MTc3ODQ3Njc3MHww&ixlib=rb-4.1.0&q=85";
const SKETCH = "https://images.unsplash.com/photo-1761746395622-5f7e0e7b4ec7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwaWxsdXN0cmF0aW9uJTIwc2tldGNofGVufDB8fHx8MTc3ODQ3Njc3MHww&ixlib=rb-4.1.0&q=85";
const INSPIRATION = "https://images.unsplash.com/photo-1720031995243-dc267089f662?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwaWxsdXN0cmF0aW9uJTIwc2tldGNofGVufDB8fHx8MTc3ODQ3Njc3MHww&ixlib=rb-4.1.0&q=85";

export default function Landing() {
  const { user } = useAuth();
  const ctaTo = user ? "/studio" : "/register";

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero — Tetris asymmetric */}
      <section className="max-w-[1600px] mx-auto px-8 lg:px-12 pt-16 pb-24">
        <div className="grid grid-cols-12 gap-6 lg:gap-10">
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-end">
            <span className="font-mono-label text-white/40 mb-8 fade-up" data-testid="hero-overline">
              · A.I COUTURE · EST. 2026
            </span>
            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-[7rem] leading-[0.95] tracking-tighter text-white fade-up">
              Design the <em className="italic text-[#D4AF37]">unwearable</em>,<br/>
              then make it real.
            </h1>
            <p className="mt-10 max-w-xl text-white/60 text-base leading-relaxed fade-up" style={{ animationDelay: "0.2s" }}>
              Upload a reference, whisper a prompt, and let our atelier generate
              editorial-grade fashion concepts in seconds. From streetwear to haute
              couture — your studio, on demand.
            </p>
            <div className="mt-12 flex flex-wrap gap-4 fade-up" style={{ animationDelay: "0.35s" }}>
              <Link to={ctaTo} className="btn-primary" data-testid="hero-primary-cta">
                Enter the Atelier →
              </Link>
              <Link to="/login" className="btn-ghost" data-testid="hero-secondary-cta">
                Sign in
              </Link>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4 lg:gap-6">
            <div className="col-span-2 aspect-[4/5] overflow-hidden fade-up group" style={{ animationDelay: "0.15s" }}>
              <img src={HERO_MAIN} alt="" className="w-full h-full object-cover img-editorial" />
            </div>
            <div className="aspect-square overflow-hidden fade-up group" style={{ animationDelay: "0.3s" }}>
              <img src={FABRIC_GOLD} alt="" className="w-full h-full object-cover img-editorial" />
            </div>
            <div className="aspect-square overflow-hidden fade-up group" style={{ animationDelay: "0.45s" }}>
              <img src={HERO_SEC} alt="" className="w-full h-full object-cover img-editorial" />
            </div>
          </div>
        </div>
      </section>

      {/* Capability strip */}
      <section className="border-y border-white/10 py-6 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-12 flex flex-wrap items-center justify-between gap-y-4 gap-x-12">
          {[
            "01 · Image-to-Image",
            "02 · Material Swap",
            "03 · Color Variations",
            "04 · Outfit Compositions",
            "05 · Mood Boards",
          ].map((t) => (
            <span key={t} className="font-mono-label text-white/40">{t}</span>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-[1600px] mx-auto px-8 lg:px-12 py-32">
        <div className="grid grid-cols-12 gap-10 mb-20">
          <div className="col-span-12 lg:col-span-5">
            <span className="font-mono-label text-white/40">The Method</span>
            <h2 className="font-serif-display text-5xl lg:text-6xl mt-6 tracking-tighter leading-[1]">
              Three gestures.<br/>
              <em className="italic text-[#D4AF37]">Infinite</em> silhouettes.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:pl-20 flex items-end">
            <p className="text-white/60 leading-relaxed text-lg">
              Built for designers, stylists, and creative directors who want to
              move from inspiration to a finished concept image without leaving
              the page. Trained on the language of fashion editorials.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10">
          {[
            {
              n: "01",
              title: "Reference",
              body: "Drop in a jacket photo, a fabric swatch, or a runway still. Anything that holds your direction.",
              img: SKETCH,
            },
            {
              n: "02",
              title: "Prompt",
              body: "Describe the transformation. \"Luxury minimal · women's tailoring · black & gold · matte silk.\"",
              img: FABRIC_EMBR,
            },
            {
              n: "03",
              title: "Render",
              body: "Receive an editorial-grade concept. Iterate, vary, save to a mood board, or compose a full outfit.",
              img: INSPIRATION,
            },
          ].map((step) => (
            <div key={step.n} className="bg-[#0A0A0C] p-10 group">
              <div className="flex items-baseline justify-between mb-12">
                <span className="font-mono-label text-[#D4AF37]">Step · {step.n}</span>
                <span className="font-serif-display text-5xl text-white/10">{step.n}</span>
              </div>
              <h3 className="font-serif-display text-3xl mb-4">{step.title}</h3>
              <p className="text-white/55 leading-relaxed mb-8 text-sm">{step.body}</p>
              <div className="aspect-[4/3] overflow-hidden">
                <img src={step.img} alt="" className="w-full h-full object-cover img-editorial" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Concept gallery */}
      <section className="max-w-[1600px] mx-auto px-8 lg:px-12 py-32">
        <div className="flex items-end justify-between mb-16">
          <div>
            <span className="font-mono-label text-white/40">Selected Concepts</span>
            <h2 className="font-serif-display text-5xl lg:text-6xl mt-6 tracking-tighter">
              From the <em className="italic">house</em> archives.
            </h2>
          </div>
          <Link to={ctaTo} className="font-mono-label text-white/60 hover:text-white hidden md:block">
            See full archive →
          </Link>
        </div>
        <div className="grid grid-cols-12 gap-px bg-white/10">
          <div className="col-span-12 md:col-span-6 lg:col-span-4 aspect-[3/4] overflow-hidden group bg-black">
            <img src={CONCEPT_1} alt="" className="w-full h-full object-cover img-editorial" />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-5 aspect-[3/4] overflow-hidden group bg-black">
            <img src={CONCEPT_2} alt="" className="w-full h-full object-cover img-editorial" />
          </div>
          <div className="col-span-12 lg:col-span-3 aspect-[3/4] overflow-hidden group bg-black">
            <img src={CONCEPT_3} alt="" className="w-full h-full object-cover img-editorial" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1600px] mx-auto px-8 lg:px-12 py-32 border-t border-white/10">
        <div className="grid grid-cols-12 gap-10 items-center">
          <div className="col-span-12 lg:col-span-8">
            <h2 className="font-serif-display text-5xl lg:text-7xl tracking-tighter leading-none">
              Your atelier opens<br/>at <em className="italic text-[#D4AF37]">midnight</em>.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-4 flex lg:justify-end">
            <Link to={ctaTo} className="btn-primary text-base" data-testid="footer-cta">
              Begin a Session →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="max-w-[1600px] mx-auto px-8 lg:px-12 flex flex-wrap justify-between gap-4">
          <span className="font-mono-label text-white/30">© Atelier Noir · MMXXVI</span>
          <span className="font-mono-label text-white/30">Powered by Gemini Nano Banana</span>
        </div>
      </footer>
    </div>
  );
}
