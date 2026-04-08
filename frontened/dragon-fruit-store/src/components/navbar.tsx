import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { SITE_CONTACT } from "@/lib/site-contact";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { openCart, totalCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const isHome = location === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/#about" },
    { name: "Products", href: "/products" },
    { name: "Gallery", href: "/#gallery" },
    { name: "Contact", href: "/#contact" },
  ];

  const transparent = isHome && !isScrolled && !mobileMenuOpen;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent py-5"
          : "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-sm py-3"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 z-50 group shrink-0">
          <img
            src="/logo.png"
            alt="Katiyar Dragon Fruit Nursery"
            className="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform shadow-md"
          />
          <div className="flex flex-col leading-tight">
            <span
              className={`font-heading font-bold text-base tracking-tight transition-colors ${
                transparent ? "text-white drop-shadow-md" : "text-foreground"
              }`}
            >
              Katiyar Nursery
            </span>
            <span
              className={`text-[10px] font-medium transition-colors ${
                transparent ? "text-white/70" : "text-muted-foreground"
              }`}
            >
              {SITE_CONTACT.locationLabel}
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium hover:text-primary transition-colors ${
                transparent
                  ? "text-white/90 hover:text-white drop-shadow-md"
                  : "text-muted-foreground"
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={transparent ? "text-white hover:bg-white/20 hover:text-white" : ""}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <button
            onClick={openCart}
            className={`relative p-2 rounded-full transition-colors ${
              transparent ? "text-white hover:bg-white/20" : "hover:bg-muted"
            }`}
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {totalCount}
              </span>
            )}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-1 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={
              transparent || mobileMenuOpen
                ? mobileMenuOpen
                  ? ""
                  : "text-white hover:bg-white/20 hover:text-white"
                : ""
            }
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <button
            onClick={openCart}
            className={`relative p-2 rounded-full transition-colors ${
              transparent && !mobileMenuOpen
                ? "text-white hover:bg-white/20"
                : "hover:bg-muted text-foreground"
            }`}
            aria-label="Open cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {totalCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-md ${
              transparent && !mobileMenuOpen ? "text-white" : "text-foreground"
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 h-screen bg-background pt-24 px-6 flex flex-col gap-6 md:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-6 text-center mt-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-heading font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Link
                href="/admin"
                className="text-muted-foreground mt-8 text-sm hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin Panel
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
