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
    <main className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Macroly
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Sign in to continue</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
          />
        </div>

        {state.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-base font-medium text-white disabled:opacity-60 dark:bg-neutral-50 dark:text-neutral-900"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
