import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { getBestSellers, getNewArrivals, getCategories } from "@/lib/queries/products";
import { getActiveStorePromosByProductIds } from "@/lib/queries/pricing";
import { formatPrice } from "@/lib/utils";

// Category hero images (static — categories don't have images seeded yet)
const categoryImages: Record<string, string> = {
  tops: "https://images.unsplash.com/photo-1434389677669-e08b4cda3a12?w=600&h=400&fit=crop",
  bottoms: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=400&fit=crop",
  outerwear: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop",
  dresses: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=400&fit=crop",
  accessories: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop",
  footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop",
};

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [bestSellers, newArrivals, categories] = await Promise.all([
    getBestSellers(4),
    getNewArrivals(4),
    getCategories(),
  ]);

  const allIds = Array.from(
    new Set([...bestSellers.map((p) => p.id), ...newArrivals.map((p) => p.id)])
  );
  const promoMap = await getActiveStorePromosByProductIds(allIds);

  // Only show top 3 categories with products
  const topCategories = categories.filter((c) => Number((c as { product_count: number }).product_count) > 0).slice(0, 3);

  return (
    <div>
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative h-[85vh] min-h-[600px] bg-neutral-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=1080&fit=crop"
          alt="AYRES Collection"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="relative h-full flex flex-col items-center justify-end pb-20 px-4 text-center">
          <p className="text-sm tracking-[0.4em] uppercase text-neutral-300 mb-4">
            New Collection 2026
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white mb-6 max-w-2xl leading-tight">
            Modern Essentials, <br />
            <span className="font-medium">Timeless Style</span>
          </h2>
          <p className="text-neutral-300 text-base sm:text-lg mb-10 max-w-md">
            Crafted with intention. Designed for everyday.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 h-13 px-10 bg-white text-black rounded-full text-sm font-medium hover:bg-neutral-100 transition-all active:scale-[0.98]"
          >
            Shop Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">
              Explore
            </p>
            <h2 className="text-2xl sm:text-3xl font-light">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCategories.map((cat: any) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="group relative aspect-[3/2] rounded-2xl overflow-hidden bg-neutral-100"
              >
                <Image
                  src={categoryImages[cat.slug] || PLACEHOLDER_IMG}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white text-lg tracking-[0.2em] uppercase font-medium">
                    {cat.name}
                  </span>
                  <span className="text-white/70 text-xs mt-1">
                    {cat.product_count} Products
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BEST SELLERS ==================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">
                Curated
              </p>
              <h2 className="text-2xl sm:text-3xl font-light">Best Sellers</h2>
            </div>
            <Link
              href="/collections"
              className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500 hover:text-black transition-colors"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
            {bestSellers.map((product) => {
              const promo = promoMap.get(product.id);
              return (
                <ProductCard
                  key={product.slug}
                  slug={product.slug}
                  name={product.name}
                  price={promo ? promo.discount_price : Number(product.base_price)}
                  originalPrice={promo ? Number(product.base_price) : undefined}
                  imageUrl={product.primary_image || PLACEHOLDER_IMG}
                  badge={product.total_sold > 200 ? "Best Seller" : undefined}
                />
              );
            })}
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/collections"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-black"
            >
              View All Products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== BRAND STORY ==================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
              <Image
                src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop"
                alt="Our Story"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="py-8 md:pl-12 lg:pl-20">
              <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                Our Story
              </p>
              <h2 className="text-3xl sm:text-4xl font-light leading-snug mb-6">
                Designed with <br />
                purpose, made to <br />
                <span className="font-medium">last</span>
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-4">
                AYRES was born from a simple belief: fashion should be intentional.
                Every piece in our collection is thoughtfully designed, responsibly
                sourced, and crafted to become a lasting part of your wardrobe.
              </p>
              <p className="text-neutral-500 leading-relaxed mb-8">
                We focus on quality materials, clean silhouettes, and versatile
                pieces that transcend seasons.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-black border-b border-black pb-0.5 hover:border-neutral-400 transition-colors"
              >
                Learn More
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== NEW ARRIVALS ==================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">
                Just In
              </p>
              <h2 className="text-2xl sm:text-3xl font-light">New Arrivals</h2>
            </div>
            <Link
              href="/collections"
              className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500 hover:text-black transition-colors"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
            {newArrivals.map((product) => {
              const promo = promoMap.get(product.id);
              return (
                <ProductCard
                  key={product.slug}
                  slug={product.slug}
                  name={product.name}
                  price={promo ? promo.discount_price : Number(product.base_price)}
                  originalPrice={promo ? Number(product.base_price) : undefined}
                  imageUrl={product.primary_image || PLACEHOLDER_IMG}
                  badge="New"
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES BAR ==================== */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-sm font-medium text-black mb-1">Free Shipping</p>
              <p className="text-xs text-neutral-400">On orders over Rp 500.000</p>
            </div>
            <div>
              <p className="text-sm font-medium text-black mb-1">Easy Returns</p>
              <p className="text-xs text-neutral-400">30-day return policy</p>
            </div>
            <div>
              <p className="text-sm font-medium text-black mb-1">Secure Payment</p>
              <p className="text-xs text-neutral-400">100% secure checkout</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
