import { CalendarCheck, Users, DollarSign, Star, Layers } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { bookingsService } from "@/services/bookings";
import { consultantsService } from "@/services/consultants";
import { testimonialsService } from "@/services/testimonials";
import { useCurrency } from "@/contexts/CurrencyContext";

const statusColor = (s: string) => {
  if (s === "confirmed") return "bg-primary/15 text-primary border-primary/30";
  if (s === "completed") return "bg-green-500/15 text-green-400 border-green-500/30";
  if (s === "pending") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  if (s === "published") return "bg-primary/15 text-primary border-primary/30";
  if (s === "draft") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
};

export default function AdminOverview() {
  const { formatPrice } = useCurrency();
  const [bookings, setBookings] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, consultantsData, testimonialsData] = await Promise.all([
        bookingsService.getAll(),
        consultantsService.getAll(),
        testimonialsService.getAll()
      ]);
      setBookings(bookingsData);
      setConsultants(consultantsData);
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      label: "Total Bookings", 
      value: bookings.length.toString(), 
      icon: CalendarCheck, 
      trend: `${bookings.filter(b => b.status === 'confirmed').length} confirmed` 
    },
    { 
      label: "Active Consultants", 
      value: consultants.filter(c => c.is_active).length.toString(), 
      icon: Users, 
      trend: `${consultants.length} total` 
    },
    { 
      label: "Total Revenue", 
      value: formatPrice(
        bookings
          .filter(b => b.payment_status === 'paid')
          .reduce((sum, b) => sum + (b.session_price || 0), 0)
      ), 
      icon: DollarSign, 
      trend: `${bookings.filter(b => b.payment_status === 'paid').length} paid` 
    },
    { 
      label: "Testimonials", 
      value: testimonials.length.toString(), 
      icon: Star, 
      trend: `${testimonials.filter(t => t.status === 'published').length} published` 
    },
  ];

  const recentBookings = bookings.slice(0, 3);
  const recentTestimonials = testimonials.slice(0, 3);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading dashboard...</div>;
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent Bookings</h2>
          <Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Booking ID</TableHead>
              <TableHead className="text-xs">Client</TableHead>
              <TableHead className="text-xs">Consultant</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{b.id.slice(0, 8)}</TableCell>
                <TableCell className="text-sm">{b.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{b.consultants?.name || 'N/A'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(b.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${statusColor(b.status)}`}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Testimonials */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" /> Recent Testimonials
            </h2>
            <Button variant="ghost" size="sm" className="text-primary text-xs">View All</Button>
          </div>
          <div className="divide-y divide-border">
            {recentTestimonials.map((t, i) => (
              <div key={i} className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.client_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{t.review}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3 w-3 ${s <= t.rating ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs shrink-0 ${statusColor(t.status)}`}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Content Edits */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Quick Stats
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Total Consultants</p>
                <span className="text-sm text-primary font-semibold">{consultants.length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {consultants.filter(c => c.is_active).length} active
              </p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Pending Bookings</p>
                <span className="text-sm text-yellow-400 font-semibold">
                  {bookings.filter(b => b.status === 'pending').length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Awaiting confirmation</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Draft Testimonials</p>
                <span className="text-sm text-muted-foreground font-semibold">
                  {testimonials.filter(t => t.status === 'draft').length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Ready to publish</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
