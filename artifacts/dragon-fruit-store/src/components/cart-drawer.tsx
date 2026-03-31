import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalCount, totalPrice, clearCart } = useCart();

  const getWhatsAppUrl = () => {
    if (items.length === 0) return "#";
    const lines = items.map(
      (i) => `• ${i.name} x${i.quantity} (₹${(i.price * i.quantity).toFixed(2)})`
    );
    const message = `Hi! I'd like to place an order:\n\n${lines.join("\n")}\n\nTotal: ₹${totalPrice.toFixed(2)}`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="font-heading font-bold text-lg">Your Cart</h2>
                {totalCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="font-heading font-semibold text-lg text-foreground">Your cart is empty</p>
                  <p className="text-muted-foreground text-sm">Add some fresh dragon fruits to get started!</p>
                  <Button variant="outline" onClick={closeCart} className="rounded-full mt-2">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-3 bg-muted/40 rounded-xl p-3"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/64x64/e8f5e8/4a7c59?text=🐉";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} / {item.unit}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-background rounded-full border px-1 py-0.5">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-primary">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t px-5 py-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Subtotal</span>
                  <span className="font-bold text-lg text-foreground">₹{totalPrice.toFixed(2)}</span>
                </div>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full rounded-full h-12 font-semibold text-base gap-2 bg-green-500 hover:bg-green-600 text-white">
                    <MessageCircle className="w-5 h-5" />
                    Order via WhatsApp
                  </Button>
                </a>
                <button
                  onClick={clearCart}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors text-center"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
