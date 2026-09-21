"use client";

import { useRef, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const control = "w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#0A2E5D] focus:ring-2 focus:ring-[#0A2E5D]/20";
const extensions = ["jpg", "jpeg", "png", "webp", "pdf", "mp4", "mov", "stl", "3mf", "obj"];
const maxSize = 20 * 1024 * 1024;

function Field({ label, id, wide, ...props }: ComponentProps<"input"> & { label: string; id: string; wide?: boolean }) {
  return <div className={wide ? "md:col-span-2" : undefined}>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">{label}{props.required && " *"}</label>
    <input {...props} id={id} name={id} className={control} />
  </div>;
}

function Section({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  return <section aria-labelledby={`section-${number}`} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8">
    <div className="mb-6 flex items-start gap-4">
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0A2E5D]/5 text-sm font-bold text-[#0A2E5D]">{number}</span>
      <div><h2 id={`section-${number}`} className="text-xl font-bold text-[#0A2E5D] md:text-2xl">{title}</h2><p className="mt-1 text-sm leading-6 text-gray-600">{description}</p></div>
    </div>
    {children}
  </section>;
}

export default function QuoteForm({ initialDescription = "", initialName = "", initialEmail = "" }: { initialDescription?: string; initialName?: string; initialEmail?: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successId, setSuccessId] = useState<number | null>(null);
  const result = useRef<HTMLDivElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next = [...files];
    const errors: string[] = [];
    for (const file of Array.from(incoming)) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!extensions.includes(extension)) errors.push(`${file.name}: formato não aceito.`);
      else if (file.size === 0 || file.size > maxSize) errors.push(`${file.name}: o arquivo deve ter conteúdo e no máximo 20 MB.`);
      else if (next.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) continue;
      else if (next.length >= 5) errors.push("Você pode selecionar até 5 arquivos. Remova um para adicionar outro.");
      else next.push(file);
    }
    setFiles(next);
    setFileError([...new Set(errors)].join(" "));
    setSuccessId(null);
  }

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitting(true);
    setSubmitError("");
    setSuccessId(null);

    const client = createClient();
    if (!client) {
      setSubmitError("A conexão com o atendimento ainda não está disponível.");
      setSubmitting(false);
      return;
    }

    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData.user) {
      router.push("/login?next=%2Forcamento");
      return;
    }

    const form = new FormData(formElement);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    const optional = (name: string) => value(name) || null;

    const { data: quote, error: quoteError } = await client.from("quotes").insert({
      user_id: authData.user.id,
      customer_name: value("nome"),
      customer_email: value("email"),
      customer_phone: value("telefone"),
      postal_code: optional("cep"),
      city: optional("cidade"),
      address: optional("endereco"),
      address_number: optional("numero"),
      address_extra: optional("complemento"),
      description: value("descricao"),
      quantity: Number(value("quantidade")),
      color: optional("cor"),
      material: value("material"),
      desired_date: optional("prazo"),
      notes: optional("observacoes"),
      submission_complete: files.length === 0,
    }).select("id").single();

    if (quoteError || !quote) {
      setSubmitError("Não foi possível enviar o orçamento agora. Confira os campos e tente novamente.");
      setSubmitting(false);
      result.current?.focus();
      return;
    }

    const uploadedPaths: string[] = [];
    let attachmentsFailed = false;
    for (const file of files) {
      const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-180) || "arquivo";
      const path = `${authData.user.id}/${quote.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await client.storage.from("quote-files").upload(path, file, { upsert: false });
      if (uploadError) {
        attachmentsFailed = true;
        break;
      }
      uploadedPaths.push(path);
    }

    if (!attachmentsFailed && uploadedPaths.length > 0) {
      const { error: metadataError } = await client.from("quote_files").insert(files.map((file, index) => ({
        quote_id: quote.id,
        user_id: authData.user.id,
        storage_path: uploadedPaths[index],
        original_name: file.name,
        mime_type: file.type || null,
        size_bytes: file.size,
      })));
      attachmentsFailed = Boolean(metadataError);
    }

    if (!attachmentsFailed && files.length > 0) {
      const { error: completionError } = await client
        .from("quotes")
        .update({ submission_complete: true })
        .eq("id", quote.id)
        .eq("user_id", authData.user.id);

      if (completionError) {
        setSubmitting(false);
        setSubmitError("O orçamento e os arquivos foram enviados, mas não foi possível concluir a confirmação automática. Não envie novamente; entre em contato com a equipe.");
        result.current?.focus();
        return;
      }
    }

    if (attachmentsFailed && uploadedPaths.length > 0) {
      await client.storage.from("quote-files").remove(uploadedPaths);
    }

    setFiles([]);
    setSuccessId(quote.id);
    setSubmitting(false);
    if (attachmentsFailed) setSubmitError("O orçamento foi recebido, mas os anexos não. Responda ao contato da equipe com os arquivos.");
    formElement.reset();
    result.current?.focus();
  }

  return <form className="space-y-6" onChange={() => { setSuccessId(null); setSubmitError(""); }} onSubmit={submitQuote}>
    <p className="text-sm text-gray-600">Campos com * são obrigatórios.</p>
    <Section number="01" title="Seus dados" description="Informações para conversar sobre seu orçamento.">
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="nome" label="Nome completo" autoComplete="name" required maxLength={120} pattern=".*\S.*" placeholder="Como podemos chamar você?" defaultValue={initialName} wide />
        <Field id="email" label="E-mail" type="email" autoComplete="email" required maxLength={254} placeholder="voce@exemplo.com" defaultValue={initialEmail} />
        <Field id="telefone" label="WhatsApp / Telefone" type="tel" autoComplete="tel" required maxLength={25} pattern="(?=(?:\D*\d){10,15}\D*$)\+?[0-9\s\(\)\-]{10,25}" title="Informe o telefone com DDD, usando de 10 a 15 números, espaços, parênteses ou hífen." placeholder="(11) 99999-9999" />
      </div>
    </Section>
    <Section number="02" title="Endereço" description="Opcional nesta etapa. Ajuda a planejar a entrega ou retirada.">
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="cep" label="CEP" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}-?[0-9]{3}" maxLength={9} title="Informe 8 números, com ou sem hífen." placeholder="00000-000" />
        <Field id="cidade" label="Cidade" autoComplete="address-level2" maxLength={100} placeholder="Sua cidade" />
        <Field id="endereco" label="Endereço" autoComplete="address-line1" maxLength={200} placeholder="Rua, avenida..." wide />
        <Field id="numero" label="Número" maxLength={20} placeholder="123 ou s/n" />
        <Field id="complemento" label="Complemento" autoComplete="address-line2" maxLength={100} placeholder="Apartamento, bloco..." />
      </div>
    </Section>
    <Section number="03" title="Sobre o projeto" description="Descreva sua peça e como pretende usá-la. Não precisa conhecer os termos técnicos.">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="descricao" className="mb-2 block text-sm font-semibold text-gray-700">Descrição do projeto *</label>
          <textarea id="descricao" name="descricao" required minLength={10} maxLength={5000} rows={5} className={`${control} resize-y`} placeholder="O que deseja produzir? Inclua medidas aproximadas, uso da peça e detalhes importantes." defaultValue={initialDescription} />
        </div>
        <Field id="quantidade" label="Quantidade" type="number" required min={1} max={10000} step={1} defaultValue={1} />
        <Field id="cor" label="Cor desejada" maxLength={100} placeholder="Ex.: branco, preto, vermelho..." />
        <div>
          <label htmlFor="material" className="mb-2 block text-sm font-semibold text-gray-700">Material</label>
          <select id="material" name="material" defaultValue="recomendacao" className={control}>
            <option value="recomendacao">Não sei / Quero recomendação</option>
            <option value="pla">PLA</option><option value="petg">PETG</option><option value="abs">ABS</option><option value="outro">Outro (descreva nas observações)</option>
          </select>
        </div>
        <Field id="prazo" label="Data desejada" type="date" />
      </div>
      <p className="mt-4 text-sm text-gray-500">Material, disponibilidade de cores e prazo serão confirmados após a análise.</p>
    </Section>
    <Section number="04" title="Arquivos e referências" description="Opcional. Adicione fotos, vídeos, desenhos ou modelos 3D para explicar sua ideia.">
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-[#F4F6F8] p-5 md:p-8">
        <label htmlFor="arquivos" className="mb-3 block font-semibold text-[#0A2E5D]">Selecione arquivos do projeto</label>
        <input id="arquivos" type="file" multiple accept={extensions.map((extension) => `.${extension}`).join(",")} aria-describedby="file-help file-error" aria-invalid={Boolean(fileError)} className="block w-full min-w-0 text-sm file:mr-3 file:mb-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#0A2E5D] file:px-4 file:py-3 file:font-semibold file:text-white focus-visible:outline-2 focus-visible:outline-[#0A2E5D]" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} />
        <p id="file-help" className="mt-2 text-xs leading-5 text-gray-600">Até 5 arquivos, com no máximo 20 MB cada. JPG, PNG, WEBP, PDF, MP4, MOV, STL, 3MF ou OBJ.</p>
      </div>
      <p id="file-error" role="alert" className="mt-3 break-words text-sm text-red-700">{fileError}</p>
      {files.length > 0 && <ul aria-label="Arquivos selecionados" className="mt-4 divide-y divide-gray-200">
        {files.map((file, index) => <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0"><p className="break-all text-sm font-medium">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} MB</p></div>
          <button type="button" aria-label={`Remover ${file.name}`} className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={() => { setFiles(files.filter((_, position) => position !== index)); setFileError(""); setSuccessId(null); }}>Remover</button>
        </li>)}
      </ul>}
    </Section>
    <Section number="05" title="Observações" description="Há mais alguma coisa que devemos saber?">
      <label htmlFor="observacoes" className="mb-2 block text-sm font-semibold text-gray-700">Informações adicionais</label>
      <textarea id="observacoes" name="observacoes" rows={3} maxLength={3000} className={`${control} resize-y`} placeholder="Preferências de acabamento, dúvidas ou outras referências..." />
    </Section>
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <p className="max-w-md text-sm leading-6 text-gray-600">Ao enviar, sua solicitação ficará vinculada à sua conta para acompanhamento.</p>
      <button type="submit" disabled={submitting} className="w-full shrink-0 rounded-lg bg-[#E53935] px-6 py-3 font-semibold text-white transition hover:bg-[#C62828] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A2E5D] disabled:cursor-wait disabled:opacity-60 sm:w-auto">{submitting ? "Enviando..." : "Enviar orçamento"}</button>
    </div>
    {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-800">{submitError}</p>}
    <div ref={result} tabIndex={-1} role="status" className={successId ? "rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900" : "sr-only"}>
      {successId && <><strong>Orçamento enviado.</strong> Recebemos sua solicitação nº {successId}. A equipe entrará em contato pelos dados informados.</>}
    </div>
  </form>;
}
