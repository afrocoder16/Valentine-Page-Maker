import Link from "next/link";
import { buttonClasses } from "@/components/Button";

const navLinks = [
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-2xl text-slate-900">
          BeMyValentine
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/builder?template=cute-classic"
          className={buttonClasses("outline")}
        >
          Start building
        </Link>
      </div>
      <div className="flex items-center justify-center gap-6 px-6 pb-4 text-xs text-slate-600 md:hidden">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
