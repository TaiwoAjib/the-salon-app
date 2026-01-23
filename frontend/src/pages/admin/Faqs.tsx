import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Loader2,
  Save
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { faqService, Faq } from '@/services/faqService';
import { settingsService } from '@/services/settingsService';

export default function Faqs() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Form states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showFaqSection, setShowFaqSection] = useState(true);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  // Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setShowFaqSection(data.showFaqSection ?? true);
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setIsSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Fetch FAQs
  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: faqService.getAllFaqs,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: faqService.createFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setIsCreateOpen(false);
      resetForm();
      toast.success("FAQ created successfully");
    },
    onError: () => toast.error("Failed to create FAQ"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; faq: Partial<Faq> }) => 
      faqService.updateFaq(data.id, data.faq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setEditingFaq(null);
      resetForm();
      toast.success("FAQ updated successfully");
    },
    onError: () => toast.error("Failed to update FAQ"),
  });

  const deleteMutation = useMutation({
    mutationFn: faqService.deleteFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setDeletingId(null);
      toast.success("FAQ deleted successfully");
    },
    onError: () => toast.error("Failed to delete FAQ"),
  });

  const settingsMutation = useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: (data) => {
      setShowFaqSection(data.showFaqSection ?? true);
      toast.success("Settings updated successfully");
    },
    onError: () => toast.error("Failed to update settings"),
  });

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setIsActive(true);
  };

  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsActive(faq.isActive);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaq) {
      updateMutation.mutate({
        id: editingFaq.id,
        faq: { question, answer, isActive }
      });
    } else {
      createMutation.mutate({ question, answer, isActive });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === faqs.length - 1) return;

    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
    
    // Optimistic update could happen here, but we'll just call API
    const orderedIds = newFaqs.map(f => f.id);
    try {
      await faqService.reorderFaqs(orderedIds);
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    } catch (error) {
      toast.error("Failed to reorder FAQs");
    }
  };

  const handleToggleSection = (checked: boolean) => {
    settingsMutation.mutate({ showFaqSection: checked });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
          <p className="text-muted-foreground">Manage frequently asked questions and answers.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>Control the visibility of the FAQ section on the home page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-faq" 
              checked={showFaqSection}
              onCheckedChange={handleToggleSection}
              disabled={isSettingsLoading || settingsMutation.isPending}
            />
            <Label htmlFor="show-faq">Show FAQ Section on Home Page</Label>
            {settingsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">No FAQs found. Create one to get started.</p>
          </div>
        ) : (
          faqs.map((faq, index) => (
            <Card key={faq.id} className="overflow-hidden">
              <div className="p-4 flex items-start gap-4">
                <div className="flex flex-col gap-1 mt-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    disabled={index === faqs.length - 1}
                    onClick={() => handleMove(index, 'down')}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{faq.question}</h3>
                    {!faq.isActive && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Hidden</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{faq.answer}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(faq)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => setDeletingId(faq.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingFaq} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingFaq(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
            <DialogDescription>
              Add a question and answer for your customers.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input 
                id="question" 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                placeholder="e.g., What are your opening hours?"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea 
                id="answer" 
                value={answer} 
                onChange={(e) => setAnswer(e.target.value)} 
                placeholder="Enter the answer here..."
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="active" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="active">Active (Visible to customers)</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateOpen(false);
                setEditingFaq(null);
              }}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingFaq ? 'Save Changes' : 'Create FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this FAQ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
