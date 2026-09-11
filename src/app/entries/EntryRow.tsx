"use client";

import { useState, useTransition } from "react";
import { deleteEntry, updateEntry } from "./actions";

export type Entry = {
  id: string;
  kind: "food" | "activity";
  label: string;
  amount: number | null;
};

export default function EntryRow({
  entry,
  onUpdated,
  onDeleted,
}: {
  entry: Entry;
  onUpdated: (entry: Entry) => void;
  onDeleted: (id: string, kind: "food" | "activity") => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(entry.label);
  const [amount, setAmount] = useState(String(entry.amount ?? ""));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const hasAmount = entry.kind === "food";

  function save() {
    const formData = new FormData();
    formData.set("kind", entry.kind);
    formData.set("id", entry.id);
    formData.set("label", label);
    if (hasAmount) formData.set("amount", amount);

    startTransition(async () => {
      const result = await updateEntry(formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setError("");
      setEditing(false);
      onUpdated({ ...entry, label: result.entry.label, amount: result.entry.amount });
    });
  }

  function remove() {
    const formData = new FormData();
    formData.set("kind", entry.kind);
    formData.set("id", entry.id);

    startTransition(async () => {
      await deleteEntry(formData);
      onDeleted(entry.id, entry.kind);
    });
  }

  if (editing) {
    return (
      <div className="space-y-1 rounded-lg border border-neutral-300 p-2 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-2 py-1 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
          {hasAmount ? (
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              inputMode="numeric"
              min={0}
              className="w-20 rounded-lg border border-neutral-300 px-2 py-1 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
          ) : null}
        </div>
        {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
        <div className="flex justify-end gap-3 text-sm">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-neutral-500 dark:text-neutral-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="text-red-600 dark:text-red-400"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="font-medium text-neutral-900 dark:text-neutral-50"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-900"
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {entry.kind === "activity" ? (
          <span aria-hidden className="shrink-0 text-neutral-400 dark:text-neutral-500">
            🏋
          </span>
        ) : null}
        <span className="truncate text-neutral-800 dark:text-neutral-200">{entry.label}</span>
      </span>
      {hasAmount ? (
        <span className="shrink-0 pl-2 text-neutral-500 dark:text-neutral-400">
          {entry.amount} cal
        </span>
      ) : null}
    </button>
  );
}
