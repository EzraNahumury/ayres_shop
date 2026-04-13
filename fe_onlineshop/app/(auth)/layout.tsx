import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Simple header */}
      <header className="flex items-center justify-center py-8">
        <Link href="/">
          <h1 className="text-2xl font-bold tracking-[0.3em] text-black">
            AYRES
          </h1>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 pb-16">
        {children}
      </main>

      {/* Simple footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-neutral-400">
          &copy; {new Date().getFullYear()} AYRES. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
