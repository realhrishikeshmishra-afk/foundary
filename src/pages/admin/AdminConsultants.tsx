import { useState, useEffect } from "react";
import { Search, Plus, LayoutGrid, List, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { consultantsService } from "@/services/consultants";
import { storageService } from "@/services/storage";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Database } from "@/lib/database.types";

type Consultant = Database['public']['Tables']['consultants']['Row'];

export default function AdminConsultants() {
  const { toast } = useToast();
  const { formatPrice, currency, currencySymbol } = useCurrency();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Consultant | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    title: "",
    bio: "",
    expertise: "",
    pricing_30: 100,
    pricing_60: 180,
    is_active: true
  });

  useEffect(() => {
    loadConsultants();
  }, []);

  const loadConsultants = async () => {
    try {
      const data = await consultantsService.getAll();
      setConsultants(data);
    } catch (error) {
      console.error('Error loading consultants:', error);
      toast({
        title: "Error",
        description: "Failed to load consultants",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      title: "",
      bio: "",
      expertise: "",
      pricing_30: 100,
      pricing_60: 180,
      is_active: true
    });
    setImageFile(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (consultant: Consultant) => {
    setEditing(consultant);
    setForm({
      name: consultant.name,
      title: consultant.title,
      bio: consultant.bio,
      expertise: consultant.expertise.join(", "),
      pricing_30: consultant.pricing_30,
      pricing_60: consultant.pricing_60,
      is_active: consultant.is_active
    });
    setImageFile(null);
    setImagePreview(consultant.image_url);
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.title || !form.bio) {
      toast({
        title: "Validation Error",
        description: "Name, title, and bio are required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      let imageUrl = editing?.image_url || null;

      // Upload image if new file selected
      if (imageFile) {
        try {
          imageUrl = await storageService.uploadFile('consultant-images', imageFile, `consultant-${Date.now()}`);
        } catch (storageError) {
          console.error('Storage error:', storageError);
          toast({
            title: "Storage Error",
            description: "Failed to upload image. Please ensure storage buckets are set up correctly.",
            variant: "destructive"
          });
          setSaving(false);
          return;
        }
      }

      const expertiseArray = form.expertise
        .split(",")
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const consultantData = {
        name: form.name,
        title: form.title,
        bio: form.bio,
        expertise: expertiseArray,
        pricing_30: form.pricing_30,
        pricing_60: form.pricing_60,
        is_active: form.is_active,
        image_url: imageUrl
      };

      if (editing) {
        await consultantsService.update(editing.id, consultantData);
        toast({ title: "Updated", description: `${form.name} updated successfully` });
      } else {
        await consultantsService.create(consultantData);
        toast({ title: "Added", description: `${form.name} added successfully` });
      }

      setDialogOpen(false);
      loadConsultants();
    } catch (error) {
      console.error('Error saving consultant:', error);
      toast({
        title: "Error",
        description: "Failed to save consultant",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this consultant?')) return;
    
    try {
      await consultantsService.delete(id);
      toast({ title: "Deleted", description: "Consultant removed successfully" });
      loadConsultants();
    } catch (error) {
      console.error('Error deleting consultant:', error);
      toast({
        title: "Error",
        description: "Failed to delete consultant",
        variant: "destructive"
      });
    }
  };

  const filtered = consultants.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading consultants...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Manage Consultants</h1>
          <p className="text-sm text-muted-foreground mt-1">{consultants.length} consultants registered</p>
        </div>
        <Button size="sm" className="glow-gold-sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Add Consultant
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <div className="flex border border-border rounded-md overflow-hidden">
          <button onClick={() => setView("table")} className={`p-2 transition-colors ${view === "table" ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setView("grid")} className={`p-2 transition-colors ${view === "grid" ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="bg-card border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">30 min</TableHead>
                <TableHead className="text-xs">60 min</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-sm">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.expertise.slice(0, 2).map((exp, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatPrice(c.pricing_30)}</TableCell>
                  <TableCell className="text-sm">{formatPrice(c.pricing_60)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${c.is_active ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-muted text-muted-foreground"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-7"
                        onClick={() => openEdit(c)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-display font-bold text-sm">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <Badge variant="outline" className={`text-xs ${c.is_active ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-muted text-muted-foreground"}`}>
                  {c.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm text-foreground">{c.name}</h3>
              <p className="text-xs text-muted-foreground">{c.title}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {c.expertise.slice(0, 2).map((exp, i) => (
                  <span key={i} className="text-xs text-primary">{exp}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span>30m: {formatPrice(c.pricing_30)}</span>
                <span>60m: {formatPrice(c.pricing_60)}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-8"
                  onClick={() => openEdit(c)}
                >
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-8 text-destructive"
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit Consultant" : "Add New Consultant"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {editing ? "Update consultant details below." : "Fill in the details for the new consultant."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="bg-background border-border" 
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  className="bg-background border-border" 
                  placeholder="Business Strategist"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio *</Label>
              <Textarea 
                rows={4} 
                value={form.bio} 
                onChange={(e) => setForm({ ...form, bio: e.target.value })} 
                className="bg-background border-border" 
                placeholder="Brief professional background and expertise..."
              />
            </div>

            <div className="space-y-2">
              <Label>Expertise Areas (comma-separated)</Label>
              <Input 
                value={form.expertise} 
                onChange={(e) => setForm({ ...form, expertise: e.target.value })} 
                className="bg-background border-border" 
                placeholder="Business Strategy, Leadership, Growth"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>30-min Session Price ({currencySymbol})</Label>
                <Input 
                  type="number" 
                  value={form.pricing_30} 
                  onChange={(e) => setForm({ ...form, pricing_30: parseInt(e.target.value) || 0 })} 
                  className="bg-background border-border" 
                  placeholder="100"
                />
                <p className="text-xs text-muted-foreground">
                  Current currency: {currency}
                </p>
              </div>
              <div className="space-y-2">
                <Label>60-min Session Price ({currencySymbol})</Label>
                <Input 
                  type="number" 
                  value={form.pricing_60} 
                  onChange={(e) => setForm({ ...form, pricing_60: parseInt(e.target.value) || 0 })} 
                  className="bg-background border-border" 
                  placeholder="180"
                />
                <p className="text-xs text-muted-foreground">
                  Current currency: {currency}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profile Image</Label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-24 w-24 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="bg-background border-border"
                    id="consultant-image"
                  />
                  <Label htmlFor="consultant-image" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload
                      </span>
                    </Button>
                  </Label>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch 
                checked={form.is_active} 
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} 
              />
              <Label>Active (visible to users)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button className="glow-gold-sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Consultant" : "Add Consultant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
