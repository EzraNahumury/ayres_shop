import Link from "next/link";
import { Globe, Mail, MessageCircle } from "lucide-react";

const footerLinks = {
  shop: [
    { name: "New Arrivals", href: "/collections/new-arrivals" },
    { name: "Tops", href: "/collections/tops" },
    { name: "Bottoms", href: "/collections/bottoms" },
    { name: "Outerwear", href: "/collections/outerwear" },
    { name: "Dresses", href: "/collections/dresses" },
    { name: "Accessories", href: "/collections/accessories" },
  ],
  help: [
    { name: "Contact Us", href: "/contact" },
    { name: "Shipping & Returns", href: "/shipping-returns" },
    { name: "Size Guide", href: "/size-guide" },
    { name: "FAQ", href: "/faq" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Newsletter */}
      <div className="border-b border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="text-sm tracking-[0.3em] uppercase text-neutral-400 mb-3">
              Newsletter
            </h3>
            <p className="text-2xl font-light mb-8">
              Be the first to know about new collections and exclusive offers
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 h-12 px-5 bg-transparent border border-neutral-700 rounded-full text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="h-12 px-8 bg-white text-black rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors active:scale-[0.98]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-xl font-bold tracking-[0.3em] mb-6">AYRES</h2>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              Modern essentials crafted with intention. Quality materials, timeless design.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-neutral-500 hover:text-white transition-colors"
                aria-label="Website"
              >
                <Globe className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-neutral-500 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-neutral-500 hover:text-white transition-colors"
                aria-label="Chat"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">
              Shop
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">
              Help
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-neutral-500 text-center">
            &copy; {new Date().getFullYear()} AYRES. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
