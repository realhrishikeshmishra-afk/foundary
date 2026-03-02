import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";

export default function ClosingCTASection() {
  return (
    <section className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-6 text-center">
        <AnimatedSection>
          <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto leading-tight">
            Your Next Breakthrough Starts With{" "}
            <span className="text-gradient-gold">One Conversation.</span>
          </h2>
          <p className="mt-6 text-muted-foreground text-lg max-w-xl mx-auto">
            Connect with a verified expert and take the next step in your journey.
          </p>
          <Link to="/booking" className="inline-block mt-10">
            <Button size="lg" className="text-base px-10 py-6 glow-gold animate-glow-pulse">
              Book a Private Session
            </Button>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
