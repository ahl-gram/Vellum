import { resolve } from "node:path";
import ts from "typescript";

export function compileWithVirtual(options: ts.CompilerOptions, roots: readonly string[], virtual: ReadonlyMap<string, string>): ts.Program {
  const host = ts.createCompilerHost(options);
  const read = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, ...rest) => {
    const text = virtual.get(resolve(name));
    return text === undefined ? read(name, version, ...rest) : ts.createSourceFile(name, text, version, true);
  };
  const exists = host.fileExists.bind(host);
  host.fileExists = (name) => virtual.has(resolve(name)) || exists(name);
  return ts.createProgram({ rootNames: [...roots, ...virtual.keys()], options, host });
}
