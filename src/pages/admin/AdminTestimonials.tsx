import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testimonialsService } from "@/services/testimonials";
import type { Database } from "@/lib/database.types";

type Testimonial = Database['public']['Tables']['testimonials']['Row'];

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? "text-primary fill-primary" : "text-muted-foreground/30"} ${onChange ? "cursor-pointer" : ""}`}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  );
}

export default function AdminTestimonials() {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  // Form state
  const [form, setForm] = useState({ 
    client_name: "", 
    designation: "", 
    company: "", 
    review: "", 
    rating: 5, 
    published: true 
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const data = await testimonialsService.getAll();
      setTestimonials(data);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast({
        title: "Error",
        description: "Failed to load testimonials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ client_name: "", designation: "", company: "", review: "", rating: 5, published: true });
    setDialogOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ 
      client_name: t.client_name, 
      designation: t.designation, 
      company: t.company || "", 
      review: t.review, 
      rating: t.rating, 
      published: t.status === "published" 
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.client_name || !form.review) {
      toast({
        title: "Validation Error",
        description: "Client name and review are required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editing) {
        await testimonialsService.update(editing.id, {
          client_name: form.client_name,
          designation: form.designation,
          company: form.company || null,
          review: form.review,
          rating: form.rating,
          status: form.published ? "published" : "draft"
        });
        toast({ title: "Updated", description: `Testimonial from ${form.client_name} updated.` });
      } else {
        await testimonialsService.create({
          client_name: form.client_name,
          designation: form.designation,
          company: form.company || null,
          review: form.review,
          rating: form.rating,
          status: form.published ? "published" : "draft"
        });
        toast({ title: "Added", description: `Testimonial from ${form.client_name} added.` });
      }
      setDialogOpen(false);
      loadTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to save testimonial",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await testimonialsService.delete(deleteId);
      toast({ title: "Deleted", description: "Testimonial removed." });
      setDeleteId(null);
      loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading testimonials...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Testimonials</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage client testimonials displayed on the homepage.</p>
        </div>
        <Button className="glow-gold-sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1.5" /> Add Testimonial
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Client</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Review</TableHead>
              <TableHead className="text-xs">Rating</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="text-sm font-medium">{t.client_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{t.designation}{t.company && `, ${t.company}`}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[280px] truncate">{t.review}</TableCell>
                <TableCell><StarRating rating={t.rating} /></TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${t.status === "published" ? "bg-primary/15 text-primary border-primary/30" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"}`}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => openEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => setDeleteId(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{editing ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {editing ? "Update the testimonial details below." : "Fill in the details for the new testimonial."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="bg-background border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company (Optional)</Label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="space-y-2">
              <Label>Review Text *</Label>
              <Textarea rows={4} value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Label>Rating</Label>
                <StarRating rating={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
              </div>
              <div className="flex items-center gap-2">
                <Label>Publish</Label>
                <Switch checked={form.published} onCheckedChange={(c) => setForm({ ...form, published: c })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="glow-gold-sm" onClick={handleSave}>
              {editing ? "Update" : "Save Testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The testimonial will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
