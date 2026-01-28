import Link from "next/link";

const footerLinks = [{ href: "/contact", label: "Contact" }];

export default function Footer() {
  return (
    <footer className="bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-10 text-sm text-slate-500">
        <p>Made for modern love notes.</p>
        <div className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
