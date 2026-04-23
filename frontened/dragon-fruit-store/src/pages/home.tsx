import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  useGetProducts, 
  useGetReviews, 
  useGetGallery,
  useGetStoreStats
} from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SITE_CONTACT } from "@/lib/site-contact";
import { getProductPrimaryImage, resolveAssetUrl } from "@/lib/asset-url";
import { OrderFormDialog } from "@/components/order-form-dialog";
import { OrderLineItem } from "@/lib/order-pricing";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link, useLocation } from "wouter";
import { useCart } from "@/context/cart-context";
import { 
  Leaf, 
  Truck, 
  ShieldCheck, 
  Package, 
  Star, 
  Quote, 
  Phone, 
  Mail,
  CheckCircle2,
  X,
  MessageCircle,
  ArrowRight,
  ShoppingCart,
  Instagram,
  Facebook,
  ExternalLink,
} from "lucide-react";

const PRODUCT_FALLBACK_IMAGE = "/images/gallery-1.png";
const GALLERY_FALLBACK_IMAGE = "/images/gallery-2.png";

export default function Home() {
  const { data: products, isLoading: isLoadingProducts } = useGetProducts();
  const { data: reviews, isLoading: isLoadingReviews } = useGetReviews();
  const { data: gallery, isLoading: isLoadingGallery } = useGetGallery();
  const { data: stats } = useGetStoreStats();
  const { addItem } = useCart();
  const [, setLocation] = useLocation();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderLineItem[]>([]);
  const [productsCarouselApi, setProductsCarouselApi] = useState<CarouselApi>();
  const [selectedProductSlide, setSelectedProductSlide] = useState(0);

  const productsList = (() => {
    const value: unknown = products;
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const data = (value as { data?: unknown }).data;
      if (Array.isArray(data)) return data;
    }
    if (typeof value === "string") {
      try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  const reviewsList = (() => {
    const value: unknown = reviews;
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const data = (value as { data?: unknown }).data;
      if (Array.isArray(data)) return data;
    }
    if (typeof value === "string") {
      try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  const galleryList = (() => {
    const value: unknown = gallery;
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const data = (value as { data?: unknown }).data;
      if (Array.isArray(data)) return data;
    }
    if (typeof value === "string") {
      try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  const featuredProducts = productsList.filter((p: any) => p?.featured || p?.badge);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
  };

  const handleBuyNow = (product: any) => {
    setOrderItems([
      {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        imageUrl: getProductPrimaryImage(product),
        quantity: 1,
      },
    ]);
    setIsOrderFormOpen(true);
  };

  const openProduct = (id: number) => {
    setLocation(`/products/${id}?source=home`);
  };

  useEffect(() => {
    if (!productsCarouselApi) return;

    const syncSelectedSlide = () => {
      setSelectedProductSlide(productsCarouselApi.selectedScrollSnap());
    };

    syncSelectedSlide();
    productsCarouselApi.on("select", syncSelectedSlide);
    productsCarouselApi.on("reInit", syncSelectedSlide);

    const autoplay = window.setInterval(() => {
      if (productsCarouselApi.canScrollNext()) {
        productsCarouselApi.scrollNext();
      } else {
        productsCarouselApi.scrollTo(0);
      }
    }, 3500);

    return () => {
      window.clearInterval(autoplay);
      productsCarouselApi.off("select", syncSelectedSlide);
      productsCarouselApi.off("reInit", syncSelectedSlide);
    };
  }, [productsCarouselApi]);

  const growthTimeline = [
    {
      month: "Month 0",
      title: "New Plant",
      description: "A fresh dragon fruit plant settles in and starts building strong roots.",
    },
    {
      month: "Month 3",
      title: "Grows Fast",
      description: "Healthy stems push upward quickly with visible weekly growth.",
    },
    {
      month: "Month 6",
      title: "Starts Branching",
      description: "The plant becomes fuller and begins shaping into a productive vine.",
    },
    {
      month: "Month 12-18",
      title: "First Fruits",
      description: "With good care, flowering starts and the first fruits begin to appear.",
    },
    {
      month: "2 Years",
      title: "Full Yield",
      description: "A mature plant reaches strong production and gives regular harvests.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* 1. Hero Section */}
      <section id="home" className="relative min-h-[100dvh] md:h-[100dvh] flex items-center justify-center pt-24 pb-12 md:pt-32 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-bg.png" 
            alt="Lush Dragon Fruit Farm" 
            className="w-full h-full object-cover scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-black/60 dark:bg-black/70 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
        </div>
        
        <div className="container relative z-20 px-4 md:px-6 flex flex-col items-center text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 mt-8 md:mb-8 md:mt-14"
          >
            <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md px-5 py-2 text-sm font-medium tracking-wide rounded-full shadow-2xl">
              <Leaf className="w-4 h-4 mr-2 inline-block text-secondary" /> 
              100% Certified Organic Farm
            </Badge>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl max-w-5xl leading-[1.05] md:leading-[1.1] mb-6 md:mb-8 drop-shadow-xl"
          >
            Fresh Organic Dragon Fruits Plant Delivered To Your Door
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-zinc-200 mb-8 md:mb-12 max-w-2xl font-light tracking-wide drop-shadow-md"
          >
            Pure • Fresh • Premium Quality
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex w-full justify-center"
          >
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg h-16 px-10 rounded-full shadow-2xl shadow-secondary/20 hover:shadow-secondary/40 transition-all hover:-translate-y-1">
                Catalogue
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10 md:mt-20 text-sm md:text-base font-medium text-zinc-200"
          >
            <div className="flex items-center gap-2 text-white drop-shadow-md"><CheckCircle2 className="w-5 h-5 text-secondary" /> 100% Natural</div>
            <div className="flex items-center gap-2 text-white drop-shadow-md"><CheckCircle2 className="w-5 h-5 text-secondary" /> Farm-to-home</div>
            <div className="flex items-center gap-2 text-white drop-shadow-md"><CheckCircle2 className="w-5 h-5 text-secondary" /> Secure Payments</div>
          </motion.div>
        </div>
      </section>
      {/* 2. Products Section */}
      <section id="products" className="relative z-10 pt-28 md:pt-36 pb-24 md:pb-32 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <motion.div {...fadeIn} className="max-w-2xl">
              <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 mb-5 px-4 py-1.5 rounded-full text-sm font-semibold">Fresh Harvest</Badge>
              <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">Explore Our Products</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">Top sellers & best products from our 50+ premium dragon fruit varieties. Grown naturally without chemicals.</p>
            </motion.div>
            <motion.div {...fadeIn} className="flex gap-3 shrink-0">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-sm font-semibold rounded-full">⭐ Top Seller</Badge>
              <Badge className="bg-secondary/10 text-secondary border-secondary/20 px-3 py-1.5 text-sm font-semibold rounded-full">✓ Best Product</Badge>
            </motion.div>
          </div>

          <div className="md:hidden">
            {isLoadingProducts ? (
              <div className="flex flex-col space-y-4">
                <Skeleton className="h-[300px] w-full rounded-2xl" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full mt-4 rounded-full" />
              </div>
            ) : (
              <Carousel setApi={setProductsCarouselApi} opts={{ align: "center", loop: true }} className="w-full px-1">
                <CarouselContent className="-ml-3">
                  {featuredProducts.map((product: any, i: number) => (
                    <CarouselItem key={product.id} className="pl-3 basis-[78%]">
                      <motion.div
                        data-testid={`card-home-product-${product.id}`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: Math.min(i * 0.08, 0.5) }}
                        className={`h-full transition-all duration-300 ${selectedProductSlide === i ? "scale-100 opacity-100" : "scale-92 opacity-60"}`}
                      >
                        <Card
                          className="overflow-hidden group h-full flex flex-col border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/80 cursor-pointer"
                          onClick={() => openProduct(product.id)}
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                            <img
                              src={resolveAssetUrl(product.imageUrl)}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {product.badge && (
                              <Badge className={`absolute top-4 left-4 border-none shadow-lg px-3 py-1 font-bold uppercase tracking-wider text-[10px] ${
                                product.badge === 'Top Seller' ? 'bg-secondary text-white' :
                                product.badge === 'Best Product' ? 'bg-primary text-white' :
                                product.badge === 'Premium' ? 'bg-yellow-500 text-white' :
                                product.badge === 'Rare' ? 'bg-purple-600 text-white' :
                                product.badge === 'Collector' ? 'bg-blue-600 text-white' :
                                'bg-primary text-white'
                              }`}>
                                {product.badge}
                              </Badge>
                            )}
                            {!product.inStock && (
                              <div className="absolute inset-0 bg-white/80 dark:bg-black/70 flex items-center justify-center backdrop-blur-sm z-10">
                                <Badge variant="outline" className="text-lg py-2 px-6 border-2 border-foreground bg-background font-bold">Out of Stock</Badge>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4 flex-1 flex flex-col">
                            <h3 className="font-heading font-bold text-xl leading-tight mb-2">{product.name}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-2 flex-1 text-sm leading-relaxed">
                              {product.description}
                            </p>
                            <div className="mt-auto mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="font-heading font-bold text-[1.75rem] leading-none text-foreground">
                                  ₹{product.price}
                                </span>
                                <span className="text-sm font-normal text-muted-foreground font-sans">/ {product.unit}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 rounded-full shadow-lg text-sm"
                                disabled={!product.inStock}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addItem({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    unit: product.unit,
                                    imageUrl: getProductPrimaryImage(product),
                                  });
                                }}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-11 w-11 rounded-full border-secondary text-secondary hover:bg-secondary hover:text-white shrink-0"
                                disabled={!product.inStock}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBuyNow(product);
                                }}
                              >
                                <MessageCircle className="w-5 h-5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/50 text-foreground shadow-sm backdrop-blur-sm hover:bg-white/80 disabled:opacity-30" />
                <CarouselNext className="right-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white/50 text-foreground shadow-sm backdrop-blur-sm hover:bg-white/80 disabled:opacity-30" />
              </Carousel>
            )}
          </div>

          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isLoadingProducts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-[300px] w-full rounded-2xl" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-12 w-full mt-4 rounded-full" />
                </div>
              ))
            ) : (
              <>
                {featuredProducts.map((product: any, i: number) => (
                  <motion.div
                    key={product.id}
                    data-testid={`card-home-product-${product.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: Math.min(i * 0.08, 0.5) }}
                  >
                    <Card
                      className="overflow-hidden group h-full flex flex-col border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-zinc-900/80 cursor-pointer"
                      onClick={() => openProduct(product.id)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <img 
                          src={resolveAssetUrl(product.imageUrl)} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {product.badge && (
                          <Badge className={`absolute top-4 left-4 border-none shadow-lg px-3 py-1 font-bold uppercase tracking-wider text-[10px] ${
                            product.badge === 'Top Seller' ? 'bg-secondary text-white' :
                            product.badge === 'Best Product' ? 'bg-primary text-white' :
                            product.badge === 'Premium' ? 'bg-yellow-500 text-white' :
                            product.badge === 'Rare' ? 'bg-purple-600 text-white' :
                            product.badge === 'Collector' ? 'bg-blue-600 text-white' :
                            'bg-primary text-white'
                          }`}>
                            {product.badge}
                          </Badge>
                        )}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-white/80 dark:bg-black/70 flex items-center justify-center backdrop-blur-sm z-10">
                            <Badge variant="outline" className="text-lg py-2 px-6 border-2 border-foreground bg-background font-bold">Out of Stock</Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-8 flex-1 flex flex-col">
                        <h3 className="font-heading font-bold text-2xl mb-3">{product.name}</h3>
                        <p className="text-muted-foreground mb-6 line-clamp-2 flex-1 text-sm leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                          <span className="font-heading font-bold text-3xl text-foreground">
                            ₹{product.price}
                            <span className="text-base font-normal text-muted-foreground font-sans"> / {product.unit}</span>
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-full shadow-lg"
                            disabled={!product.inStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              addItem({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                unit: product.unit,
                                    imageUrl: getProductPrimaryImage(product),
                                  });
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-full border-secondary text-secondary hover:bg-secondary hover:text-white shrink-0"
                            disabled={!product.inStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyNow(product);
                            }}
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {!isLoadingProducts && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 md:mt-10"
            >
              <Link href="/products">
                <Card className="overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary rounded-3xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 bg-primary/3 hover:bg-primary/5 cursor-pointer">
                  <CardContent className="min-h-[140px] md:min-h-[160px] px-6 py-8 md:px-10 md:py-10 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5 md:gap-6">
                      <div>
                        <h3 className="font-heading font-bold text-2xl md:text-3xl text-primary mb-2">View All Products</h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl">
                          Browse our complete catalog of 50+ premium dragon fruit plant varieties.
                        </p>
                      </div>
                    </div>
                    <Badge className="shrink-0 bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full font-semibold">
                      50+ Varieties →
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          )}

        </div>
      </section>
      {/* 3. Reviews Slider */}
      <section className="py-24 md:py-32 bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="container px-4 md:px-6 mx-auto relative">
          {/* Decorative quote icon */}
          <Quote className="absolute top-0 right-10 w-64 h-64 text-zinc-50 dark:text-zinc-900 -z-10 -rotate-12" />

          <motion.div {...fadeIn} className="text-center mb-20 relative z-10">
            <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 mb-5 px-4 py-1.5 rounded-full text-sm font-semibold">Testimonials</Badge>
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">What Our Customers Say</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">Don't just take our word for it. Here's what families across the country think about our freshly harvested dragon fruits.</p>
          </motion.div>

          {isLoadingReviews ? (
            <div className="flex justify-center"><Skeleton className="h-[300px] w-full max-w-4xl rounded-3xl" /></div>
          ) : reviewsList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-6xl mx-auto px-10 md:px-16"
            >
              <Carousel
                opts={{ align: "start", loop: true }}
                className="w-full"
              >
                <CarouselContent className="-ml-4 md:-ml-8 py-4">
                  {reviewsList.map((review: any) => (
                    <CarouselItem key={review.id} className="pl-4 md:pl-8 md:basis-1/2">
                      <div className="h-full">
                        <Card className="h-full border-none shadow-xl shadow-zinc-100/50 hover:shadow-2xl transition-shadow bg-zinc-50/50 dark:bg-zinc-900/50 dark:shadow-none rounded-3xl overflow-hidden relative">
                          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
                          <CardContent className="p-10 relative h-full flex flex-col">
                            <div className="flex items-center gap-1.5 mb-8">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-5 h-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-200 dark:text-zinc-700"}`} />
                              ))}
                            </div>
                            <p className="text-foreground text-xl mb-10 relative z-10 flex-1 font-medium leading-relaxed">
                              "{review.comment}"
                            </p>
                            <div className="flex items-center gap-5 mt-auto">
                              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xl uppercase overflow-hidden ring-4 ring-white dark:ring-zinc-800">
                                {review.avatarUrl ? (
                                  <img src={review.avatarUrl} alt={review.customerName} className="w-full h-full object-cover" />
                                ) : (
                                  review.customerName.charAt(0)
                                )}
                              </div>
                              <div>
                                <h4 className="font-heading font-bold text-lg">{review.customerName}</h4>
                                <p className="text-sm text-secondary font-semibold">Verified Buyer</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-4 md:-left-16 h-14 w-14 rounded-full border-none shadow-lg bg-white dark:bg-zinc-800 hover:bg-primary hover:text-white transition-colors" />
                <CarouselNext className="-right-4 md:-right-16 h-14 w-14 rounded-full border-none shadow-lg bg-white dark:bg-zinc-800 hover:bg-primary hover:text-white transition-colors" />
              </Carousel>
            </motion.div>
          )}
        </div>
      </section>
      {/* 4. Gallery Section */}
      <section id="gallery" className="py-24 md:py-32 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div {...fadeIn} className="text-center mb-16 md:mb-24">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-5 px-4 py-1.5 rounded-full text-sm font-semibold">Farm Life</Badge>
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">Inside Our Farm</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">A visual journey from planting the first seeds to harvesting the most beautiful dragon fruits you've ever seen.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {isLoadingGallery ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))
            ) : galleryList.slice(0, 6).map((img: any, i: number) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 bg-zinc-200 dark:bg-zinc-800"
                onClick={() => setSelectedImage(img.imageUrl)}
              >
                <img
                  src={img.imageUrl}
                  alt={img.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => { (e.target as HTMLImageElement).src = GALLERY_FALLBACK_IMAGE; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 md:p-8">
                  <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-md mb-3 px-3 py-1">{img.category}</Badge>
                    <p className="text-white font-medium text-lg md:text-xl font-heading leading-tight">{img.caption}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
            <DialogContent className="max-w-5xl w-full p-2 bg-transparent border-none shadow-none flex items-center justify-center">
              {selectedImage && (
                <div className="relative w-full">
                  <img
                    src={selectedImage}
                    alt="Gallery view"
                    className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                    onError={(e) => { (e.target as HTMLImageElement).src = GALLERY_FALLBACK_IMAGE; }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-4 -right-4 bg-black text-white hover:bg-black/80 rounded-full h-10 w-10 border-2 border-white"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>
      {/* 5. Why Choose Us */}
      <section className="relative z-0 py-24 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div {...fadeIn} className="text-center mb-20">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-5 px-4 py-1.5 rounded-full text-sm font-semibold">Our Promise</Badge>
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6 text-foreground">Why Choose Our Farm</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">We nurture every plant with care to bring you the sweetest, healthiest dragon fruits directly from nature.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Leaf, title: "Farm Fresh", desc: "Harvested on the day of dispatch for maximum freshness and flavor." },
              { icon: Truck, title: "Fast Delivery", desc: "Express delivery right to your doorstep within 24-48 hours." },
              { icon: ShieldCheck, title: "Premium Quality", desc: "Hand-picked, perfectly ripened fruits with zero chemical treatments." },
              { icon: Package, title: "Secure Packaging", desc: "Eco-friendly, bruise-proof packaging to ensure safe transit." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-zinc-900 text-center h-full rounded-2xl group">
                  <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors flex items-center justify-center mb-8 text-primary rotate-3 group-hover:rotate-6">
                      <feature.icon className="w-10 h-10" />
                    </div>
                    <h3 className="font-heading font-bold text-2xl mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* 6. About the Farm */}
      {/* 6. About the Farm */}
      <section id="about" className="py-24 md:py-32 bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10 border-8 border-white dark:border-zinc-800">
                <img 
                  src="/images/about-farm.png" 
                  alt="Farmers at Dragon Fruit Farm" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl -z-10"></div>
              
              {stats && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="absolute -bottom-10 -right-4 md:-right-10 bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-2xl z-20 border border-zinc-100 dark:border-zinc-700"
                >
                  <div className="flex gap-10">
                    <div>
                      <div className="font-heading font-bold text-4xl text-primary mb-1">{stats.happyCustomers}+</div>
                      <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Happy Families</div>
                    </div>
                    <div className="w-px bg-zinc-200 dark:bg-zinc-700"></div>
                    <div>
                      <div className="font-heading font-bold text-4xl text-secondary mb-1">6 Yrs</div>
                      <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Farming Legacy</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="order-1 lg:order-2"
            >
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-6 px-4 py-1.5 rounded-full text-sm font-semibold">Our Story</Badge>
              <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-8 text-foreground leading-[1.1]">
                Grown With Care, <br />Rooted in Trust
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg mb-12 leading-relaxed">
                <p>
                  At Katiyar Nursery, we don&apos;t just sell plants - we nurture them.
                </p>
                <p>
                  What began as a simple passion for greenery has grown into a trusted nursery where every plant is raised with attention, patience, and genuine love. We believe plants are not products; they are living companions that deserve the right environment, care, and nourishment from day one.
                </p>
                <p>
                  From tiny saplings to fully matured plants, each one in our nursery is grown naturally, without harmful chemicals, using healthy soil, clean water, and sustainable practices. We focus on building strong roots, healthier growth, and long-lasting life so that when a plant reaches your home or garden, it continues to thrive.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Leaf className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xl mb-2 text-foreground">Our Mission</h4>
                    <p className="text-muted-foreground">To bring nature closer to you by raising plants the right way.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xl mb-2 text-foreground">Why We Care</h4>
                    <p className="text-muted-foreground">We don&apos;t just grow plants. We grow happiness for every home, garden, and landscape.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* 7. Growth Timeline */}
      <section className="py-20 md:py-24 bg-zinc-50 dark:bg-zinc-900/30 overflow-hidden border-y border-zinc-100 dark:border-zinc-800">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div {...fadeIn} className="text-center max-w-3xl mx-auto mb-14">
            <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 mb-5 px-4 py-1.5 rounded-full text-sm font-semibold">
              Plant Journey
            </Badge>
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6 text-foreground">
              Dragon Fruit Plant Growth Timeline
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              From a new plant to full yield, here is the simple journey growers can expect with proper care and healthy nursery stock.
            </p>
          </motion.div>

          <motion.div
            {...fadeIn}
            className="relative rounded-[2rem] border border-primary/30 bg-gradient-to-br from-primary via-rose-600 to-red-600 p-6 md:p-10 shadow-[0_30px_80px_rgba(225,29,72,0.22)]"
          >
            <div className="absolute inset-x-10 top-1/2 hidden xl:block h-[2px] -translate-y-1/2 bg-gradient-to-r from-primary/20 via-secondary/30 to-primary/20" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 relative">
              {growthTimeline.map((item, index) => (
                <motion.div
                  key={item.month}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="relative rounded-[1.75rem] border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-6">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/15 px-3 py-1 rounded-full font-bold text-xs">
                      {item.month}
                    </Badge>
                    <span className="font-heading text-3xl font-bold text-primary/20">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl mb-3 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      {/* 8. Contact Section */}
      <section id="contact" className="py-24 md:py-32 bg-white dark:bg-zinc-950">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-xl border border-zinc-100 dark:border-zinc-800">
            <div className="p-10 md:p-16 lg:p-20 bg-white dark:bg-zinc-900 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <Badge className="bg-primary/10 text-primary w-fit hover:bg-primary/20 mb-6 px-4 py-1.5 rounded-full text-sm font-semibold">Get in Touch</Badge>
                <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">We'd Love to Hear From You</h2>
                <p className="text-muted-foreground text-lg mb-12 leading-relaxed">Have a question about our plants, want to place an order, or need nursery guidance? Reach out directly on call, WhatsApp, email, or social media.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <a href={SITE_CONTACT.phoneHref} className="group rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 p-6 hover:border-primary/40 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Phone className="w-6 h-6" />
                    </div>
                    <h4 className="font-heading font-bold text-xl text-foreground mb-2">Call Us</h4>
                    <p className="text-muted-foreground text-base mb-3">Talk directly for orders, plant queries, and nursery support.</p>
                    <p className="text-primary font-semibold text-lg">{SITE_CONTACT.phoneDisplay}</p>
                  </a>

                  <a href={SITE_CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="group rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 p-6 hover:border-secondary/40 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:text-white transition-colors">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <h4 className="font-heading font-bold text-xl text-foreground mb-2">WhatsApp</h4>
                    <p className="text-muted-foreground text-base mb-3">Send your wishlist, product questions, or order details instantly.</p>
                    <p className="text-secondary font-semibold text-lg">Chat on WhatsApp</p>
                  </a>

                  <a href={SITE_CONTACT.emailHref} className="group rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 p-6 hover:border-primary/40 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h4 className="font-heading font-bold text-xl text-foreground mb-2">Email</h4>
                    <p className="text-muted-foreground text-base mb-3">Reach out for bulk inquiries, nursery details, or partnership requests.</p>
                    <p className="text-primary font-semibold text-lg break-all">{SITE_CONTACT.email}</p>
                  </a>

                  <a href={SITE_CONTACT.instagramHref} target="_blank" rel="noopener noreferrer" className="group rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50 p-6 hover:border-primary/40 hover:shadow-lg transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <h4 className="font-heading font-bold text-xl text-foreground mb-2">Instagram</h4>
                    <p className="text-muted-foreground text-base mb-3">Follow new arrivals, nursery updates, and plant highlights.</p>
                    <p className="text-primary font-semibold text-lg inline-flex items-center gap-2">
                      Visit profile
                      <ExternalLink className="w-4 h-4" />
                    </p>
                  </a>
                </div>

                <div className="rounded-[2rem] bg-gradient-to-br from-primary via-rose-600 to-secondary text-white p-8 md:p-10 shadow-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="max-w-2xl">
                      <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20 mb-5 px-4 py-1.5 rounded-full text-sm font-semibold">
                        Social & Support
                      </Badge>
                      <h3 className="font-heading font-bold text-3xl md:text-4xl mb-4">Connect with Katiyar Nursery Everywhere</h3>
                      <p className="text-white/85 text-lg leading-relaxed">
                        Call for direct support, message on WhatsApp for orders, email for detailed inquiries, and follow our nursery on Instagram and Facebook for fresh updates.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <a href={SITE_CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" className="bg-white text-primary hover:bg-zinc-100 font-semibold rounded-full px-7">
                          <MessageCircle className="w-5 h-5 mr-2" />
                          WhatsApp
                        </Button>
                      </a>
                      <a href={SITE_CONTACT.instagramHref} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 rounded-full px-7">
                          <Instagram className="w-5 h-5 mr-2" />
                          Instagram
                        </Button>
                      </a>
                      <a href={SITE_CONTACT.facebookHref} target="_blank" rel="noopener noreferrer">
                        <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 rounded-full px-7">
                          <Facebook className="w-5 h-5 mr-2" />
                          Facebook
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
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
