import ts from "typescript";

export const CTX_THROWING_WAITS: readonly string[] = ["waitSettled", "waitTurned", "settle"];

export type FamilyFile = { readonly path: string; readonly text: string };
export type Breach = { readonly at: string; readonly name: string };
export type Containment = { readonly breaches: readonly Breach[]; readonly throwingCalls: number; readonly steps: readonly string[] };

type Parsed = { readonly path: string; readonly sf: ts.SourceFile };
type Region = { readonly node: ts.Node; readonly file: Parsed };

const isFunction = (n: ts.Node): n is ts.FunctionLikeDeclaration =>
  ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n);

const stepLabel = (n: ts.Node): string | null => {
  const call = n.parent;
  if (!(ts.isArrowFunction(n) || ts.isFunctionExpression(n)) || !ts.isCallExpression(call) || call.arguments[1] !== n) return null;
  if (!ts.isIdentifier(call.expression) || call.expression.text !== "step") return null;
  const label = call.arguments[0];
  return label && ts.isStringLiteralLike(label) ? label.text : "(step)";
};

const functionName = (n: ts.Node): string | null => {
  if (!isFunction(n)) return null;
  if (ts.isFunctionDeclaration(n) || ts.isMethodDeclaration(n)) return n.name && (ts.isIdentifier(n.name) || ts.isStringLiteral(n.name)) ? n.name.text : null;
  const p = n.parent;
  if (ts.isVariableDeclaration(p) && p.initializer === n && ts.isIdentifier(p.name)) return p.name.text;
  if (ts.isPropertyAssignment(p) && p.initializer === n && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) return p.name.text;
  return null;
};

const isRun = (n: ts.Node): boolean => functionName(n) === "run";

const calleeName = (call: ts.CallExpression): string | null => {
  const c = call.expression;
  if (ts.isIdentifier(c)) return c.text;
  if (ts.isPropertyAccessExpression(c)) return c.name.text;
  if (ts.isElementAccessExpression(c) && ts.isStringLiteralLike(c.argumentExpression)) return c.argumentExpression.text;
  return null;
};

function ownNodes(region: ts.Node, visit: (n: ts.Node) => void): void {
  const walk = (n: ts.Node): void => {
    if (n !== region && (stepLabel(n) !== null || functionName(n) !== null)) return;
    visit(n);
    ts.forEachChild(n, walk);
  };
  walk(region);
}

function survey(parsed: readonly Parsed[]): { named: Map<string, Region[]>; roots: Region[]; steps: string[] } {
  const named = new Map<string, Region[]>();
  const roots: Region[] = [];
  const steps: string[] = [];
  for (const file of parsed) {
    roots.push({ node: file.sf, file });
    const walk = (n: ts.Node): void => {
      const label = stepLabel(n);
      if (label !== null) steps.push(label);
      if (isRun(n)) roots.push({ node: n, file });
      else {
        const name = functionName(n);
        if (name !== null) named.set(name, [...(named.get(name) ?? []), { node: n, file }]);
      }
      ts.forEachChild(n, walk);
    };
    walk(file.sf);
  }
  return { named, roots, steps };
}

function throwers(named: ReadonlyMap<string, readonly Region[]>): ReadonlySet<string> {
  const throwing = new Set(CTX_THROWING_WAITS);
  const throwsIn = (region: ts.Node): boolean => {
    let found = false;
    ownNodes(region, (n) => {
      if (ts.isThrowStatement(n) || (ts.isCallExpression(n) && throwing.has(calleeName(n) ?? ""))) found = true;
    });
    return found;
  };
  for (let grew = true; grew; ) {
    grew = false;
    for (const [name, regions] of named) {
      if (throwing.has(name) || !regions.some((r) => throwsIn(r.node))) continue;
      throwing.add(name);
      grew = true;
    }
  }
  return throwing;
}

function breachesIn(roots: readonly Region[], throwing: ReadonlySet<string>): Breach[] {
  const breaches: Breach[] = [];
  for (const { node, file } of roots) {
    ownNodes(node, (n) => {
      const name = ts.isThrowStatement(n) ? "throw" : ts.isCallExpression(n) ? calleeName(n) : null;
      if (name === null || (name !== "throw" && !throwing.has(name))) return;
      const line = file.sf.getLineAndCharacterOfPosition(n.getStart(file.sf)).line + 1;
      breaches.push({ at: `${file.path}:${line}`, name });
    });
  }
  return breaches;
}

// Blind spots, each with its direction: a function reached through an alias, a computed key, `.call` or `.bind`, or passed as a value (to `.finally`, `.then`, a callback), is not read as called, a miss; two functions sharing a name in one family are read as one, and a factory's returned anonymous function as part of the factory, each a false red; a step reached by any name but `step` is not a step, a false red; a thrower in a shared support module is not seeded, a miss (the PR #572 errata row).
export function containment(files: readonly FamilyFile[]): Containment {
  const parsed: Parsed[] = files.map(({ path, text }) => ({ path, sf: ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS) }));
  const { named, roots, steps } = survey(parsed);
  const throwing = throwers(named);
  let throwingCalls = 0;
  const count = (n: ts.Node): void => {
    if (ts.isCallExpression(n) && throwing.has(calleeName(n) ?? "")) throwingCalls++;
    ts.forEachChild(n, count);
  };
  parsed.forEach((file) => count(file.sf));
  return { breaches: breachesIn(roots, throwing), throwingCalls, steps };
}
