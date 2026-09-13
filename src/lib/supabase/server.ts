import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseConfig } from "./config";
import { safeDestination } from "@/lib/auth/validation";

export async function createClient() {
  const config = supabaseConfig();
  if (!config) return null;
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; proxy refreshes them before render.
        }
      },
    },
  });
}

export const currentUser = cache(async () => {
  const client = await createClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  return error ? null : data.user;
});

export async function requireUser(destination = "/loja") {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(safeDestination(destination))}`);
  return user;
}
