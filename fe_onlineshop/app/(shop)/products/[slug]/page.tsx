import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getProductBySlug,
  getProductVariants,
  getProductImages,
  getBestSellers,
} from "@/lib/queries/products";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/shop/product-card";
import { VariantSelector } from "./variant-selector";
import type { Metadata } from "next";

const PLACEHOLDER = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description || `Shop ${product.name} at AYRES`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [variants, images, related] = await Promise.all([
    getProductVariants(product.id),
    getProductImages(product.id),
    getBestSellers(4),
  ]);

  // Extract unique color/size options from variants
  const colorOptions = [
    ...new Set(variants.map((v) => v.option_value_1).filter(Boolean)),
  ] as string[];
  const sizeOptions = [
    ...new Set(variants.map((v) => v.option_value_2).filter(Boolean)),
  ] as string[];

  const relatedProducts = related.filter((p) => p.slug !== slug).slice(0, 4);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          {product.category_slug && (
            <>
              <Link
                href={`/collections/${product.category_slug}`}
                className="hover:text-black transition-colors"
              >
                {product.category_name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-neutral-700 truncate">{product.name}</span>
        </nav>

        {/* Product layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left — Gallery */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100">
              <Image
                src={images[0]?.image_url || PLACEHOLDER}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Thumbnail grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100 ring-2 ring-transparent hover:ring-black transition-all cursor-pointer"
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product info */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex flex-col gap-6">
              {/* Brand */}
              {product.brand_name && (
                <p className="text-xs tracking-[0.3em] uppercase text-neutral-400">
                  {product.brand_name}
                </p>
              )}

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-light leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold">
                  {formatPrice(Number(product.base_price))}
                </span>
              </div>

              {/* Sold count */}
              {product.total_sold > 0 && (
                <p className="text-xs text-neutral-400">
                  {product.total_sold.toLocaleString("id-ID")} sold
                </p>
              )}

              {/* Divider */}
              <hr className="border-neutral-100" />

              {/* Variant selector (client component) */}
              <VariantSelector
                productId={product.id}
                productName={product.name}
                basePrice={Number(product.base_price)}
                hasVariant={!!product.has_variant}
                variants={variants.map((v) => ({
                  id: v.id,
                  color: v.option_value_1 || "",
                  size: v.option_value_2 || "",
                  price: Number(v.price),
                  stock: v.stock,
                }))}
                colorOptions={colorOptions}
                sizeOptions={sizeOptions}
                stock={product.stock}
                minPurchase={product.min_purchase}
                maxPurchase={product.max_purchase}
              />

              {/* Divider */}
              <hr className="border-neutral-100" />

              {/* Description */}
              {product.description && (
                <details className="group" open>
                  <summary className="flex items-center justify-between cursor-pointer py-2">
                    <span className="text-sm font-medium">Description</span>
                    <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="text-sm text-neutral-500 leading-relaxed pb-2">
                    {product.description}
                  </p>
                </details>
              )}

              {/* Shipping info */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer py-2">
                  <span className="text-sm font-medium">Shipping & Returns</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <div className="text-sm text-neutral-500 leading-relaxed pb-2 space-y-2">
                  <p>Free shipping on orders over Rp 500.000</p>
                  <p>Standard delivery: 2-5 business days</p>
                  <p>30-day easy return policy</p>
                  <p>Weight: {product.weight_grams}g</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="bg-white mt-16 py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-xl font-light mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.slug}
                  slug={p.slug}
                  name={p.name}
                  price={Number(p.base_price)}
                  imageUrl={p.primary_image || PLACEHOLDER}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
