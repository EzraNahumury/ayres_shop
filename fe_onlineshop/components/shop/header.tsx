"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "New Arrivals", href: "/collections/new-arrivals" },
  { name: "Tops", href: "/collections/tops" },
  { name: "Bottoms", href: "/collections/bottoms" },
  { name: "Outerwear", href: "/collections/outerwear" },
  { name: "Dresses", href: "/collections/dresses" },
  { name: "Accessories", href: "/collections/accessories" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
        {/* Top bar - announcement */}
        <div className="bg-black text-white text-center py-2 px-4">
          <p className="text-xs tracking-widest uppercase">
            Free shipping on orders over Rp 500.000
          </p>
        </div>

        {/* Main header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 text-neutral-700 hover:text-black transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold tracking-[0.3em] text-black">
                AYRES
              </h1>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-neutral-600 hover:text-black transition-colors duration-200 tracking-wide"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-neutral-700 hover:text-black transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="/login"
                className="hidden sm:flex p-2.5 text-neutral-700 hover:text-black transition-colors"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href="/wishlist"
                className="hidden sm:flex p-2.5 text-neutral-700 hover:text-black transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                href="/cart"
                className="relative p-2.5 text-neutral-700 hover:text-black transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {/* Cart badge - will be dynamic later */}
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search overlay */}
        <div
          className={cn(
            "absolute inset-x-0 top-full bg-white border-b border-neutral-100 transition-all duration-300",
            searchOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          )}
        >
          <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full h-12 pl-12 pr-4 bg-neutral-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus={searchOpen}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden transition-opacity duration-300",
          mobileMenuOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu panel */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-80 max-w-[calc(100vw-3rem)] bg-white shadow-2xl transition-transform duration-300 ease-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-neutral-100">
            <h2 className="text-lg font-bold tracking-[0.2em]">AYRES</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-neutral-500 hover:text-black transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="px-4 py-6 flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="py-3 px-2 text-base text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-100">
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                className="flex items-center gap-3 py-3 px-2 text-sm text-neutral-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Sign In / Register
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-3 py-3 px-2 text-sm text-neutral-600 hover:text-black transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
