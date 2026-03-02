import { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { bookingsService } from "@/services/bookings";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

const statusColor = (s: string) => {
  if (s === "confirmed") return "bg-primary/15 text-primary border-primary/30";
  if (s === "completed") return "bg-green-500/15 text-green-400 border-green-500/30";
  if (s === "pending") return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  return "bg-destructive/15 text-destructive border-destructive/30";
};

const paymentColor = (s: string) => {
  if (s === "paid") return "text-green-400";
  if (s === "pending") return "text-yellow-400";
  return "text-destructive";
};

export default function AdminBookings() {
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
    payment_status: "pending" as "pending" | "paid" | "refunded"
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingsService.getAll();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (booking: any) => {
    setSelectedBooking(booking);
    setForm({
      status: booking.status,
      payment_status: booking.payment_status
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedBooking) return;

    setSaving(true);
    try {
      await bookingsService.update(selectedBooking.id, {
        status: form.status,
        payment_status: form.payment_status
      });

      toast({ 
        title: "Updated", 
        description: "Booking status updated successfully" 
      });

      setDialogOpen(false);
      loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const filtered = bookings.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Manage Bookings</h1>
          <p className="text-sm text-muted-foreground mt-1">{bookings.length} total bookings</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card border-border" />
      </div>

      <div className="bg-card border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">ID</TableHead>
              <TableHead className="text-xs">Client</TableHead>
              <TableHead className="text-xs">Consultant</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Time</TableHead>
              <TableHead className="text-xs">Duration</TableHead>
              <TableHead className="text-xs">Price</TableHead>
              <TableHead className="text-xs">Payment</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{b.id.slice(0, 8)}</TableCell>
                <TableCell className="text-sm">{b.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{b.consultants?.name || 'N/A'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(b.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{b.time}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{b.session_duration ? `${b.session_duration} min` : 'N/A'}</TableCell>
                <TableCell className="text-sm font-medium text-primary">{b.session_price ? formatPrice(b.session_price) : 'N/A'}</TableCell>
                <TableCell className={`text-xs font-medium ${paymentColor(b.payment_status)}`}>
                  {b.payment_status.charAt(0).toUpperCase() + b.payment_status.slice(1)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${statusColor(b.status)}`}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary"
                    onClick={() => openEdit(b)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Update Booking Status</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Update the booking and payment status for {selectedBooking?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Booking Status</Label>
              <Select 
                value={form.status} 
                onValueChange={(value: any) => setForm({ ...form, status: value })}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select 
                value={form.payment_status} 
                onValueChange={(value: any) => setForm({ ...form, payment_status: value })}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedBooking && (
              <div className="bg-secondary/30 p-3 rounded-lg space-y-1 text-sm">
                <p><span className="text-muted-foreground">Client:</span> {selectedBooking.name}</p>
                <p><span className="text-muted-foreground">Email:</span> {selectedBooking.email}</p>
                <p><span className="text-muted-foreground">Date:</span> {new Date(selectedBooking.date).toLocaleDateString()}</p>
                <p><span className="text-muted-foreground">Time:</span> {selectedBooking.time}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button className="glow-gold-sm" onClick={handleSave} disabled={saving}>
              {saving ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
