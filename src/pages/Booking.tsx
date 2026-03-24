import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, CheckCircle, CreditCard, Lock, Sparkles, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { consultantsService } from "@/services/consultants";
import { bookingsService } from "@/services/bookings";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { initiateRazorpayPayment } from "@/services/razorpay";
import { emailService } from "@/services/email";
import { PageLoader } from "@/components/PageLoader";

function Particle({ x, y, size, delay, dur }: { x: string; y: string; size: number; delay: number; dur: number }) {
  return (
    <motion.div className="absolute rounded-full bg-primary/25 pointer-events-none"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ y: [0, -18, 0], opacity: [0.1, 0.4, 0.1] }}
      transition={{ duration: dur, delay, repeat: Infinity, ease: "easeInOut" }} />
  );
}

const PARTICLES = [
  { x: "5%",  y: "25%", size: 5, delay: 0,   dur: 5.5 },
  { x: "92%", y: "18%", size: 4, delay: 1.3, dur: 6   },
  { x: "85%", y: "70%", size: 6, delay: 2.1, dur: 7   },
  { x: "8%",  y: "72%", size: 3, delay: 0.7, dur: 5   },
];

export default function BookingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", consultant_id: "", date: "", time: "", message: "", session_duration: 60 });
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);

  const { user, profile, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [4, -4]);
  const rotateY = useTransform(mouseX, [-300, 300], [-4, 4]);
  const formRef = useRef<HTMLDivElement>(null);
  const formInView = useInView(formRef, { once: true, margin: "-60px" });

  useEffect(() => {
    if (!authLoading && !user) { toast.error("Please login to book a session"); navigate("/login"); }
  }, [user, authLoading, navigate]);

  const { data: consultants, isLoading } = useQuery({
    queryKey: ["consultants", "active"],
    queryFn: () => consultantsService.getAll(true),
  });

  useEffect(() => {
    if (user && profile) setFormData(prev => ({ ...prev, name: profile.full_name || "", email: user.email || "" }));
  }, [user, profile]);

  useEffect(() => {
    const id = searchParams.get("consultant");
    if (id && consultants) {
      const found = consultants.find(c => c.id === id);
      if (found) { setFormData(prev => ({ ...prev, consultant_id: id })); setSelectedConsultant(found); }
    }
  }, [consultants, searchParams]);

  useEffect(() => {
    if (formData.consultant_id && consultants) setSelectedConsultant(consultants.find(c => c.id === formData.consultant_id) || null);
    else setSelectedConsultant(null);
  }, [formData.consultant_id, consultants]);

  const sessionPrice = formData.session_duration === 30 ? selectedConsultant?.pricing_30 : selectedConsultant?.pricing_60;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please login"); navigate("/login"); return; }
    if (!formData.consultant_id) { toast.error("Please select a consultant"); return; }
    if (!formData.date || !formData.time) { toast.error("Please select a date and time"); return; }
    setPaymentProcessing(true);
    try {
      const booking = await bookingsService.create({
        user_id: user.id, consultant_id: formData.consultant_id, name: formData.name, email: formData.email,
        date: formData.date, time: formData.time, message: formData.message || null,
        session_duration: formData.session_duration, session_price: sessionPrice, payment_status: "pending", status: "pending",
      });
      await initiateRazorpayPayment({
        amount: sessionPrice || 0, currency: "INR", bookingId: booking.id,
        consultantName: selectedConsultant?.name || "", sessionDuration: formData.session_duration,
        userName: formData.name, userEmail: formData.email,
        onSuccess: async () => {
          await bookingsService.update(booking.id, { payment_status: "paid", status: "confirmed", meeting_room_id: `foundarly-${booking.id}` });
          
          // Send confirmation emails (non-blocking)
          emailService.sendBookingConfirmation(booking.id).catch(err => {
            console.error('Failed to send confirmation emails:', err);
            // Don't show error to user - booking is still successful
          });
          
          toast.success("Payment successful! Booking confirmed.");
          setSubmitted(true); setPaymentProcessing(false);
        },
        onFailure: async (error) => {
          await bookingsService.delete(booking.id);
          if (error?.message !== "Payment cancelled by user") toast.error(error?.description || "Payment failed.");
          else toast.info("Payment cancelled.");
          setPaymentProcessing(false);
        },
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to process booking.");
      setPaymentProcessing(false);
    }
  };

  if (authLoading) return <PageLoader text="Loading..." />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* ── Hero ── */}
      <section ref={containerRef} onMouseMove={handleMouseMove}
        className="relative pt-36 pb-16 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-primary/6 blur-[120px] pointer-events-none" />
        {[300, 480, 640].map((s, i) => (
          <motion.div key={s} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 pointer-events-none"
            style={{ width: s, height: s }}
            animate={{ scale: [1, 1.05, 1], opacity: [0.15 - i * 0.04, 0.05, 0.15 - i * 0.04] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }} />
        ))}
        <motion.svg className="absolute top-10 right-16 opacity-[0.09] pointer-events-none" width="140" height="140" viewBox="0 0 140 140"
          animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          <circle cx="70" cy="70" r="62" fill="none" stroke="hsl(45,100%,50%)" strokeWidth="1" strokeDasharray="8 6" />
          <circle cx="70" cy="70" r="42" fill="none" stroke="hsl(45,100%,50%)" strokeWidth="0.5" strokeDasharray="4 8" />
        </motion.svg>
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/8 mb-7"
            initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-primary text-xs font-semibold tracking-[0.15em] uppercase">Book a Session</span>
          </motion.div>
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
            <motion.h1 className="font-display text-5xl md:text-6xl font-bold leading-tight"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}>
              Schedule Your{" "}
              <span className="relative inline-block">
                <span className="text-gradient-gold">Consultation</span>
                <motion.div className="absolute -bottom-2 left-0 h-[3px] rounded-full bg-gradient-to-r from-primary to-amber-400"
                  initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.9 }} />
              </span>
            </motion.h1>
          </motion.div>
          <motion.p className="mt-5 text-muted-foreground max-w-md mx-auto text-sm md:text-base"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            Private 1-on-1 sessions with verified experts. Secure payment, instant confirmation.
          </motion.p>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="py-16 bg-background relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-6 max-w-2xl relative z-10">
          <motion.div ref={formRef} initial={{ opacity: 0, y: 30 }} animate={formInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>

            {submitted ? (
              <motion.div className="bg-gradient-card border border-primary/20 rounded-2xl p-12 text-center"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                style={{ boxShadow: "0 32px 80px -20px hsl(45 100% 50% / 0.15)" }}>
                <motion.div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.1 }}>
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold mb-3 text-gradient-gold">Booking Confirmed!</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Your payment was successful. A confirmation has been sent to{" "}
                  <span className="text-foreground font-medium">{formData.email}</span>
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate("/my-bookings")} className="glow-gold-sm">View My Bookings</Button>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", consultant_id: "", date: "", time: "", message: "", session_duration: 60 }); }}>
                    Book Another
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}
                className="bg-gradient-card border border-border rounded-2xl p-8 space-y-6 relative overflow-hidden"
                style={{ boxShadow: "0 24px 60px -16px hsl(45 100% 50% / 0.10)" }}>
                {/* Corner glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/8 blur-3xl pointer-events-none" />

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground block">Full Name</label>
                    <Input required placeholder="Your name" className="bg-secondary border-border focus:border-primary/50 transition-colors"
                      value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground block">Email</label>
                    <Input required type="email" placeholder="you@example.com" className="bg-secondary border-border focus:border-primary/50 transition-colors"
                      value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                  </div>
                </div>

                {/* Consultant */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">Select Consultant</label>
                  {isLoading ? (
                    <div className="bg-secondary border border-border rounded-lg p-3 text-sm text-muted-foreground">Loading consultants...</div>
                  ) : (
                    <Select value={formData.consultant_id} onValueChange={(v) => handleChange("consultant_id", v)}>
                      <SelectTrigger className="bg-secondary border-border focus:border-primary/50">
                        <SelectValue placeholder="Choose an expert" />
                      </SelectTrigger>
                      <SelectContent>
                        {consultants?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name} — {c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Session Duration */}
                {selectedConsultant && (
                  <motion.div className="bg-secondary/40 border border-border rounded-xl p-4"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
                    <label className="text-sm font-medium text-foreground mb-3 block">Session Duration</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ duration: 30, price: selectedConsultant.pricing_30, label: "Quick consultation" },
                        { duration: 60, price: selectedConsultant.pricing_60, label: "Deep-dive session" }].map(({ duration, price, label }) => (
                        <motion.button key={duration} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, session_duration: duration }))}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${formData.session_duration === duration ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:border-primary/40"}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span className="font-semibold text-foreground text-sm">{duration} min</span>
                          </div>
                          <div className="text-xl font-bold text-primary">{formatPrice(price)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5 block">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Preferred Date
                    </label>
                    <Input required type="date" className="bg-secondary border-border focus:border-primary/50"
                      value={formData.date} onChange={(e) => handleChange("date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5 block">
                      <Clock className="h-3.5 w-3.5 text-primary" /> Preferred Time
                    </label>
                    <Input required type="time" className="bg-secondary border-border focus:border-primary/50"
                      value={formData.time} onChange={(e) => handleChange("time", e.target.value)} />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">Message (optional)</label>
                  <Textarea placeholder="Tell us about your goals..." className="bg-secondary border-border min-h-[90px] resize-none focus:bor
der-primary/50"
                    value={formData.message} onChange={(e) => handleChange("message", e.target.value)} />
                </div>

                {/* Order Summary */}
                {selectedConsultant && sessionPrice && (
                  <motion.div className="bg-primary/6 border border-primary/20 rounded-xl p-4 space-y-2"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Order Summary</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{selectedConsultant.name}</span>
                      <span className="text-foreground">{formData.session_duration} min session</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-primary/20 pt-2">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary text-lg">{formatPrice(sessionPrice)}</span>
                    </div>
                  </motion.div>
                )}

                {/* Submit */}
                <Button type="submit" size="lg" className="w-full glow-gold py-6 text-base" disabled={paymentProcessing || !selectedConsultant}>
                  {paymentProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Pay {selectedConsultant && sessionPrice ? formatPrice(sessionPrice) : ""} & Confirm Booking
                    </span>
                  )}
                </Button>

                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                  <Lock size={12} className="text-primary" />
                  <span>Secured by Razorpay · 100% safe & encrypted</span>
                  <Shield size={12} className="text-primary" />
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
