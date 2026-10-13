import ts from "typescript";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const options = {
  strict: true, noEmit: true, skipLibCheck: true,
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  allowImportingTsExtensions: true,
};
const host = ts.createCompilerHost(options);
host.resolveModuleNames = (names, containingFile) => names.map((name) => {
  if (name === "https://esm.sh/@supabase/supabase-js@2.116.0") {
    return ts.resolveModuleName("@supabase/supabase-js", path.join(root, "package.json"), options, host).resolvedModule;
  }
  return ts.resolveModuleName(name, containingFile, options, host).resolvedModule;
});
const program = ts.createProgram([
  path.join(root, "../functions/notify-business-event/index.ts"),
  path.join(root, "deno-globals.d.ts"),
], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCurrentDirectory: () => root,
    getCanonicalFileName: (name) => name,
    getNewLine: () => "\n",
  }));
  process.exitCode = 1;
} else console.log("Edge function typecheck passed against pinned Supabase types.");
