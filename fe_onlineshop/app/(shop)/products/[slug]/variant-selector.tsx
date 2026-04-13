"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";

interface Variant {
  id: number;
  color: string;
  size: string;
  price: number;
  stock: number;
}

interface VariantSelectorProps {
  productId: number;
  productName: string;
  basePrice: number;
  hasVariant: boolean;
  variants: Variant[];
  colorOptions: string[];
  sizeOptions: string[];
  stock: number;
  minPurchase: number;
  maxPurchase: number | null;
}

export function VariantSelector({
  productId,
  productName,
  basePrice,
  hasVariant,
  variants,
  colorOptions,
  sizeOptions,
  stock: productStock,
  minPurchase,
  maxPurchase,
}: VariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(minPurchase);
  const [addedToCart, setAddedToCart] = useState(false);

  // Find matching variant
  const selectedVariant = hasVariant
    ? variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      )
    : null;

  const currentPrice = selectedVariant ? selectedVariant.price : basePrice;
  const currentStock = hasVariant
    ? selectedVariant?.stock ?? 0
    : productStock;

  const maxQty = maxPurchase
    ? Math.min(maxPurchase, currentStock)
    : currentStock;

  const canAddToCart = hasVariant
    ? !!selectedVariant && currentStock > 0
    : currentStock > 0;

  // Check which sizes are available for selected color
  function isSizeAvailable(size: string): boolean {
    if (!selectedColor) return variants.some((v) => v.size === size && v.stock > 0);
    return variants.some(
      (v) => v.color === selectedColor && v.size === size && v.stock > 0
    );
  }

  function handleAddToCart() {
    // TODO: Integrate with cart API/store
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Color selector */}
      {colorOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Color</span>
            {selectedColor && (
              <span className="text-sm text-neutral-500">{selectedColor}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setSelectedSize("");
                  setQuantity(minPurchase);
                }}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium border transition-all",
                  selectedColor === color
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizeOptions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Size</span>
            {selectedSize && (
              <span className="text-sm text-neutral-500">{selectedSize}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const available = isSizeAvailable(size);
              return (
                <button
                  key={size}
                  onClick={() => {
                    if (available) {
                      setSelectedSize(size);
                      setQuantity(minPurchase);
                    }
                  }}
                  disabled={!available}
                  className={cn(
                    "w-14 h-11 rounded-lg text-sm font-medium border transition-all",
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : available
                        ? "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                        : "border-neutral-100 text-neutral-300 cursor-not-allowed line-through"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock info */}
      {canAddToCart && currentStock <= 10 && currentStock > 0 && (
        <p className="text-xs text-amber-600 font-medium">
          Only {currentStock} left in stock
        </p>
      )}

      {/* Quantity */}
      <div>
        <span className="text-sm font-medium mb-3 block">Quantity</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuantity(Math.max(minPurchase, quantity - 1))}
            disabled={quantity <= minPurchase}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-14 h-10 flex items-center justify-center text-sm font-medium">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
            disabled={quantity >= maxQty}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Price display */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold">
          {formatPrice(currentPrice * quantity)}
        </span>
        {quantity > 1 && (
          <span className="text-sm text-neutral-400">
            ({formatPrice(currentPrice)} each)
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          variant={addedToCart ? "secondary" : "primary"}
          size="lg"
          className="w-full"
        >
          <ShoppingBag className="h-4 w-4" />
          {addedToCart
            ? "Added to Cart!"
            : hasVariant && (!selectedColor || !selectedSize)
              ? "Select Options"
              : "Add to Cart"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          disabled={!canAddToCart}
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </Button>
      </div>
    </div>
  );
}
