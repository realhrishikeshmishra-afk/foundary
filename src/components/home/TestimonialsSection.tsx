import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import { useQuery } from "@tanstack/react-query";
import { testimonialsService } from "@/services/testimonials";

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['testimonials', 'published'],
    queryFn: () => testimonialsService.getAll(true),
  });

  if (isLoading || !testimonials || testimonials.length === 0) {
    return null;
  }

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const t = testimonials[current];

  return (
    <section className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-6 max-w-3xl">
        <AnimatedSection className="text-center mb-12">
          <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">Testimonials</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            What Our <span className="text-gradient-gold">Clients Say</span>
          </h2>
        </AnimatedSection>

        <AnimatedSection>
          <div className="bg-gradient-card border border-border rounded-lg p-8 md:p-12 text-center relative">
            <Quote size={32} className="text-primary/20 mx-auto mb-6" />
            <p className="text-lg md:text-xl text-foreground leading-relaxed italic">"{t.review}"</p>
            <div className="mt-8">
              <p className="font-semibold text-foreground">{t.client_name}</p>
              <p className="text-sm text-muted-foreground">{t.designation}</p>
              {t.company && <p className="text-sm text-muted-foreground">{t.company}</p>}
            </div>

            {testimonials.length > 1 && (
              <div className="flex justify-center gap-4 mt-8">
                <button onClick={prev} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary/50 transition-colors">
                  <ChevronLeft size={18} className="text-muted-foreground" />
                </button>
                <button onClick={next} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary/50 transition-colors">
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
