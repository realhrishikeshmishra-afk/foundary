import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { consultantsService } from "@/services/consultants";
import { useCurrency } from "@/contexts/CurrencyContext";
import { SkeletonGrid } from "@/components/PageLoader";

export default function ConsultantsSection() {
  const { formatPrice } = useCurrency();
  const { data: consultants, isLoading } = useQuery({
    queryKey: ['consultants', 'active'],
    queryFn: () => consultantsService.getAll(true),
  });

  const getDefaultAvatar = (gender?: string) =>
    gender === 'female' ? '/female-default.jpg' : '/male-default.png';

  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="h-3 bg-muted rounded-full w-24 mx-auto mb-3" />
            <div className="h-8 bg-muted rounded-full w-56 mx-auto" />
          </div>
          <SkeletonGrid count={4} cols={4} avatar />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Dot grid */}
      <svg className="absolute bottom-0 left-0 w-64 h-64 opacity-[0.04] pointer-events-none" viewBox="0 0 200 200">
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => (
            <circle key={`${row}-${col}`} cx={col * 25 + 12} cy={row * 25 + 12} r="2" fill="hsl(45,100%,50%)" />
          ))
        )}
      </svg>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">Featured</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Meet Our <span className="text-gradient-gold">Experts</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {consultants?.slice(0, 4).map((c, i) => (
            <motion.div
              key={c.id}
              className="group bg-gradient-card border border-border rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8, boxShadow: "0 24px 48px -12px hsl(45 100% 50% / 0.2)" }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

              {/* Avatar with ring animation */}
              <motion.div
                className="relative mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                />
                <img
                  src={c.image_url || getDefaultAvatar(c.gender)}
                  alt={c.name}
                  className="w-20 h-20 rounded-full border-2 border-border group-hover:border-primary/40 transition-colors object-cover relative z-10"
                />
              </motion.div>

              <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">{c.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{c.title}</p>

              {c.expertise && c.expertise.length > 0 && (
                <span className="inline-block mt-3 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {c.expertise[0]}
                </span>
              )}

              <p className="mt-4 font-sans text-lg font-bold text-foreground">
                {formatPrice(c.pricing_60)}
                <span className="text-sm text-muted-foreground font-normal"> / session</span>
              </p>

              <Link to={`/booking?consultant=${c.id}`} className="mt-4 w-full relative z-10">
                <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  Book Now
                </Button>
              </Link>

              {/* Bottom accent */}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"
                initial={{ width: 0 }}
                whileInView={{ width: "50%" }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.5, duration: 0.8 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
