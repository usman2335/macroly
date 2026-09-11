import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-neutral-50 px-4 text-center dark:bg-neutral-950">
      <div className="space-y-1">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Signed in as</p>
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          {user.email}
        </h1>
      </div>

      <form action="/auth/logout" method="post">
        <button
          type="submit"
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
