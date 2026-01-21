
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  Plus,
  Trash2,
} from "lucide-react";
import type { BuilderDoc, BuilderSettings, BuilderMusic } from "@/lib/builder/types";
import {
  createUploadedPhoto,
  getDefaultLoveNoteTitle,
} from "@/lib/builder/config";

const MIN_MOMENTS = 3;
const MAX_MOMENTS = 6;
const MAX_LOVE_NOTES = 4;
const MAX_AUDIO_MB = 4;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

type AutoResizeTextareaProps = {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  placeholder?: string;
};

function AutoResizeTextarea({
  value,
  onChange,
  className = "",
  rows = 2,
  placeholder,
}: AutoResizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className={className}
    />
  );
}

type EditorSectionProps = {
  title: string;
  helper: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function EditorSection({
  title,
  helper,
  children,
  defaultOpen = true,
}: EditorSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[2rem] bg-white/90 p-5 shadow-soft">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
            {title}
          </p>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>
        <ChevronDown
          className={`mt-1 h-5 w-5 text-slate-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen ? <div className="mt-5 space-y-4">{children}</div> : null}
    </div>
  );
}

type MusicPreviewProps = {
  track: BuilderMusic | null;
};

function MusicPreview({ track }: MusicPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const isPlaying = playingUrl === track?.url;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleEnded = () => setPlayingUrl(null);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, [track?.url]);

  const handleToggle = async () => {
    const audio = audioRef.current;
    if (!audio || !track) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setPlayingUrl(null);
      return;
    }

    try {
      await audio.play();
      setPlayingUrl(track.url);
    } catch {
      setPlayingUrl(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/85 px-4 py-3 shadow-soft">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
          Track
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {track ? (
            <>
              <span aria-hidden="true">&#9835;</span> {track.name}
            </>
          ) : (
            "No track selected"
          )}
        </p>
        <p
          className={`mt-1 text-[0.65rem] uppercase tracking-[0.28em] ${
            isPlaying ? "text-rose-500" : "text-slate-400"
          }`}
        >
          {isPlaying ? "Now playing" : "Ready to preview"}
        </p>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={!track}
        className="rounded-full bg-rose-600 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      {track ? <audio ref={audioRef} src={track.url} preload="metadata" /> : null}
    </div>
  );
}

type EditorPanelProps = {
  doc: BuilderDoc;
  settings: BuilderSettings;
  onDocChange: (nextDoc: BuilderDoc) => void;
  onSave: () => void;
  onReset: () => void;
  onToast: (message: string) => void;
  onUpgradeRequest?: (payload: {
    reason: string;
    photoCount: number;
    maxPhotos: number;
  }) => void;
};

export default function EditorPanel({
  doc,
  settings,
  onDocChange,
  onSave,
  onReset,
  onToast,
  onUpgradeRequest,
}: EditorPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const musicInputRef = useRef<HTMLInputElement | null>(null);
  const momentInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const momentFocusIndex = useRef<number | null>(null);
  const [pendingPhotoIndex, setPendingPhotoIndex] = useState<number | null>(null);
  const isCuteClassic = doc.templateId === "cute-classic";

  const photos = [...doc.photos].sort((a, b) => a.order - b.order);
  const photoUsage = photos.length;
  const photoUsagePercent = Math.min(
    100,
    Math.round((photoUsage / settings.maxPhotos) * 100)
  );
  const isAtPhotoLimit = photoUsage >= settings.maxPhotos;
  const loveNotes =
    doc.loveNotes && doc.loveNotes.length > 0 ? doc.loveNotes : [doc.loveNote];
  const loveNoteTitles = loveNotes.map((_, index) => {
    const title = doc.loveNoteTitles?.[index];
    return typeof title === "string"
      ? title
      : getDefaultLoveNoteTitle(doc.templateId, index);
  });

  const momentSignature = doc.moments.join("|");

  useEffect(() => {
    if (momentFocusIndex.current === null) {
      return;
    }
    const input = momentInputRefs.current[momentFocusIndex.current];
    momentFocusIndex.current = null;
    if (!input) {
      return;
    }
    const active = document.activeElement;
    if (active && active !== document.body && active !== input) {
      return;
    }
    input.focus();
    const length = input.value.length;
    input.setSelectionRange(length, length);
  }, [momentSignature]);

  const updateDoc = (updater: (prev: BuilderDoc) => BuilderDoc) => {
    onDocChange(updater(doc));
  };

  const handleTextChange =
    (field: "title" | "subtitle" | "tagline") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      updateDoc((prev) => ({ ...prev, [field]: value }));
    };

  const handleMomentsTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    updateDoc((prev) => ({ ...prev, momentsTitle: value }));
  };

  const handleLoveNoteTitleChange =
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      updateDoc((prev) => {
        const nextTitles = [...loveNoteTitles];
        nextTitles[index] = value;
        return { ...prev, loveNoteTitles: nextTitles };
      });
    };

  const handleSwoonChange =
    (field: "swoonLabel" | "swoonHeadline" | "swoonBody") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      updateDoc((prev) => ({ ...prev, [field]: value }));
    };

  const handleSwoonTagChange =
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      updateDoc((prev) => {
        const nextTags = [...prev.swoonTags];
        nextTags[index] = value;
        return { ...prev, swoonTags: nextTags };
      });
    };

  const handlePerkChange =
    (index: number, field: "title" | "body") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      updateDoc((prev) => {
        const nextCards = [...prev.perkCards];
        const current = nextCards[index] ?? { title: "", body: "" };
        nextCards[index] = { ...current, [field]: value };
        return { ...prev, perkCards: nextCards };
      });
    };

  const handleSimpleFieldChange =
    (field: "datePlanTitle" | "promiseTitle") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      updateDoc((prev) => ({ ...prev, [field]: value }));
    };

  const handleDatePlanChange =
    (index: number, field: "title" | "body") =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      updateDoc((prev) => {
        const nextSteps = [...prev.datePlanSteps];
        const current = nextSteps[index] ?? { title: "", body: "" };
        nextSteps[index] = { ...current, [field]: value };
        return { ...prev, datePlanSteps: nextSteps };
      });
    };

  const handlePromiseChange =
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      updateDoc((prev) => {
        const nextPromises = [...prev.promiseItems];
        nextPromises[index] = value;
        return { ...prev, promiseItems: nextPromises };
      });
    };

  const handleLoveNoteChange =
    (index: number) => (event: ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      updateDoc((prev) => {
        const nextNotes = [...loveNotes];
        nextNotes[index] = value;
        return {
          ...prev,
          loveNote: nextNotes[0] ?? "",
          loveNotes: nextNotes,
        };
      });
    };

  const handleAddLoveNote = () => {
    if (loveNotes.length >= MAX_LOVE_NOTES) {
      return;
    }
    const nextNotes = [...loveNotes, ""];
    const nextTitles = [
      ...loveNoteTitles,
      getDefaultLoveNoteTitle(doc.templateId, loveNotes.length),
    ];
    updateDoc((prev) => ({
      ...prev,
      loveNote: nextNotes[0] ?? "",
      loveNotes: nextNotes,
      loveNoteTitles: nextTitles,
    }));
    onToast("Added love note");
  };

  const handleRemoveLoveNote = (index: number) => () => {
    if (loveNotes.length <= 1) {
      return;
    }
    const nextNotes = loveNotes.filter((_, noteIndex) => noteIndex !== index);
    const nextTitles = loveNoteTitles.filter(
      (_, titleIndex) => titleIndex !== index
    );
    updateDoc((prev) => ({
      ...prev,
      loveNote: nextNotes[0] ?? "",
      loveNotes: nextNotes,
      loveNoteTitles: nextTitles,
    }));
  };

  const handleMomentChange =
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      momentFocusIndex.current = index;
      updateDoc((prev) => {
        const nextMoments = [...prev.moments];
        nextMoments[index] = value;
        return { ...prev, moments: nextMoments };
      });
    };

  const handleAddMoment = () => {
    if (doc.moments.length >= MAX_MOMENTS) {
      return;
    }
    updateDoc((prev) => ({ ...prev, moments: [...prev.moments, ""] }));
    onToast("Added moment");
  };

  const handleRemoveMoment = (index: number) => () => {
    if (doc.moments.length <= MIN_MOMENTS) {
      return;
    }
    updateDoc((prev) => ({
      ...prev,
      moments: prev.moments.filter((_, momentIndex) => momentIndex !== index),
    }));
  };

  const triggerPhotoSelect = (index: number | null) => {
    setPendingPhotoIndex(index);
    fileInputRef.current?.click();
  };

  const requestPhotoUpgrade = () => {
    onUpgradeRequest?.({
      reason: `This plan allows up to ${settings.maxPhotos} photos.`,
      photoCount: photoUsage,
      maxPhotos: settings.maxPhotos,
    });
  };

  const applyPhoto = (dataUrl: string, targetIndex: number | null) => {
    if (targetIndex === null && photoUsage >= settings.maxPhotos) {
      requestPhotoUpgrade();
      return;
    }

    const isReplace = targetIndex !== null && targetIndex < photos.length;
    updateDoc((prev) => {
      const nextPhotos = [...photos];
      if (targetIndex !== null && targetIndex < nextPhotos.length) {
        nextPhotos[targetIndex] = {
          ...createUploadedPhoto(dataUrl, targetIndex),
          alt: nextPhotos[targetIndex].alt,
        };
      } else {
        nextPhotos.push(createUploadedPhoto(dataUrl, nextPhotos.length));
      }
      const reindexed = nextPhotos.map((photo, index) => ({
        ...photo,
        order: index,
      }));
      return { ...prev, photos: reindexed };
    });

    onToast(isReplace ? "Photo replaced" : "Photo added");
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    applyPhoto(dataUrl, pendingPhotoIndex);
    setPendingPhotoIndex(null);
    event.target.value = "";
  };

  const handlePhotoDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    applyPhoto(dataUrl, null);
  };

  const handleAddPhotoClick = () => {
    if (photoUsage >= settings.maxPhotos) {
      requestPhotoUpgrade();
      return;
    }
    triggerPhotoSelect(null);
  };

  const handleRemovePhoto = (index: number) => () => {
    updateDoc((prev) => {
      const nextPhotos = photos.filter((_, photoIndex) => photoIndex !== index);
      const reindexed = nextPhotos.map((photo, idx) => ({
        ...photo,
        order: idx,
      }));
      return { ...prev, photos: reindexed };
    });
    onToast("Photo removed");
  };

  const movePhoto = (index: number, direction: -1 | 1) => () => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photos.length) {
      return;
    }
    updateDoc((prev) => {
      const nextPhotos = [...photos];
      const [moved] = nextPhotos.splice(index, 1);
      nextPhotos.splice(targetIndex, 0, moved);
      const reindexed = nextPhotos.map((photo, idx) => ({
        ...photo,
        order: idx,
      }));
      return { ...prev, photos: reindexed };
    });
  };

  const handleUploadMusic = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!/audio\/(mpeg|mp4|x-m4a)/.test(file.type)) {
      onToast("Upload an MP3 or M4A file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
      onToast(`Max file size is ${MAX_AUDIO_MB}MB. Please compress first.`);
      event.target.value = "";
      return;
    }

    const dataUrl = await fileToDataUrl(file);
    const label = file.name.replace(/\.[^/.]+$/, "");
    updateDoc((prev) => ({
      ...prev,
      music: {
        url: dataUrl,
        name: label,
        mime: file.type,
      },
    }));
    onToast("Uploaded track");
    event.target.value = "";
  };

  const handleRemoveMusic = () => {
    updateDoc((prev) => ({ ...prev, music: null }));
    onToast("Removed track");
  };

  const iconButtonClasses =
    "inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 text-slate-500 shadow-soft transition hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButtonClasses =
    "inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-600 shadow-soft transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50/70 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSave}
            className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-600 transition hover:border-rose-300 hover:bg-rose-50/70"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 transition hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-500"
          >
            Reset
          </button>
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Autosave on every change
        </p>
      </div>

      <EditorSection
        title="Text"
        helper="Set the headline, subtitle, and love note."
      >
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Tagline
          </span>
          <input
            value={doc.tagline}
            onChange={handleTextChange("tagline")}
            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Title
          </span>
          <input
            value={doc.title}
            onChange={handleTextChange("title")}
            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 font-display text-xl text-slate-900 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
          />
        </label>

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Title size
          </span>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { value: "small", label: "Small" },
              { value: "normal", label: "Normal" },
              { value: "big", label: "Big" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateDoc((prev) => ({
                    ...prev,
                    titleSize: option.value as BuilderDoc["titleSize"],
                  }))
                }
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  doc.titleSize === option.value
                    ? "bg-rose-600 text-white shadow-soft"
                    : "border border-rose-200 bg-white/80 text-rose-600 hover:bg-rose-50/70"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Subtitle
          </span>
          <AutoResizeTextarea
            value={doc.subtitle}
            onChange={handleTextChange("subtitle")}
            rows={3}
            className={`mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60 ${
              doc.showSubtitle === false ? "opacity-60" : ""
            }`}
          />
        </label>

        <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-500 shadow-soft">
          <span>Subtitle visibility</span>
          <button
            type="button"
            onClick={() =>
              updateDoc((prev) => ({
                ...prev,
                showSubtitle: !(prev.showSubtitle ?? true),
              }))
            }
            className={`rounded-full px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] transition ${
              doc.showSubtitle === false
                ? "bg-white text-slate-500"
                : "bg-rose-600 text-white shadow-soft"
            }`}
          >
            {doc.showSubtitle === false ? "Hidden" : "Visible"}
          </button>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Love notes
          </span>
          {loveNotes.map((note, index) => (
            <div
              key={`love-note-${index}`}
              className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-soft"
            >
              <div className="flex-1 space-y-2">
                <input
                  value={loveNoteTitles[index]}
                  onChange={handleLoveNoteTitleChange(index)}
                  placeholder="Note title"
                  className="w-full bg-transparent px-1 py-1 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <AutoResizeTextarea
                  value={note}
                  onChange={handleLoveNoteChange(index)}
                  rows={4}
                  className="w-full resize-none bg-transparent px-1 py-2 text-sm text-slate-700 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveLoveNote(index)}
                disabled={loveNotes.length <= 1}
                className={iconButtonClasses}
                aria-label="Remove love note"
                title="Remove love note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddLoveNote}
            disabled={loveNotes.length >= MAX_LOVE_NOTES}
            className={secondaryButtonClasses}
          >
            <Plus className="h-4 w-4" />
            Add love note
          </button>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Font mood
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "classic", label: "Classic" },
              { value: "soft", label: "Soft" },
              { value: "playful", label: "Playful" },
              { value: "romantic", label: "Romantic" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateDoc((prev) => ({ ...prev, selectedFont: option.value }))
                }
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  doc.selectedFont === option.value
                    ? "bg-rose-600 text-white shadow-soft"
                    : "border border-rose-200 bg-white/80 text-rose-600 hover:bg-rose-50/70"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Section order
          </span>
          <div className="space-y-2">
            {(doc.sectionOrder ?? ["gallery", "love-note", "moments"]).map(
              (section, index) => {
                const label =
                  section === "gallery"
                    ? "Gallery"
                    : section === "love-note"
                      ? "Love note"
                      : "Cute moments";
                return (
                  <div
                    key={`section-${section}`}
                    className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-2 shadow-soft"
                  >
                    <span className="text-sm text-slate-700">{label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateDoc((prev) => {
                            const order = [...(prev.sectionOrder ?? [])];
                            if (index === 0) {
                              return prev;
                            }
                            const [moved] = order.splice(index, 1);
                            order.splice(index - 1, 0, moved);
                            return { ...prev, sectionOrder: order };
                          })
                        }
                        disabled={index === 0}
                        className={iconButtonClasses}
                        aria-label="Move section up"
                        title="Move section up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateDoc((prev) => {
                            const order = [...(prev.sectionOrder ?? [])];
                            if (index === order.length - 1) {
                              return prev;
                            }
                            const [moved] = order.splice(index, 1);
                            order.splice(index + 1, 0, moved);
                            return { ...prev, sectionOrder: order };
                          })
                        }
                        disabled={
                          index === (doc.sectionOrder ?? []).length - 1
                        }
                        className={iconButtonClasses}
                        aria-label="Move section down"
                        title="Move section down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Background intensity
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "soft", label: "Soft" },
              { value: "medium", label: "Medium" },
              { value: "bold", label: "Bold" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateDoc((prev) => ({
                    ...prev,
                    backgroundIntensity: option.value as BuilderDoc["backgroundIntensity"],
                  }))
                }
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  doc.backgroundIntensity === option.value
                    ? "bg-rose-600 text-white shadow-soft"
                    : "border border-rose-200 bg-white/80 text-rose-600 hover:bg-rose-50/70"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </EditorSection>

      {isCuteClassic ? (
        <>
          <EditorSection
            title="Extra flair"
            helper="Edit the swoon meter and perk cards."
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Swoon label
              </span>
              <input
                value={doc.swoonLabel}
                onChange={handleSwoonChange("swoonLabel")}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Swoon headline
              </span>
              <input
                value={doc.swoonHeadline}
                onChange={handleSwoonChange("swoonHeadline")}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Swoon body
              </span>
              <AutoResizeTextarea
                value={doc.swoonBody}
                onChange={handleSwoonChange("swoonBody")}
                rows={2}
                className="mt-2 w-full resize-none rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
              />
            </label>

            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Swoon tags
              </span>
              <div className="grid grid-cols-2 gap-2">
                {doc.swoonTags.map((tag, index) => (
                  <input
                    key={`swoon-tag-${index}`}
                    value={tag}
                    onChange={handleSwoonTagChange(index)}
                    className="rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Perk cards
              </span>
              {doc.perkCards.map((card, index) => (
                <div
                  key={`perk-card-${index}`}
                  className="space-y-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-soft"
                >
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-rose-400">
                    Perk {index + 1}
                  </p>
                  <input
                    value={card.title}
                    onChange={handlePerkChange(index, "title")}
                    className="w-full bg-transparent px-1 py-1 text-sm font-semibold text-slate-700 focus:outline-none"
                  />
                  <AutoResizeTextarea
                    value={card.body}
                    onChange={handlePerkChange(index, "body")}
                    rows={2}
                    className="w-full resize-none bg-transparent px-1 py-1 text-sm text-slate-700 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </EditorSection>

          <EditorSection
            title="Date plan"
            helper="Edit the plan and promise sections."
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Plan title
              </span>
              <input
                value={doc.datePlanTitle}
                onChange={handleSimpleFieldChange("datePlanTitle")}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
              />
            </label>
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Plan steps
              </span>
              {doc.datePlanSteps.map((step, index) => (
                <div
                  key={`plan-step-${index}`}
                  className="space-y-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-soft"
                >
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-rose-400">
                    Step {index + 1}
                  </p>
                  <input
                    value={step.title}
                    onChange={handleDatePlanChange(index, "title")}
                    className="w-full bg-transparent px-1 py-1 text-sm font-semibold text-slate-700 focus:outline-none"
                  />
                  <AutoResizeTextarea
                    value={step.body}
                    onChange={handleDatePlanChange(index, "body")}
                    rows={2}
                    className="w-full resize-none bg-transparent px-1 py-1 text-sm text-slate-700 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Promise title
              </span>
              <input
                value={doc.promiseTitle}
                onChange={handleSimpleFieldChange("promiseTitle")}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
              />
            </label>

            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Promise lines
              </span>
              <div className="space-y-2">
                {doc.promiseItems.map((item, index) => (
                  <input
                    key={`promise-${index}`}
                    value={item}
                    onChange={handlePromiseChange(index)}
                    className="w-full rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
                  />
                ))}
              </div>
            </div>
          </EditorSection>
        </>
      ) : null}

      <EditorSection
        title="Cute moments"
        helper="Short highlights you want them to remember."
      >
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Section title
          </span>
          <input
            value={doc.momentsTitle}
            onChange={handleMomentsTitleChange}
            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-soft focus:border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200/60"
          />
        </label>
        <p className="text-xs text-slate-500">Keep it short and sweet.</p>
        <div className="space-y-3">
          {doc.moments.map((moment, index) => (
            <div
              key={`moment-${index}`}
              className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 shadow-soft"
            >
              <GripVertical className="h-4 w-4 text-slate-300" />
              <input
                ref={(node) => {
                  momentInputRefs.current[index] = node;
                }}
                value={moment}
                onChange={handleMomentChange(index)}
                className="flex-1 bg-transparent px-1 py-2 text-sm text-slate-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRemoveMoment(index)}
                disabled={doc.moments.length <= MIN_MOMENTS}
                className={iconButtonClasses}
                aria-label="Remove moment"
                title="Remove moment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddMoment}
            disabled={doc.moments.length >= MAX_MOMENTS}
            className={secondaryButtonClasses}
          >
            <Plus className="h-4 w-4" />
            Add moment
          </button>
        </div>
      </EditorSection>

      <EditorSection
        title="Photos"
        helper={`Add up to ${settings.maxPhotos} photos (GIFs welcome).`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
            <span>
              {photoUsage} of {settings.maxPhotos} used
            </span>
            <span>Upgrade for more photos</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600"
              style={{ width: `${photoUsagePercent}%` }}
            />
          </div>
        </div>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handlePhotoDrop}
          className="rounded-2xl border border-dashed border-rose-200 bg-white/70 px-4 py-5 text-center shadow-soft"
        >
          <button
            type="button"
            onClick={handleAddPhotoClick}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-600 transition hover:border-rose-300 hover:bg-rose-50/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImagePlus className="h-4 w-4" />
            Add photo
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Drag and drop or click to upload. GIFs welcome.
          </p>
        </div>
        {isAtPhotoLimit ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-xs text-rose-600 shadow-soft">
            Photo limit reached. Upgrade to add more.
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div key={photo.id} className="space-y-2">
              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white/80 shadow-soft">
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt={photo.alt ?? `Uploaded photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-rose-200 via-rose-100 to-amber-100" />
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-slate-900/40 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => triggerPhotoSelect(index)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-soft transition hover:bg-white"
                    title="Replace photo"
                    aria-label="Replace photo"
                  >
                    <ImagePlus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto(index)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-rose-600 shadow-soft transition hover:bg-white"
                    title="Remove photo"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={movePhoto(index, -1)}
                  disabled={index === 0}
                  className={iconButtonClasses}
                  aria-label="Move photo up"
                  title="Move photo up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={movePhoto(index, 1)}
                  disabled={index === photos.length - 1}
                  className={iconButtonClasses}
                  aria-label="Move photo down"
                  title="Move photo down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto(index)}
                  className={iconButtonClasses}
                  aria-label="Remove photo"
                  title="Remove photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Photo mood
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "natural", label: "Natural" },
              { value: "soft", label: "Soft Warm" },
              { value: "pink", label: "Pink Glow" },
              { value: "vintage", label: "Vintage" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateDoc((prev) => ({
                    ...prev,
                    photoMood: option.value as BuilderDoc["photoMood"],
                  }))
                }
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  doc.photoMood === option.value
                    ? "bg-rose-600 text-white shadow-soft"
                    : "border border-rose-200 bg-white/80 text-rose-600 hover:bg-rose-50/70"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </EditorSection>

      <EditorSection
        title="Music"
        helper="Upload a track to play on the page."
      >
        <input
          ref={musicInputRef}
          type="file"
          accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"
          onChange={handleUploadMusic}
          className="hidden"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => musicInputRef.current?.click()}
            className="rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-600 shadow-soft transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50/70"
          >
            Upload mp3/m4a
          </button>
          <button
            type="button"
            onClick={handleRemoveMusic}
            disabled={!doc.music}
            className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-soft transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Remove
          </button>
          <p className="text-xs text-slate-500">
            Max {MAX_AUDIO_MB}MB. Compress longer files.
          </p>
        </div>
        <MusicPreview track={doc.music} />
      </EditorSection>
    </div>
  );
}
