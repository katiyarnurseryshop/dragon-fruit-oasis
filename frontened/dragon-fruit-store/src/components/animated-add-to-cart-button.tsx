import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Package, ShoppingCart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedAddToCartButtonProps
  extends Omit<ButtonProps, "children" | "onClick"> {
  onAddToCart: (event: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  addedLabel?: string;
  resetDelayMs?: number;
}

export function AnimatedAddToCartButton({
  onAddToCart,
  className,
  disabled,
  label = "Add to Cart",
  addedLabel = "Added",
  resetDelayMs = 1800,
  ...props
}: AnimatedAddToCartButtonProps) {
  const [clicked, setClicked] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    onAddToCart(event);
    if (event.defaultPrevented) return;

    setClicked(true);
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setClicked(false);
      timeoutRef.current = null;
    }, resetDelayMs);
  };

  return (
    <Button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      className={cn("add-to-cart-animated relative overflow-hidden", clicked && "clicked", className)}
    >
      <ShoppingCart className="cart-icon" />
      <Package className="box-icon" />
      <span className="label-add">{label}</span>
      <span className="label-added">{addedLabel}</span>
    </Button>
  );
}
