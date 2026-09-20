-- Catálogo do Clube WPI3D: fonte única para o site e para o aplicativo.
-- Este arquivo pode ser executado novamente com segurança no SQL Editor do Supabase.
-- Depende do papel administrativo definido em admin-access.sql (private.is_admin()).

create table if not exists public.products (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 120),
  category text not null check (char_length(category) between 2 and 80),
  description text not null check (char_length(description) between 10 and 5000),
  image_path text not null check (char_length(image_path) <= 500),
  price_cents integer check (price_cents is null or price_cents >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function private.set_updated_at();

alter table public.products enable row level security;

-- Leitura pública apenas dos produtos ativos (vitrine, prévia e app).
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
on public.products for select
to anon, authenticated
using (active);

-- Escrita restrita a administradores.
drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin"
on public.products for insert
to authenticated
with check ((select private.is_admin()));

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin"
on public.products for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
on public.products for delete
to authenticated
using ((select private.is_admin()));

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant usage, select on sequence public.products_id_seq to authenticated;

-- Imagens das peças servidas publicamente; caminho gravado em products.image_path.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_select_public" on storage.objects;
create policy "product_images_select_public"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "product_images_insert_admin" on storage.objects;
create policy "product_images_insert_admin"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and (select private.is_admin()));

drop policy if exists "product_images_delete_admin" on storage.objects;
create policy "product_images_delete_admin"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and (select private.is_admin()));

-- Semente provisória enquanto as fotos continuam em public/produtos do site.
-- Preço segue a definir; ao definir, atualize price_cents e mantenha active = true.
insert into public.products (slug, title, category, description, image_path, sort_order)
values
  ('peca-religiosa', 'Peça religiosa', 'Arte religiosa',
   'Uma referência do trabalho do Clube WPI3D para quem busca uma peça de arte religiosa personalizada.',
   '/produtos/produto-01.jpeg', 1),
  ('peca-decorativa', 'Peça decorativa', 'Decoração',
   'Uma das criações do Clube WPI3D para inspirar a decoração do seu espaço.',
   '/produtos/produto-02.jpeg', 2),
  ('estatua-personalizada', 'Estátua personalizada', 'Decoração',
   'Conheça uma das estátuas produzidas em impressão 3D pelo Clube WPI3D.',
   '/produtos/produto-03.jpeg', 3)
on conflict (slug) do nothing;
