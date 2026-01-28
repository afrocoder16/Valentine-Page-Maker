"use client";

import { useState } from "react";
import { loveNotes } from "@/content/notes";

const defaultNotes = loveNotes.slice(0, 3);

const shuffleNotes = () => {
  const copy = [...loveNotes];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 3);
};

export default function LoveNotes() {
  const [notes, setNotes] = useState(defaultNotes);

  return (
    <section className="mx-auto mt-20 w-full max-w-6xl px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
            Love Notes
          </p>
          <h2 className="mt-3 font-display text-3xl text-slate-900">
            Words that land softly.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Save a line, or shuffle for a new spark.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNotes(shuffleNotes())}
          className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50/60"
        >
          Shuffle
        </button>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {notes.map((note) => (
          <div
            key={`${note.quote}-${note.author}`}
            className="rounded-3xl bg-white/85 p-6 shadow-soft"
          >
            <div className="h-2 w-12 rounded-full bg-gradient-to-r from-rose-200 via-pink-100 to-amber-100" />
            <p className="mt-4 text-base text-slate-700">{note.quote}</p>
            <p className="mt-4 text-sm font-semibold text-slate-900">
              {note.author}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">
              Steal this line for your page.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
