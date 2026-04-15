import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Construction } from "lucide-react";
import { getCurrentUser } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/checkout");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-black mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Keranjang
      </Link>

      <div className="bg-white border border-neutral-100 rounded-2xl p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-5">
          <Construction className="w-6 h-6 text-neutral-500" />
        </div>
        <h1 className="text-2xl font-light text-black mb-2">
          Checkout segera hadir
        </h1>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Halo <span className="font-medium text-black">{user.name}</span>,
          fitur checkout masih dalam pengembangan. Kamu bisa kembali ke
          keranjang atau lanjut belanja dulu.
        </p>

        <div className="mt-7 flex items-center justify-center gap-2">
          <Link
            href="/cart"
            className="h-10 px-5 rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Kembali ke Keranjang
          </Link>
          <Link
            href="/collections"
            className="h-10 px-5 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-colors inline-flex items-center"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
