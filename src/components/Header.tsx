import Link from "next/link";
import { currentUser } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin";
import { signOut } from "@/app/actions/auth";
import CartLink from "@/components/CartLink";

export default async function Header() {
  const user = await currentUser();
  const admin = user ? await isCurrentUserAdmin() : false;
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-sm font-bold tracking-widest text-[#0A2E5D]">CLUBE</span>
          <span className="text-2xl font-bold"><span className="text-[#0A2E5D]">WPI</span><span className="text-[#E53935]">3D</span></span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-5 lg:flex">
          <Link href="/" className="text-sm font-medium text-gray-700 transition hover:text-[#0A2E5D]">Início</Link>
          <Link href="/#como-funciona" className="text-sm font-medium text-gray-700 transition hover:text-[#0A2E5D]">Como funciona</Link>
          <Link href="/loja" className="text-sm font-medium text-gray-700 transition hover:text-[#0A2E5D]">Loja</Link>
          <Link href={user ? "/minha-conta" : "/login"} className="text-sm font-semibold text-[#0A2E5D] hover:underline">{user ? "Minha conta" : "Entrar"}</Link>
          {admin && <Link href="/admin" className="text-sm font-semibold text-[#E53935] hover:underline">Administração</Link>}
          {user && <CartLink />}
          {!user && <Link href="/cadastro" className="text-sm font-semibold text-[#0A2E5D] hover:underline">Criar conta</Link>}
          {user && <form action={signOut}><button className="text-sm text-gray-600 hover:underline">Sair</button></form>}
          <Link href="/orcamento" className="rounded-lg bg-[#E53935] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C62828]">Solicitar orçamento</Link>
        </nav>

        <details className="relative lg:hidden">
          <summary className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-[#0A2E5D]">Menu</summary>
          <nav aria-label="Navegação no celular" className="absolute right-0 z-20 mt-3 flex w-60 flex-col gap-1 rounded-xl border border-gray-200 bg-white p-3 text-sm text-[#0A2E5D] shadow-lg">
            <Link href="/" className="rounded-lg px-3 py-3 hover:bg-gray-50">Início</Link>
            <Link href="/loja" className="rounded-lg px-3 py-3 hover:bg-gray-50">Loja</Link>
            <Link href={user ? "/minha-conta" : "/login"} className="rounded-lg px-3 py-3 hover:bg-gray-50">{user ? "Minha conta" : "Entrar"}</Link>
            {admin && <Link href="/admin" className="rounded-lg px-3 py-3 font-semibold text-[#E53935] hover:bg-gray-50">Administração</Link>}
            {user && <CartLink mobile />}
            {!user && <Link href="/cadastro" className="rounded-lg px-3 py-3 hover:bg-gray-50">Criar conta</Link>}
            <Link href="/orcamento" className="rounded-lg bg-[#E53935] px-3 py-3 font-semibold text-white">Solicitar orçamento</Link>
            {user && <form action={signOut}><button className="w-full rounded-lg px-3 py-3 text-left hover:bg-gray-50">Sair</button></form>}
          </nav>
        </details>
      </div>
    </header>
  );
}
