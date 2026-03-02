import { ShieldCheck, Video, BadgeCheck, CalendarCheck } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const badges = [
  { icon: ShieldCheck, label: "Secure Online Payments" },
  { icon: Video, label: "Confidential Video Consultations" },
  { icon: BadgeCheck, label: "Verified Expert Profiles" },
  { icon: CalendarCheck, label: "Instant Booking Confirmation" },
];

export default function TrustSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <AnimatedSection>
          <div className="flex flex-wrap justify-center gap-8">
            {badges.map((b) => (
              <div key={b.label} className="flex items-center gap-3 bg-secondary/50 border border-border rounded-full px-6 py-3">
                <b.icon size={18} className="text-primary" />
                <span className="text-sm font-medium text-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
