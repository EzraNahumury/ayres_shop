import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  secondImageUrl?: string;
  badge?: string;
  colors?: string[];
}

export function ProductCard({
  slug,
  name,
  price,
  originalPrice,
  imageUrl,
  badge,
}: ProductCardProps) {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${slug}`} className="group block">
      {/* Image */}
      <div className="product-image-hover relative aspect-[3/4] rounded-xl bg-neutral-100 overflow-hidden mb-4">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full">
            {badge}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium text-neutral-800 group-hover:text-black transition-colors line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
