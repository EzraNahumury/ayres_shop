import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { searchProductsByKeywords } from "@/lib/queries/products";
import { getActiveStorePromosByProductIds } from "@/lib/queries/pricing";
import type { Metadata } from "next";

const PLACEHOLDER = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Cari: ${q}` : "Pencarian",
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();
  const keywords = query.split(/\s+/).filter(Boolean);
  const products =
    keywords.length > 0 ? await searchProductsByKeywords(keywords, 60) : [];
  const promoMap = await getActiveStorePromosByProductIds(products.map((p) => p.id));

  return (
    <div>
      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-2">
            Search
          </p>
          <h1 className="text-3xl sm:text-4xl font-light">
            {query ? (
              <>
                Hasil untuk{" "}
                <span className="font-medium text-black">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              "Pencarian"
            )}
          </h1>
          {query && (
            <p className="text-sm text-neutral-500 mt-2">
              {products.length} produk ditemukan
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {!query ? (
          <div className="text-center py-20">
            <p className="text-neutral-400">
              Ketik kata kunci di kolom pencarian untuk mulai mencari.
            </p>
            <Link
              href="/collections"
              className="inline-block mt-4 text-sm font-medium text-black underline"
            >
              Lihat semua produk
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-400 text-lg">
              Tidak ada produk yang cocok dengan &ldquo;{query}&rdquo;.
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Coba kata kunci lain atau jelajahi semua produk.
            </p>
            <Link
              href="/collections"
              className="inline-block mt-4 text-sm font-medium text-black underline"
            >
              Lihat semua produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
            {products.map((product) => {
              const promo = promoMap.get(product.id);
              return (
                <ProductCard
                  key={product.slug}
                  slug={product.slug}
                  name={product.name}
                  price={promo ? promo.discount_price : Number(product.base_price)}
                  originalPrice={promo ? Number(product.base_price) : undefined}
                  imageUrl={product.primary_image || PLACEHOLDER}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
