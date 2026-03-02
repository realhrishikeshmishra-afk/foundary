import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, MessageSquare, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { bookingsService } from "@/services/bookings";
import { useNavigate } from "react-router-dom";

interface Booking {
  id: string;
  consultant_id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  message: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  session_duration: number | null;
  session_price: number | null;
  created_at: string;
  consultants?: {
    name: string;
    title: string;
  };
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    
    if (user) {
      loadBookings();
    }
  }, [user, authLoading, navigate]);

  const loadBookings = async () => {
    try {
      const data = await bookingsService.getByUserId(user!.id);
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary/15 text-primary border-primary/30';
      case 'completed':
        return 'bg-green-500/15 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'cancelled':
        return 'bg-destructive/15 text-destructive border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/15 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'refunded':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-24">
          <div className="container mx-auto px-6">
            <div className="text-center py-12 text-muted-foreground">Loading your bookings...</div>
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
        <div className="container mx-auto px-6 max-w-5xl">
          <AnimatedSection className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold">
              My <span className="text-gradient-gold">Bookings</span>
            </h1>
            <p className="mt-4 text-muted-foreground">
              Track your consultation sessions and their status
            </p>
          </AnimatedSection>

          {bookings.length === 0 ? (
            <AnimatedSection>
              <Card className="bg-gradient-card border-border">
                <CardContent className="pt-12 pb-12 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't booked any consultation sessions yet.
                  </p>
                  <a 
                    href="/booking" 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 glow-gold-sm"
                  >
                    Book Your First Session
                  </a>
                </CardContent>
              </Card>
            </AnimatedSection>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking, index) => (
                <AnimatedSection key={booking.id} delay={index * 0.1}>
                  <Card className="bg-gradient-card border-border hover:border-primary/30 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="font-display text-xl mb-2">
                            {booking.consultants?.name || 'Consultant'}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {booking.consultants?.title || 'Professional Consultant'}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getPaymentStatusColor(booking.payment_status)}`}>
                            {booking.payment_status === 'paid' ? 'Paid' : 
                             booking.payment_status === 'pending' ? 'Payment Pending' : 'Refunded'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-muted-foreground text-xs">Date</p>
                            <p className="font-medium">{formatDate(booking.date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-muted-foreground text-xs">Time</p>
                            <p className="font-medium">{booking.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <User className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-muted-foreground text-xs">Booked by</p>
                            <p className="font-medium">{booking.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-muted-foreground text-xs">Booking ID</p>
                            <p className="font-medium font-mono text-xs">{booking.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Session Duration and Price */}
                      {(booking.session_duration || booking.session_price) && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {booking.session_duration && (
                              <div className="flex items-center gap-3 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="text-muted-foreground text-xs">Session Duration</p>
                                  <p className="font-medium">{booking.session_duration} minutes</p>
                                </div>
                              </div>
                            )}
                            {booking.session_price && (
                              <div className="flex items-center gap-3 text-sm">
                                <CreditCard className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="text-muted-foreground text-xs">Session Price</p>
                                  <p className="font-medium text-primary">{formatPrice(booking.session_price)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {booking.message && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-start gap-3 text-sm">
                            <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                            <div className="flex-1">
                              <p className="text-muted-foreground text-xs mb-1">Your Message</p>
                              <p className="text-sm">{booking.message}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          Booked on {new Date(booking.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
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
