import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { pricingService, PricingTier } from "@/services/pricing";

export default function PricingPage() {
  const { formatPrice } = useCurrency();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const data = await pricingService.getAll(true); // Only active tiers
      setTiers(data);
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">Pricing</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Invest in <span className="text-gradient-gold">Clarity</span></h1>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Transparent pricing. No hidden fees. Premium value.</p>
          </AnimatedSection>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading pricing...</div>
          ) : tiers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Pricing information coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {tiers.map((tier, i) => (
                <AnimatedSection key={tier.id} delay={i * 0.12}>
                  <div className={`relative bg-gradient-card border rounded-lg p-8 flex flex-col h-full ${
                    tier.is_popular ? "border-primary/40 glow-gold-sm" : "border-border"
                  }`}>
                    {tier.is_popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">Most Popular</span>
                    )}
                    <h3 className="font-display text-xl font-semibold mb-2">{tier.name}</h3>
                    {tier.description && (
                      <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                    )}
                    <p className="text-4xl font-bold text-foreground mb-6">{formatPrice(tier.price)}</p>
                    <ul className="space-y-3 flex-1 mb-8">
                      {tier.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check size={16} className="text-primary mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/booking">
                      <Button className={`w-full ${tier.is_popular ? "glow-gold-sm" : ""}`} variant={tier.is_popular ? "default" : "outline"}>
                        Book Now
                      </Button>
                    </Link>
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
