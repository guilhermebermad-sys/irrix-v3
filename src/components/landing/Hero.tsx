import { Link } from "react-router-dom";
import { Play, Droplets, ArrowRight, CheckCircle2, AlertTriangle, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

// Vídeo local: pivô central irrigando lavoura (vista aérea)
const VIDEO_SRC = "/videos/irrigation.mp4";
const VIDEO_POSTER = "/videos/irrigation.mp4"; // o próprio mp4 serve de poster (1º frame)

export function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Parallax (desktop only)
  useEffect(() => {
    if (isMobile) return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  // Pause video when off-screen
  useEffect(() => {
    if (!videoRef.current || !sectionRef.current) return;
    const el = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Animated gradient fallback */}
      <div
        className={`absolute inset-0 z-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 animate-gradient-slow transition-opacity duration-1000 ${videoLoaded && !isMobile ? "opacity-0" : "opacity-100"}`}
      />

      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {isMobile ? (
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${VIDEO_POSTER})` }} />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={VIDEO_POSTER}
            onCanPlay={() => setVideoLoaded(true)}
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          >
            {/* Vídeo local: pivô central irrigando lavoura (vista aérea) */}
            <source src={VIDEO_SRC} type="video/mp4" />
            Seu navegador não suporta vídeo.
          </video>
        )}
      </div>

      {/* Cinematic dark overlay — garante legibilidade sobre o vídeo */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-emerald-950/50 to-black/70" />

      {/* Animated Ripples */}
      <div className="absolute z-10 top-1/4 left-1/4 w-px h-px bg-primary/20 rounded-full animate-ripples" style={{ animationDelay: "0s" }} />
      <div className="absolute z-10 top-3/4 right-1/4 w-px h-px bg-secondary/20 rounded-full animate-ripples" style={{ animationDelay: "2s" }} />

      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-16 items-center pt-20">
        <div className="text-left">
          <div className="animate-hero-slide-down inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-white text-xs font-black uppercase tracking-[0.2em] mb-8">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
             </span>
             Agritech 4.0 • Inteligência Hídrica
          </div>
          
          <h1 className="animate-hero-scale-up font-display font-black text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] mb-8 tracking-tighter">
            Precisão em cada <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500">gota.</span>
          </h1>

          <p className="animate-hero-slide-up text-lg md:text-xl text-slate-200 max-w-xl leading-relaxed mb-10 font-medium" style={{ animationDelay: "400ms" }}>
            Transforme seu manejo de irrigação com inteligência de dados. 
            Cálculos automáticos de Kc e balanço hídrico real para 
            maximizar produtividade e economizar até 40% de água.
          </p>

          <div className="animate-hero-slide-up flex flex-wrap gap-4 mt-8" style={{ animationDelay: "800ms" }}>
            <Link to="/cadastro"
              className="cta-shimmer px-8 py-4 rounded-xl font-bold text-white text-lg inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/40"
              style={{ background: "var(--gradient-brand)", animation: "cta-pulse 2.5s ease-in-out infinite" }}>
              Começar Agora — Grátis <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#como-funciona"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-8 py-4 rounded-xl font-bold text-lg text-white inline-flex items-center gap-2 transition-all">
              <Play className="w-5 h-5 fill-white" /> Ver Demonstração
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            <MiniStat icon="💧" target={40} suffix="%" label="Economia de Água" delay={1000} />
            <MiniStat icon="🌱" target={15} suffix="%" label="Aumento de Produtividade" delay={1150} />
            <MiniStat icon="⚡" target={100} suffix="%" label="Automatizado" delay={1300} />
          </div>
        </div>

        <div ref={mockupRef} className="animate-hero-slide-left hidden lg:block" style={{ animationDelay: "1200ms" }}>
          <Mockup />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ icon, target, suffix, label, delay }: { icon: string; target: number; suffix: string; label: string; delay: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => {
          let start = 0;
          const duration = target > 90 ? 2000 : 1500;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else setCount(Math.floor(start));
          }, 16);
        }, delay);
        observer.unobserve(ref.current!);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, delay]);

  return (
    <div ref={ref} className="animate-hero-fade bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-2xl" style={{ animationDelay: `${delay}ms` }}>
      <span className="text-2xl block mb-2">{icon}</span>
      <div className="font-display font-black text-2xl text-white">{count}{suffix}</div>
      <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">{label}</span>
    </div>
  );
}

function Mockup() {
  return (
    <div className="relative perspective-1000">
      <div className="bg-slate-900/90 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl"
           style={{ animation: "float-dashboard 6s ease-in-out infinite" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Live Monitor • Talhão A1</div>
            <div className="font-display font-bold text-2xl text-white">Balanço Hídrico</div>
          </div>
          <div className="bg-emerald-500/20 px-4 py-2 rounded-full text-xs font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Estável
          </div>
        </div>

        <div className="flex items-center gap-8 mb-8">
          <Gauge value={68} />
          <div className="flex-1 grid grid-cols-1 gap-3">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
               <span className="text-[9px] uppercase font-bold text-white/40 block mb-1">Lâmina Líquida</span>
               <span className="text-xl font-black text-white">6.2 mm</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
               <span className="text-[9px] uppercase font-bold text-white/40 block mb-1">Precipitação</span>
               <span className="text-xl font-black text-cyan-400">12.0 mm</span>
            </div>
          </div>
        </div>

        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
          <div className="flex items-end justify-between gap-2 h-32">
            {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg transition-all duration-1000" style={{
                  height: `${h}%`,
                  background: "linear-gradient(to top, #10b981, #06b6d4)",
                  boxShadow: "0 0 15px rgba(16,185,129,0.3)"
                }} />
                <span className="text-[9px] font-bold text-white/30 uppercase">D{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Cards */}
      <div className="absolute -top-10 -left-10 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl"
           style={{ animation: "float-card-1 4s ease-in-out infinite" }}>
        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
          <Droplets className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-white/40 block">ET₀ Diária</span>
          <span className="text-lg font-black text-white">5.42 mm</span>
        </div>
      </div>

      <div className="absolute -bottom-10 -right-6 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl"
           style={{ animation: "float-card-2 5s ease-in-out infinite", animationDelay: "1s" }}>
        <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <span className="text-[9px] uppercase font-bold text-white/40 block">Tempo Rega</span>
          <span className="text-lg font-black text-white">2h 15min</span>
        </div>
      </div>

      <div className="absolute top-1/2 -right-12 bg-amber-500/20 backdrop-blur-xl p-4 rounded-2xl border border-amber-500/30 flex items-center gap-3 shadow-xl"
           style={{ animation: "float-card-3 3.5s ease-in-out infinite", animationDelay: "0.5s" }}>
        <AlertTriangle className="w-6 h-6 text-amber-500" />
        <span className="text-xs font-black text-white uppercase tracking-tighter">Atenção: Solo 32% CAD</span>
      </div>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="none" />
        <circle cx="50" cy="50" r={r} stroke="url(#hero-gauge-grad)" strokeWidth="10" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-1000" />
        <defs>
          <linearGradient id="hero-gauge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-black text-2xl text-white">{value}%</div>
        <div className="text-[8px] font-black uppercase text-white/40 tracking-widest">Soil CAD</div>
      </div>
    </div>
  );
}
