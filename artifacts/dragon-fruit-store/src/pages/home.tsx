import { useState } from "react";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "wouter";
import { 
  Leaf, 
  Truck, 
  ShieldCheck, 
  Package, 
  Star, 
  Quote, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle2,
  X,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { data: products, isLoading: isLoadingProducts } = useGetProducts();
  const { data: reviews, isLoading: isLoadingReviews } = useGetReviews();
  const { data: gallery, isLoading: isLoadingGallery } = useGetGallery();
  const { data: stats } = useGetStoreStats();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  const getWhatsAppUrl = (productName: string) => {
    return `https://wa.me/919876543210?text=Hi, I'd like to order ${encodeURIComponent(productName)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* 1. Hero Section */}
      <section id="home" className="relative h-[100dvh] min-h-[650px] flex items-center justify-center pt-20 overflow-hidden">
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
            className="mb-8"
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
            className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl max-w-5xl leading-[1.1] mb-8 drop-shadow-xl"
          >
            Fresh Organic Dragon Fruits Delivered To Your Door
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-zinc-200 mb-12 max-w-2xl font-light tracking-wide drop-shadow-md"
          >
            Pure • Fresh • Premium Quality
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto"
          >
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg h-16 px-10 rounded-full shadow-2xl shadow-secondary/20 hover:shadow-secondary/40 transition-all hover:-translate-y-1">
                Order on WhatsApp
              </Button>
            </a>
            <a href="#products">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border-white/20 h-16 px-10 rounded-full backdrop-blur-md transition-all hover:-translate-y-1 text-lg">
                View Harvest
              </Button>
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-wrap justify-center gap-8 mt-20 text-sm md:text-base font-medium text-zinc-200"
          >
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-secondary" /> 100% Natural</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-secondary" /> Farm-to-home</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-secondary" /> Secure COD</div>
          </motion.div>
        </div>
      </section>

      {/* 2. Why Choose Us */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/40 relative">
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

      {/* 3. Products Section */}
      <section id="products" className="py-24 md:py-32 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <motion.div {...fadeIn} className="max-w-2xl">
              <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 mb-5 px-4 py-1.5 rounded-full text-sm font-semibold">Fresh Harvest</Badge>
              <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">Explore Our Products</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">Premium organic dragon fruits. Rich in antioxidants, vitamins, and incredible taste. Grown naturally without chemicals.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isLoadingProducts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="h-[300px] w-full rounded-2xl" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-12 w-full mt-4 rounded-full" />
                </div>
              ))
            ) : products?.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Card className="overflow-hidden group h-full flex flex-col border border-zinc-100 dark:border-zinc-800 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-zinc-900/80">
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {product.badge && (
                      <Badge className="absolute top-4 left-4 bg-primary text-white border-none shadow-lg px-3 py-1 font-semibold uppercase tracking-wider text-[10px]">
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
                    <a href={getWhatsAppUrl(product.name)} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button 
                        className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-14 rounded-full shadow-lg shadow-secondary/20"
                        disabled={!product.inStock}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Order on WhatsApp
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View Full Catalog Button */}
          <motion.div
            {...fadeIn}
            className="text-center mt-14"
          >
            <Link href="/products">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold h-14 px-10 rounded-full gap-2 transition-all"
                data-testid="button-view-catalog"
              >
                View Full Product Catalog
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 4. Seasonal Offer Banner */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary via-rose-600 to-primary relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <motion.div 
            {...fadeIn}
            className="flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left bg-white/10 backdrop-blur-md border border-white/20 p-10 md:p-14 rounded-3xl shadow-2xl"
          >
            <div className="max-w-3xl">
              <Badge className="bg-white text-primary hover:bg-white/90 mb-6 px-4 py-1.5 rounded-full text-sm font-bold">Limited Time</Badge>
              <h2 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6 text-white leading-tight">
                Seasonal Offer – 10% OFF
              </h2>
              <p className="text-white/90 text-xl font-medium leading-relaxed">
                Experience the peak harvest! Get 10% off on all Red Dragon Fruits today. Use code <span className="font-mono bg-black/20 px-3 py-1 rounded-md tracking-wider mx-1 font-bold">DRAGON10</span> when ordering.
              </p>
            </div>
            <a href="https://wa.me/919876543210?text=Hi, I'd like to order with code DRAGON10" target="_blank" rel="noopener noreferrer" className="shrink-0 w-full lg:w-auto">
              <Button size="lg" variant="secondary" className="w-full lg:w-auto bg-white text-primary hover:bg-zinc-100 font-bold text-lg h-16 px-10 rounded-full shadow-2xl hover:scale-105 transition-transform">
                Claim Offer Now
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 5. About the Farm */}
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
                      <div className="font-heading font-bold text-4xl text-secondary mb-1">{stats.yearsOfFarming} Yrs</div>
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
                Grown With Love, <br />Rooted In Nature
              </h2>
              <div className="space-y-6 text-muted-foreground text-lg mb-12 leading-relaxed">
                <p>
                  We are a passionate family of farmers dedicated to cultivating the highest quality dragon fruits. What started as a small patch of land has blossomed into a premium organic farm that supplies nature's vibrant superfood across the country.
                </p>
                <p>
                  Every fruit we harvest is a testament to our commitment to sustainable agriculture. We never use harsh chemicals or synthetic pesticides. Instead, we rely on traditional farming wisdom combined with modern sustainable practices to grow fruits that are not just beautiful, but exceptionally sweet and nutritious.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Leaf className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xl mb-2 text-foreground">100% Organic</h4>
                    <p className="text-muted-foreground">Certified organic, soil-first farming methods.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-7 h-7 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xl mb-2 text-foreground">Hand Picked</h4>
                    <p className="text-muted-foreground">Selected at peak ripeness for maximum flavor.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. Reviews Slider */}
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
          ) : reviews && reviews.length > 0 && (
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
                  {reviews.map((review) => (
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

      {/* 7. Gallery Section */}
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
            ) : gallery?.slice(0, 6).map((img, i) => (
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
                  <img src={selectedImage} alt="Gallery view" className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
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

      {/* 8. Contact Section */}
      <section id="contact" className="py-24 md:py-32 bg-white dark:bg-zinc-950">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-xl border border-zinc-100 dark:border-zinc-800 flex flex-col lg:flex-row">
            
            <div className="p-10 md:p-16 lg:p-20 lg:w-1/2 flex flex-col justify-center bg-white dark:bg-zinc-900 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <Badge className="bg-primary/10 text-primary w-fit hover:bg-primary/20 mb-6 px-4 py-1.5 rounded-full text-sm font-semibold">Get in Touch</Badge>
                <h2 className="font-heading font-bold text-4xl md:text-5xl mb-6">We'd Love to Hear From You</h2>
                <p className="text-muted-foreground text-lg mb-12 leading-relaxed">Have a question about our fruits, farming methods, or want to place a bulk order? Reach out to us directly.</p>
                
                <div className="space-y-10">
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center shrink-0 text-primary">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xl text-foreground mb-1">Phone & WhatsApp</h4>
                      <p className="text-muted-foreground text-lg mb-2">+91 9876543210</p>
                      <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-secondary font-bold hover:underline flex items-center gap-2 mt-2">
                        <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center shrink-0 text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xl text-foreground mb-1">Email</h4>
                      <p className="text-muted-foreground text-lg">hello@dragonfruitfarm.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center shrink-0 text-primary">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xl text-foreground mb-1">Farm Location</h4>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        123 Green Valley Road,<br />
                        Organic District, 400001<br />
                        <span className="text-primary font-medium text-sm mt-2 block">Open for visits on Weekends</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 min-h-[400px] bg-zinc-200 dark:bg-zinc-800 relative">
              <div className="absolute inset-0">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12090.540103730595!2d-74.0041285!3d40.7483665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259229f3d9d37%3A0xc3c94132b4b44917!2sOrganic%20Farm!5e0!3m2!1sen!2sus!4v1612345678901!5m2!1sen!2sus" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, filter: 'grayscale(0.1) contrast(1.1)' }} 
                  allowFullScreen={true} 
                  loading="lazy"
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
