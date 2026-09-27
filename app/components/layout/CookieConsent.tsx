"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CookiePreferences = {
  essential: true;
  analytics: boolean;
  embeddedMedia: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "raf_cookie_consent_v1";
const OPEN_EVENT = "raf-open-cookie-settings";
const CHANGE_EVENT = "raf-cookie-consent-change";

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  embeddedMedia: false,
  marketing: false,
};

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setIsVisible(true);
      } else {
        const parsed = JSON.parse(saved) as CookiePreferences;
        setPreferences({
          essential: true,
          analytics: Boolean(parsed.analytics),
          embeddedMedia: Boolean(parsed.embeddedMedia),
          marketing: Boolean(parsed.marketing),
        });
      }
    } catch {
      setIsVisible(true);
    }

    const openSettings = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved) as CookiePreferences;
          setPreferences({
            essential: true,
            analytics: Boolean(parsed.analytics),
            embeddedMedia: Boolean(parsed.embeddedMedia),
            marketing: Boolean(parsed.marketing),
          });
        }
      } catch {
        setPreferences(defaultPreferences);
      }

      setIsManaging(true);
      setIsVisible(true);
    };

    window.addEventListener(OPEN_EVENT, openSettings);

    return () => {
      window.removeEventListener(OPEN_EVENT, openSettings);
    };
  }, []);

  const savePreferences = (next: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setPreferences(next);

    window.dispatchEvent(
      new CustomEvent(CHANGE_EVENT, {
        detail: next,
      })
    );

    setIsManaging(false);
    setIsVisible(false);
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      embeddedMedia: true,
      marketing: true,
    });
  };

  const rejectNonEssential = () => {
    savePreferences({
      essential: true,
      analytics: false,
      embeddedMedia: false,
      marketing: false,
    });
  };

  const togglePreference = (
    key: "analytics" | "embeddedMedia" | "marketing"
  ) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="raf-cookie-title"
        className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border-4 border-black bg-white text-black shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]"
      >
        <div className="border-b-4 border-black bg-black px-4 py-4 sm:px-6">
          <h2
            id="raf-cookie-title"
            className="font-raf text-2xl sm:text-3xl uppercase tracking-wide text-white"
          >
            Cookie Settings
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          {!isManaging ? (
            <>
              <p className="text-sm sm:text-base leading-6 text-zinc-700">
                We use essential cookies to keep RAF By Design working. With
                your permission, we may also use optional cookies for analytics,
                embedded media or marketing. You can accept, reject or manage
                your choices.
              </p>

              <p className="mt-3 text-xs sm:text-sm text-zinc-600">
                Read our{" "}
                <Link
                  href="/all-about-raf/legal/privacy"
                  className="font-black text-red-600 underline hover:text-red-500"
                >
                  Privacy &amp; Cookies
                </Link>{" "}
                information.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-lg border-2 border-black bg-red-600 px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-red-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Accept All
                </button>

                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="rounded-lg border-2 border-black bg-black px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Reject Non-Essential
                </button>

                <button
                  type="button"
                  onClick={() => setIsManaging(true)}
                  className="rounded-lg border-2 border-black bg-white px-4 py-3 text-sm font-black uppercase text-black transition hover:bg-zinc-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Manage Cookies
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm sm:text-base leading-6 text-zinc-700">
                Choose which optional cookie categories RAF By Design may use.
                Essential cookies are always enabled because they are needed for
                core website functions.
              </p>

              <div className="mt-5 space-y-3">
                <PreferenceRow
                  title="Essential"
                  description="Required for core website functions such as security, basket, checkout and session features."
                  checked
                  disabled
                />

                <PreferenceRow
                  title="Analytics"
                  description="Helps us understand how visitors use the website so we can improve it."
                  checked={preferences.analytics}
                  onChange={() => togglePreference("analytics")}
                />

                <PreferenceRow
                  title="Embedded Media & Social"
                  description="Allows optional third-party media or social content that may set cookies or similar technologies."
                  checked={preferences.embeddedMedia}
                  onChange={() => togglePreference("embeddedMedia")}
                />

                <PreferenceRow
                  title="Marketing"
                  description="Allows optional marketing or advertising technologies where these are used."
                  checked={preferences.marketing}
                  onChange={() => togglePreference("marketing")}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-lg border-2 border-black bg-red-600 px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-red-500"
                >
                  Accept All
                </button>

                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="rounded-lg border-2 border-black bg-black px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-zinc-800"
                >
                  Reject Non-Essential
                </button>

                <button
                  type="button"
                  onClick={() => savePreferences(preferences)}
                  className="rounded-lg border-2 border-black bg-white px-4 py-3 text-sm font-black uppercase text-black transition hover:bg-zinc-100"
                >
                  Save Choices
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border-2 border-black bg-zinc-100 p-4">
      <div>
        <h3 className="text-sm sm:text-base font-black uppercase">{title}</h3>
        <p className="mt-1 text-xs sm:text-sm leading-5 text-zinc-600">
          {description}
        </p>
      </div>

      <label className="relative mt-1 inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full border-2 border-black bg-zinc-300 transition peer-checked:bg-red-600 peer-disabled:opacity-70" />
        <span className="absolute left-1 h-4 w-4 rounded-full bg-black transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );
}
