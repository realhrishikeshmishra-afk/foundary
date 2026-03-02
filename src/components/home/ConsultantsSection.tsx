import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import { useQuery } from "@tanstack/react-query";
import { consultantsService } from "@/services/consultants";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function ConsultantsSection() {
  const { formatPrice } = useCurrency();
  const { data: consultants, isLoading } = useQuery({
    queryKey: ['consultants', 'active'],
    queryFn: () => consultantsService.getAll(true),
  });

  if (isLoading) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </section>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">Featured</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Meet Our <span className="text-gradient-gold">Experts</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {consultants?.slice(0, 4).map((c, i) => (
            <AnimatedSection key={c.id} delay={i * 0.1}>
              <div className="group bg-gradient-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center">
                {c.image_url ? (
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="w-20 h-20 rounded-full mb-4 border border-border group-hover:border-primary/30 transition-colors object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4 border border-border group-hover:border-primary/30 transition-colors">
                    <span className="font-display text-lg font-bold text-primary">{getInitials(c.name)}</span>
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold">{c.name}</h3>
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
                <Link to="/booking" className="mt-4 w-full">
                  <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                    Book Now
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
