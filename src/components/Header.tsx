import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { settingsService } from "@/services/settings";

const navLinks = [
  { label: "Experts", path: "/" },
  { label: "Network", path: "/network" },
  { label: "Pricing", path: "/pricing" },
  { label: "Home", path: "/home" },
  { label: "Our Story", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "FAQs", path: "/faqs" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoText, setLogoText] = useState("Foundarly");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const settings = await settingsService.getAll();
      const logoTextSetting = settings.find(s => s.setting_key === 'site_logo_text');
      const logoUrlSetting = settings.find(s => s.setting_key === 'site_logo_url');
      
      if (logoTextSetting?.setting_value) setLogoText(logoTextSetting.setting_value);
      if (logoUrlSetting?.setting_value) setLogoUrl(logoUrlSetting.setting_value);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link to="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={logoText} 
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="font-display text-2xl font-bold text-gradient-gold">
              {logoText}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors duration-300 hover:text-primary ${
                location.pathname === link.path
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user && (
            <Link
              to="/my-bookings"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              My Bookings
            </Link>
          )}
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Admin
            </Link>
          )}
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">
                {profile?.full_name || user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
          )}
          <Link to="/apply-consultant">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Become a Consultant
            </Button>
          </Link>
          <Link to="/booking">
            <Button size="sm" className="glow-gold-sm">
              Book a Session
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <nav className="flex flex-col px-6 py-4 gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm py-2 font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/my-bookings"
                  className="text-sm py-2 font-medium text-muted-foreground"
                >
                  My Bookings
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm py-2 font-medium text-muted-foreground"
                >
                  Admin
                </Link>
              )}
              <div className="flex gap-3 pt-3 border-t border-border flex-col">
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground py-2">
                      {profile?.full_name || user.email}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/login" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                  </Link>
                )}
                <Link to="/apply-consultant" className="w-full">
                  <Button variant="outline" size="sm" className="w-full border-primary text-primary">
                    Become a Consultant
                  </Button>
                </Link>
                <Link to="/booking" className="w-full">
                  <Button size="sm" className="w-full">Book a Session</Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
