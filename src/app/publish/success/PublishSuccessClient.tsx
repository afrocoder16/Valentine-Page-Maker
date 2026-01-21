"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/Button";
import { writeEntitlementSessionId } from "@/lib/entitlements";

type PublishSuccessClientProps = {
  sessionId: string;
  sharePath: string;
};

export default function PublishSuccessClient({
  sessionId,
  sharePath,
}: PublishSuccessClientProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionId) {
      writeEntitlementSessionId(sessionId);
    }
  }, [sessionId]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return sharePath;
    }
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-slate-700">
        {shareUrl}
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className={buttonClasses("outline")}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <Link
          href={sharePath}
          target="_blank"
          rel="noreferrer"
          className={buttonClasses("primary")}
        >
          Open link
        </Link>
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.28em] text-rose-500">
        {copied ? "Copied to clipboard" : "Share this link with your person"}
      </p>
    </div>
  );
}
