import { UserSearch, CalendarCheck, CreditCard, Video } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const steps = [
  { icon: UserSearch, title: "Choose Your Expert", description: "Browse curated profiles and select the right consultant." },
  { icon: CalendarCheck, title: "Book Your Session", description: "Pick a date and time that works for your schedule." },
  { icon: CreditCard, title: "Secure Payment", description: "Complete your booking with our encrypted payment flow." },
  { icon: Video, title: "Join Your Session", description: "Connect via private video for your consultation." },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">How It Works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            From Booking to <span className="text-gradient-gold">Breakthrough</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, i) => (
            <AnimatedSection key={step.title} delay={i * 0.12}>
              <div className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                  <step.icon size={28} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary/60 tracking-widest uppercase">Step {i + 1}</span>
                <h3 className="font-display text-lg font-semibold mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
