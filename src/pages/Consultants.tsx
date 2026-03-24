import { useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SkeletonGrid } from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { consultantsService } from "@/services/consultants";
import { useCurrency } from "@/contexts/CurrencyContext";
import { BadgeCheck, Sparkles, Star } from "lucide-react";

function Particle({ x, y, size, delay, dur }: { x: string; y: string; size: number; delay: number; dur: number }) {
  return (
    <motion.div className="absolute rounded-full bg-primary/25 pointer-events-none"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ y: [0, -20, 0], opacity: [0.1, 0.45, 0.1] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }} />
  );
}

const PARTICLES = [
  { x: "6%",  y: "20%", size: 5, delay: 0,   dur: 5   },
  { x: "90%", y: "15%", size: 4, delay: 1.2, dur: 6   },
  { x: "80%", y: "65%", size: 6, delay: 2,   dur: 7   },
  { x: "10%", y: "70%", size: 4, delay: 0.6, dur: 5.5 },
  { x: "50%", y: "5%",  size: 3, delay: 1.8, dur: 6.5 },
];

function ConsultantCard({ c, index }: { c: any; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const getDefaultAvatar = (gender?: string) =>
    gender === "female" ? "/female-default.jpg" : "/male-default.png";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index % 3) * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      className="group relative bg-gradient-card border border-border rounded-2xl p-6 overflow-hidden cursor-default"
      style={{ boxShadow: "0 4px 24px -8px hsl(45 100% 50% / 0.06)" }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, hsl(45 100% 50% / 0.07) 0%, transparent 70%)" }} />
      {/* Top accent line */}
      <motion.div className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-primary/60 to-transparent rounded-t-2xl"
        initial={{ width: 0 }} animate={inView ? { width: "60%" } : {}}
        transition={{ duration: 0.7, delay: (index % 3) * 0.1 + 0.3 }} />

      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div className="relative" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
          <img
            src={c.image_url || getDefaultAvatar(c.gender)}
            alt={c.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-border group-hover:border-primary/40 transition-colors duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = "/male-default.png"; }}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
            <BadgeCheck className="h-3 w-3 text-primary" />
          </div>
        </motion.div>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-200">{c.name}</h3>
          <p className="text-xs text-muted-foreground">{c.title}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{c.bio}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {c.expertise?.slice(0, 2).map((tag: string) => (
          <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
            {tag}
          </span>
        ))}
      </div>

      {/* Price + CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="font-display font-bold text-foreground text-lg">
            {formatPrice(c.pricing_60)}
            <span className="text-xs text-muted-foreground font-normal"> / session</span>
          </p>
        </div>
        <Button size="sm" className="glow-gold-sm text-xs" onClick={() => navigate(`/booking?consultant=${c.id}`)}>
          Book Now
        </Button>
      </div>
    </motion.div>
  );
}

export default function ConsultantsPage() {
  const [filter, setFilter] = useState("All");
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [4, -4]);
  const rotateY = useTransform(mouseX, [-300, 300], [-4, 4]);

  const { data: consultants, isLoading } = useQuery({
    queryKey: ["consultants", "active"],
    queryFn: () => consultantsService.getAll(true),
  });

  const categories = ["All", ...(consultants ? Array.from(new Set(consultants.flatMap((c) => c.expertise))) : [])];
  const filtered = filter === "All" ? consultants : consultants?.filter((c) => c.expertise.includes(filter));

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* ── Hero ── */}
      <section
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative pt-36 pb-20 bg-gradient-hero overflow-hidden"
      >
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/6 blur-[120px] pointer-events-none" />
        {/* Rings */}
        {[320, 500, 680].map((s, i) => (
          <motion.div key={s} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 pointer-events-none"
            style={{ width: s, height: s }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.15 - i * 0.04, 0.05, 0.15 - i * 0.04] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }} />
        ))}
        {/* Rotating SVG */}
        <motion.svg className="absolute top-10 right-16 opacity-[0.10] pointer-events-none" width="160" height="160" viewBox="0 0 160 160"
          animate={{ rotate: 360 }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}>
          <circle cx="80" cy="80" r="72" fill="none" stroke="hsl(45,100%,50%)" strokeWidth="1" strokeDasharray="8 6" />
          <circle cx="80" cy="80" r="50" fill="none" stroke="hsl(45,100%,50%)" strokeWidth="0.5" strokeDasharray="4 8" />
        </motion.svg>
        <motion.svg className="absolute bottom-8 left-12 opacity-[0.08] pointer-events-none" width="100" height="100" viewBox="0 0 100 100"
          animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
          <polygon points="50,5 95,75 5,75" fill="none" stroke="hsl(45,100%,50%)" strokeWidth="1.2" />
        </motion.svg>
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/8 mb-7"
            initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">Our Network</span>
          </motion.div>

          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
            <motion.h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}>
              Explore Our{" "}
              <span className="relative inline-block">
                <span className="text-gradient-gold">Experts</span>
                <motion.div className="absolute -bottom-2 left-0 h-[3px] rounded-full bg-gradient-to-r from-primary to-amber-400"
                  initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.9 }} />
              </span>
            </motion.h1>
          </motion.div>

          <motion.p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            Curated professionals ready to guide your next chapter.
          </motion.p>

          {/* Stats row */}
          <motion.div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            {[{ icon: BadgeCheck, label: "Verified Experts" }, { icon: Star, label: "4.9★ Avg Rating" }, { icon: Sparkles, label: "Private Sessions" }].map(({ icon: Icon, label }, i) => (
              <motion.span key={label} className="flex items-center gap-1.5"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.12 }}>
                <Icon size={13} className="text-primary" /> {label}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Filter + Grid ── */}
      <section className="py-16 bg-background relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">

          {/* Filter pills */}
          <motion.div ref={headerRef} className="flex flex-wrap justify-center gap-2.5 mb-12"
            initial={{ opacity: 0, y: 20 }} animate={headerInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
            {categories.map((cat, i) => (
              <motion.button key={cat} onClick={() => setFilter(cat)}
                initial={{ opacity: 0, scale: 0.9 }} animate={headerInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                  filter === cat ? "bg-primary text-primary-foreground border-primary shadow-sm glow-gold-sm" : "bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}>
                {cat}
              </motion.button>
            ))}
          </motion.div>

          {isLoading ? (
            <SkeletonGrid count={6} cols={3} avatar />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered?.map((c, i) => <ConsultantCard key={c.id} c={c} index={i} />)}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
