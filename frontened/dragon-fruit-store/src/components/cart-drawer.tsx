import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { OrderFormDialog } from "@/components/order-form-dialog";
import { formatCurrency, getDeliveryCharge, useDeliveryChargeRules } from "@/lib/order-pricing";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalCount, totalPrice, clearCart } = useCart();
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const deliveryChargeRules = useDeliveryChargeRules();
  const deliveryCharge = useMemo(
    () => getDeliveryCharge(totalCount, deliveryChargeRules),
    [deliveryChargeRules, totalCount],
  );
  const grandTotal = totalPrice + deliveryCharge;

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
            className="fixed inset-0 z-[60] bg-black/50"
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
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-lg font-bold">Your Cart</h2>
                {totalCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {totalCount}
                  </span>
                )}
              </div>
              <button onClick={closeCart} className="rounded-full p-2 transition-colors hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="font-heading text-lg font-semibold text-foreground">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground">Add some plants to start your order.</p>
                  <Button variant="outline" onClick={closeCart} className="mt-2 rounded-full">
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
                      className="flex gap-3 rounded-xl bg-muted/40 p-3"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/64x64/e8f5e8/4a7c59?text=Plant";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} / {item.unit}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 rounded-full border bg-background px-1 py-0.5">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="flex flex-col gap-3 border-t px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delivery</span>
                  <span className="font-semibold text-foreground">{formatCurrency(deliveryCharge)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">{formatCurrency(grandTotal)}</span>
                </div>
                <Button
                  onClick={() => {
                    closeCart();
                    setIsOrderFormOpen(true);
                  }}
                  className="h-12 w-full gap-2 rounded-full bg-green-500 text-base font-semibold text-white hover:bg-green-600"
                >
                  <MessageCircle className="h-5 w-5" />
                  Checkout on WhatsApp
                </Button>
                <button
                  onClick={clearCart}
                  className="text-center text-xs text-muted-foreground transition-colors hover:text-destructive"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <OrderFormDialog
        open={isOrderFormOpen}
        onOpenChange={setIsOrderFormOpen}
        items={items}
        onItemsChange={(nextItems) => {
          const nextMap = new Map(nextItems.map((item) => [item.id, item.quantity]));
          items.forEach((item) => {
            const nextQty = nextMap.get(item.id);
            if (typeof nextQty === "number") {
              if (nextQty !== item.quantity) updateQty(item.id, nextQty);
            } else {
              removeItem(item.id);
            }
          });
        }}
        title="Complete your cart order"
        description="Fill your delivery details and continue to WhatsApp with a complete cart summary."
      />
    </>
  );
}
