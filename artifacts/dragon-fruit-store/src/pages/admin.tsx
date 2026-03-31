import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  useGetProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  getGetProductsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Plus, Trash2, Loader2, LeafyGreen } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  badge: z.string().optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: products, isLoading } = useGetProducts();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      unit: "kg",
      imageUrl: "",
      badge: "",
      inStock: true,
      featured: false,
    },
  });

  const openNewForm = () => {
    form.reset({
      name: "",
      description: "",
      price: 0,
      unit: "kg",
      imageUrl: "",
      badge: "",
      inStock: true,
      featured: false,
    });
    setEditingId(null);
    setIsOpen(true);
  };

  const openEditForm = (product: any) => {
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      badge: product.badge || "",
      inStock: product.inStock,
      featured: product.featured,
    });
    setEditingId(product.id);
    setIsOpen(true);
  };

  const onSubmit = (data: ProductFormValues) => {
    // Clean up empty badge
    if (data.badge === "") data.badge = undefined;

    if (editingId) {
      updateProduct.mutate({ id: editingId, data }, {
        onSuccess: () => {
          toast({ title: "Product updated successfully" });
          queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
          setIsOpen(false);
        },
        onError: () => {
          toast({ title: "Failed to update product", variant: "destructive" });
        }
      });
    } else {
      createProduct.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Product created successfully" });
          queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
          setIsOpen(false);
        },
        onError: () => {
          toast({ title: "Failed to create product", variant: "destructive" });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Product deleted" });
          queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
        },
        onError: () => {
          toast({ title: "Failed to delete product", variant: "destructive" });
        }
      });
    }
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-heading flex items-center gap-2">
                Store Admin
              </h1>
              <p className="text-muted-foreground">Manage your products inventory</p>
            </div>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewForm} className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl><Input placeholder="e.g. Red Dragon Fruit" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
                          <FormControl><Input type="number" placeholder="250" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl><Input placeholder="e.g. per kg" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="badge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Badge (Optional)</FormLabel>
                          <FormControl><Input placeholder="e.g. Best Seller" {...field} value={field.value || ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl><Input placeholder="/images/gallery-1.png" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the product..." rows={3} className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-8 py-2 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-medium cursor-pointer">In Stock</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-medium cursor-pointer">Featured Product</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingId ? "Update" : "Save Product"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/50 dark:border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/80 dark:bg-zinc-800/50 hover:bg-zinc-50/80">
                <TableHead className="w-[80px] pl-6">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price / Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    Loading your products...
                  </TableCell>
                </TableRow>
              ) : products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LeafyGreen className="w-8 h-8 text-zinc-400" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-1">No products found</p>
                    <p>Add your first product to start selling.</p>
                  </TableCell>
                </TableRow>
              ) : (
                products?.map((product) => (
                  <TableRow key={product.id} className="group">
                    <TableCell className="pl-6">
                      <div className="w-14 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-base mb-1">{product.name}</div>
                      <div className="flex gap-2">
                        {product.featured && <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-none">Featured</Badge>}
                        {product.badge && <Badge variant="outline" className="text-[10px] h-5">{product.badge}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{product.price} <span className="text-muted-foreground font-normal">/ {product.unit}</span>
                    </TableCell>
                    <TableCell>
                      {product.inStock ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-medium">In Stock</Badge>
                      ) : (
                        <Badge variant="destructive" className="border-none font-medium">Out of Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(product)} className="h-8 w-8 hover:text-primary hover:bg-primary/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="h-8 w-8 hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
