"use client";

import { useId, useState } from "react";
import { normaliseTags, suggestTags } from "@/lib/catalogueTags";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  existingTags: string[];
  label?: string;
  disabled?: boolean;
  disabledHelp?: string;
  className?: string;
};

export default function CatalogueTagsInput({ value, onChange, existingTags, label = "Tags", disabled = false, disabledHelp = "Tick this item to edit its tags.", className = "" }: Props) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const choices = suggestTags(existingTags, value, draft);
  const showSuggestions = !disabled && open && choices.length > 0;

  function add(text: string) {
    if (!text.trim()) return;
    onChange(normaliseTags([...value, ...text.split(",")], existingTags));
    setDraft("");
    setActive(-1);
  }

  return (
    <div className={`relative min-w-0 ${className}`}>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-zinc-700">{label}</label>
      <div className={`flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border p-2 ${disabled ? "border-transparent bg-zinc-100 text-zinc-400" : "border-zinc-300 bg-white text-zinc-900"}`}>
        {value.map((tag, index) => (
          <span key={`${tag}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded bg-zinc-200 px-2 py-1 text-xs">
            <span className="break-words">{tag}</span>
            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((_, tagIndex) => tagIndex !== index))}
              className="rounded px-1 font-bold hover:bg-zinc-300 disabled:opacity-40"
            >×</button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          disabled={disabled}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={showSuggestions ? `${id}-suggestions` : undefined}
          aria-activedescendant={showSuggestions && active >= 0 && active < choices.length ? `${id}-option-${active}` : undefined}
          aria-describedby={`${id}-help`}
          autoComplete="off"
          placeholder="Add a tag…"
          className="min-w-24 flex-1 bg-transparent py-1 text-xs outline-none disabled:cursor-not-allowed"
          onFocus={() => { setOpen(true); setActive(-1); }}
          onBlur={() => { add(draft); setOpen(false); }}
          onChange={(event) => {
            const parts = event.target.value.split(",");
            if (parts.length > 1) {
              onChange(normaliseTags([...value, ...parts.slice(0, -1)], existingTags));
            }
            setDraft(parts[parts.length - 1]);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "ArrowDown" && choices.length > 0) {
              event.preventDefault();
              setOpen(true);
              setActive((previous) => (previous + 1) % choices.length);
            } else if (event.key === "ArrowUp" && choices.length > 0) {
              event.preventDefault();
              setOpen(true);
              setActive((previous) => previous <= 0 ? choices.length - 1 : previous - 1);
            } else if (event.key === "Enter") {
              event.preventDefault();
              add(showSuggestions && active >= 0 && active < choices.length ? choices[active] : draft);
            } else if (event.key === "Tab") {
              add(showSuggestions && active >= 0 && active < choices.length ? choices[active] : draft);
              setOpen(false);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setActive(-1);
            }
          }}
        />
      </div>
      {showSuggestions && (
        <ul id={`${id}-suggestions`} role="listbox" aria-label="Existing tags" className="absolute left-0 right-0 z-40 mt-1 max-h-52 overflow-auto rounded-lg border border-zinc-300 bg-white py-1 shadow-lg">
          {choices.map((tag, index) => (
            <li
              key={tag}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={active === index}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => { add(tag); setOpen(true); }}
              className={`cursor-pointer px-3 py-2 text-xs text-zinc-900 ${active === index ? "bg-emerald-100" : "hover:bg-zinc-100"}`}
            >{tag}</li>
          ))}
        </ul>
      )}
      <p id={`${id}-help`} className="mt-1 text-[10px] font-normal text-zinc-500">
        {disabled ? disabledHelp : "Choose a suggestion, or type a new tag and press Enter or comma."}
      </p>
    </div>
  );
}
