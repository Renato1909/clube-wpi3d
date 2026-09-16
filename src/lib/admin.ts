import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient, currentUser } from "@/lib/supabase/server";

export const isCurrentUserAdmin = cache(async () => {
  const user = await currentUser();
  if (!user) return false;

  const client = await createClient();
  if (!client) return false;

  const { data, error } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return !error && data?.role === "admin";
});

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!(await isCurrentUserAdmin())) redirect("/minha-conta");
  return user;
}
