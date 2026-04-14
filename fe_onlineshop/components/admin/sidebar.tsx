"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingBag },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/promotions", label: "Pusat Promosi", icon: Megaphone },
];

export function AdminSidebar({
  adminName,
  adminRole,
  logoutSlot,
}: {
  adminName: string;
  adminRole: string;
  logoutSlot: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-neutral-950 text-white flex flex-col flex-shrink-0">
      <div className="px-6 py-6 border-b border-neutral-800">
        <Image
          src="/logo/ayres-logo.png"
          alt="AYRES"
          width={140}
          height={36}
          priority
          className="h-8 w-auto"
        />
        <p className="text-xs text-neutral-500 mt-2 tracking-[0.2em]">
          ADMIN PANEL
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-neutral-800">
        <div className="text-sm font-medium">{adminName}</div>
        <div className="text-xs text-neutral-500 mb-3">{adminRole}</div>
        {logoutSlot}
      </div>
    </aside>
  );
}
