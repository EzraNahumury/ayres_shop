import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { getProductsByCategory, getCategories } from "@/lib/queries/products";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import type { Metadata } from "next";

const PLACEHOLDER = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=800&fit=crop";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT name FROM product_categories WHERE slug = ? LIMIT 1",
    [slug]
  );
  const name = rows[0]?.name || slug;
  return {
    title: name,
    description: `Browse ${name} collection at AYRES`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;

  // Verify category exists
  const [catRows] = await db.query<RowDataPacket[]>(
    "SELECT * FROM product_categories WHERE slug = ? AND is_active = 1 LIMIT 1",
    [slug]
  );

  if (catRows.length === 0) {
    notFound();
  }

  const category = catRows[0];
  const currentSort = sort || "newest";

  const [products, categories] = await Promise.all([
    getProductsByCategory(slug, currentSort),
    getCategories(),
  ]);

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-sm text-neutral-400 mb-3">
            <Link href="/collections" className="hover:text-black transition-colors">
              Collections
            </Link>
            <span>/</span>
            <span className="text-neutral-700">{category.name}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light">{category.name}</h1>
          {category.description && (
            <p className="text-neutral-500 mt-2 max-w-xl">{category.description}</p>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="bg-white border-b border-neutral-100 sticky top-[105px] z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/collections"
              className="shrink-0 px-5 py-2 rounded-full text-sm font-medium border border-neutral-200 text-neutral-600 hover:border-black hover:text-black transition-colors"
            >
              All
            </Link>
            {categories
              .filter((c: any) => c.product_count > 0)
              .map((cat: any) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    cat.slug === slug
                      ? "bg-black text-white"
                      : "border border-neutral-200 text-neutral-600 hover:border-black hover:text-black"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Sort + Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-neutral-400">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 hidden sm:inline">Sort by:</span>
            <div className="flex gap-1">
              {sortOptions.map((opt) => (
                <Link
                  key={opt.value}
                  href={`/collections/${slug}?sort=${opt.value}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    currentSort === opt.value
                      ? "bg-black text-white"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              slug={product.slug}
              name={product.name}
              price={Number(product.base_price)}
              imageUrl={product.primary_image || PLACEHOLDER}
            />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-400 text-lg">No products in this category yet</p>
            <Link
              href="/collections"
              className="inline-block mt-4 text-sm font-medium text-black underline"
            >
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
