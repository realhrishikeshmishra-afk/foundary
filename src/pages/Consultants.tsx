import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { consultantsService } from "@/services/consultants";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function ConsultantsPage() {
  const { formatPrice } = useCurrency();
  const [filter, setFilter] = useState("All");

  const { data: consultants, isLoading } = useQuery({
    queryKey: ['consultants', 'active'],
    queryFn: () => consultantsService.getAll(true),
  });

  // Get unique expertise categories
  const categories = ["All", ...(consultants ? Array.from(new Set(consultants.flatMap(c => c.expertise))) : [])];

  const filtered = filter === "All" 
    ? consultants 
    : consultants?.filter((c) => c.expertise.includes(filter));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-12">
            <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">Our Network</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Explore <span className="text-gradient-gold">Experts</span></h1>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Curated professionals ready to guide your next chapter.</p>
          </AnimatedSection>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                  filter === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered?.map((c, i) => (
                <AnimatedSection key={c.id} delay={i * 0.08}>
                  <div className="group bg-gradient-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                      {c.image_url ? (
                        <img
                          src={c.image_url}
                          alt={c.name}
                          className="w-14 h-14 rounded-full border border-border group-hover:border-primary/30 transition-colors object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors">
                          <span className="font-display text-base font-bold text-primary">{getInitials(c.name)}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                        <p className="text-sm text-muted-foreground">{c.title}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.bio}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {c.expertise && c.expertise.length > 0 && (
                          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {c.expertise[0]}
                          </span>
                        )}
                        <p className="mt-2 font-sans font-bold text-foreground">
                          {formatPrice(c.pricing_60)}
                          <span className="text-sm text-muted-foreground font-normal"> / session</span>
                        </p>
                      </div>
                      <Link to="/booking">
                        <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground hover:border-primary">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
