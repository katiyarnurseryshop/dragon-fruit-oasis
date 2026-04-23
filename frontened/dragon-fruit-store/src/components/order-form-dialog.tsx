import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, MapPin, MessageCircle, Phone, ShoppingBag, User, Home, Landmark, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createWhatsAppOrderUrl } from "@/lib/site-contact";
import { resolveAssetUrl } from "@/lib/asset-url";
import {
  OrderLineItem,
  OrderCustomerDetails,
  createOrderMessage,
  formatCurrency,
  getDeliveryCharge,
  getOrderSubtotal,
  getTotalPlantQuantity,
  useDeliveryChargeRules,
} from "@/lib/order-pricing";

const ORDER_FALLBACK_IMAGE = "/images/gallery-1.png";

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: OrderLineItem[];
  onItemsChange?: (items: OrderLineItem[]) => void;
  title?: string;
  description?: string;
}

const EMPTY_FORM: OrderCustomerDetails = {
  name: "",
  pinCode: "",
  phone: "",
  doorNo: "",
  address: "",
  landmark: "",
  state: "",
  alternatePhone: "",
};

export function OrderFormDialog({
  open,
  onOpenChange,
  items,
  onItemsChange,
  title = "Complete your order",
  description = "Fill in your details and continue on WhatsApp with a ready-to-send order message.",
}: OrderFormDialogProps) {
  const [form, setForm] = useState<OrderCustomerDetails>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderCustomerDetails, string>>>({});
  const [localItems, setLocalItems] = useState<OrderLineItem[]>(items);
  const wasOpenRef = useRef(open);
  const deliveryChargeRules = useDeliveryChargeRules();

  useEffect(() => {
    const openedNow = open && !wasOpenRef.current;
    if (openedNow) {
      setLocalItems(items);
      setForm(EMPTY_FORM);
      setErrors({});
    }
    wasOpenRef.current = open;
  }, [items, open]);

  const orderItems = onItemsChange ? items : localItems;
  const totalPlants = useMemo(() => getTotalPlantQuantity(orderItems), [orderItems]);
  const subtotal = useMemo(() => getOrderSubtotal(orderItems), [orderItems]);
  const deliveryCharge = useMemo(
    () => getDeliveryCharge(totalPlants, deliveryChargeRules),
    [deliveryChargeRules, totalPlants],
  );
  const orderTotal = subtotal + deliveryCharge;

  const updateItemQuantity = (id: number, quantity: number) => {
    const nextItems = orderItems
      .map((item) => (item.id === id ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);

    if (onItemsChange) {
      onItemsChange(nextItems);
      return;
    }

    setLocalItems(nextItems);
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof OrderCustomerDetails, string>> = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.pinCode.trim()) nextErrors.pinCode = "Pincode is required";
    if (!/^\d{6}$/.test(form.pinCode.trim())) nextErrors.pinCode = "Pincode must be 6 digits";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required";
    if (!/^\+?\d[\d\s-]{8,}$/.test(form.phone.trim())) nextErrors.phone = "Enter a valid phone number";
    if (!form.doorNo.trim()) nextErrors.doorNo = "Door no is required";
    if (!form.address.trim()) nextErrors.address = "Address is required";
    if (!form.landmark.trim()) nextErrors.landmark = "Landmark is required";
    if (!form.state.trim()) nextErrors.state = "State is required";
    if (form.alternatePhone.trim() && !/^\+?\d[\d\s-]{8,}$/.test(form.alternatePhone.trim())) {
      nextErrors.alternatePhone = "Enter a valid alternate phone number";
    }
    if (orderItems.length === 0) nextErrors.name = "Please add at least one product";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    const message = createOrderMessage(orderItems, {
      name: form.name.trim(),
      pinCode: form.pinCode.trim(),
      phone: form.phone.trim(),
      doorNo: form.doorNo.trim(),
      address: form.address.trim(),
      landmark: form.landmark.trim(),
      state: form.state.trim(),
      alternatePhone: form.alternatePhone.trim(),
    });

    window.open(createWhatsAppOrderUrl(message), "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-3xl border-0 bg-white p-0 shadow-2xl dark:bg-zinc-950 sm:w-full">
        <div className="grid max-h-[92vh] overflow-hidden md:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-y-auto bg-gradient-to-br from-primary via-primary/95 to-secondary p-5 text-white md:p-8">
            <DialogHeader className="text-left">
              <DialogTitle className="pr-10 font-heading text-2xl md:text-3xl">{title}</DialogTitle>
              <DialogDescription className="text-white/80">{description}</DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                  <ShoppingBag className="h-4 w-4" />
                  Order Summary
                </div>

                <div className="space-y-3">
                  {orderItems.length === 0 ? (
                    <p className="text-sm text-white/80">No products selected yet.</p>
                  ) : (
                    orderItems.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-black/15 p-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={resolveAssetUrl(item.imageUrl) || ORDER_FALLBACK_IMAGE}
                            alt={item.name}
                            className="h-14 w-14 rounded-xl object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = ORDER_FALLBACK_IMAGE;
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-white/70">
                              {formatCurrency(item.price)} / {item.unit}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="flex items-center rounded-full border border-white/20 bg-white/10 px-1 py-1">
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10"
                                  aria-label={`Decrease quantity for ${item.name}`}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10"
                                  aria-label={`Increase quantity for ${item.name}`}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <span className="text-sm font-semibold">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 space-y-2 border-t border-white/15 pt-4 text-sm">
                  <div className="flex items-center justify-between text-white/80">
                    <span>Total Plants</span>
                    <span>{totalPlants}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span>Delivery Charge</span>
                    <span>{formatCurrency(deliveryCharge)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/15 pt-3 text-base font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(orderTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex max-h-[50vh] min-h-0 flex-col bg-white dark:bg-zinc-950 md:max-h-[92vh]">
            <div className="flex-1 overflow-y-auto p-5 md:p-8">
              <div className="space-y-5">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="h-11 rounded-xl"
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPinned className="h-4 w-4 text-primary" />
                  Pincode
                </label>
                <Input
                  value={form.pinCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, pinCode: e.target.value }))}
                  placeholder="Enter 6 digit pincode"
                  className="h-11 rounded-xl"
                  maxLength={6}
                />
                {errors.pinCode && <p className="mt-1 text-xs text-destructive">{errors.pinCode}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  Phone Number
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="h-11 rounded-xl"
                />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Home className="h-4 w-4 text-primary" />
                  Door No
                </label>
                <Input
                  value={form.doorNo}
                  onChange={(e) => setForm((prev) => ({ ...prev, doorNo: e.target.value }))}
                  placeholder="Enter door no / house no"
                  className="h-11 rounded-xl"
                />
                {errors.doorNo && <p className="mt-1 text-xs text-destructive">{errors.doorNo}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Address
                </label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter full address"
                  className="min-h-[90px] rounded-xl"
                />
                {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Landmark className="h-4 w-4 text-primary" />
                  Landmark
                </label>
                <Input
                  value={form.landmark}
                  onChange={(e) => setForm((prev) => ({ ...prev, landmark: e.target.value }))}
                  placeholder="Enter nearby landmark"
                  className="h-11 rounded-xl"
                />
                {errors.landmark && <p className="mt-1 text-xs text-destructive">{errors.landmark}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  State
                </label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter state"
                  className="h-11 rounded-xl"
                />
                {errors.state && <p className="mt-1 text-xs text-destructive">{errors.state}</p>}
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  Alternative Phone Number
                </label>
                <Input
                  value={form.alternatePhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, alternatePhone: e.target.value }))}
                  placeholder="Optional alternate number"
                  className="h-11 rounded-xl"
                />
                {errors.alternatePhone && <p className="mt-1 text-xs text-destructive">{errors.alternatePhone}</p>}
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
                Your order details, quantity, delivery charge, and total will be generated automatically on WhatsApp.
              </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-border/70 bg-white p-4 dark:bg-zinc-950 md:px-8 md:pb-8">
              <Button
                type="button"
                onClick={handleContinue}
                className="h-12 w-full rounded-xl bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/90"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Continue Order on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
