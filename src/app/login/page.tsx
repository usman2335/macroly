"use client";

import { useActionState } from "react";
import { login } from "./actions";

const initialState: { error: string } = { error: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prevState: { error: string }, formData: FormData) => {
      const result = await login(formData);
      return result ?? initialState;
    },
    initialState,
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <form action={formAction} className="w-full max-w-sm">
        <p className="font-mono text-2xl text-ink">Macroly</p>
        <p className="mt-1 text-sm text-muted">Calorie &amp; training ledger</p>

        <div className="mt-8 border-t border-line pt-6 space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-base text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm text-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-base text-ink outline-none focus:border-accent"
            />
          </div>

          {state.error ? (
            <p className="text-sm text-zone-over" role="alert">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-accent px-3 py-2 text-base font-medium text-paper disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </main>
  );
}
