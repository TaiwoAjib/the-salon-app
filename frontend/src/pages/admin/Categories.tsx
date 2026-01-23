import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, ChevronLeft, ChevronRight, Tags } from "lucide-react";
import { categoryService, Category } from "@/services/categoryService";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Pagination & Search states
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, data.name);
        toast.success("Category updated successfully");
      } else {
        await categoryService.createCategory(data.name);
        toast.success("Category created successfully");
      }
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to save category");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryService.deleteCategory(id);
        toast.success("Category deleted successfully");
        fetchCategories();
      } catch (error) {
        toast.error("Failed to delete category");
        console.error(error);
      }
    }
  };

  const openCreateDialog = () => {
    setEditingCategory(null);
    form.reset({
      name: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
    });
    setIsDialogOpen(true);
  };

  // Filter and Paginate
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-charcoal">Variations</h2>
          <p className="text-muted-foreground">Manage variations (e.g., Small, Medium, Large) that can be applied to styles.</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-gold hover:bg-gold-dark text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Variation
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search variations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  {debouncedSearch ? "No variations found matching your search." : "No variations found. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Tags className="h-4 w-4 text-muted-foreground" />
                    {category.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(category)}
                      className="hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            >
            <ChevronLeft className="h-4 w-4" />
            Previous
            </Button>
            <div className="text-sm font-medium">
            Page {page} of {totalPages}
            </div>
            <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            >
            Next
            <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Variation" : "Add New Variation"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the details of the variation."
                : "Create a new variation."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Small" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-gold hover:bg-gold-dark text-white">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingCategory ? "Update Variation" : "Create Variation"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
