"use client";

import { useState } from "react";
import ProfileForm, { type ProfileFormValues } from "./ProfileForm";
import MuscleTargetsForm from "./MuscleTargetsForm";
import type { Muscle } from "@/lib/muscles";

type Section = "profile" | "muscles";

const SECTIONS: readonly [Section, string][] = [
  ["profile", "Profile"],
  ["muscles", "Muscle targets"],
];

export default function SettingsTabs({
  initial,
  muscles,
  targets,
}: {
  initial: ProfileFormValues;
  muscles: Muscle[];
  targets: Record<string, number>;
}) {
  const [section, setSection] = useState<Section>("profile");

  return (
    <div className="w-full max-w-3xl lg:flex lg:items-start lg:gap-10">
      {/* Desktop: vertical sidebar, same language as the home screen's "Log" nav. */}
      <div className="hidden lg:flex lg:w-40 lg:shrink-0 lg:flex-col lg:gap-1">
        {SECTIONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSection(value)}
            className={`rounded-md border-l-2 px-3 py-2 text-left text-sm ${
              section === value
                ? "border-accent bg-surface text-ink"
                : "border-transparent text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Phone: ordinary top tabs — a persistent sidebar doesn't fit at this width, and
          Settings isn't visited often enough to warrant the home screen's bottom bar. */}
      <div className="flex gap-5 border-b border-line lg:hidden">
        {SECTIONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSection(value)}
            className={`-mb-px border-b-2 pb-2 text-sm ${
              section === value ? "border-accent text-ink" : "border-transparent text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 w-full max-w-sm lg:mt-0 lg:max-w-none lg:flex-1">
        {section === "profile" ? (
          <ProfileForm initial={initial} />
        ) : (
          <MuscleTargetsForm muscles={muscles} targets={targets} />
        )}
      </div>
    </div>
  );
}
