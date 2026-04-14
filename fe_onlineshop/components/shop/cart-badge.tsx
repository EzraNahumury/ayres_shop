"use client";

import { useEffect, useState } from "react";
import { useCart, selectCartCount } from "@/lib/store/cart";

export function CartBadge() {
  const [mounted, setMounted] = useState(false);
  const count = useCart(selectCartCount);

  useEffect(() => {
    setMounted(true);
  }, []);

  const display = mounted ? count : 0;

  return (
    <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-black text-[10px] font-medium text-white">
      {display > 99 ? "99+" : display}
    </span>
  );
}
