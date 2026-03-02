import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { consultantsService } from "@/services/consultants";
import { bookingsService } from "@/services/bookings";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function BookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    consultant_id: "",
    date: "",
    time: "",
    message: "",
    session_duration: 60, // Default to 60 minutes
  });
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
  
  const { user, profile, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to book a session");
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch active consultants (must be before useEffect that uses it)
  const { data: consultants, isLoading } = useQuery({
    queryKey: ['consultants', 'active'],
    queryFn: () => consultantsService.getAll(true),
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (user && profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user, profile]);

  // Update selected consultant when consultant_id changes
  useEffect(() => {
    if (formData.consultant_id && consultants) {
      const consultant = consultants.find(c => c.id === formData.consultant_id);
      setSelectedConsultant(consultant);
    } else {
      setSelectedConsultant(null);
    }
  }, [formData.consultant_id, consultants]);

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: bookingsService.create,
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Your consultation request has been submitted.");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit booking");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to book a session");
      navigate('/login');
      return;
    }
    
    if (!formData.consultant_id) {
      toast.error("Please select a consultant");
      return;
    }

    // Calculate price based on duration
    const sessionPrice = formData.session_duration === 30 
      ? selectedConsultant?.pricing_30 
      : selectedConsultant?.pricing_60;

    createBooking.mutate({
      user_id: user.id, // Always use authenticated user's ID
      consultant_id: formData.consultant_id,
      name: formData.name,
      email: formData.email,
      date: formData.date,
      time: formData.time,
      message: formData.message || null,
      session_duration: formData.session_duration,
      session_price: sessionPrice,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-24">
          <div className="container mx-auto px-6">
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <AnimatedSection className="text-center mb-12">
            <p className="text-primary text-sm font-semibold tracking-[0.15em] uppercase mb-3">Book a Session</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Schedule Your <span className="text-gradient-gold">Consultation</span></h1>
          </AnimatedSection>

          {submitted ? (
            <AnimatedSection>
              <div className="bg-gradient-card border border-primary/20 rounded-lg p-12 text-center">
                <h2 className="font-display text-2xl font-bold mb-4 text-gradient-gold">Request Submitted</h2>
                <p className="text-muted-foreground">Your consultation request has been successfully submitted. Our team will confirm shortly.</p>
                <Button 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      consultant_id: "",
                      date: "",
                      time: "",
                      message: "",
                      session_duration: 60,
                    });
                  }}
                  variant="outline"
                  className="mt-6"
                >
                  Book Another Session
                </Button>
              </div>
            </AnimatedSection>
          ) : (
            <AnimatedSection>
              <form onSubmit={handleSubmit} className="bg-gradient-card border border-border rounded-lg p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                    <Input 
                      required 
                      placeholder="John Doe" 
                      className="bg-secondary border-border"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                    <Input 
                      required 
                      type="email" 
                      placeholder="john@example.com" 
                      className="bg-secondary border-border"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Consultant</label>
                  {isLoading ? (
                    <div className="bg-secondary border border-border rounded-md p-3 text-sm text-muted-foreground">
                      Loading consultants...
                    </div>
                  ) : (
                    <Select value={formData.consultant_id} onValueChange={(value) => handleChange('consultant_id', value)}>
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue placeholder="Choose an expert" />
                      </SelectTrigger>
                      <SelectContent>
                        {consultants?.map((consultant) => (
                          <SelectItem key={consultant.id} value={consultant.id}>
                            {consultant.name} - {consultant.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Session Duration Selection */}
                {selectedConsultant && (
                  <div className="bg-secondary/30 border border-border rounded-lg p-4">
                    <label className="text-sm font-medium text-foreground mb-3 block">Select Session Duration</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, session_duration: 30 }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.session_duration === 30
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-semibold text-foreground">30 Minutes</div>
                          <div className="text-2xl font-bold text-primary mt-1">
                            {formatPrice(selectedConsultant.pricing_30)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Quick consultation</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, session_duration: 60 }))}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.session_duration === 60
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-left">
                          <div className="font-semibold text-foreground">60 Minutes</div>
                          <div className="text-2xl font-bold text-primary mt-1">
                            {formatPrice(selectedConsultant.pricing_60)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Deep-dive session</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Preferred Date</label>
                    <Input 
                      required 
                      type="date" 
                      className="bg-secondary border-border"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Preferred Time</label>
                    <Input 
                      required 
                      type="time" 
                      className="bg-secondary border-border"
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Message (optional)</label>
                  <Textarea 
                    placeholder="Tell us about your goals..." 
                    className="bg-secondary border-border min-h-[100px]"
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full glow-gold-sm"
                  disabled={createBooking.isPending}
                >
                  {createBooking.isPending ? "Submitting..." : "Book Session"}
                </Button>

                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground pt-2">
                  <Shield size={14} className="text-primary" />
                  <span>Secure payment · Refund policy applies · Your data is confidential</span>
                </div>
              </form>
            </AnimatedSection>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
