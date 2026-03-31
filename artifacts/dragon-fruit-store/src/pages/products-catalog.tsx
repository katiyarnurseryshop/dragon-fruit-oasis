import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useGetProducts, useGetStoreStats } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import {
  Search,
  Leaf,
  Package,
  Filter,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight,
  ShoppingCart,
} from "lucide-react";

const ITEMS_PER_PAGE = 12;
const FILTER_OPTIONS = ["All", "Featured", "Under ₹200", "₹200–₹500", "Above ₹500"];

export default function ProductsCatalog() {
  const { data: products, isLoading } = useGetProducts();
  const { data: stats } = useGetStoreStats();
  const { addItem } = useCart();
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return (products ?? []).filter((p) => {
      const matchSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const price = Number(p.price);
      const matchFilter =
        activeFilter === "All" ||
        (activeFilter === "Featured" && p.featured) ||
        (activeFilter === "Under ₹200" && price < 200) ||
        (activeFilter === "₹200–₹500" && price >= 200 && price <= 500) ||
        (activeFilter === "Above ₹500" && price > 500);

      return matchSearch && matchFilter;
    });
  }, [products, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (f: string) => {
    setActiveFilter(f);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const openProduct = (id: number) => {
    setLocation(`/products/${id}`);
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const delta = 2;
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Page Hero */}
      <section className="pt-32 pb-14 bg-gradient-to-b from-primary/10 via-background to-background border-b border-border">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src="/logo.png" alt="Katiyar Nursery" className="w-16 h-16 rounded-full shadow-lg" />
            </div>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-sm font-medium">
              <Leaf className="w-3.5 h-3.5 mr-1.5 inline-block" />
              Katiyar Dragon Fruit Nursery
            </Badge>
            <h1 className="font-heading font-bold text-4xl md:text-6xl mb-4 text-foreground">
              Our Plant Catalog
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              50+ premium dragon fruit varieties — handpicked, organically grown, and shipped fresh from Kanpur, UP.
            </p>
          </motion.div>

          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 flex flex-wrap justify-center gap-8"
            >
              {[
                { label: "Plant Varieties", value: `${stats.totalProducts}+` },
                { label: "Happy Customers", value: `${stats.happyCustomers}+` },
                { label: "Cities Delivered", value: stats.citiesDelivered },
                { label: "Years of Experience", value: stats.yearsOfFarming },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-heading font-bold text-3xl text-primary">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-5 sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 md:px-6 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-search-products"
              placeholder="Search plants..."
              className="pl-9 rounded-full border-border"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                data-testid={`filter-${f}`}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground shrink-0">
            {filtered.length} plants
          </span>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border">
                  <Skeleton className="h-56 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-1/3 mt-2" />
                    <Skeleton className="h-10 w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading font-bold text-2xl mb-2">No plants found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter.</p>
              <Button
                variant="outline"
                className="mt-6 rounded-full"
                onClick={() => { handleSearchChange(""); setActiveFilter("All"); }}
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map((product, i) => (
                <motion.div
                  key={product.id}
                  data-testid={`card-product-${product.id}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="group rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                  onClick={() => openProduct(product.id)}
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-muted shrink-0">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400&q=70";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      {product.badge && (
                        <Badge className="bg-primary text-primary-foreground font-semibold text-[10px] px-2.5 py-0.5 rounded-full shadow">
                          {product.badge}
                        </Badge>
                      )}
                      {product.featured && !product.badge && (
                        <Badge className="bg-yellow-400 text-yellow-900 font-semibold text-[10px] px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-yellow-900" /> Featured
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/90 text-zinc-800 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading font-bold text-base mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-xs mb-4 line-clamp-2 flex-1 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto mb-3">
                      <div>
                        <span className="font-heading font-bold text-2xl text-primary">
                          ₹{product.price}
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">/{product.unit}</span>
                      </div>
                      <span className="text-xs font-medium text-secondary flex items-center gap-1 border border-secondary/30 bg-secondary/10 rounded-full px-2.5 py-1">
                        <CheckCircle2 className="w-3 h-3" /> In Stock
                      </span>
                    </div>
                    <Button
                      className="w-full rounded-full h-9 text-sm font-semibold gap-2"
                      disabled={!product.inStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          unit: product.unit,
                          imageUrl: product.imageUrl,
                        });
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {currentPage > 3 && (
                <>
                  <button
                    className="w-9 h-9 rounded-full text-sm font-medium border border-border hover:border-primary hover:text-primary transition-all"
                    onClick={() => setPage(1)}
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-muted-foreground px-1">…</span>}
                </>
              )}

              {pageNumbers.map((n) => (
                <button
                  key={n}
                  data-testid={`button-page-${n}`}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-full text-sm font-medium border transition-all ${
                    n === currentPage
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {n}
                </button>
              ))}

              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="text-muted-foreground px-1">…</span>}
                  <button
                    className="w-9 h-9 rounded-full text-sm font-medium border border-border hover:border-primary hover:text-primary transition-all"
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <span className="text-sm text-muted-foreground ml-2">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-10 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { icon: <ShieldCheck className="w-5 h-5" />, text: "100% Organic & Chemical-Free" },
              { icon: <CheckCircle2 className="w-5 h-5" />, text: "Farm-to-Door Delivery" },
              { icon: <Package className="w-5 h-5" />, text: "Secure, Fresh Packaging" },
              { icon: <Leaf className="w-5 h-5" />, text: "COD Available" },
            ].map((t) => (
              <div key={t.text} className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="text-primary">{t.icon}</span>
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
