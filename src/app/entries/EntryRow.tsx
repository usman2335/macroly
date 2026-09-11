"use client";

import { useState, useTransition } from "react";
import { deleteEntry, updateEntry } from "./actions";

export type Entry = {
  id: string;
  label: string;
  amount: number;
};

export default function EntryRow({
  entry,
  onUpdated,
  onDeleted,
}: {
  entry: Entry;
  onUpdated: (entry: Entry) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(entry.label);
  const [amount, setAmount] = useState(String(entry.amount));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    const formData = new FormData();
    formData.set("id", entry.id);
    formData.set("label", label);
    formData.set("amount", amount);

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
    formData.set("id", entry.id);

    startTransition(async () => {
      await deleteEntry(formData);
      onDeleted(entry.id);
    });
  }

  if (editing) {
    return (
      <div className="space-y-2 py-2">
        <div className="flex items-center gap-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-line bg-transparent px-2 py-1 text-base text-ink outline-none focus:border-accent"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            inputMode="numeric"
            min={0}
            className="w-20 rounded-md border border-line bg-transparent px-2 py-1 text-base text-ink outline-none focus:border-accent font-mono"
          />
        </div>
        {error ? <p className="text-xs text-zone-over">{error}</p> : null}
        <div className="flex justify-end gap-4 text-sm">
          <button type="button" onClick={() => setEditing(false)} className="text-muted">
            Cancel
          </button>
          <button type="button" onClick={remove} disabled={pending} className="text-zone-over">
            Delete
          </button>
          <button type="button" onClick={save} disabled={pending} className="text-accent">
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
      className="flex w-full items-center justify-between py-2 text-left"
    >
      <span className="truncate text-ink">{entry.label}</span>
      <span className="shrink-0 pl-2 font-mono text-muted">{entry.amount} cal</span>
    </button>
  );
}
