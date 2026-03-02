import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <span className="font-display text-2xl font-bold text-gradient-gold">Foundarly</span>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              By the Founders. For the Founders.
            </p>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold text-foreground mb-4">Platform</h4>
            <div className="flex flex-col gap-2">
              <Link to="/consultants" className="text-sm text-muted-foreground hover:text-primary transition-colors">Explore Experts</Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
              <Link to="/booking" className="text-sm text-muted-foreground hover:text-primary transition-colors">Book a Session</Link>
            </div>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold text-foreground mb-4">Company</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">Our Story</Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link to="/faqs" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQs</Link>
            </div>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold text-foreground mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/faqs" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/faqs" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/faqs" className="text-sm text-muted-foreground hover:text-primary transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Foundarly. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Premium Consulting Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
