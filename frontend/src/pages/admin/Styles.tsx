import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, DollarSign, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { styleService, Style, StylePricing } from "@/services/styleService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const styleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.any().optional(),
});

const pricingSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  durationMinutes: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Duration must be a positive number",
  }),
});

type StyleFormValues = z.infer<typeof styleSchema>;
type PricingFormValues = z.infer<typeof pricingSchema>;

const Styles = () => {
  const [styles, setStyles] = useState<Style[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStyleSubmitting, setIsStyleSubmitting] = useState(false);
  const [isPricingSubmitting, setIsPricingSubmitting] = useState(false);
  
  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Style Dialog State
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);

  // Pricing Dialog State
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);

  const styleForm = useForm<StyleFormValues>({
    resolver: zodResolver(styleSchema),
    defaultValues: {
      name: "",
    },
  });

  const pricingForm = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      categoryId: "",
      price: "",
      durationMinutes: "60",
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

  // Initial load of categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const fetchStyles = async () => {
    setIsLoading(true);
    try {
      const response = await styleService.getAllStyles({
        page,
        limit: 10,
        search: debouncedSearch,
      });
      setStyles(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      toast.error("Failed to load styles");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStyles();
  }, [page, debouncedSearch]);

  const onStyleSubmit = async (data: StyleFormValues) => {
    try {
      if (editingStyle) {
        await styleService.updateStyle(editingStyle.id, data);
        toast.success("Style updated successfully");
      } else {
        await styleService.createStyle(data);
        toast.success("Style created successfully");
      }
      setIsStyleDialogOpen(false);
      fetchStyles();
    } catch (error) {
      toast.error("Failed to save style");
      console.error(error);
    }
  };

  const onDeleteStyle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this style?")) return;
    try {
      await styleService.deleteStyle(id);
      toast.success("Style deleted successfully");
      fetchStyles();
    } catch (error) {
      toast.error("Failed to delete style");
    }
  };

  const onPricingSubmit = async (data: PricingFormValues) => {
    if (!selectedStyle) return;
    setIsPricingSubmitting(true);
    try {
      await styleService.updateStylePricing(selectedStyle.id, {
        categoryId: data.categoryId,
        price: Number(data.price),
        durationMinutes: Number(data.durationMinutes),
      });
      toast.success("Pricing updated successfully");
      pricingForm.reset({
        categoryId: "",
        price: "",
        durationMinutes: "60",
      });
      
      // Refresh styles to get updated pricing data
      const response = await styleService.getAllStyles({
        page,
        limit: 10,
        search: debouncedSearch,
      });
      setStyles(response.data);
      
      // Update selected style in dialog
      const updatedSelectedStyle = response.data.find(s => s.id === selectedStyle.id);
      if (updatedSelectedStyle) {
        setSelectedStyle(updatedSelectedStyle);
      }
      
    } catch (error) {
      toast.error("Failed to update pricing");
      console.error(error);
    } finally {
      setIsPricingSubmitting(false);
    }
  };

  const onDeletePricing = async (categoryId: string) => {
    if (!selectedStyle) return;
    try {
      await styleService.deleteStylePricing(selectedStyle.id, categoryId);
      toast.success("Pricing removed successfully");
      
      // Refresh
      const response = await styleService.getAllStyles({
        page,
        limit: 10,
        search: debouncedSearch,
      });
      setStyles(response.data);
      
      const updatedSelectedStyle = response.data.find(s => s.id === selectedStyle.id);
      if (updatedSelectedStyle) {
        setSelectedStyle(updatedSelectedStyle);
      }
    } catch (error) {
      toast.error("Failed to remove pricing");
    }
  };

  const openPricingDialog = (style: Style) => {
    setSelectedStyle(style);
    setIsPricingDialogOpen(true);
    pricingForm.reset({
      categoryId: "",
      price: "",
      durationMinutes: "60",
    });
  };

  const openEditStyleDialog = (style: Style) => {
    setEditingStyle(style);
    styleForm.reset({ name: style.name });
    setIsStyleDialogOpen(true);
  };

  const openCreateStyleDialog = () => {
    setEditingStyle(null);
    styleForm.reset({ name: "" });
    setIsStyleDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Styles</h1>
        <Button onClick={openCreateStyleDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Style
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search styles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Variations Configured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : styles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {debouncedSearch ? "No styles found matching your search." : "No styles found. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              styles.map((style) => (
                <TableRow key={style.id}>
                  <TableCell>
                    {style.imageUrl ? (
                      <img 
                        src={style.imageUrl} 
                        alt={style.name} 
                        className="h-10 w-10 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{style.name}</TableCell>
                  <TableCell>{style.pricing?.length || 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPricingDialog(style)}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Pricing
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditStyleDialog(style)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDeleteStyle(style.id)}
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
      <div className="flex items-center justify-end space-x-2">
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

      {/* Create/Edit Style Dialog */}
      <Dialog open={isStyleDialogOpen} onOpenChange={setIsStyleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStyle ? "Edit Style" : "Create Style"}</DialogTitle>
            <DialogDescription>
              Manage your salon styles (e.g., Knotless Braids).
            </DialogDescription>
          </DialogHeader>
          <Form {...styleForm}>
            <form onSubmit={styleForm.handleSubmit(onStyleSubmit)} className="space-y-4">
              <FormField
                control={styleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Knotless Braids" {...field} />
                    </FormControl>
                    <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={styleForm.control}
            name="image"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Style Image (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      onChange(event.target.files && event.target.files[0]);
                    }}
                    value=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
                <Button type="submit" disabled={isStyleSubmitting}>
                  {isStyleSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Pricing Management Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Pricing: {selectedStyle?.name}</DialogTitle>
            <DialogDescription>
              Set prices for different variations (categories) of this style.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Add New Pricing Form */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-4">Add/Update Pricing</h4>
              <Form {...pricingForm}>
                <form onSubmit={pricingForm.handleSubmit(onPricingSubmit)} className="flex items-end gap-4">
                  <FormField
                    control={pricingForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Variation (Category)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select variation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={pricingForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={pricingForm.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Mins</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPricingSubmitting}>
                    {isPricingSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Add/Update"
                    )}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Existing Pricing List */}
            <div>
              <h4 className="text-sm font-medium mb-2">Current Pricing</h4>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variation</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStyle?.pricing && selectedStyle.pricing.length > 0 ? (
                      selectedStyle.pricing.map((pricing) => (
                        <TableRow key={pricing.id}>
                          <TableCell>{pricing.category.name}</TableCell>
                          <TableCell>${pricing.price}</TableCell>
                          <TableCell>{pricing.durationMinutes} min</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onDeletePricing(pricing.categoryId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No pricing configured yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Styles;
