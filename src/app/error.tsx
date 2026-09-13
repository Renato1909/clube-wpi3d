"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#F4F6F8] px-5 text-gray-900"><div className="max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center"><h1 className="text-2xl font-bold text-[#0A2E5D]">Não foi possível abrir esta página</h1><p className="mt-4 text-sm leading-7 text-gray-600">Tente novamente em alguns instantes. Se o problema continuar, volte ao início.</p><button onClick={reset} className="mt-6 rounded-lg bg-[#0A2E5D] px-5 py-3 font-semibold text-white">Tentar novamente</button><Link href="/" className="mt-4 block text-sm text-[#0A2E5D] underline">Voltar ao início</Link></div></main>;
}
