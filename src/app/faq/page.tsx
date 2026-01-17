const faqs = [
  {
    question: "Is it free to try?",
    answer:
      "Yes. You can preview your page as much as you want before you publish.",
  },
  {
    question: "Do I need an account?",
    answer: "No login needed to build and preview your Valentine page.",
  },
  {
    question: "What music can I use?",
    answer:
      "Choose from our curated library or paste a direct audio link later.",
  },
  {
    question: "Can I edit after publishing?",
    answer:
      "Edits are supported. You'll be able to tweak photos or text anytime.",
  },
  {
    question: "Is it private?",
    answer:
      "Your link is unlisted. Private mode and scheduled reveals are coming soon.",
  },
  {
    question: "Refunds?",
    answer:
      "If something feels off, we will work with you to make it right.",
  },
];

export default function FAQPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 md:pt-24">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
          FAQ
        </p>
        <h1 className="mt-3 font-display text-4xl text-slate-900 md:text-5xl">
          Quick answers before you build.
        </h1>
        <p className="mt-4 text-lg text-slate-600 md:text-xl">
          Everything you need to know before you send the link.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-3xl bg-white/80 p-6 shadow-soft transition hover:-translate-y-0.5"
          >
            <summary className="cursor-pointer list-none font-display text-lg text-slate-900">
              {faq.question}
            </summary>
            <p className="mt-3 text-sm text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
