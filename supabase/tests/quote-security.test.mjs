import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("real SQL protects customer quote status and profile role while preserving admin updates", async () => {
  const db = new PGlite();
  const customer = "00000000-0000-4000-8000-000000000001";
  const other = "00000000-0000-4000-8000-000000000002";
  const admin = "00000000-0000-4000-8000-000000000003";
  try {
    // Minimal Supabase-owned schemas. Policies and grants under test are unmodified.
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid() to authenticated;
      create schema storage;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
      create table storage.objects (id bigint primary key, bucket_id text, name text);
      create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1, '/') $$;
    `);
    for (const path of ["schema.sql", "admin-access.sql"]) {
      await db.exec(await readFile(new URL("../" + path, import.meta.url), "utf8"));
    }
    // Reproduce permissive table grants inherited from older Supabase defaults.
    await db.exec("grant update on public.profiles, public.quotes to authenticated");
    await db.exec(await readFile(new URL("../quote-update-security.sql", import.meta.url), "utf8"));
    await db.exec(`
      insert into auth.users values
        ('${customer}', 'one@example.com', '{"full_name":"Customer One"}'),
        ('${other}', 'two@example.com', '{"full_name":"Customer Two"}'),
        ('${admin}', 'admin@example.com', '{"full_name":"Administrator"}');
      update public.profiles set role='admin' where id='${admin}';
      insert into public.quotes(user_id,customer_name,customer_email,customer_phone,description,quantity)
        values ('${customer}','Customer One','one@example.com','11999999999','A real quote description',1),
               ('${other}','Customer Two','two@example.com','11999999999','Another quote description',1);
      set role authenticated;
      select set_config('request.jwt.claim.sub', '${customer}', false);
    `);
    assert.equal((await db.query("select id from public.quotes")).rows.length, 1);
    await assert.rejects(db.exec("update public.quotes set status='aprovado' where id=1"), /Customers may only finalize/);
    await db.exec("update public.quotes set submission_complete=true where id=1");
    assert.equal((await db.query("select submission_complete from public.quotes where id=1")).rows[0].submission_complete, true);
    await assert.rejects(db.exec("update public.quotes set submission_complete=false where id=1"), /cannot be reopened/);
    await assert.rejects(db.exec("update public.profiles set role='admin'"), /permission denied/);
    await db.exec("update public.profiles set phone='11888888888'");
    await db.exec("update public.quotes set submission_complete=true where id=2");
    assert.equal((await db.query("select count(*)::int as total from public.quotes where id=2")).rows[0].total, 0);
    await db.exec(`select set_config('request.jwt.claim.sub', '${admin}', false)`);
    assert.equal((await db.query("select id from public.quotes")).rows.length, 2);
    await db.exec("update public.quotes set status='em_analise' where id=1");
    assert.equal((await db.query("select status from public.quotes where id=1")).rows[0].status, "em_analise");
    await db.exec("reset role");
    assert.equal((await db.query("select submission_complete from public.quotes where id=2")).rows[0].submission_complete, false);
  } finally {
    await db.close();
  }
});
