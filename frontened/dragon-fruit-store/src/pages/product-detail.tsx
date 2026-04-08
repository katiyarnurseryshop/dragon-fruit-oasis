import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGetProduct, useGetProducts } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE_CONTACT } from "@/lib/site-contact";
import { useCart } from "@/context/cart-context";
import { OrderFormDialog } from "@/components/order-form-dialog";
import { OrderLineItem } from "@/lib/order-pricing";
import {
  ArrowLeft,
  MessageCircle,
  Leaf,
  ShieldCheck,
  Package,
  CheckCircle2,
  Star,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";

const PRODUCT_FALLBACK_IMAGE = "/images/gallery-1.png";

interface ProductDetailProps {
  params: { id: string };
}

export default function ProductDetail({ params }: ProductDetailProps) {
  const id = parseInt(params.id);
  const { data: product, isLoading, error } = useGetProduct(id, {
    query: { enabled: !isNaN(id), queryKey: [`/api/products/${id}`] },
  });
  const { data: allProducts } = useGetProducts();
  const { addItem } = useCart();
  const [, setLocation] = useLocation();
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderLineItem[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const relatedProducts = (allProducts ?? [])
    .filter((p) => p.id !== id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 pt-32 pb-16">
          <Skeleton className="h-6 w-40 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="h-96 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-1/3 mt-4" />
              <Skeleton className="h-14 w-full mt-6" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 pt-40 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading font-bold text-3xl mb-2">Plant not found</h2>
          <p className="text-muted-foreground mb-8">The plant you are looking for does not exist.</p>
          <Link href="/products">
            <Button className="rounded-full">Back to Catalog</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const openBuyNowForm = () => {
    setOrderItems([
      {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        imageUrl: product.imageUrl,
        quantity: 1,
      },
    ]);
    setIsOrderFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium line-clamp-1 max-w-xs">{product.name}</span>
        </nav>

        {/* Back button */}
        <button
          onClick={() => setLocation("/products")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          data-testid="button-back-to-catalog"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Catalog
        </button>

        {/* Main Product Layout */}
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 mb-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden bg-muted aspect-square shadow-xl">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
                }}
              />
            </div>

            {/* Badges overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.badge && (
                <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-full shadow-lg text-sm">
                  {product.badge}
                </Badge>
              )}
              {product.featured && (
                <Badge className="bg-yellow-400 text-yellow-900 font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-sm">
                  <Star className="w-3.5 h-3.5 fill-yellow-900" /> Featured
                </Badge>
              )}
            </div>

            {/* Farm badge */}
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur rounded-xl px-4 py-2 shadow-lg flex items-center gap-2">
              <img src="/logo.png" alt="Katiyar Nursery" className="w-8 h-8 rounded-full" />
              <div className="text-xs leading-tight">
                <p className="font-semibold text-foreground">Katiyar Nursery</p>
                <p className="text-muted-foreground">{SITE_CONTACT.locationLabel}</p>
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                <Leaf className="w-3 h-3 mr-1" /> Dragon Fruit Plant
              </Badge>
              <Badge variant="outline" className="text-xs border-secondary/30 text-secondary bg-secondary/5">
                <CheckCircle2 className="w-3 h-3 mr-1" /> In Stock
              </Badge>
            </div>

            <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-muted-foreground leading-relaxed mb-8 text-base">
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-border">
              <span className="font-heading font-bold text-5xl text-primary">₹{product.price}</span>
              <span className="text-muted-foreground text-lg">/ {product.unit}</span>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: <Leaf className="w-4 h-4" />, text: "100% Organic" },
                { icon: <ShieldCheck className="w-4 h-4" />, text: "Chemical-Free" },
                { icon: <Package className="w-4 h-4" />, text: "Safe Packaging" },
                { icon: <CheckCircle2 className="w-4 h-4" />, text: "Prepaid Orders Only" },
              ].map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-2 text-sm font-medium bg-muted/50 rounded-lg px-3 py-2.5"
                >
                  <span className="text-primary">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <Button
                data-testid="button-order-whatsapp"
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold h-14 rounded-xl gap-2 text-base shadow-lg shadow-secondary/20"
                onClick={openBuyNowForm}
                disabled={!product.inStock}
              >
                <MessageCircle className="w-5 h-5" />
                Buy Now
              </Button>
              <div className="sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-xl gap-2 font-semibold border-2"
                  data-testid="button-add-to-cart"
                  disabled={!product.inStock}
                  onClick={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      unit: product.unit,
                      imageUrl: product.imageUrl,
                    })
                  }
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Free delivery on orders above ₹500. Prepaid orders only across India.
            </p>
          </motion.div>
        </div>

        {/* About This Variety */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 bg-muted/40 border border-border rounded-2xl p-8"
        >
          <h2 className="font-heading font-bold text-2xl mb-4">About This Variety</h2>
          <p className="text-muted-foreground leading-relaxed text-base mb-6">
            {product.description}
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Category", value: "Dragon Fruit Plant" },
              { label: "Unit", value: product.unit },
              { label: "Availability", value: product.inStock ? "In Stock" : "Out of Stock" },
            ].map((d) => (
              <div key={d.label} className="bg-background rounded-xl px-4 py-3 border border-border">
                <p className="text-xs text-muted-foreground font-medium mb-1">{d.label}</p>
                <p className="font-semibold text-foreground">{d.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Why Buy From Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="font-heading font-bold text-2xl mb-6">Why Buy From Katiyar Nursery?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Leaf className="w-6 h-6" />, title: "Organically Grown", desc: "All plants are grown without harmful chemicals" },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "Quality Assured", desc: "Each plant is inspected before dispatch" },
              { icon: <Package className="w-6 h-6" />, title: "Safe Delivery", desc: "Plants packed securely to prevent damage" },
              { icon: <MessageCircle className="w-6 h-6" />, title: "Expert Support", desc: "Get growing tips directly on WhatsApp" },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-2xl">More Plants You May Like</h2>
              <Link href="/products">
                <Button variant="ghost" size="sm" className="text-primary gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  onClick={() => setLocation(`/products/${p.id}`)}
                  data-testid={`card-related-${p.id}`}
                >
                  <div className="h-36 overflow-hidden bg-muted">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-heading font-semibold text-xs mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {p.name}
                    </h4>
                    <span className="font-bold text-primary text-sm">₹{p.price}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
      <OrderFormDialog
        open={isOrderFormOpen}
        onOpenChange={setIsOrderFormOpen}
        items={orderItems}
        onItemsChange={setOrderItems}
        title="Buy this plant now"
        description="Enter your details and continue on WhatsApp with this product order."
      />
    </div>
  );
}
