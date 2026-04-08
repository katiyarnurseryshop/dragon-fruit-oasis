import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
  getGetProductsQueryKey,
  useCreateProduct,
  useDeleteProduct,
  useGetProducts,
  useUpdateProduct,
  type Product,
} from "@workspace/api-client-react";
import {
  Boxes,
  CirclePlus,
  Leaf,
  List,
  LogOut,
  Moon,
  Pencil,
  Save,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_DELIVERY_CHARGE_RULES,
  type DeliveryChargeRule,
  formatCurrency,
  resetDeliveryChargeRules,
  saveDeliveryChargeRules,
  useDeliveryChargeRules,
} from "@/lib/order-pricing";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
const ADMIN_SESSION_URL = `${API_BASE_URL}/api/admin/session`;
const ADMIN_CHANGE_PASSWORD_URL = `${API_BASE_URL}/api/admin/change-password`;
const ADMIN_DASHBOARD_URL = `${API_BASE_URL}/api/admin/dashboard`;
const PRODUCT_IMAGE_UPLOAD_URL = `${API_BASE_URL}/api/products/upload`;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const loginSchema = z.object({
  username: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  badge: z.string().optional(),
  inStock: z.boolean(),
  featured: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;
type ProductValues = z.infer<typeof productSchema>;
type AuthState = "checking" | "authenticated" | "unauthenticated";
type AdminSection = "overview" | "delivery" | "create" | "list" | "settings";

interface AdminDashboardData {
  username: string;
  summary: {
    totalProducts: number;
    featuredProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
  };
  recentProducts: Product[];
}

const PRODUCT_FALLBACK_IMAGE = "/images/gallery-1.png";

function formatAdminDisplayName(username?: string) {
  if (!username) return "Katiyar Nursery";

  const normalized = username
    .replace(/[_-]+/g, " ")
    .replace(/\b\d{4,}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "Katiyar Nursery";

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {}

  return response.statusText || "Request failed";
}

async function readFileAsDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-y-auto bg-[linear-gradient(135deg,#fff8fb_0%,#fffdf8_50%,#f5fff8_100%)] p-3 md:h-screen md:overflow-hidden md:p-5 dark:bg-[linear-gradient(135deg,#160a10_0%,#130f0b_50%,#08140e_100%)]">
      {children}
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const response = await fetch(ADMIN_SESSION_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        form.setError("password", { type: "manual", message: await parseError(response) });
        return;
      }

      toast({ title: "Admin login successful" });
      onSuccess();
    } catch {
      form.setError("password", {
        type: "manual",
        message: "Unable to reach admin server",
      });
    }
  };

  return (
    <PageShell>
      <div className="mx-auto flex h-full max-w-6xl items-center justify-center rounded-[36px] border-[3px] border-black/90 bg-white/90 p-6 shadow-[0_30px_80px_rgba(132,24,58,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#131112]/95 dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="w-full max-w-md rounded-[30px] border-[3px] border-[#3c1723] bg-[linear-gradient(180deg,#fff8fb_0%,#fffef8_100%)] p-8 dark:border-[#4f2b37] dark:bg-[linear-gradient(180deg,#23151b_0%,#161412_100%)]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full border-[3px] border-[#3c1723] bg-white shadow-sm dark:border-[#6d4450] dark:bg-[#1f1a1b]">
              <img src="/logo.png" alt="Katiyar Nursery" className="h-11 w-11 rounded-full object-cover" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-[#3c1723] dark:text-white">Admin Panel</h1>
            <p className="mt-2 text-sm text-[#6e5560] dark:text-[#c7b6be]">
              Sign in to manage products, delivery charges, and theme settings.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                {...form.register("username")}
                placeholder="User ID"
                className="h-12 rounded-2xl border-2 border-[#3c1723] bg-white dark:border-[#6d4450] dark:bg-[#181415]"
              />
              {form.formState.errors.username && (
                <p className="mt-2 text-sm text-red-600">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div>
              <Input
                type="password"
                {...form.register("password")}
                placeholder="Password"
                className="h-12 rounded-2xl border-2 border-[#3c1723] bg-white dark:border-[#6d4450] dark:bg-[#181415]"
              />
              {form.formState.errors.password && (
                <p className="mt-2 text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button className="h-12 w-full rounded-2xl bg-[#8e2248] text-white hover:bg-[#771c3d]">
              Login
            </Button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-left text-sm font-semibold transition-all",
        active
          ? "border-[#8e2248] bg-[#8e2248] text-white shadow-[0_16px_30px_rgba(142,34,72,0.28)]"
          : "border-black/10 bg-white/80 text-[#382027] hover:border-[#8e2248]/35 hover:bg-[#fff4f8] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-[#d55486]/45 dark:hover:bg-white/8",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MobileTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "border-[#8e2248] bg-[#8e2248] text-white"
          : "border-black/10 bg-white/85 text-[#382027] dark:border-white/10 dark:bg-white/5 dark:text-white",
      )}
    >
      {label}
    </button>
  );
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(
      "rounded-[28px] border border-black/10 bg-white/80 p-5 shadow-[0_18px_40px_rgba(132,24,58,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none",
      className,
    )}>
      <div className="mb-5">
        <h2 className="font-heading text-2xl font-bold text-[#30151e] dark:text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[#705964] dark:text-[#c8bac0]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function AdminShellSkeleton() {
  return (
    <PageShell>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:h-full md:grid-cols-[228px_minmax(0,1fr)]">
        <aside className="hidden h-full min-h-0 flex-col rounded-[32px] border border-black/10 bg-white/85 p-4 shadow-[0_24px_50px_rgba(132,24,58,0.1)] backdrop-blur dark:border-white/10 dark:bg-white/5 md:flex">
          <div className="rounded-[28px] border border-[#8e2248]/15 bg-[linear-gradient(180deg,#fff7fa_0%,#fffef9_46%,#f5fff8_100%)] p-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,#23151b_0%,#171214_60%,#121715_100%)]">
            <Skeleton className="h-15 w-15 rounded-[22px]" />
            <Skeleton className="mt-4 h-6 w-36 rounded-full" />
            <Skeleton className="mt-2 h-4 w-24 rounded-full" />
            <Skeleton className="mt-4 h-12 w-full rounded-[20px]" />
          </div>
          <div className="mt-4 space-y-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-[20px]" />
            ))}
          </div>
          <div className="mt-auto space-y-3 pt-3">
            <Skeleton className="h-28 w-full rounded-[22px]" />
            <Skeleton className="h-14 w-14 rounded-full" />
          </div>
        </aside>

        <main className="overflow-visible rounded-[30px] border border-black/10 bg-white/70 p-4 shadow-[0_18px_40px_rgba(132,24,58,0.08)] backdrop-blur md:h-full md:overflow-hidden md:p-5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <div className="mb-4 space-y-3 md:hidden">
            <Skeleton className="h-24 w-full rounded-[26px]" />
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-24 rounded-full" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 w-full rounded-[22px]" />
              <Skeleton className="h-24 w-full rounded-[22px]" />
            </div>
          </div>

          <div className="flex h-full flex-col gap-4 md:gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-10 w-64 rounded-full" />
                <Skeleton className="h-4 w-80 rounded-full" />
              </div>
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-36 w-full rounded-[26px]" />
              ))}
            </div>

            <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Skeleton className="h-[360px] w-full rounded-[28px]" />
              <Skeleton className="h-[360px] w-full rounded-[28px]" />
            </div>
          </div>
        </main>
      </div>
    </PageShell>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [deliveryDraft, setDeliveryDraft] = useState<DeliveryChargeRule[]>(DEFAULT_DELIVERY_CHARGE_RULES);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageName, setUploadedImageName] = useState("");

  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const deliveryRules = useDeliveryChargeRules();

  const productForm = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      unit: "plant",
      imageUrl: "",
      badge: "",
      inStock: true,
      featured: false,
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const visibleSummary = useMemo(() => {
    if (dashboardData) return dashboardData.summary;
    const totalProducts = products.length;
    const featuredProducts = products.filter((product) => product.featured).length;
    const inStockProducts = products.filter((product) => product.inStock).length;
    return {
      totalProducts,
      featuredProducts,
      inStockProducts,
      outOfStockProducts: totalProducts - inStockProducts,
    };
  }, [dashboardData, products]);

  const adminDisplayName = useMemo(
    () => formatAdminDisplayName(dashboardData?.username),
    [dashboardData?.username],
  );

  useEffect(() => {
    setDeliveryDraft((current) => {
      const currentSerialized = JSON.stringify(current);
      const nextSerialized = JSON.stringify(deliveryRules);
      return currentSerialized === nextSerialized ? current : deliveryRules;
    });
  }, [deliveryRules]);

  const reloadProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
  };

  const loadDashboard = async () => {
    setDashboardLoading(true);
    try {
      const response = await fetch(ADMIN_DASHBOARD_URL, { credentials: "include" });
      if (response.status === 401) {
        setAuthState("unauthenticated");
        return;
      }
      if (!response.ok) {
        throw new Error(await parseError(response));
      }
      setDashboardData((await response.json()) as AdminDashboardData);
    } catch (error) {
      toast({
        title: "Dashboard load failed",
        description: error instanceof Error ? error.message : "Unable to load dashboard",
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const response = await fetch(ADMIN_SESSION_URL, { credentials: "include" });
        if (!mounted) return;
        setAuthState(response.ok ? "authenticated" : "unauthenticated");
      } catch {
        if (!mounted) return;
        setAuthState("unauthenticated");
      }
    };
    void checkSession();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (authState === "authenticated") {
      void loadDashboard();
    }
  }, [authState]);

  const handleApiError = (error: unknown, fallback: string) => {
    const apiError = error as { status?: number; data?: { message?: string } } | undefined;
    if (apiError?.status === 401) {
      setAuthState("unauthenticated");
      toast({ title: "Admin session expired", description: "Please login again." });
      return;
    }
    toast({
      title: "Request failed",
      description: typeof apiError?.data?.message === "string" ? apiError.data.message : fallback,
    });
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setUploadedImageName("");
    productForm.reset({
      name: "",
      description: "",
      price: 0,
      unit: "plant",
      imageUrl: "",
      badge: "",
      inStock: true,
      featured: false,
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setActiveSection("create");
    setUploadedImageName("");
    productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      badge: product.badge ?? "",
      inStock: product.inStock,
      featured: product.featured,
    });
  };

  const handleProductImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Unsupported image format",
        description: "Please upload JPG, PNG, WEBP, or GIF image files.",
      });
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const response = await fetch(PRODUCT_IMAGE_UPLOAD_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          dataUrl,
        }),
      });

      if (response.status === 401) {
        setAuthState("unauthenticated");
        toast({ title: "Admin session expired", description: "Please login again." });
        return;
      }

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const payload = (await response.json()) as { imageUrl: string };
      productForm.setValue("imageUrl", payload.imageUrl, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setUploadedImageName(file.name);
      toast({
        title: "Image uploaded",
        description: editingProduct ? "Product image is ready to update." : "Product image is ready to save.",
      });
    } catch (error) {
      toast({
        title: "Image upload failed",
        description: error instanceof Error ? error.message : "Unable to upload image right now.",
      });
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleProductSubmit = (values: ProductValues) => {
    const payload = {
      ...values,
      badge: values.badge?.trim() ? values.badge.trim() : null,
    };

    const onSuccess = async () => {
      toast({ title: editingProduct ? "Product updated" : "Product created" });
      resetProductForm();
      await reloadProducts();
      await loadDashboard();
      setActiveSection("list");
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: payload },
        {
          onSuccess: () => void onSuccess(),
          onError: (error) => handleApiError(error, "Unable to update product"),
        },
      );
      return;
    }

    createProduct.mutate(
      { data: payload },
      {
        onSuccess: () => void onSuccess(),
        onError: (error) => handleApiError(error, "Unable to create product"),
      },
    );
  };

  const handleDeleteProduct = (productId: number) => {
    if (!window.confirm("Delete this product?")) return;
    deleteProduct.mutate(
      { id: productId },
      {
        onSuccess: async () => {
          toast({ title: "Product deleted" });
          await reloadProducts();
          await loadDashboard();
        },
        onError: (error) => handleApiError(error, "Unable to delete product"),
      },
    );
  };

  const handlePasswordSubmit = async (values: PasswordValues) => {
    try {
      const response = await fetch(ADMIN_CHANGE_PASSWORD_URL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        passwordForm.setError("currentPassword", {
          type: "manual",
          message: await parseError(response),
        });
        return;
      }

      toast({
        title: "Password updated",
        description: "Please login again with the new password.",
      });
      passwordForm.reset();
      setAuthState("unauthenticated");
    } catch {
      toast({
        title: "Password change failed",
        description: "Unable to update password right now.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(ADMIN_SESSION_URL, { method: "DELETE", credentials: "include" });
    } finally {
      setAuthState("unauthenticated");
    }
  };

  if (authState === "checking") {
    return <AdminShellSkeleton />;
  }

  if (authState !== "authenticated") {
    return <AdminLogin onSuccess={() => setAuthState("authenticated")} />;
  }

  return (
    <PageShell>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:h-full md:grid-cols-[228px_minmax(0,1fr)]">
        <aside className="hidden h-full min-h-0 flex-col rounded-[32px] border border-black/10 bg-white/85 p-4 shadow-[0_24px_50px_rgba(132,24,58,0.1)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none md:flex">
          <div className="overflow-hidden rounded-[28px] border border-[#8e2248]/15 bg-[linear-gradient(180deg,#fff7fa_0%,#fffef9_46%,#f5fff8_100%)] p-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,#23151b_0%,#171214_60%,#121715_100%)]">
            <div className="mb-3 flex h-15 w-15 items-center justify-center rounded-[22px] border-2 border-[#8e2248]/35 bg-white shadow-[0_12px_24px_rgba(142,34,72,0.12)] dark:bg-[#1d1819]">
              <img src="/logo.png" alt="Katiyar Nursery" className="h-11 w-11 rounded-full object-cover" />
            </div>
            <div className="space-y-1">
              <p className="font-heading line-clamp-2 text-lg font-bold leading-tight text-[#341721] dark:text-white">
                {adminDisplayName}
              </p>
              <p className="text-xs text-[#735a66] dark:text-[#c8bac0]">Premium nursery dashboard</p>
            </div>
            <div className="mt-3 rounded-[20px] border border-white/70 bg-white/75 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8e2248] dark:text-[#f3a9c5]">
                Admin Studio
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            <NavButton
              active={activeSection === "overview"}
              icon={<Boxes className="h-4 w-4" />}
              label="Product Overview"
              onClick={() => setActiveSection("overview")}
            />
            <NavButton
              active={activeSection === "delivery"}
              icon={<Truck className="h-4 w-4" />}
              label="Delivery Charges"
              onClick={() => setActiveSection("delivery")}
            />
            <NavButton
              active={activeSection === "create"}
              icon={<CirclePlus className="h-4 w-4" />}
              label="Create Product"
              onClick={() => {
                resetProductForm();
                setActiveSection("create");
              }}
            />
            <NavButton
              active={activeSection === "list"}
              icon={<List className="h-4 w-4" />}
              label="Product List"
              onClick={() => setActiveSection("list")}
            />
            <NavButton
              active={activeSection === "settings"}
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              onClick={() => setActiveSection("settings")}
            />
          </div>

          <div className="mt-auto space-y-3 pt-3">
            <div className="rounded-[22px] border border-black/10 bg-[linear-gradient(135deg,#fff5f8_0%,#f6fff8_100%)] p-3 dark:border-white/10 dark:bg-[linear-gradient(135deg,#2b1720_0%,#132019_100%)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8e2248] dark:text-[#f3a9c5]">
                Catalog Status
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div>
                  <p className="font-heading text-xl font-bold text-[#341721] dark:text-white">
                    {visibleSummary.totalProducts}
                  </p>
                  <p className="text-xs text-[#735a66] dark:text-[#c8bac0]">Products</p>
                </div>
                <div>
                  <p className="font-heading text-xl font-bold text-[#341721] dark:text-white">
                    {visibleSummary.featuredProducts}
                  </p>
                  <p className="text-xs text-[#735a66] dark:text-[#c8bac0]">Featured</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-black/15 bg-white text-[#3b1a23] transition hover:bg-[#8e2248] hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </aside>

        <main className="overflow-visible rounded-[30px] border border-black/10 bg-white/70 p-4 shadow-[0_18px_40px_rgba(132,24,58,0.08)] backdrop-blur md:h-full md:overflow-hidden md:p-5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <div className="mb-4 space-y-3 md:hidden">
            <div className="rounded-[26px] border border-[#8e2248]/15 bg-[linear-gradient(180deg,#fff7fa_0%,#fffef9_46%,#f5fff8_100%)] p-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,#23151b_0%,#171214_60%,#121715_100%)]">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border-2 border-[#8e2248]/35 bg-white dark:bg-[#1d1819]">
                  <img src="/logo.png" alt="Katiyar Nursery" className="h-9 w-9 rounded-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading truncate text-lg font-bold text-[#341721] dark:text-white">
                    {adminDisplayName}
                  </p>
                  <p className="text-xs text-[#735a66] dark:text-[#c8bac0]">Premium nursery dashboard</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/15 bg-white text-[#3b1a23] dark:border-white/10 dark:bg-white/5 dark:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-2 px-1">
                <MobileTabButton active={activeSection === "overview"} label="Overview" onClick={() => setActiveSection("overview")} />
                <MobileTabButton active={activeSection === "delivery"} label="Delivery" onClick={() => setActiveSection("delivery")} />
                <MobileTabButton
                  active={activeSection === "create"}
                  label="Create"
                  onClick={() => {
                    resetProductForm();
                    setActiveSection("create");
                  }}
                />
                <MobileTabButton active={activeSection === "list"} label="Products" onClick={() => setActiveSection("list")} />
                <MobileTabButton active={activeSection === "settings"} label="Settings" onClick={() => setActiveSection("settings")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-black/10 bg-[linear-gradient(135deg,#fff5f8_0%,#f6fff8_100%)] p-3 dark:border-white/10 dark:bg-[linear-gradient(135deg,#2b1720_0%,#132019_100%)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8e2248] dark:text-[#f3a9c5]">
                  Products
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-[#341721] dark:text-white">
                  {visibleSummary.totalProducts}
                </p>
              </div>
              <div className="rounded-[22px] border border-black/10 bg-[linear-gradient(135deg,#fff5f8_0%,#f6fff8_100%)] p-3 dark:border-white/10 dark:bg-[linear-gradient(135deg,#2b1720_0%,#132019_100%)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8e2248] dark:text-[#f3a9c5]">
                  Featured
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-[#341721] dark:text-white">
                  {visibleSummary.featuredProducts}
                </p>
              </div>
            </div>
          </div>

          {activeSection === "overview" && (
            <div className="flex h-full flex-col gap-4 md:gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <h1 className="font-heading text-3xl font-bold text-[#2f141d] dark:text-white md:text-4xl">
                    Product Overview
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-[#705964] dark:text-[#c8bac0]">
                    A calm dashboard view of the catalog using the same soft nursery palette as the storefront.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => void loadDashboard()}
                  className="rounded-full bg-[#8e2248] text-white hover:bg-[#741a3c]"
                >
                  {dashboardLoading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Total Products", visibleSummary.totalProducts, "from-rose-100 to-white dark:from-[#3c1826] dark:to-[#1b1417]"],
                  ["Featured", visibleSummary.featuredProducts, "from-pink-100 to-white dark:from-[#391c29] dark:to-[#1b1417]"],
                  ["In Stock", visibleSummary.inStockProducts, "from-emerald-100 to-white dark:from-[#173025] dark:to-[#131714]"],
                  ["Out of Stock", visibleSummary.outOfStockProducts, "from-orange-100 to-white dark:from-[#382317] dark:to-[#181412]"],
                ].map(([label, value, gradient]) => (
                  <div
                    key={String(label)}
                    className={cn(
                      "rounded-[26px] border border-black/10 bg-gradient-to-br p-4 dark:border-white/10 md:p-5",
                      String(gradient),
                    )}
                  >
                    <p className="text-sm font-medium text-[#6e5460] dark:text-[#c9bec3]">{label}</p>
                    <p className="mt-3 font-heading text-4xl font-bold text-[#31161f] dark:text-white md:text-5xl">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <SectionCard
                  title="Recent Products"
                  description="Latest products synced from the product API."
                >
                  <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
                    {dashboardLoading && !dashboardData && products.length === 0 ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-[22px] border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-14 w-14 rounded-[18px]" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-36 rounded-full" />
                              <Skeleton className="h-3 w-24 rounded-full" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                      ))
                    ) : (
                      (dashboardData?.recentProducts ?? products.slice(0, 6)).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-[22px] border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-14 w-14 rounded-[18px] object-cover ring-1 ring-black/10 dark:ring-white/10"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE; }}
                          />
                          <div>
                            <p className="font-semibold text-[#30151e] dark:text-white">{product.name}</p>
                            <p className="text-sm text-[#705964] dark:text-[#c8bac0]">
                              {formatCurrency(product.price)} / {product.unit}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          product.inStock
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
                        )}>
                          {product.inStock ? "In Stock" : "Out"}
                        </span>
                      </div>
                      ))
                    )}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Quick Actions"
                  description="Jump directly into the most used admin tasks."
                >
                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        resetProductForm();
                        setActiveSection("create");
                      }}
                      className="rounded-[22px] border border-[#8e2248]/20 bg-[#fff5f8] p-4 text-left transition hover:border-[#8e2248]/40 hover:bg-[#fff0f5] dark:border-[#d55486]/20 dark:bg-[#2a161d] dark:hover:border-[#d55486]/35"
                    >
                      <p className="font-semibold text-[#31161f] dark:text-white">Create a new product</p>
                      <p className="mt-1 text-sm text-[#705964] dark:text-[#c8bac0]">Open the product form and add a new catalog item.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("list")}
                      className="rounded-[22px] border border-emerald-500/20 bg-[#f4fff9] p-4 text-left transition hover:border-emerald-500/40 hover:bg-[#effcf6] dark:border-emerald-500/20 dark:bg-[#102018] dark:hover:border-emerald-500/35"
                    >
                      <p className="font-semibold text-[#31161f] dark:text-white">Open product list</p>
                      <p className="mt-1 text-sm text-[#705964] dark:text-[#c8bac0]">Review existing products, edit details, or delete items.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("settings")}
                      className="rounded-[22px] border border-amber-500/20 bg-[#fffaf1] p-4 text-left transition hover:border-amber-500/40 hover:bg-[#fff6ea] dark:border-amber-500/20 dark:bg-[#241b11] dark:hover:border-amber-500/35"
                    >
                      <p className="font-semibold text-[#31161f] dark:text-white">Open settings</p>
                      <p className="mt-1 text-sm text-[#705964] dark:text-[#c8bac0]">Change password and switch between bright and dark mode.</p>
                    </button>
                  </div>
                </SectionCard>
              </div>
            </div>
          )}

          {activeSection === "delivery" && (
            <SectionCard
              title="Delivery Charges"
              description="The dashboard stays fixed while delivery rules scroll inside this panel only."
              className="md:flex md:h-full md:min-h-0 md:flex-col"
            >
              <div className="space-y-3 md:min-h-0 md:flex-1 md:overflow-auto md:pr-1">
                {deliveryDraft.map((rule) => (
                  <div
                    key={rule.upto}
                    className="grid gap-3 rounded-[22px] border border-black/10 bg-white p-3 md:grid-cols-[1.2fr_0.8fr_1fr] md:p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div>
                      <p className="font-semibold text-[#2f141d] dark:text-white">{rule.label}</p>
                      <p className="text-sm text-[#705964] dark:text-[#c8bac0]">Up to {rule.upto} plants</p>
                    </div>
                    <div className="flex items-center font-semibold text-[#2f141d] dark:text-white">
                      {formatCurrency(rule.charge)}
                    </div>
                    <Input
                      type="number"
                      value={rule.charge}
                      onChange={(event) =>
                        setDeliveryDraft((current) =>
                          current.map((item) =>
                            item.upto === rule.upto
                              ? { ...item, charge: Number(event.target.value || 0) }
                              : item,
                          ),
                        )
                      }
                      className="h-11 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    saveDeliveryChargeRules(deliveryDraft);
                    toast({ title: "Delivery charges updated" });
                  }}
                  className="rounded-full bg-[#8e2248] text-white hover:bg-[#741a3c]"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Charges
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetDeliveryChargeRules();
                    setDeliveryDraft(DEFAULT_DELIVERY_CHARGE_RULES);
                    toast({ title: "Delivery charges reset" });
                  }}
                  className="rounded-full border-black/15 bg-white hover:bg-[#f7f4f5] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                >
                  Reset Default
                </Button>
              </div>
            </SectionCard>
          )}

          {activeSection === "create" && (
            <SectionCard
              title={editingProduct ? "Edit Product" : "Create Product"}
              description="A dedicated product form with the same soft storefront styling."
              className="md:flex md:h-full md:min-h-0 md:flex-col"
            >
              <form
                onSubmit={productForm.handleSubmit(handleProductSubmit)}
                className="space-y-3 md:min-h-0 md:flex-1 md:space-y-3 md:overflow-auto md:pr-1"
              >
                <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="rounded-[24px] border border-[#8e2248]/15 bg-[linear-gradient(180deg,#fff7fa_0%,#fffef9_46%,#f5fff8_100%)] p-3 dark:border-white/10 dark:bg-[linear-gradient(180deg,#23151b_0%,#171214_60%,#121715_100%)]">
                    <div className="overflow-hidden rounded-[20px] border border-black/10 bg-white/80 dark:border-white/10 dark:bg-white/5">
                      <img
                        src={productForm.watch("imageUrl") || PRODUCT_FALLBACK_IMAGE}
                        alt="Product preview"
                        className="h-44 w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8e2248] dark:text-[#f3a9c5]">
                      Product Image
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#6d5560] dark:text-[#c8bac0]">
                      Upload from your device or paste an image URL. The latest uploaded photo can be used while creating or editing a product.
                    </p>
                    <label className="mt-3 flex cursor-pointer items-center justify-center rounded-full bg-[#8e2248] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#741a3c]">
                      {isUploadingImage ? "Uploading..." : editingProduct ? "Replace Image" : "Upload Image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        onChange={handleProductImageSelection}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </label>
                    <p className="mt-2 text-xs text-[#735a66] dark:text-[#c8bac0]">
                      {uploadedImageName
                        ? `Selected: ${uploadedImageName}`
                        : editingProduct
                          ? "Upload a new photo to replace the current product image."
                          : "No local file uploaded yet."}
                    </p>
                  </div>

                  <div className="space-y-3">
                <div>
                  <Input
                    {...productForm.register("name")}
                    placeholder="Product name"
                    className="h-10 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                  />
                  {productForm.formState.errors.name && (
                    <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Textarea
                    {...productForm.register("description")}
                    placeholder="Product description"
                    className="min-h-24 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                  />
                  {productForm.formState.errors.description && (
                    <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      {...productForm.register("price")}
                      placeholder="Price"
                      className="h-10 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                    />
                    {productForm.formState.errors.price && (
                      <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...productForm.register("unit")}
                      placeholder="Unit"
                      className="h-10 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                    />
                    {productForm.formState.errors.unit && (
                      <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.unit.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Input
                    {...productForm.register("imageUrl")}
                    placeholder="Image URL or uploaded image path"
                    className="h-10 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                  />
                  {productForm.formState.errors.imageUrl && (
                    <p className="mt-2 text-sm text-red-600">{productForm.formState.errors.imageUrl.message}</p>
                  )}
                  <p className="mt-2 text-xs text-[#705964] dark:text-[#c8bac0]">
                    You can paste a direct image URL, or use the upload button to pick a photo from local storage.
                  </p>
                </div>

                <Input
                  {...productForm.register("badge")}
                  placeholder="Badge (optional)"
                  className="h-10 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between rounded-[22px] border border-black/10 bg-white px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
                    <span className="font-semibold text-[#2f141d] dark:text-white">In Stock</span>
                    <Switch
                      checked={productForm.watch("inStock")}
                      onCheckedChange={(checked) => productForm.setValue("inStock", checked, { shouldDirty: true })}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-[22px] border border-black/10 bg-white px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
                    <span className="font-semibold text-[#2f141d] dark:text-white">Featured</span>
                    <Switch
                      checked={productForm.watch("featured")}
                      onCheckedChange={(checked) => productForm.setValue("featured", checked, { shouldDirty: true })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:gap-3">
                  <Button
                    type="submit"
                    disabled={createProduct.isPending || updateProduct.isPending || isUploadingImage}
                    className="rounded-full bg-[#8e2248] text-white hover:bg-[#741a3c]"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetProductForm}
                    className="rounded-full border-black/15 bg-white hover:bg-[#f7f4f5] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                  >
                    Clear Form
                  </Button>
                </div>
                  </div>
                </div>
              </form>
            </SectionCard>
          )}

          {activeSection === "list" && (
            <SectionCard
              title="Product List"
              description="A dedicated list section separate from product creation."
              className="md:flex md:h-full md:min-h-0 md:flex-col"
            >
              <div className="space-y-3 md:min-h-0 md:flex-1 md:overflow-auto md:pr-1">
                {productsLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-[24px] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex gap-3">
                          <Skeleton className="h-22 w-22 rounded-[20px]" />
                          <div className="min-w-0 space-y-2">
                            <Skeleton className="h-6 w-48 rounded-full" />
                            <Skeleton className="h-4 w-80 rounded-full" />
                            <Skeleton className="h-4 w-64 rounded-full" />
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Skeleton className="h-7 w-20 rounded-full" />
                              <Skeleton className="h-7 w-16 rounded-full" />
                              <Skeleton className="h-7 w-24 rounded-full" />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-10 w-24 rounded-full" />
                          <Skeleton className="h-10 w-24 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : products.length === 0 ? (
                  <div className="rounded-[22px] border border-black/10 bg-white p-4 text-sm text-[#705964] dark:border-white/10 dark:bg-white/5 dark:text-[#c8bac0]">
                    No products found.
                  </div>
                ) : (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-[24px] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-22 w-22 rounded-[20px] object-cover ring-1 ring-black/10 dark:ring-white/10"
                            onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE; }}
                          />
                          <div className="min-w-0">
                            <p className="font-heading text-lg font-bold text-[#2f141d] dark:text-white md:text-xl">{product.name}</p>
                            <p className="mt-1 max-w-2xl text-sm text-[#705964] dark:text-[#c8bac0]">{product.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                              <span className="rounded-full bg-[#fff4f8] px-3 py-1 text-[#8e2248] dark:bg-[#311722] dark:text-[#f4b1ca]">
                                {formatCurrency(product.price)}
                              </span>
                              <span className="rounded-full bg-[#f1fff7] px-3 py-1 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                {product.unit}
                              </span>
                              <span className="rounded-full bg-[#fff8ef] px-3 py-1 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                {product.inStock ? "In Stock" : "Out of Stock"}
                              </span>
                              {product.featured ? (
                                <span className="rounded-full bg-[#2f141d] px-3 py-1 text-white">Featured</span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            className="rounded-full border-black/15 bg-white hover:bg-[#f7f4f5] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteProduct.isPending}
                            className="rounded-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          )}

          {activeSection === "settings" && (
            <div className="flex flex-col gap-5 overflow-visible md:h-full md:overflow-hidden">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-black/10 bg-[linear-gradient(135deg,#fff4f8_0%,#fffef9_100%)] p-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,#2b161e_0%,#161313_100%)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8e2248] dark:text-[#f3a9c5]">
                    Current Theme
                  </p>
                  <p className="mt-3 font-heading text-3xl font-bold text-[#2f141d] dark:text-white">
                    {theme === "dark" ? "Dark" : "Bright"}
                  </p>
                  <p className="mt-2 text-sm text-[#705964] dark:text-[#c8bac0]">
                    Tuned to match the storefront palette and keep the workspace polished.
                  </p>
                </div>
                <div className="rounded-[24px] border border-black/10 bg-[linear-gradient(135deg,#f2fff7_0%,#fffdf7_100%)] p-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,#112018_0%,#151313_100%)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                    Access Name
                  </p>
                  <p className="mt-3 font-heading text-3xl font-bold text-[#2f141d] dark:text-white">
                    {adminDisplayName}
                  </p>
                  <p className="mt-2 text-sm text-[#705964] dark:text-[#c8bac0]">
                    Simplified display label for a cleaner premium sidebar presentation.
                  </p>
                </div>
                <div className="rounded-[24px] border border-black/10 bg-[linear-gradient(135deg,#fffaf1_0%,#f6fff9_100%)] p-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,#261a10_0%,#121915_100%)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
                    Workspace Feel
                  </p>
                  <p className="mt-3 font-heading text-3xl font-bold text-[#2f141d] dark:text-white">
                    Premium
                  </p>
                  <p className="mt-2 text-sm text-[#705964] dark:text-[#c8bac0]">
                    Fuller cards, softer gradients, and better visual balance across the page.
                  </p>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <SectionCard
                title="Settings"
                description="Manage password, bright mode, and dark mode from one clean panel."
                className="md:flex md:min-h-0 md:flex-col"
              >
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                  className="space-y-4 md:min-h-0 md:flex-1 md:overflow-auto md:pr-1"
                >
                  <div>
                    <Input
                      type="password"
                      {...passwordForm.register("currentPassword")}
                      placeholder="Current password"
                      className="h-11 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="password"
                      {...passwordForm.register("newPassword")}
                      placeholder="New password"
                      className="h-11 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="mt-2 text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                      placeholder="Confirm password"
                      className="h-11 rounded-2xl border-2 border-black/15 bg-white dark:border-white/10 dark:bg-[#171415]"
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <Button className="rounded-full bg-[#8e2248] text-white hover:bg-[#741a3c]">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </form>
              </SectionCard>

              <SectionCard
                title="Theme Mode"
                description="Switch the admin dashboard between bright and dark mode."
                className="md:min-h-0 md:overflow-auto"
              >
                <div className="grid gap-4">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex items-center justify-between rounded-[24px] border p-5 text-left transition-all",
                      theme === "light"
                        ? "border-[#8e2248] bg-[#fff4f8] shadow-[0_18px_30px_rgba(142,34,72,0.12)] dark:bg-[#2c1820]"
                        : "border-black/10 bg-white hover:border-[#8e2248]/30 dark:border-white/10 dark:bg-white/5",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff1c9] text-amber-600">
                        <Sun className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#2f141d] dark:text-white">Bright Mode</p>
                        <p className="text-sm text-[#705964] dark:text-[#c8bac0]">Warm and airy storefront-inspired layout</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#8e2248] dark:text-[#f3a9c5]">
                      {theme === "light" ? "Active" : "Use"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex items-center justify-between rounded-[24px] border p-5 text-left transition-all",
                      theme === "dark"
                        ? "border-[#d55486] bg-[#24131a] shadow-[0_18px_30px_rgba(0,0,0,0.25)]"
                        : "border-black/10 bg-white hover:border-[#d55486]/30 dark:border-white/10 dark:bg-white/5",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f2235] text-slate-200">
                        <Moon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#2f141d] dark:text-white">Dark Mode</p>
                        <p className="text-sm text-[#705964] dark:text-[#c8bac0]">Elegant low-light dashboard for focus</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#8e2248] dark:text-[#f3a9c5]">
                      {theme === "dark" ? "Active" : "Use"}
                    </span>
                  </button>

                  <div className="rounded-[24px] border border-black/10 bg-[linear-gradient(135deg,#fff6fa_0%,#f7fff9_100%)] p-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,#2a171e_0%,#132119_100%)]">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-5 w-5 text-[#8e2248] dark:text-[#f3a9c5]" />
                      <p className="font-semibold text-[#2f141d] dark:text-white">
                        Current theme: {theme === "dark" ? "Dark" : "Bright"}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-[#705964] dark:text-[#c8bac0]">
                      The admin now keeps the same nursery-inspired look as the main website while still matching the structured panel layout you requested.
                    </p>
                  </div>
                </div>
              </SectionCard>
              </div>
            </div>
          )}
        </main>
      </div>
    </PageShell>
  );
}
