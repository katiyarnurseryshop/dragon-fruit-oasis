import { useEffect, useRef, useState } from "react";
import { MapPin, MessageCircle, Phone, User, Home, Landmark, MapPinned } from "lucide-react";
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
import {
  OrderLineItem,
  OrderCustomerDetails,
  createOrderMessage,
} from "@/lib/order-pricing";

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
  title = "Complete your order",
  description = "Fill in your details and continue on WhatsApp with a ready-to-send order message.",
}: OrderFormDialogProps) {
  const [form, setForm] = useState<OrderCustomerDetails>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderCustomerDetails, string>>>({});
  const wasOpenRef = useRef(open);

  useEffect(() => {
    const openedNow = open && !wasOpenRef.current;
    if (openedNow) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
    wasOpenRef.current = open;
  }, [open]);

  const orderItems = items;

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
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-xl border-0 bg-white p-0 shadow-2xl dark:bg-zinc-950 sm:w-full">
        <div className="flex max-h-[92vh] min-h-0 flex-col bg-white dark:bg-zinc-950">
          <div className="border-b border-border/70 px-5 py-4 md:px-8 md:py-6">
            <DialogHeader className="text-left">
              <DialogTitle className="pr-10 font-heading text-2xl md:text-3xl">{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
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
