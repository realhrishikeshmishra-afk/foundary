import { Rocket, BarChart3, Sparkles } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const services = [
  {
    icon: Rocket,
    title: "Career Acceleration",
    description: "Navigate career transitions, negotiate leadership roles, and build a strategic path to your next milestone.",
  },
  {
    icon: BarChart3,
    title: "Business Strategy",
    description: "Refine your business model, optimize operations, and build scalable strategies with seasoned entrepreneurs.",
  },
  {
    icon: Sparkles,
    title: "Personal Growth",
    description: "Develop executive presence, overcome limiting beliefs, and cultivate the mindset of high-performing leaders.",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">What We Offer</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Focused Consulting. <span className="text-gradient-gold">Real Results.</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <AnimatedSection key={service.title} delay={i * 0.15}>
              <div className="group relative bg-gradient-card border border-border rounded-lg p-8 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <service.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
