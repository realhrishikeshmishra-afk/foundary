import { useState, useEffect } from "react";
import { Search, Download, Video, Trash2, Copy, Check, ExternalLink, Mail, CheckCircle } from "lucide-react";
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { bookingsService } from "@/services/bookings";
import { emailService } from "@/services/email";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

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
  const { formatPrice } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showRescheduleOnly, setShowRescheduleOnly] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    status: "pending" as "pending" | "confirmed" | "completed" | "cancelled",
    payment_status: "pending" as "pending" | "paid" | "refunded",
    meeting_room_id: "",
    date: "",
    time: ""
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
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (booking: any) => {
    setSelectedBooking(booking);
    setForm({
      status: booking.status,
      payment_status: booking.payment_status,
      meeting_room_id: booking.meeting_room_id || "",
      date: booking.date,
      time: booking.time
    });
    setDialogOpen(true);
  };

  const openDelete = (booking: any) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedBooking) return;

    setSaving(true);
    try {
      const updates: any = {
        status: form.status,
        payment_status: form.payment_status,
        date: form.date,
        time: form.time
      };

      // Auto-generate meeting room if status is confirmed and no room exists
      if (form.status === "confirmed" && !form.meeting_room_id) {
        updates.meeting_room_id = `foundarly-${selectedBooking.id}`;
      } else if (form.meeting_room_id) {
        updates.meeting_room_id = form.meeting_room_id;
      }

      await bookingsService.update(selectedBooking.id, updates);
      toast.success("Booking updated successfully");
      setDialogOpen(false);
      loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error("Failed to update booking");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBooking) return;

    setDeleting(true);
    try {
      await bookingsService.delete(selectedBooking.id);
      toast.success("Booking deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error("Failed to delete booking");
    } finally {
      setDeleting(false);
    }
  };

  const copyMeetingLink = (meetingRoomId: string) => {
    const link = `${window.location.origin}/meeting/${meetingRoomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(meetingRoomId);
      toast.success("Meeting link copied!");
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  const sendBookingEmail = async (bookingId: string) => {
    setSendingEmailId(bookingId);
    try {
      const result = await emailService.sendBookingConfirmation(bookingId);
      if (result.success) {
        toast.success("Confirmation emails sent successfully!");
      } else {
        // Show warning but don't fail - admin can share link manually
        toast.warning("Email system unavailable. Copy and share the meeting link manually.");
        console.error("Email error details:", result.error);
      }
    } catch (error) {
      console.error('Email error:', error);
      toast.warning("Email system unavailable. Copy and share the meeting link manually.");
    } finally {
      setSendingEmailId(null);
    }
  };

  const approveBooking = async (booking: any) => {
    setApprovingId(booking.id);
    try {
      const updates: any = {
        status: "confirmed",
        meeting_room_id: `foundarly-${booking.id}`,
      };

      await bookingsService.update(booking.id, updates);
      toast.success("Booking approved and meeting room created!");
      loadBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error("Failed to approve booking");
    } finally {
      setApprovingId(null);
    }
  };

  const exportToCSV = () => {
    try {
      // Prepare CSV headers
      const headers = [
        'Booking ID',
        'Client Name',
        'Client Email',
        'Consultant',
        'Date',
        'Time',
        'Duration (min)',
        'Price',
        'Meeting Room ID',
        'Payment Status',
        'Booking Status',
        'Participants',
        'Created At'
      ];

      // Prepare CSV rows
      const rows = filtered.map(b => [
        b.id,
        b.name,
        b.email,
        b.consultants?.name || 'N/A',
        new Date(b.date).toLocaleDateString(),
        b.time,
        b.session_duration || 'N/A',
        b.session_price || 'N/A',
        b.meeting_room_id || 'Not set',
        b.payment_status,
        b.status,
        b.participants_count || 0,
        new Date(b.created_at).toLocaleString()
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          // Escape commas and quotes in cell content
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `bookings-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported ${filtered.length} bookings to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export CSV");
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      (b.consultants?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    
    // Filter for reschedule requests (missed meetings with only 1 participant or no participants)
    const needsReschedule = b.status === "missed" && (b.participants_count || 0) < 2;
    const matchesReschedule = !showRescheduleOnly || needsReschedule;
    
    return matchesSearch && matchesStatus && matchesReschedule;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    rescheduleRequests: bookings.filter(b => b.status === "missed" && (b.participants_count || 0) < 2).length,
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Manage Bookings</h1>
            <p className="text-sm text-muted-foreground mt-1">{stats.total} total bookings</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card border border-yellow-500/20 rounded-lg p-4">
            <p className="text-xs text-yellow-600 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-card border border-primary/20 rounded-lg p-4">
            <p className="text-xs text-primary uppercase tracking-wider mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-primary">{stats.confirmed}</p>
          </div>
          <div className="bg-card border border-green-500/20 rounded-lg p-4">
            <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-card border border-destructive/20 rounded-lg p-4">
            <p className="text-xs text-destructive uppercase tracking-wider mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
          </div>
          <div 
            className="bg-card border border-orange-500/20 rounded-lg p-4 cursor-pointer hover:bg-orange-500/5 transition-colors"
            onClick={() => setShowRescheduleOnly(!showRescheduleOnly)}
          >
            <p className="text-xs text-orange-600 uppercase tracking-wider mb-1">Reschedule</p>
            <p className="text-2xl font-bold text-orange-600">{stats.rescheduleRequests}</p>
            {showRescheduleOnly && <p className="text-xs text-orange-500 mt-1">Filtered</p>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {showRescheduleOnly && (
          <Badge variant="outline" className="text-orange-600 border-orange-500/30 bg-orange-500/10">
            Showing Reschedule Requests Only
            <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => setShowRescheduleOnly(false)} />
          </Badge>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or consultant..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 bg-card border-border" 
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
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
              <TableHead className="text-xs">Meeting Room</TableHead>
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
                <TableCell className="text-xs">
                  {b.meeting_room_id ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-primary">
                        <Video className="h-3 w-3" />
                        <span className="font-mono text-xs">{b.meeting_room_id.slice(0, 15)}...</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyMeetingLink(b.meeting_room_id)}
                        title="Copy meeting link"
                      >
                        {copiedId === b.meeting_room_id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(`/meeting/${b.meeting_room_id}`, '_blank')}
                        title="Open meeting"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </TableCell>
                <TableCell className={`text-xs font-medium ${paymentColor(b.payment_status)}`}>
                  {b.payment_status.charAt(0).toUpperCase() + b.payment_status.slice(1)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${statusColor(b.status)}`}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {b.status === "pending" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => approveBooking(b)}
                        disabled={approvingId === b.id}
                        title="Approve booking and create meeting room"
                      >
                        {approvingId === b.id ? (
                          <span className="text-xs">Approving...</span>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Approve</span>
                          </>
                        )}
                      </Button>
                    )}
                    {b.status === "confirmed" && b.meeting_room_id && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => sendBookingEmail(b.id)}
                        disabled={sendingEmailId === b.id}
                        title="Send confirmation emails"
                      >
                        {sendingEmailId === b.id ? (
                          <span className="text-xs">Sending...</span>
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-primary hover:text-primary/80"
                      onClick={() => openEdit(b)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs text-destructive hover:text-destructive/80"
                      onClick={() => openDelete(b)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
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

            <div className="space-y-2">
              <Label>Meeting Room ID</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={form.meeting_room_id} 
                  onChange={(e) => setForm({ ...form, meeting_room_id: e.target.value })}
                  placeholder="foundarly-xxxxx"
                  className="bg-background border-border font-mono text-sm"
                />
                {!form.meeting_room_id && selectedBooking && (
                  <Button 
                    type="button"
                    size="sm" 
                    variant="outline"
                    onClick={() => setForm({ ...form, meeting_room_id: `foundarly-${selectedBooking.id}` })}
                  >
                    Auto
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Required for confirmed bookings</p>
            </div>

            {/* Reschedule Section */}
            <div className="pt-4 border-t border-border space-y-4">
              <Label className="text-sm font-semibold">Reschedule Meeting</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">New Date</Label>
                  <Input 
                    type="date"
                    value={form.date} 
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="bg-background border-border text-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">New Time</Label>
                  <Input 
                    type="time"
                    value={form.time} 
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="bg-background border-border text-sm"
                  />
                </div>
              </div>
            </div>

            {selectedBooking && (
              <div className="bg-secondary/30 p-3 rounded-lg space-y-1 text-sm">
                <p><span className="text-muted-foreground">Client:</span> {selectedBooking.name}</p>
                <p><span className="text-muted-foreground">Email:</span> {selectedBooking.email}</p>
                <p><span className="text-muted-foreground">Original Date:</span> {new Date(selectedBooking.date).toLocaleDateString()}</p>
                <p><span className="text-muted-foreground">Original Time:</span> {selectedBooking.time}</p>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the booking for {selectedBooking?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
